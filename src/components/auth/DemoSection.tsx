'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

interface DemoSectionProps {
  onSignIn: () => void;
  onSignUp: () => void;
  onTryDemo: () => void;
}

export function DemoSection({ onSignIn, onSignUp, onTryDemo }: DemoSectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8 text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🚀 Try MTG Maui</h1>
          <p className="text-lg text-gray-600 mb-6">
            Build your first deck and experience the power of MTG Maui before signing up!
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">🎁 Demo Features:</h3>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>✅ Create 1 complete deck</li>
              <li>✅ Browse card collection</li>
              <li>✅ View deck analytics</li>
              <li>✅ Experience full interface</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={onTryDemo}
            className="w-full bg-green-600 hover:bg-green-700 text-lg py-3"
            size="lg"
          >
            🎮 Start Free Demo (No Signup Required)
          </Button>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={onSignIn}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              Sign In
            </Button>

            <Button onClick={onSignUp} className="bg-blue-600 hover:bg-blue-700">
              Sign Up Free
            </Button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">
            🚀 <strong>Free Demo:</strong> Try everything first, then decide!
          </p>
          <p className="text-xs text-gray-400">
            No credit card required • Create unlimited accounts • Upgrade anytime
          </p>
        </div>
      </Card>
    </div>
  );
}
