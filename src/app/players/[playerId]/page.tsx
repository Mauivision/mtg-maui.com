import { Metadata } from 'next';
import { PlayerProfile } from '@/components/player/PlayerProfile';
import { notFound } from 'next/navigation';

interface PlayerPageProps {
  params: {
    playerId: string;
  };
}

export async function generateMetadata({ params }: PlayerPageProps): Promise<Metadata> {
  // In a real app, you'd fetch the player name here
  const playerName = `Player ${params.playerId}`;

  return {
    title: `${playerName} - MTG Maui League`,
    description: `View ${playerName}'s tournament statistics, achievements, and performance metrics in MTG Maui League.`,
    keywords: 'MTG Player Profile, Tournament Statistics, Player Achievements',
  };
}

export default function PlayerPage({ params }: PlayerPageProps) {
  const { playerId } = params;

  // Basic validation
  if (!playerId || playerId.length < 10) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Hero — Arena */}
      <section
        className="relative py-16 bg-cover bg-center bg-fixed overflow-hidden"
        style={{
          backgroundImage: 'url(/images/medieval-background.jpg)',
          backgroundBlendMode: 'overlay',
          backgroundColor: 'rgba(10, 12, 18, 0.85)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 animate-fade-in text-white">
              Player <span className="text-gradient-arena">Profile</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto animate-fade-in-delayed">
              Detailed statistics, achievements, and performance metrics for tournament competitors.
            </p>
          </div>
        </div>
      </section>

      {/* Player Profile Content */}
      <section className="py-8 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PlayerProfile playerId={playerId} />
        </div>
      </section>
    </div>
  );
}
