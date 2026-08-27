'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { LeagueHqShell } from '@/components/league-hq/LeagueHqShell';
import {
  generateInviteToken,
  getMembershipToken,
  saveMembershipToken,
} from '@/lib/league-hq';

export default function JoinPage() {
  const [token, setToken] = useState('');
  const [saved, setSaved] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSaved(getMembershipToken());
  }, []);

  const inviteUrl =
    typeof window !== 'undefined' && token
      ? `${window.location.origin}/join?token=${encodeURIComponent(token)}`
      : '';

  const handleSave = () => {
    if (!token.trim()) return;
    saveMembershipToken(token.trim());
    setSaved(token.trim());
  };

  const handleGenerate = () => {
    const t = generateInviteToken();
    setToken(t);
    setSaved(t);
  };

  const handleCopy = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('token');
    if (fromUrl) {
      setToken(fromUrl);
      saveMembershipToken(fromUrl);
      setSaved(fromUrl);
    }
  }, []);

  return (
    <LeagueHqShell
      badge="Invite"
      title="Join"
      subtitle="Paste an invite token or generate one for your table. Stored locally — no Google sign-in."
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-700/80 bg-slate-900/50 px-4 py-4">
          <label htmlFor="join-token" className="mb-2 block text-sm font-medium text-slate-300">
            Invite token
          </label>
          <input
            id="join-token"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="maui-xxxx"
            className="mb-3 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white"
          />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={handleSave}>
              Save token
            </Button>
            <Button size="sm" variant="secondary" onClick={handleGenerate}>
              Generate new token
            </Button>
            {inviteUrl && (
              <Button size="sm" variant="outline" onClick={handleCopy}>
                {copied ? 'Copied link' : 'Copy invite link'}
              </Button>
            )}
          </div>
          {saved && (
            <p className="mt-3 text-xs text-emerald-400/90">
              Saved locally as member token: <code className="text-emerald-200">{saved}</code>
            </p>
          )}
        </div>

        <p className="text-center text-xs text-slate-500">
          v1 membership is localStorage only. Organizers export league JSON from{' '}
          <a href="/leagues" className="text-amber-400 hover:underline">
            Leagues
          </a>{' '}
          to share rosters.
        </p>
      </div>
    </LeagueHqShell>
  );
}
