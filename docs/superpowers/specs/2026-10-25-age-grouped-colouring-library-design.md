# Age-grouped colouring page library

## Goal
Split the Creative Corner colouring pages into four age tabs, let the organizer upload and manage colouring PDFs from the dashboard, and let parents download them. Each tab shows Shopify products from its own collection.

## Decisions
- Tabs: Little Colourers (2-5), Young Artists (6-10), Creative Explorers (11-13), Studio (14-18).
- PDFs and thumbnails are stored on the existing public filesystem disk (`filesystems.public`), served through `Url::getCdnUrl`.
- The thumbnail is rendered in the browser from page 1 of the PDF (PDF.js) at upload time; the server never processes PDFs.
- The 12 existing pages are inserted by the migration for every existing organizer as published Young Artists pages, pointing at their bundled `/pdf/...` and `/pdf-thumbnails/...` assets. Paths starting with `/` are bundled assets and are never deleted from storage.
- Each tab reads a Shopify collection by handle: `colouring-ages-2-5`, `colouring-ages-6-10`, `colouring-ages-11-13`, `colouring-ages-14-18`, configured through `VITE_SHOPIFY_COLLECTION_AGE_2_5`, `..._6_10`, `..._11_13`, `..._14_18`. These replace `VITE_SHOPIFY_COLLECTION_HANDLE`.

## Backend
- Table `colouring_pages`: `organizer_id`, `title` (150), `age_group` (AGE_2_5, AGE_6_10, AGE_11_13, AGE_14_18), `tint` (PEACH, SKY, MINT, LILAC), `pdf_path`, `thumbnail_path`, `status` (DRAFT, PUBLISHED), `sort_order`.
- Authenticated, organizer-authorised routes under `/organizers/{organizerId}/colouring-pages`: list, create (multipart: `pdf` max 10 MB, `thumbnail` image max 1 MB), update (title, age group, tint, status), delete (also removes stored files), reorder (ordered ids).
- Public route: list published pages for the organizer, ordered by `sort_order`.
- Titles are purified with `HtmlPurifierService`. All messages use `__()`.

## Frontend
- Organizer dashboard "Colouring pages" screen: table with thumbnail, title, age group, status, move up/down, edit, delete, and an upload modal (PDF, title, age group, tint, publish toggle).
- `ColouringPagesTab` shows four sub-tabs; each lists published pages of that age group interleaved with shop cards from that tab's collection. An empty tab shows "New pages coming soon".
- `colouringPagesData.ts` is removed.

## Testing
Backend unit tests for the handlers and the file storage service; `php artisan scramble:analyze`; frontend `tsc` on changed files and a production build.

## Out of scope
The digital colouring canvas (separate spec), drag-and-drop reordering, replacing a PDF in place (delete and re-upload).

## Addendum: colour-by-number conversion
The upload modal has a "Make a colour-by-number version" switch. It runs entirely in the browser (`frontend/src/utilites/colourByNumber/`): page 1 of the line-art PDF is rendered with PDF.js at 1700px wide, each enclosed area becomes a region (flood fill and a distance transform find the best spot for its number), regions are coloured from a 9-colour palette so neighbours never match, and a two-page PDF is built with jsPDF: the numbered picture with a colour key, then a finished-picture preview. That PDF and a thumbnail of the numbered page are uploaded in place of the original. Colours are chosen automatically by position, not by what the picture shows. Areas with an inscribed radius under 12px at 200 dpi are left white and unnumbered.
