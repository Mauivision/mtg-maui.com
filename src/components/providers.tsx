'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { LeagueProvider } from '@/contexts/LeagueContext';
import { PageContentProvider } from '@/contexts/PageContentContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <LeagueProvider>
        <PageContentProvider>{children}</PageContentProvider>
      </LeagueProvider>
    </SessionProvider>
  );
}
