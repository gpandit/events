# Age-grouped colouring library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Spec: `docs/superpowers/specs/2026-10-25-age-grouped-colouring-library-design.md`.

**Goal:** Four age tabs, an organizer upload screen, and per-age Shopify collections.

**Architecture:** New `colouring_pages` table following the child-story-submissions pattern (Action -> Handler -> Repository), files on the public disk, thumbnail rendered client-side with PDF.js.

**Tech Stack:** Laravel, Postgres, React, React Query, Mantine, pdfjs-dist, Lingui.

## Global Constraints
Repo rules from CLAUDE.md apply: no explanatory comments, no dead code, BaseAction response helpers, custom exceptions, `__()` and Lingui strings with Arabic translations, unit tests in `tests/Unit`, `HtmlPurifierService` on stored text.

### Task 1: Backend schema, enums, repository
Migration, enums (`ColouringPageAgeGroup`, `ColouringPageTint`, `ColouringPageStatus`), model, generated + concrete domain object, repository + interface + provider binding.

### Task 2: Backend file storage and handlers
`ColouringPageFileStorageService`, handlers (list, published list, create, update, delete, reorder) with unit tests.

### Task 3: Backend actions, requests, resources, routes
Actions and FormRequests, `ColouringPageResource`, `PublicColouringPageResource`, routes, `scramble:analyze`.

### Task 4: Frontend data layer and admin screen
Types, API client, queries, mutations, PDF thumbnail helper, dashboard route and nav entry, upload modal.

### Task 5: Homepage tabs and Shopify per-age collections
Four sub-tabs, per-age collection handles in config, remove static data, pass organizer id into `ResourcesForChildren`.

### Task 6: Translations, verification, push, PR
