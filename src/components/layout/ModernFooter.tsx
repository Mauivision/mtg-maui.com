'use client';

import React from 'react';
import Link from 'next/link';
import { FaGithub, FaTwitter, FaDiscord, FaYoutube } from 'react-icons/fa';
import { usePageContent } from '@/contexts/PageContentContext';

const footerQuickLinks = [
  { href: '/', label: 'Home' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/rules', label: 'Tournament Rules' },
  { href: '/bulletin', label: 'Bulletin Board' },
  { href: '/coming-soon', label: 'Coming Soon' },
];

export const ModernFooter: React.FC = () => {
  const { getConfig } = usePageContent();
  const homeConfig = getConfig('/') as { footerBlurb?: string } | undefined;
  const footerBlurb =
    typeof homeConfig?.footerBlurb === 'string'
      ? homeConfig.footerBlurb
      : "Enter the arena. Hawaii's premier Magic: The Gathering league — Commander, Draft, real rankings, real players.";

  return (
    <footer className="bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand — blurb editable via Admin > Page Content (home) */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 border border-amber-500/40 flex items-center justify-center shadow-lg">
                <span className="text-amber-200 font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-bold text-white">Maui League</span>
            </div>
            <p className="text-slate-400 mb-4 max-w-md">{footerBlurb}</p>
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

          {/* Quick Links — labels from Admin > Page Content */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {footerQuickLinks.map(({ href, label }) => {
                const c = getConfig(href) as { navLabel?: string } | undefined;
                const displayLabel = typeof c?.navLabel === 'string' ? c.navLabel : label;
                return (
                  <li key={href}>
                    <Link href={href} className="text-slate-400 hover:text-amber-400 transition-colors">
                      {displayLabel}
                    </Link>
                  </li>
                );
              })}
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
