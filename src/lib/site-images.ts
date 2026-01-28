/**
 * Central config for site images. Edit paths here to swap assets.
 * All paths are relative to /public (use /images/... in code).
 */

const IMG = '/images';

export const siteImages = {
  /** Main hero / default background (home, rules, etc.) */
  heroBackground: `${IMG}/medieval-background.jpg`,

  /** OG / social preview (1200x630 ideal; we use existing asset) */
  ogImage: `${IMG}/medieval-background.jpg`,

  /** Page-specific backgrounds */
  backgrounds: {
    default: `${IMG}/medieval-background.jpg`,
    home: `${IMG}/medieval-background.jpg`,
    wizards: `${IMG}/medieval-background.jpg`,
    auth: `${IMG}/mtg-background.jpg`,
    rules: `${IMG}/medieval-background.jpg`,
    commander: `${IMG}/backgrounds/commander-bg.jpg`,
    analytics: `${IMG}/backgrounds/analytics-bg.jpg`,
    leaderboard: `${IMG}/backgrounds/leaderboard-bg.jpg`,
    players: `${IMG}/mtg-background.jpg`,
    comingSoon: `${IMG}/backgrounds/coming-soon-bg.jpg`,
    bracket: `${IMG}/backgrounds/bracket-bg.jpg`,
  },

  /** Default event images when event has no imageUrl */
  eventPlaceholders: [
    `${IMG}/events/event-placeholder-1.jpg`,
    `${IMG}/events/event-placeholder-2.jpg`,
    `${IMG}/events/event-placeholder-3.jpg`,
  ],

  /** Gallery / “explore” / feature visuals */
  gallery: [
    `${IMG}/gallery/gallery-1.jpg`,
    `${IMG}/gallery/gallery-2.jpg`,
    `${IMG}/gallery/gallery-3.jpg`,
    `${IMG}/gallery/gallery-4.jpg`,
    `${IMG}/gallery/gallery-5.jpg`,
  ],
} as const;

export type SiteImages = typeof siteImages;
