'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ExternalLink, Copy, Share2 } from 'lucide-react';
import { useState } from 'react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotNumber: number;
  transactionSignature: string;
  ownerAddress: string;
  explorerUrl?: string;
}

export default function SuccessModal({ 
  isOpen, 
  onClose, 
  slotNumber, 
  transactionSignature, 
  ownerAddress,
  explorerUrl: propExplorerUrl
}: SuccessModalProps) {
  const [copied, setCopied] = useState(false);
  
  const slotUrl = `${window.location.origin}?slot=${slotNumber}`;
  const explorerUrl = propExplorerUrl || `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`;
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareSlot = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out my meme on Slot #${slotNumber}!`,
          text: `I just minted Slot #${slotNumber} on Meme Wall!`,
          url: slotUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      copyToClipboard(slotUrl);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-green-900 to-emerald-900 rounded-2xl p-8 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                🎉 Mint Successful!
              </h2>
              <p className="text-green-300 text-lg font-semibold">
                Slot #{slotNumber} is now yours!
              </p>
              <p className="text-gray-300 text-sm mt-2">
                Your meme is now live on the Meme Wall
              </p>
            </div>

            {/* Transaction Details */}
            <div className="bg-black/20 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Owner:</span>
                  <span className="text-white font-mono">{ownerAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Transaction:</span>
                  <span className="text-white font-mono">{transactionSignature.slice(0, 8)}...</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* View Slot Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.open(slotUrl, '_blank')}
                className="w-full bg-gradient-to-r from-yellow-400 to-pink-400 hover:from-yellow-500 hover:to-pink-500 text-black font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <ExternalLink className="w-5 h-5" />
                <span>View My Slot</span>
              </motion.button>

              {/* Share Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={shareSlot}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Share2 className="w-5 h-5" />
                <span>Share My Slot</span>
              </motion.button>

              {/* Copy Link Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => copyToClipboard(slotUrl)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Copy className="w-5 h-5" />
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </motion.button>

              {/* View on Explorer Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.open(explorerUrl, '_blank')}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <ExternalLink className="w-5 h-5" />
                <span>View on Explorer</span>
              </motion.button>
            </div>

            {/* Close Button */}
            <div className="mt-6 text-center">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 