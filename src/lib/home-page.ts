/**
 * Editorial home page content (hero stats label, featured news). Adjust as the season updates.
 */

/** Completed league drafts shown in the hero stat tile. */
export const HOME_HERO_DRAFT_COUNT = 2;

export const HOME_FEATURED_NEWS_ITEM = {
  id: 'home-featured-3rd-draft',
  title: 'Upcoming 3rd Draft this weekend — be ready, Wizards!',
  excerpt: 'Prep your decks and watch Wizards for pairings when they go live.',
  category: 'League',
  publishedAt: '2026-03-25T12:00:00.000Z',
} as const;

/** Shown under league status on Home — Commander season scoring. */
export const HOME_LEADERBOARD_COMMANDER_NOTE =
  'Standings use full league VP: Commander pods (all waves) plus both drafts, including bonuses. With a live database, totals refresh automatically; with static JSON only, totals follow src/data/league-data.json — use Refresh on the table after file edits.';

/** Second pinned News card (below the draft weekend card). */
export const HOME_FEATURED_COMMANDER_PODS_ITEM = {
  id: 'home-featured-3rd-cmd-in-totals',
  title: 'Third Commander pods count toward league scores',
  excerpt:
    'All recorded third-wave Commander games are included in total league VP. We are still waiting on one more pod’s results; the leaderboard will refresh when they are in Wizards or the league file.',
  category: 'League',
  publishedAt: '2026-03-25T12:00:00.000Z',
} as const;
