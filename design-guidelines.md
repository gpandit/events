# Friends of Repton — Design Guidelines

This document records the visual design system used for the Friends of Repton Al
Barsha site (a customised deployment of Hi.Events). It exists so future work —
by a person or an agent — stays visually consistent instead of re-deriving
colors and spacing from scratch each time.

## Brand family

Three brands appear on this site, each with a distinct role:

- **Friends of Repton Al Barsha** — the event organizer. Navy badge logo
  (`/logos/friends-of-repton-logo.png`), used as the site favicon and next to
  the wordmark on the auth pages.
- **Friends of School** — the parent initiative. Teal/amber wordmark logo
  (`/logos/friends-of-school-logo.webp`, `-white.webp` for dark backgrounds),
  shown in the site footer and the auth page's right-hand panel.
- **Aqualeo Digecom FZ LLC** — the legal operator. Named in the footer
  copyright line and the Privacy Policy / Terms of Service pages
  (`/privacy-policy`, `/terms-of-service`). Hi.Events itself keeps a
  "Powered by Hi.Events" credit per its AGPL license (see
  `PoweredByFooter`) — that is a software attribution, not a business one,
  and should not be removed.

## Color palette

| Token | Hex | Used for |
|---|---|---|
| FoS teal (dark) | `#044D54` | Nav link text, nav active state, wordmark |
| FoS teal (deep) | `#10454B` | Secondary teal accents |
| FoS amber | `#F49F29` | Header nav background, accent highlights |
| FoR navy | `#1f2e46` | Favicon/app theme-color, auth right panel base |
| Footer background | `#2a323c` | Site-wide footer |
| Footer input fields | `#1a2029` | Contact form inputs (sit visibly darker than the footer) |

Everything else — the organizer's accent color, background color, and
light/dark mode — is **configurable per organizer** via the Homepage
Designer (`/manage/organizer/:id/organizer-homepage-designer`) and resolves
through the CSS custom property system described below. Don't hardcode an
organizer's accent color into a shared component; use the `--organizer-*`
variables instead so the Designer stays authoritative.

## Typography

- **Display/heading font**: `Outfit` (loaded via Bunny Fonts in
  `frontend/index.html`), weights 400–800.
- **Body font**: `Plus Jakarta Sans`, weights 400–700.
- Organizers can override the homepage font family via the Homepage
  Designer; components should read `var(--theme-font-family)` /
  `var(--organizer-*-font, ...)` rather than hardcoding a font stack, so
  that override keeps working.

## The theme CSS variable system

Shared chrome (`OrganizerNav`, `SiteFooter`, event/organizer cards) reads a
common set of CSS custom properties rather than importing colors directly.
They are computed once in `frontend/src/hooks/useOrganizerThemeStyles.ts`
from the organizer's theme settings (`validateThemeSettings` +
`computeThemeVariables` in `frontend/src/utilites/themeUtils.ts`), with the
`mode` forced to the current Mantine color scheme so the floating light/dark
toggle (`ThemeToggle`) has a real effect everywhere it's rendered:

```
--organizer-bg-color             organizer's chosen page background (fixed, not theme-toggled)
--organizer-content-bg-color     card/surface background (light/dark aware)
--organizer-primary-color        organizer's accent color
--organizer-primary-text-color   main text color (light/dark aware)
--organizer-secondary-color      secondary text (light/dark aware)
--organizer-secondary-text-color tertiary/muted text
--organizer-accent-contrast      text color that sits on top of the accent
--organizer-accent-soft          accent tinted for subtle backgrounds
--organizer-accent-muted         accent tinted for icons/dividers
--organizer-border-color         border/divider color
--theme-font-family              resolved font stack
```

`OrganizerHomepage.module.scss` re-maps these to the shorter
`--primary-color` / `--content-bg-color` / etc. names that `EventCard`,
`NextEventSpotlight` and friends consume; `EventHomepage.module.scss` does
the same under an `--event-*` prefix. When adding a new themed component,
prefer consuming the already-mapped short names within the module that owns
them, falling back to a sensible default (e.g.
`var(--primary-color, #8b5cf6)`) so the component still renders reasonably
before the variables are set.

Three pieces of chrome are **intentionally not** theme-variable driven,
because they're fixed brand elements rather than per-organizer
configuration: the `OrganizerNav` background (`#F49F29`), the `SiteFooter`
background (`#2a323c`), and the auth page's right-hand feature panel (dark
teal). Don't wire these to `--organizer-*` vars — that would let an
organizer's accent color override the Friends of School brand identity the
footer/nav are meant to carry.

## Site chrome

Every public-facing page should render through `OrganizerNav` → page content
→ `SiteFooter` → `ThemeToggle`, the same shell `OrganizerPageShell` uses for
the homepage. `EventHomepage` (single event page) and `AuthLayout` (login /
register / etc.) both assemble this manually since they don't share
`OrganizerPageShell`'s structure — if you add a new top-level public route,
match that pattern rather than leaving a page without the shared chrome.

`ThemeToggle` is a `position: fixed` circle pinned to the bottom-right
corner (`right: 20px; bottom: 20px`). Any other fixed bottom-right element
(e.g. `EventHomepage`'s floating "scroll to tickets" button) needs its own
`bottom` offset large enough to clear it (currently `88px`) — don't let two
fixed corner elements stack on the same offset.

## Components worth knowing about

- **`PaymentIcons`** (`frontend/src/components/common/PaymentIcons`) —
  hand-drawn SVG badges, *not* official Visa/Mastercard/Amex/Apple/Google
  logos. Swap in the real brand assets before this is customer-facing at
  scale, per each network's brand guidelines.
- **`LegalPageLayout`** — shared shell for `/privacy-policy` and
  `/terms-of-service`. Both pages' body copy must stay wrapped in Lingui
  `Trans`/`t` (see the Translations section of `CLAUDE.md`) since they're
  real legal text, not placeholder.
- **`ResourcesForChildren`** (home page, below the events spotlight) — three
  tabs: Colouring Pages (carousel + PDF downloads, currently empty pending
  real assets — see `colouringPagesData.ts`), Puzzles (static "coming
  soon"), and the story/poem submission form that feeds the
  `ChildStorySubmissions` moderation queue and the public
  `/events/:organizerId/:organizerSlug/stories` page.

## Motion

Keep animation subtle and purposeful — a short rise/fade on first paint
(hero heading, auth panel), never a persistent looping distraction except
where it reinforces a single focal element (the auth page's floating ticket
mockup). Always respect `prefers-reduced-motion: reduce` by disabling
animation entirely, not just shortening it — every animated component in
this codebase should have a matching `@media (prefers-reduced-motion: reduce)`
block.
