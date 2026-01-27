'use client';

import React, { useEffect, useState } from 'react';

interface CastleGateProps {
  children: React.ReactNode;
  isOpen?: boolean;
  onGateOpen?: () => void;
  /**
   * Minimal time to keep the overlay before revealing the page.
   * Short by default to avoid delaying first paint.
   */
  minDurationMs?: number;
}

/**
 * Lightweight gate wrapper to avoid blocking first paint with heavy animations.
 * Shows a brief overlay, then fades content in.
 */
export const CastleGate: React.FC<CastleGateProps> = ({
  children,
  isOpen: externalIsOpen = false,
  onGateOpen,
  minDurationMs = 300,
}) => {
  const [isOpen, setIsOpen] = useState(externalIsOpen);
  const [showOverlay, setShowOverlay] = useState(!externalIsOpen);

  // Sync with external control
  useEffect(() => {
    if (externalIsOpen) {
      setIsOpen(true);
      setShowOverlay(false);
    }
  }, [externalIsOpen]);

  // Auto-open quickly to keep flow smooth
  useEffect(() => {
    if (externalIsOpen) return;
    const timer = window.setTimeout(() => {
      setIsOpen(true);
      setShowOverlay(false);
      onGateOpen?.();
    }, minDurationMs);
    return () => window.clearTimeout(timer);
  }, [externalIsOpen, minDurationMs, onGateOpen]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {showOverlay && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/95 backdrop-blur-md transition-all duration-200">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 text-amber-400 text-lg font-semibold">
              <span className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span>Entering the arena…</span>
            </div>
            <p className="text-sm text-slate-400">Unlocking the gate</p>
            <div className="flex justify-center gap-1.5 pt-2">
              <span className="w-2 h-2 rounded-full bg-amber-500/60 animate-pulse" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-amber-500/60 animate-pulse" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-amber-500/60 animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      <div
        className={`relative z-10 transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
};
