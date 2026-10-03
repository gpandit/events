import React from 'react';
import classes from './PageBanner.module.scss';

export type PageBannerVariant = 'home' | 'events' | 'about' | 'stories' | 'resources';

interface PageBannerProps {
    variant: PageBannerVariant;
}

const Hills: React.FC<{ back: string; front: string }> = ({back, front}) => (
    <>
        <path d="M0 140 Q200 80 420 125 T860 110 T1200 120 V160 H0 Z" fill={back}/>
        <path d="M0 150 Q260 115 520 145 T1040 135 T1200 148 V160 H0 Z" fill={front}/>
    </>
);

const scenes: Record<PageBannerVariant, { from: string; to: string; art: React.ReactNode }> = {
    home: {
        from: '#38bdf8',
        to: '#a3e635',
        art: (
            <>
                <circle cx="1020" cy="52" r="30" fill="#fde047"/>
                <g fill="#ffffff" opacity="0.9">
                    <ellipse cx="220" cy="48" rx="54" ry="16"/>
                    <ellipse cx="260" cy="38" rx="36" ry="14"/>
                    <ellipse cx="640" cy="70" rx="64" ry="16"/>
                    <ellipse cx="690" cy="58" rx="40" ry="14"/>
                </g>
                <Hills back="#4ade80" front="#16a34a"/>
            </>
        ),
    },
    events: {
        from: '#fb7185',
        to: '#fbbf24',
        art: (
            <>
                <path d="M0 14 Q300 50 600 14 T1200 14" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.8"/>
                {[60, 170, 280, 390, 500, 610, 720, 830, 940, 1050, 1150].map((x, i) => (
                    <path
                        key={x}
                        d={`M${x} ${22 + (i % 2) * 6} l22 0 l-11 30 z`}
                        fill={['#ffffff', '#38bdf8', '#a78bfa', '#34d399'][i % 4]}
                        opacity="0.95"
                    />
                ))}
                <g>
                    <ellipse cx="120" cy="108" rx="22" ry="28" fill="#38bdf8"/>
                    <ellipse cx="170" cy="96" rx="22" ry="28" fill="#a78bfa"/>
                    <ellipse cx="1030" cy="100" rx="22" ry="28" fill="#34d399"/>
                    <ellipse cx="1082" cy="112" rx="22" ry="28" fill="#ffffff"/>
                    <path d="M120 136 Q130 150 124 160 M170 124 Q160 145 168 160 M1030 128 Q1040 146 1034 160 M1082 140 Q1072 150 1078 160" stroke="#ffffff" strokeWidth="2" fill="none"/>
                </g>
                <g fill="#ffffff" opacity="0.85">
                    <circle cx="340" cy="100" r="5"/>
                    <circle cx="470" cy="120" r="4"/>
                    <circle cx="700" cy="104" r="6"/>
                    <circle cx="860" cy="124" r="4"/>
                    <circle cx="940" cy="92" r="5"/>
                </g>
                <path d="M600 70 l8 18 l20 2 l-15 13 l5 20 l-18 -11 l-18 11 l5 -20 l-15 -13 l20 -2 z" fill="#ffffff" opacity="0.9"/>
            </>
        ),
    },
    about: {
        from: '#2dd4bf',
        to: '#facc15',
        art: (
            <>
                <circle cx="150" cy="54" r="30" fill="#fff7ae"/>
                <Hills back="#34d399" front="#059669"/>
                {[420, 520, 880, 980].map((x, i) => (
                    <g key={x}>
                        <rect x={x - 4} y={96 + (i % 2) * 8} width="8" height="30" fill="#92400e"/>
                        <circle cx={x} cy={84 + (i % 2) * 8} r="22" fill={i % 2 ? '#22c55e' : '#16a34a'}/>
                    </g>
                ))}
                <g fill="#fb7185">
                    <path d="M640 60 c-10 -16 -34 -2 -20 16 l20 20 l20 -20 c14 -18 -10 -32 -20 -16 z"/>
                    <path d="M720 40 c-7 -11 -24 -1 -14 11 l14 14 l14 -14 c10 -12 -7 -22 -14 -11 z" opacity="0.8"/>
                    <path d="M570 38 c-7 -11 -24 -1 -14 11 l14 14 l14 -14 c10 -12 -7 -22 -14 -11 z" opacity="0.8"/>
                </g>
            </>
        ),
    },
    stories: {
        from: '#4338ca',
        to: '#c026d3',
        art: (
            <>
                <circle cx="1040" cy="56" r="32" fill="#fef3c7"/>
                <circle cx="1056" cy="48" r="28" fill="#5b21b6" opacity="0.55"/>
                <g fill="#ffffff">
                    <circle cx="90" cy="30" r="2.5"/>
                    <circle cx="210" cy="64" r="2"/>
                    <circle cx="330" cy="26" r="3"/>
                    <circle cx="450" cy="58" r="2"/>
                    <circle cx="760" cy="34" r="2.5"/>
                    <circle cx="860" cy="70" r="2"/>
                    <circle cx="940" cy="24" r="3"/>
                    <circle cx="1150" cy="40" r="2"/>
                </g>
                <g transform="translate(0 -34)">
                <path d="M520 130 Q600 100 600 100 Q600 100 680 130 V148 Q600 120 600 120 Q600 120 520 148 Z" fill="#fde68a"/>
                <path d="M600 100 V120" stroke="#b45309" strokeWidth="3"/>
                <path d="M540 126 Q570 114 596 122 M604 122 Q630 114 660 126" stroke="#b45309" strokeWidth="2" fill="none"/>
                <path d="M780 120 q40 -50 90 -70 q-10 40 -50 80 z" fill="#f9a8d4"/>
                <path d="M780 120 L862 56" stroke="#9d174d" strokeWidth="2"/>
                </g>
                <Hills back="#6d28d9" front="#4c1d95"/>
            </>
        ),
    },
    resources: {
        from: '#8b5cf6',
        to: '#f472b6',
        art: (
            <>
                {[
                    {x: 140, c: '#facc15'},
                    {x: 200, c: '#38bdf8'},
                    {x: 260, c: '#4ade80'},
                ].map((p, i) => (
                    <g key={p.x} transform={`rotate(${-18 + i * 10} ${p.x} 100)`}>
                        <rect x={p.x} y="40" width="20" height="90" rx="3" fill={p.c}/>
                        <path d={`M${p.x} 40 l10 -22 l10 22 z`} fill="#fde8d0"/>
                        <path d={`M${p.x + 5} 28 l5 -10 l5 10 z`} fill="#1f2937"/>
                    </g>
                ))}
                <g transform="translate(560 40)">
                    <path d="M0 0 h38 v-8 a10 10 0 1 1 20 0 v8 h38 v38 h-8 a10 10 0 1 0 0 20 h8 v38 h-96 z" fill="#ffffff" opacity="0.92"/>
                </g>
                <g transform="translate(700 56) rotate(14)">
                    <path d="M0 0 h38 v-8 a10 10 0 1 1 20 0 v8 h38 v38 h-96 z" fill="#fde047" opacity="0.95"/>
                </g>
                <path d="M980 40 l10 22 l24 3 l-18 16 l6 24 l-22 -13 l-22 13 l6 -24 l-18 -16 l24 -3 z" fill="#fde047"/>
                <g fill="#ffffff" opacity="0.8">
                    <circle cx="420" cy="50" r="6"/>
                    <circle cx="470" cy="118" r="5"/>
                    <circle cx="880" cy="44" r="5"/>
                    <circle cx="1100" cy="110" r="7"/>
                </g>
            </>
        ),
    },
};

export const PageBanner: React.FC<PageBannerProps> = ({variant}) => {
    const scene = scenes[variant];
    const gradientId = `page-banner-${variant}`;

    return (
        <div className={classes.banner} aria-hidden="true" data-testid="page-banner">
            <svg className={classes.scene} viewBox="0 0 1200 160" preserveAspectRatio="xMidYMid slice">
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor={scene.from}/>
                        <stop offset="1" stopColor={scene.to}/>
                    </linearGradient>
                </defs>
                <rect width="1200" height="160" fill={`url(#${gradientId})`}/>
                {scene.art}
            </svg>
        </div>
    );
};

export default PageBanner;
