import {ConfigKeys} from "../types.ts";
import {getConfig} from "./config.ts";

const SHOPIFY_API_VERSION = '2025-07';
const SHOPIFY_COUNTRY = 'AE';
const SHOPIFY_LANGUAGE = 'EN';
const SHOPIFY_PRODUCT_LIMIT = 20;
const SHOPIFY_VARIANT_LIMIT = 20;

interface ShopifyMoney {
    amount: string;
    currencyCode: string;
}

interface ShopifyVariant {
    id: string;
    title: string;
    price: ShopifyMoney;
}

export interface ShopifyProduct {
    id: string;
    handle: string;
    title: string;
    imageUrl: string | null;
    imageAlt: string;
    variants: ShopifyVariant[];
}

type GridItem<P> =
    | { type: 'page'; page: P }
    | { type: 'product'; product: ShopifyProduct };

export type ShopifyCollectionConfigKey = Extract<ConfigKeys, `VITE_SHOPIFY_COLLECTION_AGE_${string}`>;

interface ShopifyConfig {
    storeDomain: string;
    storefrontToken: string;
    publicDomain: string;
}

interface RawCollectionResponse {
    collection: {
        products: {
            nodes: Array<{
                id: string;
                handle: string;
                title: string;
                featuredImage: { url: string; altText: string | null } | null;
                variants: {
                    nodes: Array<{
                        id: string;
                        title: string;
                        availableForSale: boolean;
                        price: ShopifyMoney;
                    }>;
                };
            }>;
        };
    } | null;
}

interface RawCartCreateResponse {
    cartCreate: {
        cart: { checkoutUrl: string } | null;
        userErrors: Array<{ message: string }>;
    };
}

const COLLECTION_QUERY = `
query ShopCollection($handle: String!, $products: Int!, $variants: Int!)
@inContext(country: ${SHOPIFY_COUNTRY}, language: ${SHOPIFY_LANGUAGE}) {
  collection(handle: $handle) {
    products(first: $products) {
      nodes {
        id
        handle
        title
        featuredImage { url altText }
        variants(first: $variants) {
          nodes { id title availableForSale price { amount currencyCode } }
        }
      }
    }
  }
}`;

const CART_CREATE_MUTATION = `
mutation ShopCartCreate($input: CartInput!)
@inContext(country: ${SHOPIFY_COUNTRY}, language: ${SHOPIFY_LANGUAGE}) {
  cartCreate(input: $input) {
    cart { checkoutUrl }
    userErrors { message }
  }
}`;

class ShopifyRequestError extends Error {}

export const getShopifyConfig = (): ShopifyConfig | null => {
    const storeDomain = getConfig('VITE_SHOPIFY_STORE_DOMAIN');
    const storefrontToken = getConfig('VITE_SHOPIFY_STOREFRONT_TOKEN');

    if (!storeDomain || !storefrontToken) {
        return null;
    }

    return {
        storeDomain,
        storefrontToken,
        publicDomain: getConfig('VITE_SHOPIFY_PUBLIC_DOMAIN') || storeDomain,
    };
};

export const getShopifyCollectionHandle = (key: ShopifyCollectionConfigKey): string | undefined => getConfig(key);

const shopifyRequest = async <T>(query: string, variables: Record<string, unknown>): Promise<T> => {
    const config = getShopifyConfig();
    if (!config) {
        throw new ShopifyRequestError();
    }

    const response = await fetch(`https://${config.storeDomain}/api/${SHOPIFY_API_VERSION}/graphql.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': config.storefrontToken,
        },
        body: JSON.stringify({query, variables}),
    });

    if (!response.ok) {
        throw new ShopifyRequestError();
    }

    const body = await response.json();
    if (body.errors?.length || !body.data) {
        throw new ShopifyRequestError();
    }

    return body.data as T;
};

const mapCollectionResponse = (data: RawCollectionResponse): ShopifyProduct[] =>
    (data.collection?.products.nodes ?? [])
        .map((node) => ({
            id: node.id,
            handle: node.handle,
            title: node.title,
            imageUrl: node.featuredImage?.url ?? null,
            imageAlt: node.featuredImage?.altText || node.title,
            variants: node.variants.nodes
                .filter((variant) => variant.availableForSale)
                .map(({id, title, price}) => ({id, title, price})),
        }))
        .filter((product) => product.variants.length > 0);

export const fetchShopifyCollection = async (collectionHandle: string): Promise<ShopifyProduct[]> => {
    const data = await shopifyRequest<RawCollectionResponse>(COLLECTION_QUERY, {
        handle: collectionHandle,
        products: SHOPIFY_PRODUCT_LIMIT,
        variants: SHOPIFY_VARIANT_LIMIT,
    });

    return mapCollectionResponse(data);
};

const rewriteCheckoutHost = (checkoutUrl: string, publicDomain: string): string => {
    const url = new URL(checkoutUrl);
    url.host = publicDomain;
    return url.toString();
};

export const createShopifyCheckoutUrl = async (variantId: string): Promise<string> => {
    const data = await shopifyRequest<RawCartCreateResponse>(CART_CREATE_MUTATION, {
        input: {
            lines: [{merchandiseId: variantId, quantity: 1}],
            buyerIdentity: {countryCode: SHOPIFY_COUNTRY},
        },
    });

    const checkoutUrl = data.cartCreate.cart?.checkoutUrl;
    if (!checkoutUrl || data.cartCreate.userErrors.length > 0) {
        throw new ShopifyRequestError();
    }

    return rewriteCheckoutHost(checkoutUrl, getShopifyConfig()?.publicDomain ?? new URL(checkoutUrl).host);
};

export const interleaveShopProducts = <P>(
    pages: P[],
    products: ShopifyProduct[],
    every: number
): GridItem<P>[] => {
    const items: GridItem<P>[] = [];
    let nextProduct = 0;

    pages.forEach((page, index) => {
        items.push({type: 'page', page});

        const isGroupEnd = (index + 1) % every === 0;
        if (isGroupEnd && nextProduct < products.length) {
            items.push({type: 'product', product: products[nextProduct++]});
        }
    });

    if (nextProduct === 0 && products.length > 0) {
        items.push({type: 'product', product: products[0]});
    }

    return items;
};

export const formatShopifyPrice = ({amount, currencyCode}: ShopifyMoney): string =>
    new Intl.NumberFormat('en', {style: 'currency', currency: currencyCode}).format(Number(amount));
