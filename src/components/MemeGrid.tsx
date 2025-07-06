'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Crown } from 'lucide-react';

interface MemeGridProps {
  onSlotClick: (slotNumber: number) => void;
  isLaunched: boolean;
}

interface Slot {
  id: number;
  isOwned: boolean;
  owner?: string;
  image?: string;
  title?: string;
  upvotes: number;
  downvotes: number;
  isFeatured?: boolean;
}

export default function MemeGrid({ onSlotClick, isLaunched }: MemeGridProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleSlots, setVisibleSlots] = useState<Slot[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const slotsPerPage = 100; // Show 100 slots at a time for better performance

  // Generate 10,000 slots
  useEffect(() => {
    const generateSlots = () => {
      const newSlots: Slot[] = [];
      for (let i = 1; i <= 10000; i++) {
        newSlots.push({
          id: i,
          isOwned: Math.random() < 0.15, // 15% owned for demo
          owner: Math.random() < 0.15 ? `0x${Math.random().toString(16).slice(2, 10)}...` : undefined,
          image: Math.random() < 0.15 ? `https://picsum.photos/200/200?random=${i}` : undefined,
          title: Math.random() < 0.15 ? `Meme #${i}` : undefined,
          upvotes: Math.floor(Math.random() * 500),
          downvotes: Math.floor(Math.random() * 50),
          isFeatured: i <= 3, // First 3 slots are featured
        });
      }
      setSlots(newSlots);
      setLoading(false);
    };

    generateSlots();
  }, []);

  // Pagination for better performance
  useEffect(() => {
    const startIndex = (currentPage - 1) * slotsPerPage;
    const endIndex = startIndex + slotsPerPage;
    setVisibleSlots(slots.slice(startIndex, endIndex));
  }, [slots, currentPage]);

  const handleVote = (slotId: number, isUpvote: boolean) => {
    setSlots(prev => prev.map(slot => 
      slot.id === slotId 
        ? { 
            ...slot, 
            upvotes: isUpvote ? slot.upvotes + 1 : slot.upvotes,
            downvotes: !isUpvote ? slot.downvotes + 1 : slot.downvotes
          }
        : slot
    ));
  };

  const loadMoreSlots = () => {
    setCurrentPage(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
        {visibleSlots.map((slot) => (
          <motion.div
            key={slot.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              aspect-square rounded-lg border-2 cursor-pointer transition-all duration-200 relative
              ${slot.isOwned 
                ? 'border-green-500 bg-green-900/20 hover:border-green-400' 
                : 'border-gray-600 bg-gray-800/20 hover:border-yellow-400'
              }
              ${slot.isFeatured ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''}
            `}
            onClick={() => onSlotClick(slot.id)}
          >
            {/* Featured Badge */}
            {slot.isFeatured && (
              <div className="absolute -top-2 -right-2 z-10">
                <Crown className="w-6 h-6 text-yellow-400" />
              </div>
            )}

            {slot.isOwned ? (
              <div className="h-full p-2 flex flex-col">
                {slot.image ? (
                  <div className="w-full h-3/4 rounded mb-1 overflow-hidden">
                    <img 
                      src={slot.image} 
                      alt={slot.title || `Slot ${slot.id}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-full h-3/4 bg-gradient-to-br from-purple-600 to-pink-600 rounded mb-1 flex items-center justify-center">
                    <span className="text-xs font-bold">#{slot.id}</span>
                  </div>
                )}
                
                <div className="flex-1 flex flex-col justify-between">
                  <div className="text-xs truncate font-medium">{slot.title || `Slot ${slot.id}`}</div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(slot.id, true);
                        }}
                        className="text-green-400 hover:text-green-300 transition-colors"
                      >
                        <Heart className="w-3 h-3" />
                      </button>
                      <span className="font-medium">{slot.upvotes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(slot.id, false);
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Heart className="w-3 h-3 rotate-180" />
                      </button>
                      <span className="font-medium">{slot.downvotes}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-2">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-400 mb-1">#{slot.id}</div>
                  <div className="text-xs text-gray-500">Available</div>
                  <div className="text-xs text-yellow-400 font-medium mt-1">0.01 SOL</div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Load More Button */}
      {currentPage * slotsPerPage < slots.length && (
        <div className="flex justify-center mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadMoreSlots}
            className="bg-gradient-to-r from-yellow-400 to-pink-400 text-black font-bold py-3 px-6 rounded-lg hover:from-yellow-500 hover:to-pink-500 transition-all duration-200"
          >
            Load More Slots
          </motion.button>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="text-center mt-4 text-gray-400 text-sm">
        Showing {Math.min(currentPage * slotsPerPage, slots.length)} of {slots.length} slots
      </div>
    </div>
  );
} 