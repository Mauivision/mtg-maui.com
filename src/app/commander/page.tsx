import { Metadata } from 'next';
import { CommanderScoring } from '@/components/commander/CommanderScoring';

export const metadata: Metadata = {
  title: 'Commander Scoring - MTG Maui League',
  description:
    'Advanced Commander game scoring system. Track points, knockouts, eliminations, and last 2 standing in multiplayer Magic: The Gathering tournaments.',
  keywords: 'Commander, MTG, Scoring, Points, Knockouts, Multiplayer, Tournament',
};

export default function CommanderPage() {
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
              Commander <span className="text-gradient-arena">Scoring</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-slate-300 max-w-3xl mx-auto animate-fade-in-delayed">
              Master the art of multiplayer Magic! Track your victories, eliminations, and strategic
              prowess in the ultimate Commander scoring system.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 animate-fade-in-delayed-2">
              <div className="card-arena p-6 rounded-xl border-amber-500/20">
                <div className="text-3xl font-bold text-amber-400 mb-2">⚔️</div>
                <h3 className="text-xl font-bold text-white mb-2">Epic Battles</h3>
                <p className="text-slate-300">Multiplayer mayhem with legendary commanders</p>
              </div>
              <div className="card-arena p-6 rounded-xl border-red-500/20">
                <div className="text-3xl font-bold text-red-400 mb-2">💀</div>
                <h3 className="text-xl font-bold text-white mb-2">Eliminations</h3>
                <p className="text-slate-300">Track knockouts and strategic eliminations</p>
              </div>
              <div className="card-arena p-6 rounded-xl border-emerald-500/20">
                <div className="text-3xl font-bold text-emerald-400 mb-2">🏆</div>
                <h3 className="text-xl font-bold text-white mb-2">Last 2 Standing</h3>
                <p className="text-slate-300">Bonus points for surviving to the end</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Commander Scoring Content */}
      <section className="py-12 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CommanderScoring />
        </div>
      </section>
    </div>
  );
}
