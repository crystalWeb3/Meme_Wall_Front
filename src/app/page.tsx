'use client';

import { useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import MemeGrid from '@/components/MemeGrid';
import TopTokens from '@/components/TopTokens';
import CountdownTimer from '@/components/CountdownTimer';
import MintModal from '@/components/MintModal';

export default function Home() {
  const { connected } = useWallet();
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [slotsRemaining] = useState(10000);
  const [isLaunched, setIsLaunched] = useState(false);

  // Mock data - replace with real blockchain data
  const topTokens = [
    { id: 1, name: "PEPE", votes: 1250, image: "/api/placeholder/300/200" },
    { id: 2, name: "DOGE", votes: 980, image: "/api/placeholder/300/200" },
    { id: 3, name: "SHIB", votes: 750, image: "/api/placeholder/300/200" },
  ];

  const handleSlotClick = (slotNumber: number) => {
    if (!connected) {
      alert('Please connect your wallet first!');
      return;
    }
    setSelectedSlot(slotNumber);
    setIsMintModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
              MEME WALL
            </h1>
            <div className="flex items-center space-x-2 text-yellow-400">
              <Users className="w-5 h-5" />
              <span className="text-xl font-bold">{slotsRemaining.toLocaleString()} slots left</span>
            </div>
          </div>
          <WalletMultiButton className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" />
        </div>

        {/* Navigation */}
        <nav className="flex justify-center space-x-8 mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-lg font-semibold hover:text-yellow-400 transition-colors"
          >
            10,000 Slots
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-lg font-semibold hover:text-yellow-400 transition-colors"
          >
            Resale <span className="text-sm text-gray-400">(Coming Soon)</span>
          </motion.button>
        </nav>
      </header>

      {/* Countdown Timer */}
      {!isLaunched && (
        <div className="container mx-auto px-4 mb-8">
          <CountdownTimer onLaunch={() => setIsLaunched(true)} />
        </div>
      )}

      {/* Top 3 Tokens */}
      {isLaunched && (
        <div className="container mx-auto px-4 mb-8">
          <TopTokens tokens={topTokens} />
        </div>
      )}

      {/* Meme Grid */}
      <div className="container mx-auto px-4 pb-8">
        <MemeGrid 
          onSlotClick={handleSlotClick}
          isLaunched={isLaunched}
        />
      </div>

      {/* Mint Modal */}
      {isMintModalOpen && selectedSlot && (
        <MintModal
          slotNumber={selectedSlot}
          isOpen={isMintModalOpen}
          onClose={() => {
            setIsMintModalOpen(false);
            setSelectedSlot(null);
          }}
        />
      )}
    </div>
  );
}
