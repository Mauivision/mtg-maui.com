'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaRobot, FaMagic, FaTrophy, FaUsers, FaChartLine, FaCog } from 'react-icons/fa';
import { Button } from './Button';

interface Message {
  id: string;
  type: 'goblin' | 'user';
  content: string;
  timestamp: Date;
  actions?: Array<{
    label: string;
    action: () => void;
    icon?: React.ReactNode;
  }>;
}

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  highlight: string;
}

const features: Feature[] = [
  {
    id: 'tournaments',
    title: 'Tournament Leagues',
    description:
      'Join competitive Magic: The Gathering leagues with real-time scoring and rankings.',
    icon: <FaTrophy className="w-6 h-6 text-amber-500" />,
    path: '/leaderboard',
    highlight: 'Battle it out in Commander, Draft, and Standard formats!',
  },
  {
    id: 'analytics',
    title: 'Advanced Analytics',
    description: 'Dive deep into performance metrics, win rates, and tournament statistics.',
    icon: <FaChartLine className="w-6 h-6 text-blue-500" />,
    path: '/analytics',
    highlight: 'Track your progress with detailed charts and insights!',
  },
  {
    id: 'character-sheets',
    title: 'Character Sheets',
    description: 'Create and manage your player profiles with achievements and statistics.',
    icon: <FaUsers className="w-6 h-6 text-green-500" />,
    path: '/character-sheets',
    highlight: 'Build your legendary MTG persona!',
  },
  {
    id: 'decks',
    title: 'Deck Management',
    description: 'Build, share, and analyze your deck strategies with the community.',
    icon: <FaMagic className="w-6 h-6 text-purple-500" />,
    path: '/decks',
    highlight: 'Craft winning decks with expert tools!',
  },
  {
    id: 'bulletin',
    title: 'Community Bulletin',
    description: 'Stay updated with tournament announcements, news, and community events.',
    icon: <FaCog className="w-6 h-6 text-red-500" />,
    path: '/bulletin',
    highlight: 'Never miss important league updates!',
  },
];

export const GoblinAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const showFeatures = useCallback(() => {
    const featureMessage: Message = {
      id: Date.now().toString(),
      type: 'goblin',
      content: "🧙‍♂️ Behold the treasures o' MTG Maui! I shall reveal our most splendid features:",
      timestamp: new Date(),
      actions: features.map(feature => ({
        label: feature.title,
        action: () => {
          // Inline function to avoid circular dependency
          const featureMessage: Message = {
            id: Date.now().toString(),
            type: 'goblin',
            content: `✨ **${feature.title}**\n\n${feature.description}\n\n💫 *${feature.highlight}*`,
            timestamp: new Date(),
            actions: [
              {
                label: 'Take me there!',
                action: () => (window.location.href = feature.path),
                icon: <FaMagic className="w-4 h-4" />,
              },
              {
                label: 'Show more features',
                action: () => showFeatures(),
                icon: <FaTrophy className="w-4 h-4" />,
              },
            ],
          };
          setMessages(prev => [...prev, featureMessage]);
        },
        icon: feature.icon,
      })),
    };
    setMessages(prev => [...prev, featureMessage]);
  }, []);

  const explainTournaments = useCallback(() => {
    const tournamentMessage: Message = {
      id: Date.now().toString(),
      type: 'goblin',
      content:
        '🏆 **Tournament Glory Awaits!**\n\nIn MTG Maui, we battle in epic formats:\n\n⚔️ **Commander**: Multiplayer mayhem with legendary commanders!\n🎯 **Draft**: Build decks from booster packs!\n🏛️ **Standard**: Modern magic with the latest sets!\n\nPoints, knockouts, and last-2-standing determine yer champions!',
      timestamp: new Date(),
      actions: [
        {
          label: 'View Leaderboard',
          action: () => (window.location.href = '/leaderboard'),
          icon: <FaTrophy className="w-4 h-4" />,
        },
        {
          label: 'Join a League',
          action: () => (window.location.href = '/auth/signup'),
          icon: <FaUsers className="w-4 h-4" />,
        },
      ],
    };
    setMessages(prev => [...prev, tournamentMessage]);
  }, []);

  const welcomeNewbie = useCallback(() => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      type: 'goblin',
      content:
        "🎪 **Welcome, Young Mage!**\n\nFear not the arcane arts o' tournament play! Let me guide ye through yer first steps:\n\n1. 🏰 **Create yer character** - Build a legendary profile\n2. ⚔️ **Choose yer format** - Commander, Draft, or Standard\n3. 🏆 **Enter the fray** - Join leagues and battle!\n4. 📊 **Track yer progress** - Analytics show yer growth\n\nReady to become a legend?",
      timestamp: new Date(),
      actions: [
        {
          label: 'Sign Up Now!',
          action: () => (window.location.href = '/auth/signup'),
          icon: <FaMagic className="w-4 h-4" />,
        },
        {
          label: 'Learn More',
          action: () => (window.location.href = '/character-sheets'),
          icon: <FaUsers className="w-4 h-4" />,
        },
      ],
    };
    setMessages(prev => [...prev, welcomeMessage]);
  }, []);

  const startConversation = useCallback(() => {
    const initialMessages: Message[] = [
      {
        id: '1',
        type: 'goblin',
        content:
          "🎲 *burps* Ahoy there, adventurer! I be Grimgut, the goblin guide o' this magical tournament realm! What brings ye to MTG Maui?",
        timestamp: new Date(),
        actions: [
          {
            label: 'Show me the features!',
            action: () => showFeatures(),
            icon: <FaMagic className="w-4 h-4" />,
          },
          {
            label: 'Tell me about tournaments',
            action: () => explainTournaments(),
            icon: <FaTrophy className="w-4 h-4" />,
          },
          {
            label: "I'm new here",
            action: () => welcomeNewbie(),
            icon: <FaUsers className="w-4 h-4" />,
          },
        ],
      },
    ];
    setMessages(initialMessages);
  }, [showFeatures, explainTournaments, welcomeNewbie]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      startConversation();
    }
  }, [isOpen, messages.length, startConversation]);

  const addUserMessage = (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
  };

  return (
    <>
      {/* Floating Goblin Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => {
            setIsOpen(!isOpen);
          }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 shadow-2xl hover:shadow-green-500/30 border-2 border-green-400"
          size="lg"
        >
          <FaRobot className="w-8 h-8 text-white" />
        </Button>

        {/* Notification Badge */}
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
          >
            <span className="text-xs font-bold text-white">!</span>
          </motion.div>
        )}
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-600 to-green-800 rounded-t-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👹</span>
                </div>
                <div>
                  <h3 className="text-white font-bold">Grimgut the Goblin</h3>
                  <p className="text-green-200 text-sm">Your MTG Guide</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-green-700/50"
              >
                <FaTimes className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'goblin'
                        ? 'bg-slate-700 text-white'
                        : 'bg-amber-600 text-white'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    {message.actions && (
                      <div className="mt-3 space-y-2">
                        {message.actions.map((action, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={action.action}
                            className="w-full justify-start text-xs bg-slate-600/50 border-slate-500 hover:bg-slate-600 hover:border-amber-400"
                          >
                            {action.icon && <span className="mr-2">{action.icon}</span>}
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator */}
            {messages.length > 0 && messages[messages.length - 1].type === 'user' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-4">
                <div className="flex items-center space-x-2 text-gray-400">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                  <span className="text-sm">Grimgut is typing...</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
