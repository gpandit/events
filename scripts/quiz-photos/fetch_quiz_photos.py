#!/usr/bin/env python3
import argparse
import html
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from io import BytesIO
from pathlib import Path

from PIL import Image

WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php"
USER_AGENT = "FriendsOfSchoolQuizPhotos/1.0 (https://friendsofschool.com; self-hosting quiz photos)"
BATCH_SIZE = 25
MAX_ATTEMPTS = 8
MAX_RETRY_WAIT_SECONDS = 120
RETRYABLE_STATUSES = (429, 500, 502, 503, 504)
SOURCE_WIDTH = 640
OUTPUT_WIDTH = 400
WEBP_QUALITY = 72
REQUEST_PAUSE_SECONDS = 1.0

ROOT = Path(__file__).resolve().parents[2]
TITLES_PATH = Path(__file__).with_name("titles.json")
PHOTOS_DIR = ROOT / "frontend" / "public" / "quiz-photos"
MANIFEST_PATH = ROOT / "frontend" / "src" / "components" / "layouts" / "OrganizerHomepage" / "ResourcesForChildren" / "PuzzlesTab" / "quizPhotoManifest.json"
CREDITS_PATH = PHOTOS_DIR / "credits.html"


def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                return response.read()
        except urllib.error.HTTPError as error:
            if error.code not in RETRYABLE_STATUSES or attempt == MAX_ATTEMPTS:
                raise
            retry_after = error.headers.get("Retry-After", "")
            wait = int(retry_after) if retry_after.isdigit() else 2 ** attempt
            time.sleep(min(wait, MAX_RETRY_WAIT_SECONDS))


def api_get(params):
    query = urllib.parse.urlencode({"format": "json", "formatversion": "2", "redirects": "1", **params})
    return json.loads(fetch(f"{WIKIPEDIA_API}?{query}"))


def download(url):
    return fetch(url)


def slugify(title):
    return re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")


def strip_markup(value):
    return html.unescape(re.sub(r"<[^>]+>", "", value or "")).strip()


def resolve_titles(titles):
    result = api_get({
        "action": "query",
        "prop": "pageimages",
        "piprop": "thumbnail|name",
        "pithumbsize": str(SOURCE_WIDTH),
        "titles": "|".join(titles),
    })["query"]
    normalized = {item["from"]: item["to"] for item in result.get("normalized", [])}
    redirected = {item["from"]: item["to"] for item in result.get("redirects", [])}
    pages = {page["title"]: page for page in result.get("pages", [])}

    resolved = {}
    for title in titles:
        final_title = normalized.get(title, title)
        final_title = redirected.get(final_title, final_title)
        page = pages.get(final_title, {})
        if page.get("thumbnail") and page.get("pageimage"):
            resolved[title] = {"thumbnail": page["thumbnail"]["source"], "file": page["pageimage"]}
    return resolved


def fetch_credits(files):
    result = api_get({
        "action": "query",
        "prop": "imageinfo",
        "iiprop": "extmetadata|url",
        "titles": "|".join(f"File:{name}" for name in files),
    })["query"]
    normalized = {item["from"]: item["to"] for item in result.get("normalized", [])}
    pages = {page["title"]: page for page in result.get("pages", [])}

    credits = {}
    for name in files:
        key = f"File:{name}"
        info = (pages.get(normalized.get(key, key), {}).get("imageinfo") or [{}])[0]
        metadata = info.get("extmetadata", {})
        credits[name] = {
            "artist": strip_markup(metadata.get("Artist", {}).get("value")) or "Unknown",
            "licence": strip_markup(metadata.get("LicenseShortName", {}).get("value")) or "See file page",
            "licence_url": strip_markup(metadata.get("LicenseUrl", {}).get("value")),
            "page": info.get("descriptionurl", ""),
        }
    return credits


