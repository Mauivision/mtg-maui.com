'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Admin page redirects to Wizards Control page.
 * All admin functionality has been consolidated into /wizards.
 */
export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/wizards');
  }, [router]);

  return null;
}
