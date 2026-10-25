# Shopify Products in Colouring Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show products from the I CREATE Shopify `colours` collection between the colouring pages; clicking one opens a modal whose Buy now button opens Shopify checkout in a new tab.

**Architecture:** A pure `utilites/shopify.ts` module holds config, GraphQL requests, response mapping, interleaving and checkout-host rewriting. A React Query hook loads the collection (client-side only), a mutation creates the cart. `ColouringPagesTab` interleaves `ShopProductCard`s into the grid and opens `ShopProductModal`.

**Tech Stack:** React, TypeScript, React Query, Mantine, SCSS modules, Lingui, Shopify Storefront GraphQL API 2025-07.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-10-25-shopify-products-in-colouring-pages-design.md`
- No iframe; checkout opens in a new tab on `www.icreate.art`
- Country `AE`, language `EN` via `@inContext`; no `/en-ae` path
- Config keys: `VITE_SHOPIFY_STORE_DOMAIN`, `VITE_SHOPIFY_STOREFRONT_TOKEN`, `VITE_SHOPIFY_COLLECTION_HANDLE`, `VITE_SHOPIFY_PUBLIC_DOMAIN`; token never committed
- Missing config / failed fetch / empty collection: page unchanged
- One shop card after every 3rd colouring page; leftover products not appended
- Repo rules: no explanatory comments, no dead code, `t` for user strings with `ar` translations, `showError` for errors, SSR-safe, `data-testid` on interactive elements
- The frontend has no unit-test runner; adding one is out of scope, so verification is `npx tsc --noEmit`, `yarn lint` and a one-off script run for the pure helpers

---

### Task 1: Config keys

**Files:**
- Modify: `frontend/src/types.ts` (ConfigKeys union)
- Modify: `frontend/src/utilites/config.ts` (clientBuildEnv)
- Modify: `frontend/.env.example`

- [ ] Add `| 'VITE_SHOPIFY_STORE_DOMAIN' | 'VITE_SHOPIFY_STOREFRONT_TOKEN' | 'VITE_SHOPIFY_COLLECTION_HANDLE' | 'VITE_SHOPIFY_PUBLIC_DOMAIN'` after `'VITE_DEFAULT_SHARE_IMAGE_PATH'`.
- [ ] Add the four `import.meta.env.*` entries to `clientBuildEnv`.
- [ ] Append the four empty keys to `.env.example`.
- [ ] Run `npx tsc --noEmit` (expect no errors); commit `feat: add Shopify config keys`.

### Task 2: Shopify module

**Files:**
- Create: `frontend/src/utilites/shopify.ts`

**Produces:** `getShopifyConfig(): ShopifyConfig | null`, `fetchShopifyCollection(config): Promise<ShopifyProduct[]>`, `createShopifyCheckoutUrl(config, variantId): Promise<string>`, `interleaveShopProducts`, `rewriteCheckoutHost`, `formatShopifyPrice`, types `ShopifyProduct`, `ShopifyVariant`, `ShopifyMoney`, `GridItem`.

- [ ] Implement the module (see code in the commit).
- [ ] Verify helpers with a one-off script: interleave 12 pages / 9 products / every 3 yields 4 products at positions 4, 8, 12, 16; `rewriteCheckoutHost('https://x.myshopify.com/cart/c/abc?key=1','www.icreate.art')` yields `https://www.icreate.art/cart/c/abc?key=1`; mapper drops products with no available variant.
- [ ] Commit `feat: add Shopify Storefront helpers`.

### Task 3: Query and mutation

**Files:**
- Create: `frontend/src/queries/useGetShopifyCollection.ts`
- Create: `frontend/src/mutations/useCreateShopifyCheckout.ts`

- [ ] Query: key `GET_SHOPIFY_COLLECTION_QUERY_KEY`, `enabled` only when `getShopifyConfig()` is non-null, `retry: false`, `staleTime` 5 minutes.
- [ ] Mutation: `mutationFn: (variantId: string) => createShopifyCheckoutUrl(config, variantId)`.
- [ ] `npx tsc --noEmit`; commit `feat: add Shopify query and checkout mutation`.

### Task 4: UI

**Files:**
- Create: `frontend/src/components/layouts/OrganizerHomepage/ResourcesForChildren/ColouringPagesTab/ShopProductCard.tsx`
- Create: `.../ColouringPagesTab/ShopProductModal.tsx`
- Modify: `.../ColouringPagesTab/index.tsx`
- Modify: `.../ResourcesForChildren.module.scss`

- [ ] Card: `<button>` using existing tile styling, "Shop" badge, title, price; `data-testid="shop-product-card"`.
- [ ] Modal: Mantine `Modal`; image, title, price, `Select` of available variants when more than one, Buy now button `data-testid="shop-buy-now-button"`. Click opens a blank tab synchronously (avoids popup blockers), then sets its location to the checkout URL; on error closes the tab and calls `showError`.
- [ ] `ColouringPagesTab`: call the query hook, build items with `interleaveShopProducts(colouringPages, products, 3)`, render cards or pages, hold selected product state.
- [ ] `npx tsc --noEmit` and `yarn lint`; commit `feat: show Shopify products between colouring pages`.

### Task 5: Translations

**Files:**
- Modify: `frontend/src/locales/en.po`, `ar.po` (and compiled `.js`)

- [ ] `yarn messages:extract --clean`, add Arabic for each new string, `yarn messages:compile`, confirm 0 missing; commit `feat: add translations for Shopify shop cards`.

### Task 6: Verify, push, PR

- [ ] `npx tsc --noEmit`, `yarn lint`, `yarn build`.
- [ ] Push, open draft PR, subscribe.
