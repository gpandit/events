<?php

namespace HiEvents\DomainObjects\Enums;

/**
 * Curated set of fonts available for public event and organizer homepages.
 * Kept in sync with frontend/src/constants/homepageFonts.ts — update both when adding/removing fonts.
 */
enum HomepageFontFamily: string
{
    use BaseEnum;

    case Outfit = 'Outfit';
    case PlusJakartaSans = 'Plus Jakarta Sans';
    case PlayfairDisplay = 'Playfair Display';
}
