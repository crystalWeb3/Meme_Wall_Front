'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image as ImageIcon, Link, DollarSign } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';

interface MintModalProps {
  slotNumber: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function MintModal({ slotNumber, isOpen, onClose }: MintModalProps) {
  const { connected, publicKey } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null as File | null,
    dexScreener: '',
    pumpFun: '',
    website: '',
    twitter: '',
    telegram: ''
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        alert('Only JPG, PNG, and GIF files are allowed');
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected || !publicKey) {
      alert('Please connect your wallet first!');
      return;
    }

    if (!formData.image) {
      alert('Please upload an image!');
      return;
    }

    if (!formData.title.trim()) {
      alert('Please enter a title!');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement actual minting logic
      // 1. Upload image to IPFS/Arweave
      // 2. Create metadata
      // 3. Call Solana program
      
      console.log('Minting slot:', slotNumber);
      console.log('Form data:', formData);
      
      // Simulate minting process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Slot minted successfully! 🎉');
      onClose();
    } catch (error) {
      console.error('Minting failed:', error);
      alert('Minting failed. Please try again.');
    } finally {
      setIsLoading(false);
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
            className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Mint Slot #{slotNumber}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Price Info */}
            <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-semibold">Slot Price:</span>
                </div>
                <span className="text-2xl font-bold text-white">0.01 SOL</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Upload Meme Image/GIF *
                </label>
                <div
                  className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-yellow-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <div className="space-y-2">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-lg mx-auto"
                      />
                      <p className="text-sm text-gray-400">Click to change image</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <p className="text-gray-400">Click to upload image (JPG, PNG, GIF)</p>
                      <p className="text-xs text-gray-500">Max 5MB</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Title & Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                    placeholder="Enter meme title"
                    maxLength={50}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                    placeholder="Enter description"
                    rows={3}
                    maxLength={200}
                  />
                </div>
              </div>

              {/* Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <Link className="w-5 h-5" />
                  <span>Token Links</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="url"
                    value={formData.dexScreener}
                    onChange={(e) => setFormData(prev => ({ ...prev, dexScreener: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                    placeholder="DexScreener URL"
                  />
                  <input
                    type="url"
                    value={formData.pumpFun}
                    onChange={(e) => setFormData(prev => ({ ...prev, pumpFun: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                    placeholder="Pump.fun URL"
                  />
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                    placeholder="Website URL"
                  />
                  <input
                    type="url"
                    value={formData.twitter}
                    onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                    placeholder="Twitter URL"
                  />
                  <input
                    type="url"
                    value={formData.telegram}
                    onChange={(e) => setFormData(prev => ({ ...prev, telegram: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                    placeholder="Telegram URL"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !connected}
                className="w-full bg-gradient-to-r from-yellow-400 to-pink-400 hover:from-yellow-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 px-6 rounded-lg transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                    <span>Minting...</span>
                  </div>
                ) : (
                  `Mint Slot #${slotNumber} for 0.01 SOL`
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 