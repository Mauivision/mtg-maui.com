'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

type Relic = {
  src: string;
  alt: string;
};

const RELICS: Relic[] = [
  { src: '/images/easter-eggs/prismatic-piper.png', alt: '' },
  { src: '/images/easter-eggs/mtg-logo-meta.png', alt: '' },
  { src: '/images/easter-eggs/oracle-alpha.png', alt: '' },
  { src: '/images/easter-eggs/mystic-flute.png', alt: '' },
  { src: '/images/easter-eggs/edge-eternities.png', alt: '' },
  { src: '/images/easter-eggs/warhammer-promo.png', alt: '' },
];

function hashString(input: string): number {
  // Deterministic, fast, non-crypto hash.
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickRelics(pathname: string) {
  const h = hashString(pathname || '/');
  const count = 2 + (h % 2); // 2–3 relics per route
  const picks: Array<{ relic: Relic; seed: number }> = [];
  for (let i = 0; i < count; i += 1) {
    const idx = (h + i * 101) % RELICS.length;
    picks.push({ relic: RELICS[idx]!, seed: h + i * 997 });
  }
  return picks;
}

function pos(seed: number) {
  // map seed → 0..1 floats
  const a = (seed % 10_000) / 10_000;
  const b = ((Math.floor(seed / 10_000) % 10_000) / 10_000) || 0.5;
  return { a, b };
}

export function HiddenRelics() {
  const pathname = usePathname() ?? '/';
  const picks = useMemo(() => pickRelics(pathname), [pathname]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[5] hidden md:block">
      {picks.map(({ relic, seed }, i) => {
        const { a, b } = pos(seed);
        const top = `${10 + Math.round(a * 75)}%`;
        const left = `${5 + Math.round(b * 85)}%`;
        const rotate = (seed % 21) - 10; // -10..10 deg
        const scale = 0.75 + ((seed % 7) / 10); // 0.75..1.35
        const opacity = 0.035 + ((seed % 5) * 0.01); // 0.035..0.075

        return (
          <div
            key={`${relic.src}-${i}`}
            className="absolute select-none"
            style={{
              top,
              left,
              transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${scale})`,
              opacity,
              filter: 'blur(0.2px) saturate(0.85) contrast(1.05)',
              mixBlendMode: 'soft-light',
            }}
          >
            <Image
              src={relic.src}
              alt={relic.alt}
              width={520}
              height={320}
              className="max-w-[42vw] lg:max-w-[28vw] h-auto rounded-xl"
              unoptimized
              priority={false}
            />
          </div>
        );
      })}
    </div>
  );
}

