'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { LeagueProvider } from '@/contexts/LeagueContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <LeagueProvider>{children}</LeagueProvider>
    </SessionProvider>
  );
}
