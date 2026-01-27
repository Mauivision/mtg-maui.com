'use client';

import React from 'react';
import Link from 'next/link';
import { FaGithub, FaTwitter, FaDiscord, FaYoutube } from 'react-icons/fa';

export const ModernFooter: React.FC = () => {
  return (
    <footer className="bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand — Arena aesthetic, match header */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 border border-amber-500/40 flex items-center justify-center shadow-lg">
                <span className="text-amber-200 font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-bold text-white">Maui League</span>
            </div>
            <p className="text-slate-400 mb-4 max-w-md">
              Enter the arena. Hawaii&apos;s premier Magic: The Gathering league — Commander, Draft,
              real rankings, real players.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-slate-400 hover:text-amber-400 transition-colors"
                aria-label="GitHub"
              >
                <FaGithub className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-amber-400 transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-amber-400 transition-colors"
                aria-label="Discord"
              >
                <FaDiscord className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-amber-400 transition-colors"
                aria-label="YouTube"
              >
                <FaYoutube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/leaderboard"
                  className="text-slate-400 hover:text-amber-400 transition-colors"
                >
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/rules" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Tournament Rules
                </Link>
              </li>
              <li>
                <Link href="/bulletin" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Bulletin Board
                </Link>
              </li>
              <li>
                <Link
                  href="/coming-soon"
                  className="text-slate-400 hover:text-amber-400 transition-colors"
                >
                  Coming Soon
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Community</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Discord Server
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Tournament Rules
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-amber-400 transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-500 text-sm">© {new Date().getFullYear()} MTG Maui League. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-slate-500 hover:text-amber-400 text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-slate-500 hover:text-amber-400 text-sm transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
