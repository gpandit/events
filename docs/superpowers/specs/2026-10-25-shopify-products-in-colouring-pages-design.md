# Shopify products in the colouring pages grid

## Goal
Show I CREATE products from the Shopify `colours` collection between the colouring pages in the Creative Corner. Clicking a product opens an in-page modal where the shopper can start a purchase; checkout completes on Shopify's hosted checkout in a new tab.

## Decisions
- No iframe. Shopify sends `X-Frame-Options` / `frame-ancestors` headers that block product pages and checkout inside third-party frames, and Shop Pay / payment steps cannot run in one.
- Products are fetched live from the Shopify Storefront API (collection handle `colours`, collection id `696658329926`).
- The UAE market is selected through `@inContext(country: AE, language: EN)`, not through a `/en-ae` URL path. Enabled markets on the store are UAE (`AE`) and United Kingdom (`GB`).
- Customers only ever see `www.icreate.art`; checkout URLs returned by Shopify are rewritten to that host.

## Configuration
New frontend config keys, read through `getConfig` and declared in `types.ts`, `clientBuildEnv` and `.env.example`:

| Key | Value |
| --- | --- |
| `VITE_SHOPIFY_STORE_DOMAIN` | `17q71t-jj.myshopify.com` |
| `VITE_SHOPIFY_STOREFRONT_TOKEN` | public Storefront access token (set in env, never committed) |
| `VITE_SHOPIFY_COLLECTION_HANDLE` | `colours` |
| `VITE_SHOPIFY_PUBLIC_DOMAIN` | `www.icreate.art` |

The country (`AE`) and language (`EN`) are constants in the Shopify query module. If the domain, token or handle is missing, the feature renders nothing.

## Components
- `queries/useGetShopifyCollection.ts` — React Query hook; POSTs the collection query to `https://<store-domain>/api/2025-07/graphql.json`; maps the response to `ShopifyProduct[]` (handle, title, image, price, currency, available variants with id/title/price/availability).
- `mutations/useCreateShopifyCheckout.ts` — React Query mutation; `cartCreate` with one line (variant id, quantity 1) and `buyerIdentity.countryCode: AE`; returns the `checkoutUrl`.
- `utilites/shopify.ts` — pure helpers: `rewriteCheckoutHost(url, publicDomain)` and `interleaveShopProducts(pages, products, every)`.
- `ColouringPagesTab/ShopProductCard` — tile in the existing grid styling with a "Shop" badge, product image, title and price.
- `ColouringPagesTab/ShopProductModal` — Mantine modal: image, title, price, variant select when more than one available variant, "Buy now" button. Buy now opens the rewritten checkout URL in a new tab.

## Placement
`ColouringPagesTab` renders one shop card after every 3rd colouring page, in collection order. Remaining products after the last page are not appended. The existing `ShopBanner` stays.

## Data flow
1. `ColouringPagesTab` calls `useGetShopifyCollection` (client-side only; disabled during SSR).
2. Products are interleaved into the grid.
3. Card click opens the modal for that product.
4. Buy now runs `cartCreate`, rewrites the host of `checkoutUrl`, and opens it with `window.open(url, '_blank', 'noopener')`.

## Error handling
- Missing config, fetch failure, empty collection, or no available products: no shop cards render and the page is unchanged.
- Checkout creation failure: `showError` from `utilites/notifications.tsx`; the modal stays open.
- Sold-out variants are not selectable; a product with no available variant is omitted.

## Testing
- Unit tests for `rewriteCheckoutHost`, `interleaveShopProducts` and the response mapper.
- Lingui strings for all new user-facing text with translations in every supported locale.
- Manual verification against the live store from an environment that can reach `*.myshopify.com`: products load with AED prices, modal opens, Buy now lands on `www.icreate.art` checkout.

## Out of scope
Cart with multiple items, quantity selector, discount codes, and any change to the Hi.Events ticketing flow.
