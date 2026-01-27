import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tournament Rules - MTG Maui League',
  description:
    'Official tournament rules and scoring system for MTG Maui League. Complete Chaos Commander League guidelines and house rules.',
  keywords: 'MTG Rules, Tournament Rules, Commander Rules, League Rules, Scoring System',
};

export default function RulesPage() {
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
              Tournament <span className="text-gradient-arena">Rules</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-slate-300 max-w-3xl mx-auto animate-fade-in-delayed">
              Official rules and scoring system for the Chaos Commander League. Your guide to
              competitive multiplayer Magic: The Gathering.
            </p>
            <div className="inline-block p-4 bg-amber-900/40 backdrop-blur-sm rounded-xl border border-amber-500/40 shadow-xl animate-fade-in-delayed-2">
              <p className="text-amber-200 text-lg font-bold">
                ⚖️ Rules will be updated for the next tournament season
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rules Content — card-arena */}
      <section className="py-12 bg-slate-950/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="card-arena rounded-2xl p-8 text-center border-amber-500/20">
              <div className="text-6xl mb-4">📜</div>
              <h2 className="text-3xl font-bold text-white mb-4">Rules Under Development</h2>
              <p className="text-xl text-amber-200/90 mb-6">
                The complete Chaos Commander League rules are currently being finalized. Check back
                soon for the official tournament guidelines!
              </p>
              <div className="text-amber-300/80">
                <p className="text-lg">Expected Launch: Next Tournament Season</p>
                <p className="text-sm mt-2">Follow our announcements for updates</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  emoji: '🏆',
                  title: 'Tournament Format',
                  items: [
                    'Commander (EDH) multiplayer format',
                    '4 players per pod',
                    'Competitive play with house rules',
                    'Time limit: 45-60 minutes',
                  ],
                },
                {
                  emoji: '⚖️',
                  title: 'Scoring System',
                  items: [
                    'Gold Objectives: 5 points each',
                    'Silver Objectives: 2 points each',
                    'Knockouts: 3 points per elimination',
                    'Last 2 Standing: 5 bonus points',
                  ],
                },
                {
                  emoji: '📜',
                  title: 'House Rules',
                  items: [
                    'Chaos Commander specific rules',
                    'Special objectives and conditions',
                    'Tournament etiquette guidelines',
                    'Sportsmanship requirements',
                  ],
                },
                {
                  emoji: '🎯',
                  title: 'Objectives',
                  items: [
                    'Gold objectives for major achievements',
                    'Silver objectives for secondary goals',
                    'Bonus conditions and special rules',
                    'Tournament-specific challenges',
                  ],
                },
              ].map((block, i) => (
                <div
                  key={i}
                  className="card-arena rounded-xl p-6 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-2xl">{block.emoji}</span>
                    {block.title}
                  </h3>
                  <ul className="text-slate-300 space-y-2">
                    {block.items.map((item, j) => (
                      <li key={j}>• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="card-arena rounded-2xl p-8 text-center border-amber-500/20">
              <h3 className="text-2xl font-bold text-white mb-4">Questions About Rules?</h3>
              <p className="text-slate-300 mb-6">
                Have questions about tournament rules or need clarification on any aspect of
                gameplay?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-6 py-3 rounded-lg font-medium transition-all border border-amber-500/30"
                >
                  Contact Tournament Organizer
                </a>
                <a
                  href="/bulletin"
                  className="border-2 border-amber-500/50 text-amber-400 hover:bg-amber-500/10 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Check Announcements
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
