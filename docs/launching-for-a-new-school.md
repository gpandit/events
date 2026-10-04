# Launching the site for another school

Each school runs its own deployment (own database, own domain) from this codebase. Everything school-specific is either an environment variable or content edited in the Site Designer.

## 1. Environment variables

Backend:

| Variable | Purpose |
| --- | --- |
| `SITE_CONTACT_EMAIL` | Receives footer contact messages, volunteer sign-ups and data-erasure receipts |
| `SITE_CONTACT_CC_EMAIL` | Copied on contact messages and volunteer sign-ups |
| `SITE_CONTACT_SUBJECT_TAG` | Prefix on contact email subjects, e.g. the school's group name |

Frontend (build/runtime):

| Variable | Purpose |
| --- | --- |
| `VITE_APP_NAME` | School name on the sign-in screen |
| `VITE_APP_LOGO_DARK` | Logo on the sign-in screen |
| `VITE_DEFAULT_SHARE_IMAGE_PATH` | Share image used when a page has none, e.g. `/logos/school-logo.png` |
| `VITE_FRONTEND_URL` | Public URL of the site |
| `VITE_GOOGLE_TAG_ID` | Google tag measurement ID |
| `VITE_INSTAGRAM_HANDLE` | Fallback Instagram handle when none is set in the designer |
| `VITE_INSTAGRAM_EMBED_URL` | Optional Instagram feed embed |
| `VITE_PRIVACY_URL`, `VITE_TOS_URL` | Override the built-in legal pages |

Put the school's logo files under `frontend/public/logos/`.

## 2. Site Designer (Manage > Site Designer)

Switch between the **Home** and **About & Contact** pages; the preview follows the selection.

- Images: cover and logo
- Home: hero banner, upcoming events heading
- About & Contact: about text, team heading and members, get-in-touch heading and introduction
- Both: contact email and Instagram handle (footer, About page, Instagram page), theme colours, typography

Blank fields fall back to neutral defaults. The team section and Instagram links are hidden when empty.

## 3. Checklist

1. Create the organizer, upload the logo and cover, set it live.
2. Fill in the Site Designer pages above.
3. Set the environment variables and run `php artisan migrate`.
4. Review the legal pages (privacy policy, terms, cookie policy) with the school's own details.
5. Set `VITE_DEFAULT_ORGANIZER_ID` to the organizer so the root URL opens its site.

## 4. School shop

Manage > Shops creates one shop per vendor. Each shop is a category plus a seller:

| Category | Can be sold by | Notes |
| --- | --- | --- |
| New uniform | School, external vendor | Starts with Regular, Sports home, Sports away and House sub-categories |
| Preloved uniform | School, PTA | Starts with Regular, Sports and House sub-categories |
| Textbooks & stationery | School, external vendor | Textbooks and Stationery sub-categories |
| School meals | External vendor | One vendor per school |

- Sub-categories are product categories inside the shop; rename, add or hide them from Products.
- Sizes: create the product with tiered prices and label each tier with the age or size (for example "Age 5-6" or "Small"). Each tier has its own price and stock.
- Checkout uses the same payment methods as events. Every shop asks for **Student name** and **Student class or year** (the first order question is used as the student name on pick lists, so keep it first).
- All orders are collected from school reception. Manage > (shop) > Collection lists orders by student: mark them ready to email the buyer, mark them collected, or print the pick list.
- Shops appear on the public Shop page, grouped by category, once published.
