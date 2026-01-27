'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FaTrophy, FaUsers, FaCalendar, FaArrowRight, FaDice } from 'react-icons/fa';
import { CastleGate } from '@/components/ui/CastleGate';

const stats = [
  { label: 'Active Players', value: '127', icon: FaUsers, color: 'from-blue-600/80 to-blue-800/80 border-blue-500/40' },
  { label: 'Tournaments', value: '8', icon: FaTrophy, color: 'from-amber-600/80 to-amber-800/80 border-amber-500/40' },
  { label: 'Games Played', value: '342', icon: FaCalendar, color: 'from-emerald-600/80 to-emerald-800/80 border-emerald-500/40' },
];

const features = [
  {
    title: 'Leaderboard',
    desc: 'Track your progress and see how you rank against other players.',
    href: '/leaderboard',
    icon: FaTrophy,
    cta: 'View Rankings',
  },
  {
    title: 'Character Sheets',
    desc: 'View your D&D-style character progression and achievements.',
    href: '/character-sheets',
    icon: FaUsers,
    cta: 'View Sheets',
  },
  {
    title: 'Rules',
    desc: 'Learn about tournament formats, scoring, and house rules.',
    href: '/rules',
    icon: FaCalendar,
    cta: 'Read Rules',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen static-page">
      <CastleGate
        onGateOpen={() => {
          // Gate animation complete - no logging needed
        }}
      >
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
              Hawaii&apos;s Premier MTG League
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Enter the{' '}
              <span className="text-gradient-arena">Arena</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Commander. Draft. Real rankings. Real players. The ultimate Magic league experience.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link href="/leaderboard">
                <Button
                  size="lg"
                  variant="primary"
                  ripple
                  glow
                  className="bg-gradient-to-r from-amber-600 to-amber-700 text-white border border-amber-500/30 hover:from-amber-500 hover:to-amber-600 shadow-lg shadow-amber-950/30"
                >
                  <FaTrophy className="w-5 h-5 mr-2" />
                  View Leaderboard
                </Button>
              </Link>
              <Link href="/character-sheets">
                <Button
                  variant="outline"
                  size="lg"
                  ripple
                  className="border-2 border-amber-500/50 text-amber-400 hover:bg-amber-500/10 hover:border-amber-400"
                >
                  Character Sheets
                </Button>
              </Link>
            </div>

            {/* Mana-style stat orbs */}
            <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="flex flex-col items-center">
                    <div className={`mana-orb bg-gradient-to-br ${stat.color}`}>
                      <Icon className="w-6 h-6 text-white/90" />
                    </div>
                    <div className="text-2xl font-bold text-white mt-3">{stat.value}</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Chaos Draft — Event card */}
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
                    <p className="text-red-300/80 text-sm">Pack Opening · Dec 27 · Tournament · Feb 1</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="px-3 py-1.5 rounded-lg bg-red-900/50 border border-red-500/30 text-red-200 font-semibold">
                    $25 Entry
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-amber-900/30 border border-amber-500/30 text-amber-200 font-semibold">
                    $500 Prize Pool
                  </span>
                  <Link href="/bulletin">
                    <Button variant="outline" size="sm" className="border-red-500/50 text-red-300 hover:bg-red-500/10">
                      Details <FaArrowRight className="w-3 h-3 ml-1 inline" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features — Explore the League */}
        <section className="py-20 bg-slate-950/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-white mb-4">Explore the League</h2>
            <p className="text-slate-400 text-center max-w-xl mx-auto mb-12">
              Climb the ranks, track your journey, and master the rules.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <Card
                    key={i}
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
