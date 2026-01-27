'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FaBullhorn, FaCalendar, FaUser, FaNewspaper } from 'react-icons/fa';
import { usePageContent } from '@/contexts/PageContentContext';

type BulletinItem = {
  id: string;
  type: 'news' | 'event';
  title: string;
  content: string;
  author: string;
  date: string;
  category: string;
};

export default function BulletinBoardPage() {
  const { getPage } = usePageContent();
  const pageInfo = getPage('/bulletin');
  const [items, setItems] = useState<BulletinItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [nRes, eRes] = await Promise.all([fetch('/api/news'), fetch('/api/events')]);
        const list: BulletinItem[] = [];

        if (nRes.ok) {
          const { news } = (await nRes.json()) as { news?: Array<{ id: string; title: string; excerpt?: string; content?: string; category: string; author?: string; publishedAt: string }> };
          (news || []).forEach((n) => {
            list.push({
              id: `news-${n.id}`,
              type: 'news',
              title: n.title,
              content: n.excerpt || n.content || '',
              author: n.author || 'League',
              date: n.publishedAt,
              category: n.category || 'News',
            });
          });
        }

        if (eRes.ok) {
          const { events } = (await eRes.json()) as { events?: Array<{ id: string; title: string; description?: string; date: string; time?: string; location?: string; status: string }> };
          (events || []).forEach((ev) => {
            list.push({
              id: `event-${ev.id}`,
              type: 'event',
              title: ev.title,
              content: ev.description || '',
              author: 'Events',
              date: ev.date,
              category: 'Events',
            });
          });
        }

        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setItems(list);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>(['All']);
    items.forEach((i) => cats.add(i.category));
    return Array.from(cats);
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchSearch =
        !searchTerm ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [items, selectedCategory, searchTerm]);

  return (
    <div className="min-h-screen static-page">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 static-page-content">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in flex items-center justify-center gap-3">
            <FaBullhorn className="w-8 h-8 text-amber-400" />
            <span className="text-gradient-arena">{pageInfo?.title ?? 'Bulletin Board'}</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto animate-fade-in-delayed">
            {pageInfo?.description ?? 'Upcoming events, news, and fun Magic articles. Editable via Admin & Wizard Control.'}
          </p>
        </div>

        <div className="animate-fade-in-delayed-2">
          <Card className="card-arena mb-8 border-amber-500/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(cat)}
                      className={
                        selectedCategory === cat
                          ? 'bg-amber-600 hover:bg-amber-700 border-amber-500/30'
                          : 'border-slate-600 text-slate-300 hover:border-amber-500/40 hover:text-amber-300'
                      }
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
                <div className="flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800/80 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {loading ? (
            <Card className="card-arena border-amber-500/20">
              <CardContent className="p-12 text-center">
                <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400">Loading…</p>
              </CardContent>
            </Card>
          ) : filtered.length > 0 ? (
            filtered.map((item, index) => (
              <div
                key={item.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${0.15 + index * 0.08}s`, opacity: 0 }}
              >
                <Card className="card-arena border-amber-500/20 hover:-translate-y-0.5 transition-all">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-xl text-white">{item.title}</CardTitle>
                          <Badge variant="outline" className="border-amber-500/50 text-amber-300">
                            {item.type === 'event' ? (
                              <span className="flex items-center gap-1">
                                <FaCalendar className="w-3 h-3" /> Events
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <FaNewspaper className="w-3 h-3" /> {item.category}
                              </span>
                            )}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <FaUser className="w-4 h-4" />
                            {item.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaCalendar className="w-4 h-4" />
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  {item.content && (
                    <CardContent>
                      <p className="text-slate-300">{item.content}</p>
                    </CardContent>
                  )}
                </Card>
              </div>
            ))
          ) : (
            <Card className="card-arena border-amber-500/20">
              <CardContent className="p-12 text-center">
                <FaBullhorn className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No items found</h3>
                <p className="text-slate-400">
                  Add news and events in Admin & Wizard Control (/admin) to see them here.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
