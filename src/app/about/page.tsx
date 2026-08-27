'use client';

import React from 'react';
import Link from 'next/link';
import { LeagueHqShell } from '@/components/league-hq/LeagueHqShell';

export default function AboutPage() {
  return (
    <LeagueHqShell
      badge="Season 4 · Format"
      title="About & Rules"
      subtitle="Source of truth for the current casual league format."
    >
      <div className="space-y-6 text-sm leading-relaxed text-slate-300">
        <section className="rounded-xl border border-slate-700/80 bg-slate-900/50 px-4 py-4">
          <h2 className="mb-2 text-base font-semibold text-white">Season status</h2>
          <p>
            <strong className="text-amber-300">Season 3 is finished.</strong> Standings and pod history from Season
            3 remain available as an archive on{' '}
            <Link href="/score" className="text-amber-400 hover:underline">
              Scores
            </Link>{' '}
            and{' '}
            <Link href="/games" className="text-amber-400 hover:underline">
              Games
            </Link>
            .
          </p>
        </section>

        <section className="rounded-xl border border-amber-500/20 bg-amber-950/10 px-4 py-4">
          <h2 className="mb-2 text-base font-semibold text-amber-200">Season 4 — casual Chaos Commander</h2>
          <ul className="list-inside list-disc space-y-2 text-slate-300">
            <li>Casual Commander pods — relaxed table rules, league tracks commander points.</li>
            <li>
              Draft nights use either <strong className="text-white">chaos-pack drafts</strong> or{' '}
              <strong className="text-white">pick-2 four-person chaos drafts</strong> (table choice).
            </li>
            <li>Draft match wins score league draft points (same spirit as prior seasons).</li>
            <li>
              Build decks from cards you own with the{' '}
              <Link href="/decks" className="text-amber-400 hover:underline">
                Deck Builder
              </Link>{' '}
              — tuned for Storm, Windrider when she&apos;s in your pool.
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-slate-700/80 bg-slate-900/50 px-4 py-4">
          <h2 className="mb-2 text-base font-semibold text-white">What Season 4 is not</h2>
          <ul className="list-inside list-disc space-y-1 text-slate-400">
            <li>No 13-pack draft start or growing 70→100 deck size requirements.</li>
            <li>No letter-die objective system from prior structured formats.</li>
            <li>No life tracker or companion app required — this site is league HQ + deck helper.</li>
          </ul>
        </section>

        <section className="rounded-xl border border-slate-700/80 bg-slate-900/50 px-4 py-4">
          <h2 className="mb-2 text-base font-semibold text-white">Scoring (simple)</h2>
          <p>
            <strong className="text-white">CMD</strong> — commander pod points from recorded games.{' '}
            <strong className="text-white">DFT</strong> — draft points from match wins.{' '}
            <strong className="text-amber-300">Total</strong> = CMD + DFT. See the{' '}
            <Link href="/leaderboard" className="text-amber-400 hover:underline">
              Leaderboard
            </Link>
            .
          </p>
        </section>

        <section className="rounded-xl border border-slate-700/80 bg-slate-900/50 px-4 py-4">
          <h2 className="mb-2 text-base font-semibold text-white">Join a league</h2>
          <p>
            Use an invite token on the{' '}
            <Link href="/join" className="text-amber-400 hover:underline">
              Join
            </Link>{' '}
            page. League organizers can create and export leagues on{' '}
            <Link href="/leagues" className="text-amber-400 hover:underline">
              Leagues
            </Link>
            .
          </p>
        </section>
      </div>
    </LeagueHqShell>
  );
}
