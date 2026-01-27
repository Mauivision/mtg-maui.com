'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FaBullhorn, FaCalendar, FaUser, FaEye, FaThumbsUp, FaComment } from 'react-icons/fa';

const announcements = [
  {
    id: 1,
    title: 'Season 2 Registration Now Open!',
    content: `We're excited to announce that registration for Season 2 of the MTG Maui League is now open! This season will feature new formats, exciting prizes, and more opportunities to compete.`,
    author: 'League Admin',
    date: '2024-03-01',
    category: 'Announcements',
    priority: 'high',
    views: 245,
    likes: 18,
    comments: 5,
    tags: ['season', 'registration', 'commander'],
  },
  {
    id: 2,
    title: 'New Scoring System Update',
    content: `We've implemented a new scoring system for Commander games to better reflect the strategic depth and outcomes of each match.`,
    author: 'Tournament Director',
    date: '2024-02-28',
    category: 'Updates',
    priority: 'medium',
    views: 189,
    likes: 23,
    comments: 12,
    tags: ['scoring', 'rules', 'commander'],
  },
  {
    id: 3,
    title: 'Community Spotlight: Deck of the Month',
    content: `Congratulations to DragonMaster for winning February's Deck of the Month award! Their innovative deck showcased excellent card selection and strategic depth.`,
    author: 'Community Manager',
    date: '2024-02-25',
    category: 'Community',
    priority: 'low',
    views: 156,
    likes: 31,
    comments: 8,
    tags: ['community', 'spotlight', 'deck'],
  },
];

const categories = ['All', 'Announcements', 'Updates', 'Community', 'Events'];

export default function BulletinBoardPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesCategory =
      selectedCategory === 'All' || announcement.category === selectedCategory;
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-900/50 text-red-200">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-amber-900/50 text-amber-200">Important</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen static-page">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 static-page-content">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in flex items-center justify-center gap-3">
            <FaBullhorn className="w-8 h-8 text-amber-400" />
            <span className="text-gradient-arena">Bulletin Board</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto animate-fade-in-delayed">
            Stay updated with the latest announcements, rule changes, and tournament information.
          </p>
        </div>

        <div className="animate-fade-in-delayed-2">
          <Card className="card-arena mb-8 border-amber-500/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={
                        selectedCategory === category
                          ? 'bg-amber-600 hover:bg-amber-700 border-amber-500/30'
                          : 'border-slate-600 text-slate-300 hover:border-amber-500/40 hover:text-amber-300'
                      }
                    >
                      {category}
                    </Button>
                  ))}
                </div>
                <div className="flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search announcements..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800/80 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map((announcement, index) => (
              <div
                key={announcement.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${0.15 + index * 0.08}s`, opacity: 0 }}
              >
                <Card className="card-arena border-amber-500/20 hover:-translate-y-0.5 transition-all">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-xl text-white">{announcement.title}</CardTitle>
                          {getPriorityBadge(announcement.priority)}
                        </div>
                        <CardDescription className="flex items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <FaUser className="w-4 h-4" />
                            {announcement.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaCalendar className="w-4 h-4" />
                            {new Date(announcement.date).toLocaleDateString()}
                          </span>
                          <Badge variant="outline" className="border-amber-500/50 text-amber-300">
                            {announcement.category}
                          </Badge>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 mb-4">{announcement.content}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {announcement.tags.map(tag => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs bg-slate-700/80 text-slate-300 border-slate-600"
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-6 text-sm text-slate-500 border-t border-slate-700 pt-4">
                      <span className="flex items-center gap-1">
                        <FaEye className="w-4 h-4" />
                        {announcement.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <FaThumbsUp className="w-4 h-4" />
                        {announcement.likes} likes
                      </span>
                      <span className="flex items-center gap-1">
                        <FaComment className="w-4 h-4" />
                        {announcement.comments} comments
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))
          ) : (
            <Card className="card-arena border-amber-500/20">
              <CardContent className="p-12 text-center">
                <FaBullhorn className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No announcements found</h3>
                <p className="text-slate-400">Try adjusting your search terms or category filter.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
