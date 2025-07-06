'use client';

import { motion } from 'framer-motion';
import { TrendingUp, ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface Token {
  id: number;
  name: string;
  votes: number;
  image: string;
}

interface TopTokensProps {
  tokens: Token[];
}

export default function TopTokens({ tokens }: TopTokensProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center mb-6">
        <TrendingUp className="w-6 h-6 text-yellow-400 mr-2" />
        <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
          Top Trending Tokens
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tokens.map((token, index) => (
          <motion.div
            key={token.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative bg-gradient-to-br from-purple-800/50 to-pink-800/50 rounded-xl p-6 border border-purple-600/30"
          >
            {/* Rank Badge */}
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full flex items-center justify-center text-black font-bold text-sm">
              #{index + 1}
            </div>
            
            {/* Token Image */}
            <div className="w-full h-48 mb-4 rounded-lg overflow-hidden">
              <Image 
                src={token.image} 
                alt={token.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Token Info */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">{token.name}</h3>
              <div className="flex items-center justify-center space-x-2 text-yellow-400">
                <TrendingUp className="w-4 h-4" />
                <span className="font-semibold">{token.votes.toLocaleString()} votes</span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-center space-x-3 mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-medium transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>DexScreener</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-xs font-medium transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Pump.fun</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 