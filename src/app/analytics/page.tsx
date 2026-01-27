import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics - MTG Maui League',
  description:
    'Comprehensive tournament analytics, player statistics, and performance metrics for MTG Maui League.',
  keywords: 'MTG Analytics, Tournament Statistics, Player Performance, League Data',
};

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero — Arena */}
      <section
        className="relative py-20 bg-cover bg-center bg-fixed overflow-hidden"
        style={{
          backgroundImage: 'url(/images/medieval-background.jpg)',
          backgroundBlendMode: 'overlay',
          backgroundColor: 'rgba(10, 12, 18, 0.85)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in text-white">
              Tournament <span className="text-gradient-arena">Analytics</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-slate-300 max-w-3xl mx-auto animate-fade-in-delayed">
              Analytics dashboard is currently under development. Check back soon for comprehensive
              tournament statistics and player performance metrics.
            </p>
            <div className="card-arena max-w-2xl mx-auto mt-12 p-8 border-amber-500/20 animate-fade-in-delayed-2">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-white mb-4">Coming Soon</h2>
              <p className="text-slate-300">
                We&apos;re building powerful analytics tools to help you understand tournament trends,
                player performance, and league statistics.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
