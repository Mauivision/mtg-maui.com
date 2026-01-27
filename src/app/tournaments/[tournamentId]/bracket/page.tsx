import { Metadata } from 'next';
import { TournamentBracket } from '@/components/tournament/TournamentBracket';
import { notFound } from 'next/navigation';

interface BracketPageProps {
  params: {
    tournamentId: string;
  };
}

export async function generateMetadata({ params }: BracketPageProps): Promise<Metadata> {
  // In a real app, you'd fetch the tournament name here
  const tournamentName = `Tournament ${params.tournamentId}`;

  return {
    title: `${tournamentName} Bracket - MTG Maui League`,
    description: `Interactive tournament bracket for ${tournamentName}. Track matchups, results, and progression in real-time.`,
    keywords: 'MTG Tournament Bracket, Tournament Results, Match Schedule, Tournament Progression',
  };
}

export default function TournamentBracketPage({ params }: BracketPageProps) {
  const { tournamentId } = params;

  // Basic validation
  if (!tournamentId || tournamentId.length < 10) {
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
              Tournament <span className="text-gradient-arena">Bracket</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto animate-fade-in-delayed">
              Interactive bracket visualization showing tournament progression, matchups, and
              results.
            </p>
          </div>
        </div>
      </section>

      {/* Tournament Bracket Content */}
      <section className="py-8 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TournamentBracket tournamentId={tournamentId} interactive={true} />
        </div>
      </section>
    </div>
  );
}
