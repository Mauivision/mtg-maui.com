/**
 * Arena Theme Utilities
 * 
 * Centralized theme constants and utilities for the MTG Maui League arena/tavern aesthetic
 */

export const arenaTheme = {
  colors: {
    background: {
      primary: 'bg-slate-950',
      secondary: 'bg-slate-900',
      surface: 'bg-slate-800',
      elevated: 'bg-slate-700',
    },
    text: {
      primary: 'text-gray-100',
      secondary: 'text-gray-300',
      muted: 'text-gray-400',
      accent: 'text-amber-400',
    },
    border: {
      default: 'border-slate-700',
      light: 'border-slate-600',
      accent: 'border-amber-500',
    },
    arena: {
      gold: {
        50: 'bg-amber-50',
        100: 'bg-amber-100',
        200: 'bg-amber-200',
        300: 'bg-amber-300',
        400: 'bg-amber-400',
        500: 'bg-amber-500',
        600: 'bg-amber-600',
        700: 'bg-amber-700',
        800: 'bg-amber-800',
        900: 'bg-amber-900',
      },
    },
    mana: {
      blue: 'bg-blue-600',
      red: 'bg-red-600',
      green: 'bg-green-600',
      black: 'bg-slate-800',
      white: 'bg-gray-100',
    },
  },
  gradients: {
    arena: 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500',
    gold: 'bg-gradient-to-br from-amber-600 to-orange-600',
    text: 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent',
  },
  shadows: {
    arena: 'shadow-lg shadow-amber-950/20',
    glow: 'shadow-lg shadow-amber-500/30',
  },
} as const;

/**
 * Get arena-themed card classes
 */
export function getArenaCardClasses(hover = true): string {
  const base = 'bg-slate-800/90 border border-slate-700/50 rounded-xl shadow-lg backdrop-blur-sm transition-all duration-300';
  const hoverClass = hover ? 'hover:border-amber-500/30 hover:shadow-xl hover:shadow-amber-950/20' : '';
  return `${base} ${hoverClass}`;
}

/**
 * Get mana orb classes
 */
export function getManaOrbClasses(color: 'blue' | 'amber' | 'emerald' = 'amber'): string {
  const colorMap = {
    blue: 'from-blue-600/80 to-blue-800/80 border-blue-500/40 hover:border-blue-400/60',
    amber: 'from-amber-600/80 to-amber-800/80 border-amber-500/40 hover:border-amber-400/60',
    emerald: 'from-emerald-600/80 to-emerald-800/80 border-emerald-500/40 hover:border-emerald-400/60',
  };
  
  return `inline-flex items-center justify-center w-12 h-12 rounded-full border-2 bg-gradient-to-br ${colorMap[color]} shadow-lg text-white/90 transition-all duration-300 hover:scale-105`;
}
