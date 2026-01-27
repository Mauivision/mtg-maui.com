'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FaTrophy, FaUsers, FaCalendar, FaArrowRight, FaDice, FaNewspaper } from 'react-icons/fa';
import { CastleGate } from '@/components/ui/CastleGate';
import { usePageContent } from '@/contexts/PageContentContext';

const iconByHref: Record<string, React.ComponentType<{ className?: string }>> = {
  '/leaderboard': FaTrophy,
  '/character-sheets': FaUsers,
  '/rules': FaCalendar,
};

const defaultFeatures = [
  { title: 'Leaderboard', desc: 'Track your progress and see how you rank against other players.', href: '/leaderboard', cta: 'View Rankings' },
  { title: 'Character Sheets', desc: 'View your D&D-style character progression and achievements.', href: '/character-sheets', cta: 'View Sheets' },
  { title: 'Rules', desc: 'Learn about tournament formats, scoring, and house rules.', href: '/rules', cta: 'Read Rules' },
];

const statConfig = [
  { key: 'totalUsers' as const, label: 'Active Players', icon: FaUsers, color: 'from-blue-600/80 to-blue-800/80 border-blue-500/40' },
  { key: 'totalLeagues' as const, label: 'Tournaments', icon: FaTrophy, color: 'from-amber-600/80 to-amber-800/80 border-amber-500/40' },
  { key: 'totalGames' as const, label: 'Games Played', icon: FaCalendar, color: 'from-emerald-600/80 to-emerald-800/80 border-emerald-500/40' },
];

