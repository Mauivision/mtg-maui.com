'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface PageConfig {
  path: string;
  title: string | null;
  description: string | null;
  config: Record<string, unknown>;
}

interface PageContentContextType {
  pages: PageConfig[];
  loading: boolean;
  getPage: (path: string) => PageConfig | undefined;
  getConfig: (path: string) => Record<string, unknown>;
  refresh: () => Promise<void>;
}

const PageContentContext = createContext<PageContentContextType | undefined>(undefined);

export function usePageContent() {
  const ctx = useContext(PageContentContext);
  if (ctx === undefined) throw new Error('usePageContent must be used within PageContentProvider');
  return ctx;
}

interface PageContentProviderProps {
  children: ReactNode;
}

export function PageContentProvider({ children }: PageContentProviderProps) {
  const [pages, setPages] = useState<PageConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch('/api/pages');
      if (res.ok) {
        const data = (await res.json()) as { pages?: PageConfig[] };
        setPages(data.pages ?? []);
      }
    } catch {
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const getPage = useCallback(
    (path: string) => {
      const normalized = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
      return pages.find((p) => p.path === normalized || p.path === path);
    },
    [pages]
  );

  const getConfig = useCallback(
    (path: string) => {
      return getPage(path)?.config ?? {};
    },
    [getPage]
  );

  const value: PageContentContextType = {
    pages,
    loading,
    getPage,
    getConfig,
    refresh: fetchPages,
  };

  return (
    <PageContentContext.Provider value={value}>{children}</PageContentContext.Provider>
  );
}
