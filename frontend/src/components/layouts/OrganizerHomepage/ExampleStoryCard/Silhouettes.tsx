import React from 'react';

type SilhouetteProps = {
    className?: string;
};

export const LanternUnderTreeSilhouette: React.FC<SilhouetteProps> = ({className}) => (
    <svg viewBox="0 0 160 160" className={className} aria-hidden="true">
        <circle cx="46" cy="50" r="34" fill="currentColor"/>
        <rect x="41" y="80" width="10" height="34" rx="2" fill="currentColor"/>
        <circle cx="112" cy="68" r="11" fill="currentColor"/>
        <path d="M98 84 Q112 77 126 84 L130 140 Q112 149 94 140 Z" fill="currentColor"/>
        <rect x="117" y="52" width="4" height="18" rx="2" fill="currentColor" transform="rotate(-18 119 61)"/>
        <rect x="124" y="42" width="12" height="15" rx="2" fill="currentColor"/>
    </svg>
);

export const CatSilhouette: React.FC<SilhouetteProps> = ({className}) => (
    <svg viewBox="0 0 160 160" className={className} aria-hidden="true">
        <path d="M63 46 L58 16 L80 44 Z" fill="currentColor"/>
        <path d="M97 44 L102 16 L111 46 Z" fill="currentColor"/>
        <path
            d="M40 142 Q33 92 60 62 Q80 44 100 62 Q127 92 120 142 Q100 152 80 152 Q60 152 40 142 Z"
            fill="currentColor"
        />
        <path d="M116 118 Q144 108 138 78 Q136 68 127 73 Q138 94 114 108 Z" fill="currentColor"/>
    </svg>
);

export const BoatUnderMoonSilhouette: React.FC<SilhouetteProps> = ({className}) => (
    <svg viewBox="0 0 160 160" className={className} aria-hidden="true">
        <circle cx="112" cy="36" r="18" fill="currentColor"/>
        <circle cx="82" cy="92" r="9" fill="currentColor"/>
        <rect x="78" y="100" width="4" height="22" rx="1" fill="currentColor"/>
        <path d="M40 122 L122 122 L104 144 L58 144 Z" fill="currentColor"/>
        <path
            d="M18 150 Q40 142 62 150 Q84 158 106 150 Q128 142 150 150"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
        />
    </svg>
);