export default function HomePage() {
  const { getConfig } = usePageContent();
  const homeConfig = getConfig('/') as {
    heroSubtitle?: string;
    heroHeadline?: string;
    heroTagline?: string;
    exploreTitle?: string;
    exploreSubtitle?: string;
    features?: Array<{ title: string; desc: string; href: string; cta: string }>;
  } | undefined;
  const [stats, setStats] = useState<Record<string, number>>({ totalUsers: 0, totalLeagues: 0, totalGames: 0 });
  const [events, setEvents] = useState<Array<{ id: string; title: string; date: string; location?: string; status: string }>>([]);
  const [news, setNews] = useState<Array<{ id: string; title: string; excerpt?: string; category: string; publishedAt: string }>>([]);
  const [loading, setLoading] = useState(true);

  const heroSubtitle = homeConfig?.heroSubtitle ?? "Hawaii's Premier MTG League";
  const heroHeadline = homeConfig?.heroHeadline ?? 'Enter the Arena';
  const heroTagline = homeConfig?.heroTagline ?? 'Commander. Draft. Real rankings. Real players. The ultimate Magic league experience.';
  const exploreTitle = homeConfig?.exploreTitle ?? 'Explore the League';
  const exploreSubtitle = homeConfig?.exploreSubtitle ?? 'Climb the ranks, track your journey, and master the rules.';
  const features = Array.isArray(homeConfig?.features) && homeConfig.features.length > 0
    ? homeConfig.features
    : defaultFeatures;

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, eRes, nRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/events'),
          fetch('/api/news'),
        ]);
        if (sRes.ok) {
          const d = await sRes.json();
          setStats({ totalUsers: d.totalUsers ?? 0, totalLeagues: d.totalLeagues ?? 0, totalGames: d.totalGames ?? 0 });
        }
        if (eRes.ok) {
          const d = await eRes.json();
          setEvents(Array.isArray(d.events) ? d.events.slice(0, 5) : []);
        }
        if (nRes.ok) {
          const d = await nRes.json();
          setNews(Array.isArray(d.news) ? d.news.slice(0, 5) : []);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen static-page">
      <CastleGate onGateOpen={() => {}}>
        {/* Hero — Enter the Arena */}
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(/images/medieval-background.jpg)',
              backgroundBlendMode: 'overlay',
              backgroundColor: 'rgba(10, 12, 18, 0.85)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950" />

          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center static-page-content">
            <p className="text-amber-400/90 text-sm uppercase tracking-[0.2em] mb-4 animate-fade-in-up">
              {heroSubtitle}
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              {heroHeadline.includes('Arena') ? (
                <>
                  {heroHeadline.replace('Arena', '').trim()}
                  {' '}
                  <span className="text-gradient-arena">Arena</span>
                </>
              ) : (
                heroHeadline
              )}
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {heroTagline}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link href="/leaderboard">
                <Button size="lg" variant="primary" ripple glow className="bg-gradient-to-r from-amber-600 to-amber-700 text-white border border-amber-500/30 hover:from-amber-500 hover:to-amber-600 shadow-lg shadow-amber-950/30">
                  <FaTrophy className="w-5 h-5 mr-2" />
                  View Leaderboard
                </Button>
              </Link>
              <Link href="/character-sheets">
                <Button variant="outline" size="lg" ripple className="border-2 border-amber-500/50 text-amber-400 hover:bg-amber-500/10 hover:border-amber-400">
                  Character Sheets
                </Button>
              </Link>
            </div>

            {/* Mana-style stat orbs — editable via Admin */}
            <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              {statConfig.map(({ key, label, icon: Icon, color }, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className={`mana-orb bg-gradient-to-br ${color}`}>
                    <Icon className="w-6 h-6 text-white/90" />
                  </div>
                  <div className="text-2xl font-bold text-white mt-3">{loading ? '—' : String(stats[key] ?? 0)}</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming Events — editable via Admin / Wizards */}
        {events.length > 0 && (
          <section className="py-16 relative">
            <div className="absolute inset-0 bg-slate-950/80" />
            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-amber-400 mb-6">Upcoming Events</h2>
              <div className="space-y-4">
                {events.map((ev) => (
                  <Link key={ev.id} href="/bulletin">
                    <Card className="card-arena bg-slate-800/80 border-slate-600 hover:border-amber-500/40 transition-colors">
                      <CardContent className="py-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center">
                            <FaCalendar className="w-6 h-6 text-amber-400" />
                          </div>
                          <div>
                            <div className="font-semibold text-white">{ev.title}</div>
                            <div className="text-sm text-slate-400">
                              {ev.date && new Date(ev.date).toLocaleDateString()}
                              {ev.location ? ` · ${ev.location}` : ''}
                            </div>
                          </div>
                        </div>
                        <span className="text-amber-400 text-sm">Details <FaArrowRight className="inline w-3 h-3 ml-1" /></span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Link href="/bulletin">
                  <Button variant="outline" size="sm" className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10">
                    All events & news
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Recent News — editable via Admin; fun Magic articles */}
        {news.length > 0 && (
          <section className="py-16 relative">
            <div className="absolute inset-0 bg-slate-950/50" />
            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-amber-400 mb-6">Recent News & Articles</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {news.map((n) => (
                  <Link key={n.id} href="/bulletin">
                    <Card className="card-arena bg-slate-800/80 border-slate-600 hover:border-amber-500/40 transition-colors h-full">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-white text-lg flex items-center gap-2">
                          <FaNewspaper className="w-4 h-4 text-amber-400" />
                          {n.title}
                        </CardTitle>
                        <p className="text-slate-400 text-sm">{n.excerpt || n.category}</p>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Link href="/bulletin">
                  <Button variant="outline" size="sm" className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10">
                    View all
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Chaos Draft — fallback when no events */}
        {events.length === 0 && (
        <section className="py-16 relative">
          <div className="absolute inset-0 bg-slate-950/80" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="card-arena rounded-2xl p-8 sm:p-10 border-2 border-red-500/30 bg-gradient-to-br from-slate-900/95 via-red-950/20 to-slate-900/95">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center">
                    <FaDice className="w-7 h-7 text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-red-100">Chaos Draft</h2>
                    <p className="text-red-300/80 text-sm">Pack Opening · Tournament</p>
                  </div>
                </div>
                <Link href="/bulletin">
                  <Button variant="outline" size="sm" className="border-red-500/50 text-red-300 hover:bg-red-500/10">
                    Details <FaArrowRight className="w-3 h-3 ml-1 inline" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* Features — editable via Admin > Page Content (home) */}
        <section className="py-20 bg-slate-950/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-white mb-4">{exploreTitle}</h2>
            <p className="text-slate-400 text-center max-w-xl mx-auto mb-12">{exploreSubtitle}</p>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((f, i) => {
                const Icon = iconByHref[f.href] ?? FaTrophy;
                return (
                  <Card
                    key={f.href + i}
                    className="card-arena group transition-all duration-300 hover:-translate-y-1"
                  >
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-3">
                        <span className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:border-amber-500/50 transition-colors">
                          <Icon className="w-5 h-5" />
                        </span>
                        {f.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-400 mb-5">{f.desc}</p>
                      <Link href={f.href}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 w-full justify-between group/btn"
                        >
                          {f.cta}
                          <FaArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </CastleGate>
    </div>
  );
}