def to_webp(data):
    image = Image.open(BytesIO(data)).convert("RGB")
    if image.width > OUTPUT_WIDTH:
        image = image.resize((OUTPUT_WIDTH, round(image.height * OUTPUT_WIDTH / image.width)), Image.LANCZOS)
    buffer = BytesIO()
    image.save(buffer, "WEBP", quality=WEBP_QUALITY, method=6)
    return buffer.getvalue()


def render_credits(entries):
    rows = []
    for title, entry in sorted(entries.items()):
        licence = html.escape(entry["licence"])
        if entry["licence_url"]:
            licence = f'<a href="{html.escape(entry["licence_url"])}">{licence}</a>'
        source = f'<a href="{html.escape(entry["page"])}">File page</a>' if entry["page"] else ""
        rows.append(
            f"<tr><td>{html.escape(title.replace('_', ' '))}</td><td>{html.escape(entry['artist'])}</td><td>{licence}</td><td>{source}</td></tr>"
        )
    return (
        '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
        "<title>Quiz photo credits</title>"
        "<style>body{font-family:sans-serif;max-width:60rem;margin:2rem auto;padding:0 1rem}table{border-collapse:collapse;width:100%}"
        "td,th{border-bottom:1px solid #ddd;padding:.4rem;text-align:left;vertical-align:top}</style></head><body>"
        "<h1>Quiz photo credits</h1><p>Photos used in the general knowledge quiz come from Wikipedia and Wikimedia Commons "
        "and are reused under their licences.</p><table><thead><tr><th>Picture</th><th>Author</th><th>Licence</th><th>Source</th></tr></thead><tbody>"
        + "".join(rows)
        + "</tbody></table></body></html>\n"
    )


def load_existing(path):
    return json.loads(path.read_text()) if path.exists() else {}


def run(titles, photos_dir, manifest_path, credits_path, pause=REQUEST_PAUSE_SECONDS):
    photos_dir.mkdir(parents=True, exist_ok=True)
    manifest = load_existing(manifest_path)
    credit_entries = load_existing(photos_dir / "credits.json")
    failed = []

    def save():
        manifest_path.write_text(json.dumps(dict(sorted(manifest.items())), indent=1) + "\n")
        (photos_dir / "credits.json").write_text(json.dumps(dict(sorted(credit_entries.items())), indent=1) + "\n")
        credits_path.write_text(render_credits(credit_entries))

    pending = [title for title in titles if not (title in manifest and (photos_dir / manifest[title]).exists())]
    try:
        for start in range(0, len(pending), BATCH_SIZE):
            batch = pending[start:start + BATCH_SIZE]
            resolved = resolve_titles(batch)
            credits = fetch_credits([entry["file"] for entry in resolved.values()]) if resolved else {}
            time.sleep(pause)

            for title in batch:
                if title not in resolved:
                    failed.append(title)
                    continue
                try:
                    webp = to_webp(download(resolved[title]["thumbnail"]))
                except Exception as error:
                    print(f"FAILED {title}: {error}", file=sys.stderr)
                    failed.append(title)
                    continue
                filename = f"{slugify(title)}.webp"
                (photos_dir / filename).write_bytes(webp)
                manifest[title] = filename
                credit_entries[title] = credits[resolved[title]["file"]]
                time.sleep(pause)

            save()
            print(f"{min(start + BATCH_SIZE, len(pending))}/{len(pending)} processed", flush=True)
    finally:
        save()

    total_bytes = sum((photos_dir / name).stat().st_size for name in manifest.values())
    print(f"{len(manifest)} photos, {total_bytes / 1024 / 1024:.1f} MB, {len(failed)} failed")
    for title in failed:
        print(f"  missing: {title}")
    return failed


def main():
    parser = argparse.ArgumentParser(description="Download and compress the quiz photos so they can be served from this site.")
    parser.add_argument("--titles", type=Path, default=TITLES_PATH)
    args = parser.parse_args()
    run(json.loads(args.titles.read_text()), PHOTOS_DIR, MANIFEST_PATH, CREDITS_PATH)


if __name__ == "__main__":
    main()
