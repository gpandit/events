import json
import tempfile
import urllib.error
import unittest
from io import BytesIO
from pathlib import Path
from unittest import mock

from PIL import Image

import fetch_quiz_photos as fetcher


def sample_jpeg():
    buffer = BytesIO()
    Image.effect_noise((800, 600), 40).convert("RGB").save(buffer, "JPEG")
    return buffer.getvalue()


def fake_api(params):
    if params["prop"] == "pageimages":
        return {"query": {
            "normalized": [{"from": "albert_einstein", "to": "Albert einstein"}],
            "redirects": [{"from": "Albert einstein", "to": "Albert Einstein"}],
            "pages": [
                {"title": "Albert Einstein", "pageimage": "Einstein.jpg", "thumbnail": {"source": "https://upload.example/einstein.jpg"}},
                {"title": "No Picture"},
            ],
        }}
    return {"query": {"pages": [{
        "title": "File:Einstein.jpg",
        "imageinfo": [{
            "descriptionurl": "https://commons.example/File:Einstein.jpg",
            "extmetadata": {
                "Artist": {"value": '<a href="x">Jane &amp; Co</a>'},
                "LicenseShortName": {"value": "CC BY-SA 4.0"},
                "LicenseUrl": {"value": "https://creativecommons.org/licenses/by-sa/4.0"},
            },
        }],
    }]}}


class FetchQuizPhotosTest(unittest.TestCase):
    def run_fetch(self, titles, directory):
        photos = Path(directory) / "quiz-photos"
        manifest = Path(directory) / "manifest.json"
        with mock.patch.object(fetcher, "api_get", side_effect=fake_api), \
                mock.patch.object(fetcher, "download", return_value=sample_jpeg()) as download:
            failed = fetcher.run(titles, photos, manifest, photos / "credits.html", pause=0)
        return photos, manifest, failed, download

    def test_downloads_compresses_and_records_credits(self):
        with tempfile.TemporaryDirectory() as directory:
            photos, manifest, failed, _ = self.run_fetch(["albert_einstein", "No Picture"], directory)

            self.assertEqual(["No Picture"], failed)
            self.assertEqual({"albert_einstein": "albert-einstein.webp"}, json.loads(manifest.read_text()))

            image = Image.open(photos / "albert-einstein.webp")
            self.assertEqual("WEBP", image.format)
            self.assertEqual(fetcher.OUTPUT_WIDTH, image.width)

            credits = (photos / "credits.html").read_text()
            self.assertIn("Jane &amp; Co", credits)
            self.assertIn("CC BY-SA 4.0", credits)
            self.assertIn("https://commons.example/File:Einstein.jpg", credits)

    def test_second_run_skips_photos_already_downloaded(self):
        with tempfile.TemporaryDirectory() as directory:
            self.run_fetch(["albert_einstein"], directory)
            _, _, _, download = self.run_fetch(["albert_einstein"], directory)

            download.assert_not_called()

    def test_fetch_waits_for_retry_after_then_succeeds(self):
        throttled = urllib.error.HTTPError("https://x", 429, "Too Many Requests", {"Retry-After": "7"}, None)
        ok = mock.MagicMock()
        ok.__enter__.return_value.read.return_value = b"data"

        with mock.patch.object(fetcher.urllib.request, "urlopen", side_effect=[throttled, ok]), \
                mock.patch.object(fetcher.time, "sleep") as sleep:
            self.assertEqual(b"data", fetcher.fetch("https://x"))

        sleep.assert_called_once_with(7)

    def test_fetch_does_not_retry_a_missing_file(self):
        missing = urllib.error.HTTPError("https://x", 404, "Not Found", {}, None)

        with mock.patch.object(fetcher.urllib.request, "urlopen", side_effect=missing) as urlopen:
            with self.assertRaises(urllib.error.HTTPError):
                fetcher.fetch("https://x")

        self.assertEqual(1, urlopen.call_count)

    def test_strip_markup_removes_tags_and_entities(self):
        self.assertEqual("A & B", fetcher.strip_markup('<b>A</b> &amp; B'))


if __name__ == "__main__":
    unittest.main()
