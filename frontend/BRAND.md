# Brand & theme guidelines — public organizer site

**Scope:** the public-facing organizer pages (`src/components/layouts/OrganizerHomepage/**`
and the routes they render — homepage, events, Instagram, children's stories,
and the shared chrome: nav, footer, cookie banner, legal pages). Not the
authenticated `/manage/*` admin dashboard, which uses Mantine's own primary
colour scale (`src/styles/global.scss`) and is out of scope here.

Modelled on the same format as `fos`'s marketing-site brand guide (role / token /
hex / use table, explicit contrast notes, accessibility baseline) so both
products are easy to audit side by side.

## Two colour systems on this site

1. **Fixed chrome** — the nav bar and footer are the same on every organizer
   page regardless of that organizer's theme or light/dark mode. They exist
   so the site always reads as one product even when organizers pick wildly
   different accent colours.
2. **Organizer theme** — the homepage content area (hero, event cards,
   Resources for Children, children's stories) is themed per organizer via
   CSS custom properties computed in `src/utilites/themeUtils.ts` and applied
   in `src/hooks/useOrganizerThemeStyles.ts`. An organizer picks one `accent`
   colour; everything else (surface, text, border) is derived from the
   active light/dark mode, which follows the global theme toggle
   (`useComputedColorScheme`), not the organizer's saved preference.

## 1. Fixed chrome

| Role | Token / selector | Value | Use |
|---|---|---|---|
| Nav background | `OrganizerNav.module.scss` `.nav` | `rgba(255, 255, 255, 0.5)` + `backdrop-filter: blur(16px) saturate(160%)` | Frosted glass bar, same in light and dark mode — it floats above whatever is behind it, so it never needs its own dark variant |
| Nav text | `.brandName`, `.link` | `#15171a` (ink), `rgba(21, 23, 26, 0.68)` for inactive links | Fixed dark ink; passes 4.5:1+ against the frosted bar regardless of what the page behind it is doing |
| Nav hover/active accent | `.link:hover`, `.linkActive` | `var(--organizer-primary-color)` | The one place the organizer's own accent shows through the fixed chrome |
| Footer background | `SiteFooter.module.scss` `.footer` | `#2a323c` | Always dark, in both modes — a deliberate anchor so the page never ends on an inconsistent note |
| Footer primary text | `.footerNavLink:hover`, `.columnTitle` | `#ffffff` | 15.8:1 on `#2a323c` |
| Footer secondary text | `.footerNavLink`, `.brandText` | `#9aa2ad` | 4.6:1 on `#2a323c` — passes AA for body-size text |

Rule: nothing in the fixed chrome should read `--organizer-*` text-colour
variables for its own text — only for accent highlights. Mixing organizer
text colour into fixed-background chrome is exactly how a light-mode accent
disappears against the always-dark footer.

## 2. Organizer theme tokens (light / dark)

Derived in `getDerivedColors()` (`themeUtils.ts`):

| Role | Token | Light | Dark | Contrast |
|---|---|---|---|---|
| Surface (cards) | `--organizer-content-bg-color` | `#ffffff` | `#1f1f1f` | — |
| Primary text | `--organizer-primary-text-color` | `#1a1a1a` | `#ffffff` | 15.3:1 / 16.6:1 on surface |
| Secondary text | `--organizer-secondary-color` | `#525252` | `#a3a3a3` | 7.5:1 / 7.9:1 on surface |
| Tertiary text (meta, captions) | `--organizer-secondary-text-color` | `#737373` | `#8c8c8c` | 4.7:1 / 4.6:1 on surface |
| Border | `--organizer-border-color` | `rgba(0,0,0,0.1)` | `rgba(255,255,255,0.1)` | structural only, not text |
| Accent (organizer-chosen) | `--organizer-primary-color` | any hex the organizer picks | same hex, both modes | not guaranteed against surface — see below |
| Accent-on-fill text | `--organizer-accent-contrast` | `#1a1a1a` or `#ffffff`, picked by accent's own luminance | same | for text sitting *on top of* an accent-filled button |
| **Accent-as-text** | `--organizer-accent-text` | accent, nudged toward black until AA | accent, nudged toward white until AA | **use this**, not `--organizer-primary-color`, whenever the accent colour is the *text* (badges, links, small icons on a card) rather than a button fill |

### Why `--organizer-accent-text` exists

An organizer's `accent` is validated for use as a *button fill* (paired with
`--organizer-accent-contrast`) but was never checked against the *card
surface* it sits on. A mid-tone accent picked to look good as a button in
light mode can fail 4.5:1 against the dark-mode card surface (`#1f1f1f`)
when reused directly as text colour — that was the dark-mode legibility bug
reported on this site. `getAccentTextColor()` (`themeUtils.ts`) checks the
accent against the current surface and, only if it fails, blends it toward
white (dark mode) or black (light mode) in 20% steps until it clears AA.

**Rule:** any component colouring *text, a badge, or a small icon* with the
organizer accent must use `var(--organizer-accent-text, var(--organizer-primary-color, ...))`,
not `var(--organizer-primary-color)` directly. Buttons and filled pills
(where the accent is the *background*, paired with
`--organizer-accent-contrast` as the text colour) are unaffected and should
keep using `--organizer-primary-color` as the fill.

## Typography

- Display/body font is organizer-selectable (`--theme-font-family`), default
  **Outfit** — geometric, friendly, reads well for a children/family audience
  without tipping into a "kids' app" aesthetic.
- Headings: 700–800 weight, tight letter-spacing (`-0.01em` to `-0.02em`).
- Body copy: 0.9–0.95rem, 1.6–1.75 line-height — never below 16px-equivalent
  for anything but captions/dates.

## Accessibility baseline

- 4.5:1 minimum contrast for all body text and any accent used as text
  (enforced going forward via `--organizer-accent-text`, see above).
- Icons are SVG only (Tabler icons or hand-built silhouettes), never emoji.
- Carousel/scroll controls (`ColouringPagesTab`) are real `<button>` elements
  with `aria-label`s, not just scroll-snap with no visible affordance.
- `prefers-reduced-motion` is not yet wired into the hover/translate
  transitions added across these components — a follow-up, not covered by
  this pass.
