'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DeckList } from './DeckList';
import { DeckDetail } from './DeckDetail';
import { DeckImportExport } from './DeckImportExport';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/hooks/useAuth';
import { Deck } from '@/types/mtg';

export const DeckManager: React.FC = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const { session } = useAuth();

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/decks');

      if (response.ok) {
        const fetchedDecks = await response.json();
        setDecks(fetchedDecks);
      } else {
        console.error('Failed to fetch decks');
      }
    } catch (error) {
      console.error('Error fetching decks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeckSelect = (deck: Deck) => {
    setSelectedDeck(deck);
  };

  const handleDeckUpdate = async () => {
    await fetchDecks(); // Refresh the deck list
    setSelectedDeck(null); // Close the detail view
  };

  const handleDeckDelete = async () => {
    await fetchDecks(); // Refresh the deck list
    setSelectedDeck(null); // Close the detail view
  };

  const handleCreateDeck = () => {
    setShowCreateModal(true);
  };

  const handleImportDeck = () => {
    setShowImportModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading decks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Deck Manager</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImportDeck}>
            Import Deck
          </Button>
          <Button onClick={handleCreateDeck}>Create New Deck</Button>
        </div>
      </div>

      {selectedDeck ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <DeckDetail
            deck={selectedDeck}
            onUpdate={handleDeckUpdate}
            onDelete={handleDeckDelete}
            onBack={() => setSelectedDeck(null)}
          />
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <DeckList
            decks={decks}
            loading={loading}
            onDeckSelect={handleDeckSelect}
            onCreateDeck={handleCreateDeck}
            showUserDecks={true}
            currentUserId={session?.user?.id}
          />
        </motion.div>
      )}

      {/* Create Deck Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Deck"
      >
        <DeckDetail onUpdate={handleDeckUpdate} onBack={() => setShowCreateModal(false)} />
      </Modal>

      {/* Import Deck Modal */}
      <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)} title="Import Deck">
        <DeckImportExport
          onImport={async deck => {
            await fetchDecks();
            setShowImportModal(false);
          }}
        />
      </Modal>
    </div>
  );
};
