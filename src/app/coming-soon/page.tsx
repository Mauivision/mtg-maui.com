'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FaClock, FaCalendar, FaUsers, FaMapMarkerAlt, FaStar, FaRocket } from 'react-icons/fa';

// Mock upcoming features and events
const upcomingFeatures = [
  {
    id: 1,
    title: 'Advanced Deck Builder',
    description: 'Enhanced deck building tools with AI-powered suggestions and deck analysis.',
    releaseDate: 'Q2 2024',
    status: 'in-development',
    priority: 'high',
  },
  {
    id: 2,
    title: 'Live Tournament Streaming',
    description: 'Watch live matches and get real-time tournament updates.',
    releaseDate: 'Q3 2024',
    status: 'planned',
    priority: 'medium',
  },
  {
    id: 3,
    title: 'Mobile App',
    description: 'Native mobile app for iOS and Android with push notifications.',
    releaseDate: 'Q4 2024',
    status: 'planned',
    priority: 'high',
  },
  {
    id: 4,
    title: 'Achievement System',
    description: 'Unlock badges and rewards for various accomplishments.',
    releaseDate: 'Q2 2024',
    status: 'in-development',
    priority: 'low',
  },
];

const upcomingEvents = [
  {
    id: 1,
    title: 'Spring Championship',
    date: 'April 15, 2024',
    time: '10:00 AM - 6:00 PM',
    location: 'Maui Convention Center',
    format: 'Commander',
    maxPlayers: 64,
    registeredPlayers: 32,
    prizePool: '$500',
    description: 'Season finale tournament with special guest judges and prizes.',
  },
  {
    id: 2,
    title: 'Draft League Season 2',
    date: 'April 22, 2024',
    time: '6:00 PM (Weekly)',
    location: 'Virtual + In-Person',
    format: 'Draft',
    maxPlayers: 32,
    registeredPlayers: 18,
    prizePool: '$200',
    description: '8-week draft league with weekly matches and season-long competition.',
  },
  {
    id: 3,
    title: 'Legacy Showcase',
    date: 'May 5, 2024',
    time: '1:00 PM - 5:00 PM',
    location: 'Maui Game Store',
    format: 'Legacy',
    maxPlayers: 16,
    registeredPlayers: 8,
    prizePool: '$150',
    description: 'Type 1.5 format tournament for experienced players.',
  },
  {
    id: 4,
    title: 'Community Game Day',
    date: 'May 12, 2024',
    time: '11:00 AM - 4:00 PM',
    location: 'Wailea Community Center',
    format: 'Multiple',
    maxPlayers: 50,
    registeredPlayers: 25,
    prizePool: 'Community Prizes',
    description: 'Casual gaming day with various formats and beginner-friendly events.',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'in-development':
      return 'bg-blue-900/40 text-blue-300 border-blue-500/40';
    case 'planned':
      return 'bg-amber-900/40 text-amber-300 border-amber-500/40';
    case 'completed':
      return 'bg-emerald-900/40 text-emerald-300 border-emerald-500/40';
    default:
      return 'bg-slate-700 text-slate-300 border-slate-600';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'text-red-400';
    case 'medium':
      return 'text-amber-400';
    case 'low':
      return 'text-emerald-400';
    default:
      return 'text-slate-400';
  }
};

export default function ComingSoonPage() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date('2024-04-15T10:00:00'); // Spring Championship date

    const timer = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen">
      <div
        className="relative py-8 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: 'url(/images/medieval-background.jpg)',
          backgroundBlendMode: 'overlay',
          backgroundColor: 'rgba(10, 12, 18, 0.85)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header — Arena */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in">
              🚀 <span className="text-gradient-arena">Coming Soon</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8 animate-fade-in-delayed">
              Exciting new features and events are on the horizon! Here&apos;s what&apos;s coming to
              MTG Maui League.
            </p>

            {/* Countdown Timer */}
            <Card className="card-arena max-w-md mx-auto mb-8 border-amber-500/20 animate-fade-in-delayed-2">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <FaClock className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-white">Next Big Event</h3>
                  <p className="text-sm text-slate-400">Spring Championship</p>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <div className="text-2xl font-bold text-amber-400">{timeLeft.days}</div>
                    <div className="text-xs text-slate-400">Days</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <div className="text-2xl font-bold text-amber-400">{timeLeft.hours}</div>
                    <div className="text-xs text-slate-400">Hours</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <div className="text-2xl font-bold text-amber-400">{timeLeft.minutes}</div>
                    <div className="text-xs text-slate-400">Minutes</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <div className="text-2xl font-bold text-amber-400">{timeLeft.seconds}</div>
                    <div className="text-xs text-slate-400">Seconds</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">📅 Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingEvents.map((event, index) => (
                <div
                  key={event.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${0.2 + index * 0.1}s`, opacity: 0 }}
                >
                  <Card className="card-arena h-full border-amber-500/20 hover:-translate-y-0.5 transition-all">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg text-white">{event.title}</CardTitle>
                      <Badge className="bg-blue-900/40 text-blue-300 border-blue-500/40">
                        {event.format}
                      </Badge>
                    </div>
                    <CardDescription className="space-y-1 text-slate-400">
                      <div className="flex items-center gap-1">
                        <FaCalendar className="w-4 h-4" />
                        {event.date} • {event.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <FaMapMarkerAlt className="w-4 h-4" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <FaUsers className="w-4 h-4" />
                        {event.registeredPlayers}/{event.maxPlayers} registered
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 mb-4">{event.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-slate-400">
                        <span className="font-medium text-white">Prize Pool:</span> {event.prizePool}
                      </div>
                      <Button size="sm" className="bg-amber-600 hover:bg-amber-700 border-amber-500/30">
                        Register
                      </Button>
                    </div>
                  </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </section>

          {/* Upcoming Features */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">✨ Upcoming Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingFeatures.map((feature, index) => (
                <Card
                  key={feature.id}
                  className="card-arena border-amber-500/20 hover:-translate-y-0.5 transition-all animate-fade-in-up"
                  style={{ animationDelay: `${0.3 + index * 0.1}s`, opacity: 0 }}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg flex items-center gap-2 text-white">
                        <FaRocket className={`w-5 h-5 ${getPriorityColor(feature.priority)}`} />
                        {feature.title}
                      </CardTitle>
                      <Badge className={getStatusColor(feature.status)}>
                        {feature.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <CardDescription className="text-slate-400">
                      Expected: {feature.releaseDate}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Newsletter Signup */}
          <section className="text-center">
            <Card className="card-arena max-w-2xl mx-auto border-amber-500/20">
              <CardContent className="p-8">
                <FaStar className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4 text-white">Stay Updated</h3>
                <p className="text-slate-300 mb-6">
                  Be the first to know about new features, events, and updates. Join our newsletter
                  for exclusive announcements.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2 bg-slate-800/80 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                  <Button className="bg-amber-600 hover:bg-amber-700 border-amber-500/30">
                    Subscribe
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Call to Action */}
          <section className="text-center mt-12">
            <div className="card-arena rounded-2xl p-8 border-amber-500/30 bg-gradient-to-br from-amber-900/40 via-amber-800/20 to-slate-900/40">
              <h3 className="text-2xl font-bold mb-4 text-white">Ready to Get Started?</h3>
              <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                While we work on these exciting features, you can still join tournaments, track your
                progress on the leaderboard, and connect with the community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="outline"
                  className="border-2 border-amber-400 text-amber-300 hover:bg-amber-500/10"
                >
                  View Leaderboard
                </Button>
                <Button className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 border-amber-500/30">
                  Join League
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
