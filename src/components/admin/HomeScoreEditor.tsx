'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EditableLeaderboardTable } from '@/components/admin/EditableLeaderboardTable';
import { FaEdit } from 'react-icons/fa';

interface HomeScoreEditorProps {
  leagueId: string | null;
}

export function HomeScoreEditor({ leagueId }: HomeScoreEditorProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!leagueId) {
        setChecking(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/check-admin', { credentials: 'include' });
        if (!res.ok) {
          if (!cancelled) setIsAdmin(false);
          return;
        }
        const data = (await res.json()) as { isAdmin?: boolean };
        if (!cancelled) setIsAdmin(Boolean(data.isAdmin));
      } catch {
        if (!cancelled) setIsAdmin(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [leagueId]);

  if (!leagueId) return null;
  if (checking) return null;
  if (!isAdmin) return null;

  return (
    <Card className="bg-slate-900/40 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-white">Edit Scores</CardTitle>
          <p className="text-slate-400 text-sm mt-1">
            Admin-only. Changes update the Home leaderboard totals.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setOpen((v) => !v)}
          className="border-amber-500/50 text-amber-300 hover:bg-amber-500/10"
        >
          <FaEdit className="w-4 h-4 mr-2" />
          {open ? 'Hide editor' : 'Open editor'}
        </Button>
      </CardHeader>
      {open && (
        <CardContent>
          <EditableLeaderboardTable leagueId={leagueId} />
        </CardContent>
      )}
    </Card>
  );
}

