'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart} from 'lucide-react';
import Image from 'next/image';

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
}

export default function MemeGrid({ onSlotClick, isLaunched }: MemeGridProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate 10,000 slots
  useEffect(() => {
    const generateSlots = () => {
      const newSlots: Slot[] = [];
      for (let i = 1; i <= 10000; i++) {
        newSlots.push({
          id: i,
          isOwned: Math.random() < 0.1, // 10% owned for demo
          owner: Math.random() < 0.1 ? `0x${Math.random().toString(16).slice(2, 10)}...` : undefined,
          image: Math.random() < 0.1 ? `https://picsum.photos/200/200?random=${i}` : undefined,
          title: Math.random() < 0.1 ? `Meme #${i}` : undefined,
          upvotes: Math.floor(Math.random() * 100),
          downvotes: Math.floor(Math.random() * 20),
        });
      }
      setSlots(newSlots);
      setLoading(false);
    };

    generateSlots();
  }, []);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
        {isLaunched ? 'The Meme Wall' : 'Coming Soon...'}
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2">
        {slots.map((slot) => (
          <motion.div
            key={slot.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              aspect-square rounded-lg border-2 cursor-pointer transition-all duration-200
              ${slot.isOwned 
                ? 'border-green-500 bg-green-900/20' 
                : 'border-gray-600 bg-gray-800/20 hover:border-yellow-400'
              }
            `}
            onClick={() => onSlotClick(slot.id)}
          >
            {slot.isOwned ? (
              <div className="h-full p-2 flex flex-col">
                {slot.image ? (
                  <Image 
                    src={slot.image} 
                    alt={slot.title || `Slot ${slot.id}`}
                    className="w-full h-3/4 object-cover rounded mb-1"
                  />
                ) : (
                  <div className="w-full h-3/4 bg-gradient-to-br from-purple-600 to-pink-600 rounded mb-1 flex items-center justify-center">
                    <span className="text-xs font-bold">#{slot.id}</span>
                  </div>
                )}
                
                <div className="flex-1 flex flex-col justify-between">
                  <div className="text-xs truncate">{slot.title || `Slot ${slot.id}`}</div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(slot.id, true);
                        }}
                        className="text-green-400 hover:text-green-300"
                      >
                        <Heart className="w-3 h-3" />
                      </button>
                      <span>{slot.upvotes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(slot.id, false);
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Heart className="w-3 h-3 rotate-180" />
                      </button>
                      <span>{slot.downvotes}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400">#{slot.id}</div>
                  <div className="text-xs text-gray-500">Available</div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
} 