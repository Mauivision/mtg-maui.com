'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Wizard control is combined with Admin. Redirect /wizards -> /admin.
 */
export default function WizardsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
