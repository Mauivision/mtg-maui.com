'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FaMagic, FaSignInAlt, FaUser } from 'react-icons/fa';

interface AuthSectionProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

export const AuthSection: React.FC<AuthSectionProps> = ({ onSignIn, onSignUp }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full mx-4"
      >
        <Card className="p-8 text-center shadow-xl">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6"
          >
            <FaMagic className="text-6xl text-blue-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">MTG Maui</h1>
            <p className="text-gray-600">
              Your ultimate Magic: The Gathering deck builder and tournament manager
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-4"
          >
            <Button variant="primary" size="lg" className="w-full" onClick={onSignIn}>
              <FaSignInAlt className="mr-2" />
              Sign In
            </Button>

            <Button variant="secondary" size="lg" className="w-full" onClick={onSignUp}>
              <FaUser className="mr-2" />
              Sign Up
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-6 text-sm text-gray-500"
          >
            <p className="mb-2">Features:</p>
            <ul className="text-left space-y-1">
              <li>• Build and manage MTG decks with drag-and-drop</li>
              <li>• Advanced card search with Scryfall integration</li>
              <li>• Comprehensive deck analysis and suggestions</li>
              <li>• Tournament management and tracking</li>
              <li>• Collection management</li>
              <li>• Real-time authentication</li>
            </ul>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};

export default AuthSection;
