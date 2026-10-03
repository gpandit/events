export interface HomepageFontDefinition {
    value: string;
    label: string;
    category: 'sans' | 'serif';
    stack: string;
}

const sansStack = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
const serifStack = `Georgia, 'Times New Roman', Times, serif`;

/**
 * Curated set of fonts offered in the homepage designer.
 * Kept in sync with backend/app/DomainObjects/Enums/HomepageFontFamily.php —
 * update both when adding or removing fonts.
 */
export const HOMEPAGE_FONTS: HomepageFontDefinition[] = [
    {value: 'Outfit', label: 'Outfit', category: 'sans', stack: sansStack},
    {value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', category: 'sans', stack: sansStack},
    {value: 'Playfair Display', label: 'Playfair Display', category: 'serif', stack: serifStack},
];

export const DEFAULT_HOMEPAGE_FONT = 'Outfit';

const FONT_LOOKUP: Record<string, HomepageFontDefinition> = HOMEPAGE_FONTS.reduce(
    (acc, font) => ({...acc, [font.value]: font}),
    {} as Record<string, HomepageFontDefinition>,
);

export const getHomepageFont = (value: string | null | undefined): HomepageFontDefinition => {
    if (value && FONT_LOOKUP[value]) {
        return FONT_LOOKUP[value];
    }
    return FONT_LOOKUP[DEFAULT_HOMEPAGE_FONT];
};

export const buildHomepageFontStack = (value: string | null | undefined): string => {
    const font = getHomepageFont(value);
    return `'${font.value}', ${font.stack}`;
};
