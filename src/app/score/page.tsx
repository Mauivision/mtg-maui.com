'use client';

import React from 'react';
import Link from 'next/link';
import { CommanderScoring } from '@/components/commander/CommanderScoring';
import { FaArrowLeft } from 'react-icons/fa';

export default function ScorePage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
        <CommanderScoring />
      </div>
    </div>
  );
}
