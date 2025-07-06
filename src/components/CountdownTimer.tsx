'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, Rocket } from 'lucide-react';

interface CountdownTimerProps {
  onLaunch: () => void;
}

export default function CountdownTimer({ onLaunch }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Set launch date to 7 days from now
    const launchDate = new Date();
    launchDate.setDate(launchDate.getDate() + 7);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        onLaunch();
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [onLaunch]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <div className="flex items-center justify-center mb-6">
        <Rocket className="w-8 h-8 text-yellow-400 mr-3 animate-pulse" />
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
          MEME WALL LAUNCH
        </h1>
      </div>
      
      <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
        The ultimate digital meme real estate is about to drop! 
        <br />
        <span className="text-yellow-400 font-semibold">10,000 slots</span> of pure meme glory await.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-br from-purple-800/50 to-pink-800/50 rounded-xl p-6 border border-purple-600/30"
        >
          <div className="text-3xl md:text-4xl font-bold text-yellow-400">{timeLeft.days}</div>
          <div className="text-sm text-gray-300">Days</div>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-br from-purple-800/50 to-pink-800/50 rounded-xl p-6 border border-purple-600/30"
        >
          <div className="text-3xl md:text-4xl font-bold text-yellow-400">{timeLeft.hours}</div>
          <div className="text-sm text-gray-300">Hours</div>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-br from-purple-800/50 to-pink-800/50 rounded-xl p-6 border border-purple-600/30"
        >
          <div className="text-3xl md:text-4xl font-bold text-yellow-400">{timeLeft.minutes}</div>
          <div className="text-sm text-gray-300">Minutes</div>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-br from-purple-800/50 to-pink-800/50 rounded-xl p-6 border border-purple-600/30"
        >
          <div className="text-3xl md:text-4xl font-bold text-yellow-400">{timeLeft.seconds}</div>
          <div className="text-sm text-gray-300">Seconds</div>
        </motion.div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-2 bg-green-600/20 border border-green-500/30 rounded-lg px-4 py-2"
        >
          <Zap className="w-5 h-5 text-green-400" />
          <span className="text-green-400 font-semibold">500 Whitelist Slots Available</span>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-2 bg-blue-600/20 border border-blue-500/30 rounded-lg px-4 py-2"
        >
          <Clock className="w-5 h-5 text-blue-400" />
          <span className="text-blue-400 font-semibold">Connect Wallet to Mint</span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 text-center"
      >
        <p className="text-sm text-gray-400">
          ⚡ Early birds get the best slots! ⚡
        </p>
      </motion.div>
    </motion.div>
  );
} 