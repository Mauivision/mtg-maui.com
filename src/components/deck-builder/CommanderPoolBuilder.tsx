'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FaArrowLeft,
  FaCopy,
  FaDownload,
  FaMagic,
  FaUpload,
  FaExclamationTriangle,
  FaCheckCircle,
} from 'react-icons/fa';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  canBeCommander,
  copyDeckToClipboard,
  downloadDeckAsText,
  formatColorIdentity,
  generateDeckFromPool,
  loadDeckBuilderState,
  lookupPoolCards,
  parsePoolText,
  saveDeckBuilderState,
  totalPoolCount,
  uniquePoolCount,
  MIN_POOL_CARDS_100,
  MIN_POOL_CARDS_70,
  type DeckBuilderState,
  type GeneratedDeck,
} from '@/lib/deck-builder';

const CATEGORY_LABELS: Record<string, string> = {
  land: 'Lands',
  removal: 'Removal',
  synergy: 'Commander synergy',
  creature: 'Creatures',
};

export function CommanderPoolBuilder() {
  const [state, setState] = useState<DeckBuilderState>(() => loadDeckBuilderState());
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [legalCommanders, setLegalCommanders] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [poolCommanders, setPoolCommanders] = useState<string[]>([]);
  const [loadingCommanders, setLoadingCommanders] = useState(false);

  const poolEntries = useMemo(() => parsePoolText(state.poolText), [state.poolText]);
  const poolTotal = totalPoolCount(poolEntries);
  const poolUnique = uniquePoolCount(poolEntries);
  const minRequired = state.mode === 'commander100' ? MIN_POOL_CARDS_100 : MIN_POOL_CARDS_70;

  const update = useCallback((patch: Partial<DeckBuilderState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    saveDeckBuilderState(state);
  }, [state]);

  useEffect(() => {
    if (state.autoSuggestCommander || poolEntries.length === 0) {
      setPoolCommanders([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingCommanders(true);
      try {
        const cards = await lookupPoolCards(poolEntries);
        const names = cards.filter(canBeCommander).map((c) => c.name);
        setPoolCommanders(names);
        if (names.length === 1) {
          update({ selectedCommander: names[0] });
        }
      } catch {
        setPoolCommanders([]);
      } finally {
        setLoadingCommanders(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [poolEntries, state.autoSuggestCommander, update]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      update({ poolText: state.poolText ? `${state.poolText.trim()}\n${text.trim()}` : text.trim() });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    setLegalCommanders([]);
    try {
      const result = await generateDeckFromPool({
        poolText: state.poolText,
        mode: state.mode,
        selectedCommander: state.autoSuggestCommander ? null : state.selectedCommander,
        autoSuggestCommander: state.autoSuggestCommander,
      });

      if (!result.ok) {
        setError(result.message);
        setLegalCommanders(result.legalCommanders ?? []);
        return;
      }

      update({ lastGenerated: result.deck });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate deck');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!state.lastGenerated) return;
    const ok = await copyDeckToClipboard(state.lastGenerated);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-[100dvh] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-6xl px-4 pt-2 sm:px-5 sm:pt-4">
        <header className="sticky top-14 z-20 -mx-4 mb-4 border-b border-slate-700/60 bg-slate-950/75 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/55 sm:-mx-5 sm:mb-6 sm:px-5 sm:py-4">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl border border-slate-600/80 bg-slate-800/50 px-3 py-2 text-sm font-medium text-amber-400 transition-colors hover:border-amber-500/50 hover:bg-slate-800 hover:text-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 touch-manipulation sm:min-h-0 sm:min-w-0 sm:justify-start sm:border-0 sm:bg-transparent sm:px-0 sm:py-0"
            >
              <FaArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              <span className="sm:hidden">Home</span>
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-bold tracking-tight text-white sm:text-xl">
                Commander Deck Builder
              </h1>
              <p className="hidden text-xs text-slate-400 sm:block sm:text-sm">
                Build a deck from cards you already own — nothing outside your pool
              </p>
            </div>
          </div>
        </header>

        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-sm text-amber-100/90">
          <strong className="text-amber-300">Season 4</strong> is casual Chaos Commander plus chaos-pack or pick-2
          drafts. Use this tool to assemble lists from your collection — no shopping for staples you do not own.
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pool input */}
          <Card className="border-slate-700/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <FaUpload className="text-amber-400" aria-hidden />
                Your card pool
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-400">
                Paste or upload your collection. One card per line —{' '}
                <code className="rounded bg-slate-900 px-1.5 py-0.5 text-amber-200/90">1 Card Name</code> or plain{' '}
                <code className="rounded bg-slate-900 px-1.5 py-0.5 text-amber-200/90">Card Name</code>. CSV uploads
                supported.
              </p>

              <textarea
                value={state.poolText}
                onChange={(e) => update({ poolText: e.target.value })}
                placeholder={'1 Sol Ring\n1 Command Tower\n1 Arcane Signet\n...'}
                rows={14}
                className="w-full rounded-lg border border-slate-600 bg-slate-900/80 px-3 py-2 font-mono text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                aria-label="Card pool"
              />

              <div className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer">
                  <input type="file" accept=".txt,.csv,text/plain,text/csv" className="sr-only" onChange={handleFileUpload} />
                  <span className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:border-amber-500/50 hover:text-amber-200">
                    <FaUpload aria-hidden />
                    Upload file
                  </span>
                </label>
                <Badge variant="secondary">
                  {poolTotal} cards ({poolUnique} unique)
                </Badge>
                {poolTotal < minRequired && (
                  <span className="text-xs text-amber-400">Need {minRequired - poolTotal} more for this mode</span>
                )}
              </div>

              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-slate-300">Deck mode</legend>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-600/80 px-3 py-2 hover:border-amber-500/40">
                    <input
                      type="radio"
                      name="deck-mode"
                      checked={state.mode === 'commander100'}
                      onChange={() => update({ mode: 'commander100' })}
                      className="mt-1"
                    />
                    <span>
                      <span className="block text-sm font-medium text-white">100-card Commander</span>
                      <span className="text-xs text-slate-400">
                        1 commander · 37 lands · 8 removal · 18 synergy · 36 creatures
                      </span>
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-600/80 px-3 py-2 hover:border-amber-500/40">
                    <input
                      type="radio"
                      name="deck-mode"
                      checked={state.mode === 'twoColor70'}
                      onChange={() => update({ mode: 'twoColor70' })}
                      className="mt-1"
                    />
                    <span>
                      <span className="block text-sm font-medium text-white">70-card two-color</span>
                      <span className="text-xs text-slate-400">Scaled skeleton · two-color commander required</span>
                    </span>
                  </label>
                </div>
              </fieldset>

              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-slate-300">Commander</legend>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={state.autoSuggestCommander}
                    onChange={(e) => update({ autoSuggestCommander: e.target.checked, selectedCommander: null })}
                  />
                  Auto-suggest best commander from pool
                </label>
                {!state.autoSuggestCommander && (
                  <select
                    value={state.selectedCommander ?? ''}
                    onChange={(e) => update({ selectedCommander: e.target.value || null })}
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    aria-label="Select commander"
                    disabled={loadingCommanders}
                  >
                    <option value="">
                      {loadingCommanders
                        ? 'Finding legal commanders…'
                        : poolCommanders.length
                          ? 'Choose a commander…'
                          : 'Add pool cards first'}
                    </option>
                    {poolCommanders.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                )}
              </fieldset>

              <Button
                onClick={handleGenerate}
                disabled={generating || poolTotal < minRequired}
                loading={generating}
                className="w-full !bg-gradient-to-r !from-amber-600 !to-amber-700 hover:!from-amber-500 hover:!to-amber-600"
              >
                <FaMagic className="mr-2" aria-hidden />
                Generate deck from pool
              </Button>

              {error && (
                <div className="rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2 text-sm text-red-200" role="alert">
                  <FaExclamationTriangle className="mr-1 inline" aria-hidden />
                  {error}
                  {legalCommanders.length > 0 && (
                    <ul className="mt-2 list-inside list-disc text-red-100/90">
                      {legalCommanders.slice(0, 12).map((name) => (
                        <li key={name}>
                          <button
                            type="button"
                            className="underline hover:text-white"
                            onClick={() =>
                              update({
                                autoSuggestCommander: false,
                                selectedCommander: name,
                              })
                            }
                          >
                            {name}
                          </button>
                        </li>
                      ))}
                      {legalCommanders.length > 12 && (
                        <li className="text-red-200/70">…and {legalCommanders.length - 12} more</li>
                      )}
                    </ul>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Output */}
          <Card className="border-slate-700/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <FaMagic className="text-amber-400" aria-hidden />
                Generated list
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!state.lastGenerated ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center text-center text-slate-500">
                  {generating ? (
                    <>
                      <LoadingSpinner size="lg" />
                      <p className="mt-4 text-sm">Looking up cards and building your list…</p>
                    </>
                  ) : (
                    <p className="text-sm">
                      Add your pool and generate. Every card will come from cards you listed — no EDHREC staples
                      injected.
                    </p>
                  )}
                </div>
              ) : (
                <DeckOutput deck={state.lastGenerated} copied={copied} onCopy={handleCopy} onDownload={() => downloadDeckAsText(state.lastGenerated!)} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DeckOutput({
  deck,
  copied,
  onCopy,
  onDownload,
}: {
  deck: GeneratedDeck;
  copied: boolean;
  onCopy: () => void;
  onDownload: () => void;
}) {
  const byCategory = useMemo(() => {
    const map = new Map<string, { name: string; quantity: number }[]>();
    for (const card of deck.cards) {
      const list = map.get(card.category) ?? [];
      list.push({ name: card.name, quantity: card.quantity });
      map.set(card.category, list);
    }
    return map;
  }, [deck.cards]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-white">{deck.commander}</h2>
        <Badge variant="secondary">{formatColorIdentity(deck.commanderColorIdentity)}</Badge>
        <Badge variant={deck.totalCards === deck.targetTotal ? 'success' : 'warning'}>
          {deck.totalCards}/{deck.targetTotal} cards
        </Badge>
      </div>

      {deck.warnings.map((w) => (
        <p key={w} className="text-xs text-amber-300/90">
          {w}
        </p>
      ))}

      {deck.gaps.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 px-3 py-2 text-sm">
          <p className="font-medium text-amber-200">Gaps in your pool</p>
          <ul className="mt-1 list-inside list-disc text-amber-100/80">
            {deck.gaps.map((g) => (
              <li key={g.category}>
                {CATEGORY_LABELS[g.category] ?? g.category}: filled {g.filled} of {g.needed}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={onCopy}>
          {copied ? <FaCheckCircle className="mr-1 text-green-400" /> : <FaCopy className="mr-1" />}
          {copied ? 'Copied' : 'Copy list'}
        </Button>
        <Button size="sm" variant="outline" onClick={onDownload}>
          <FaDownload className="mr-1" />
          Download .txt
        </Button>
      </div>

      <div className="max-h-[420px] overflow-y-auto rounded-lg border border-slate-700 bg-slate-900/50 p-3 font-mono text-xs text-slate-300">
        <div className="mb-2 font-semibold text-amber-300">1 {deck.commander}</div>
        {(['land', 'removal', 'synergy', 'creature'] as const).map((cat) => {
          const cards = byCategory.get(cat);
          if (!cards?.length) return null;
          return (
            <div key={cat} className="mb-3">
              <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">
                {CATEGORY_LABELS[cat]}
              </div>
              {cards.map((c) => (
                <div key={c.name}>
                  {c.quantity > 1 ? `${c.quantity} ` : '1 '}
                  {c.name}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
