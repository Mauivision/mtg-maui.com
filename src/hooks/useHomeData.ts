'use client';

import { useState, useEffect, useCallback } from 'react';

export interface HomeStats {
  totalUsers: number;
  totalLeagues: number;
  totalGames: number;
}

export interface HomeNewsItem {
  id: string;
  title: string;
  excerpt?: string;
  category: string;
  publishedAt: string;
}

export interface HomeEventItem {
  id: string;
  title: string;
  date: string;
  location?: string;
}

export interface UseHomeDataResult {
  stats: HomeStats;
  news: HomeNewsItem[];
  events: HomeEventItem[];
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useHomeData(): UseHomeDataResult {
  const [stats, setStats] = useState<HomeStats>({
    totalUsers: 0,
    totalLeagues: 0,
    totalGames: 0,
  });
  const [news, setNews] = useState<HomeNewsItem[]>([]);
  const [events, setEvents] = useState<HomeEventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [sRes, nRes, eRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/news'),
        fetch('/api/events'),
      ]);
      if (sRes.ok) {
        const d = await sRes.json();
        setStats({
          totalUsers: d.totalUsers ?? 0,
          totalLeagues: d.totalLeagues ?? 0,
          totalGames: d.totalGames ?? 0,
        });
      }
      if (nRes.ok) {
        const d = await nRes.json();
        setNews(Array.isArray(d.news) ? d.news : []);
      }
      if (eRes.ok) {
        const d = await eRes.json();
        setEvents(Array.isArray(d.events) ? d.events : []);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { stats, news, events, loading, refresh: fetchAll };
}
