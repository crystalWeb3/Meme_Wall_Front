'use client';

import { useState, useEffect } from 'react';
import { ClientWalletButton } from "@/components/ClientWalletButton";
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import { ExternalLink, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import MemeGrid from '@/components/MemeGrid';
import MintModal from '@/components/MintModal';
import { useMemeWall } from '@/hooks/useMemeWall';
import "@solana/wallet-adapter-react-ui/styles.css";

export default function Home() {
  const { connected } = useWallet();
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [highlightedSlot, setHighlightedSlot] = useState<number | null>(null);
  
  // Use simulated blockchain data
  const { globalState, slots, loading, mintSlot } = useMemeWall();
  
  // Calculate slots remaining from blockchain data
  const slotsRemaining = globalState ? globalState.totalSlots - globalState.mintedSlots : 10000;

  // Check for slot parameter in URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const slotParam = urlParams.get('slot');
    if (slotParam) {
      const slotNumber = parseInt(slotParam);
      if (!isNaN(slotNumber) && slotNumber >= 1 && slotNumber <= 10000) {
        setHighlightedSlot(slotNumber);
        // Scroll to the slot after a short delay to ensure the grid is loaded
        setTimeout(() => {
          const slotElement = document.querySelector(`[data-slot="${slotNumber}"]`);
          if (slotElement) {
            slotElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add a highlight effect
            slotElement.classList.add('ring-4', 'ring-yellow-400', 'ring-opacity-75');
            setTimeout(() => {
              slotElement.classList.remove('ring-4', 'ring-yellow-400', 'ring-opacity-75');
            }, 3000);
          }
        }, 1000);
      }
    }
  }, []);

  // Mock data for top 3 featured meme slots (since we don't have voting yet)
  const featuredSlots = [
    { 
      id: 1, 
      title: "PEPE", 
      votes: 1250, 
      image: "https://picsum.photos/400/300?random=1",
      owner: "0x1234...5678",
      price: "0.01 SOL",
      marketCap: "$2.5M"
    },
    { 
      id: 2, 
      title: "DOGE", 
      votes: 980, 
      image: "https://picsum.photos/400/300?random=2",
      owner: "0x8765...4321",
      price: "0.01 SOL",
      marketCap: "$1.8M"
    },
    { 
      id: 3, 
      title: "SHIB", 
      votes: 750, 
      image: "https://picsum.photos/400/300?random=3",
      owner: "0x9999...8888",
      price: "0.01 SOL",
      marketCap: "$1.2M"
    },
  ];

  const handleSlotClick = (slotNumber: number) => {
    if (!connected) {
      alert('Please connect your wallet first!');
      return;
    }
    setSelectedSlot(slotNumber);
    setIsMintModalOpen(true);
  };

  const handleWhitelistClick = () => {
    // Link to whitepaper
    window.open('https://your-whitepaper-url.com', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header - Project Name/Logo and Slot Meter */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          {/* Top Left - Project Name/Logo */}
          <div className="flex items-center">
            <Image
              src="/logo.png" 
              alt="Project Logo" 
              width={70} 
              height={70} 
              className="rounded-full mr-4"
            />
            <h1 className="text-5xl font-bold text-white from-yellow-400 to-pink-400 bg-clip-text text-transparent">
              MEME WALL
            </h1>
          </div>
          
          {/* Top Right - Slot Meter */}
          <div className="text-5xl font-bold text-yellow-400">
            {loading ? "Loading..." : `${slotsRemaining.toLocaleString()} slots left`}
          </div>
        </div>

        {/* Centered Navigation Buttons */}
        <nav className="flex justify-center space-x-12 mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleWhitelistClick}
            className="text-xl font-bold hover:text-yellow-400 transition-colors cursor-pointer"
          >
            10,000 Slots
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-xl font-bold hover:text-yellow-400 transition-colors cursor-pointer"
          >
            <span className="underline">Resale</span>
            <span className="text-sm text-gray-400 ml-2">(Coming Soon)</span>
          </motion.button>
          
          <div className="transform scale-125">
            <ClientWalletButton className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg font-bold px-6 py-3 rounded-lg" />
          </div>
        </nav>
      </header>

      {/* Blockchain Status */}
      {globalState && (
        <div className="container mx-auto px-4 mb-4">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 text-center">
            <div className="text-green-400 font-semibold">✅ Real Blockchain - Devnet</div>
            <div className="text-sm text-gray-300">
              Total Slots: {globalState.totalSlots.toLocaleString()} | 
              Minted: {globalState.mintedSlots.toLocaleString()} | 
              Phase: {globalState.phase && 'public' in globalState.phase ? 'Public' : 'Whitelist'} | 
              Price: {globalState.mintPrice} SOL
            </div>
          </div>
        </div>
      )}

      {/* Featured Meme Slots - Top 3 Most Upvoted */}
      <section className="container mx-auto px-4 mb-12">
        <div className="flex items-center justify-center mb-8">
          <TrendingUp className="w-8 h-8 text-yellow-400 mr-3" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
            Featured Memes
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredSlots.map((slot, index) => (
            <motion.div
              key={slot.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative bg-gradient-to-br from-purple-800/50 to-pink-800/50 rounded-xl p-6 border border-purple-600/30 hover:border-yellow-400/50 transition-all duration-300"
            >
              {/* Rank Badge */}
              <div className="absolute -top-3 -left-3 w-12 h-12 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full flex items-center justify-center text-black font-bold text-lg">
                #{index + 1}
              </div>
              
              {/* Meme Image */}
              <div className="w-full h-64 mb-4 rounded-lg overflow-hidden">
                <Image 
                  src={slot.image} 
                  alt={slot.title}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              {/* Meme Info */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">{slot.title}</h3>
                <div className="flex items-center justify-center space-x-2 text-yellow-400 mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-semibold text-lg">{slot.votes.toLocaleString()} votes</span>
                </div>
                <p className="text-gray-300 text-sm mb-4">Owner: {slot.owner}</p>
                
                {/* Action Buttons */}
                <div className="flex justify-center space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>DexScreener</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Pump.fun</span>
                  </motion.button>
                </div>
                
                {/* Additional Info */}
                <div className="mt-3 text-center">
                  <div className="text-xs text-gray-400">
                    <span className="text-yellow-400 font-medium">{slot.price}</span> • Market Cap: <span className="text-green-400 font-medium">{slot.marketCap}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Full Grid of 10,000 Slots - Scrollable */}
      <section className="container mx-auto px-4 pb-8">
        <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
          The Meme Wall
        </h2>
        
        <div className="max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-400 scrollbar-track-gray-800 rounded-lg">
          <MemeGrid 
            onSlotClick={handleSlotClick}
            blockchainSlots={slots}
            loading={loading}
            highlightedSlot={highlightedSlot}
          />
        </div>
      </section>

      {/* Mint Modal */}
      {isMintModalOpen && selectedSlot && (
        <MintModal
          slotNumber={selectedSlot}
          isOpen={isMintModalOpen}
          onClose={() => {
            setIsMintModalOpen(false);
            setSelectedSlot(null);
          }}
          onMint={async (formData) => {
            try {
              const result = await mintSlot(formData);
              
              if (result?.success) {
                return {
                  success: true,
                  signature: result.transaction,
                  explorerUrl: `https://explorer.solana.com/tx/${result.transaction}?cluster=devnet`,
                  imageUrl: result.slot?.metadataUri,
                  metadataUrl: result.slot?.metadataUri,
                  nftMintAddress: result.nft?.mint?.toString(),
                  slotAccountAddress: result.slot?.slotNumber ? 
                    // This would be the actual slot PDA, but for now we'll use a placeholder
                    '11111111111111111111111111111111' : undefined
                };
              } else {
                return {
                  success: false,
                  error: result?.error || 'Minting failed'
                };
              }
            } catch (error) {
              return {
                success: false,
                error: error instanceof Error ? error.message : 'Minting failed'
              };
            }
          }}
          isWalletWhitelisted={() => true}
          globalState={globalState}
        />
      )}
    </div>
  );
}
