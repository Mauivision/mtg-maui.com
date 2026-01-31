/**
 * Centralized component exports
 * Import commonly used components from a single location
 */

// UI Components
export { Button } from './ui/Button';
export { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
export { Input } from './ui/Input';
export { Label } from './ui/Label';
export { Modal } from './ui/Modal';
export { Select } from './ui/Select';
export { Textarea } from './ui/Textarea';
export { Badge } from './ui/Badge';
export { LoadingSpinner } from './ui/LoadingSpinner';
export { Skeleton } from './ui/Skeleton';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';

// Layout Components
export { ModernHeader } from './layout/ModernHeader';
export { ModernFooter } from './layout/ModernFooter';
export { PageTransition } from './layout/PageTransition';
export { AdventureLink } from './layout/AdventureLink';

// Common Components
export { ErrorBoundary } from './common/ErrorBoundary';
export { LoadingScreen } from './common/LoadingScreen';

// Analytics Components
export { ErrorReporter } from './analytics/ErrorReporter';
export { WebVitals } from './analytics/WebVitals';
export { AnalyticsDashboard } from './analytics/AnalyticsDashboard';

// Leaderboard Components
export { RealtimeLeaderboard } from './leaderboard/RealtimeLeaderboard';
export { LeaderboardFilters } from './leaderboard/LeaderboardFilters';
export { Wave1PodResults } from './leaderboard/Wave1PodResults';

// Admin Components
export { AdminDashboard } from './admin/AdminDashboard';
export { EditableLeaderboardTable } from './admin/EditableLeaderboardTable';
export { ScoringRulesManager } from './admin/ScoringRulesManager';
export { BulkOperations } from './admin/BulkOperations';
export { AdvancedSearch } from './admin/AdvancedSearch';
export { SeasonManager } from './admin/SeasonManager';

// Wizard Components
export { WizardsDashboard } from './wizards/WizardsDashboard';
export { WizardsPlayerTable } from './wizards/WizardsPlayerTable';
export { WizardsGamesTable } from './wizards/WizardsGamesTable';
export { WizardsScoringRules } from './wizards/WizardsScoringRules';

// Player Components
export { PlayerProfile } from './player/PlayerProfile';
export { PlayerComparison } from './player/PlayerComparison';

// League Components
export { LeagueStatus } from './league/LeagueStatus';
export { default as DeckRegistry } from './league/DeckRegistry';

// Tournament Components
export { TournamentBracket } from './tournament/TournamentBracket';

// Deck Components
export { DeckBuilder } from './deck/DeckBuilder';
export { DeckDetail } from './deck/DeckDetail';
export { DeckList } from './deck/DeckList';
export { DeckManager } from './deck/DeckManager';
export { DeckImportExport } from './deck/DeckImportExport';

// Commander Components
export { CommanderScoring } from './commander/CommanderScoring';

// Auth Components
export { AuthSection } from './auth/AuthSection';
export { DemoSection } from './auth/DemoSection';

// SEO Components
export { StructuredData } from './seo/StructuredData';

// Providers
export { Providers } from './providers';
