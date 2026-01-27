'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdventureLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function AdventureLink({ href, children, className = '', onClick }: AdventureLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} onClick={onClick}>
      <div className={`transform transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 active:scale-95 ${className}`}>
        <div className={`relative transition-all duration-300 ${isActive ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]' : ''}`}>
          {children}
          {isActive && (
            <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-amber-400 transition-all duration-300" />
          )}
        </div>
      </div>
    </Link>
  );
}
