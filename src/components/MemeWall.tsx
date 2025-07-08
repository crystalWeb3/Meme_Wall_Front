import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useMemeWall } from '../hooks/useMemeWall';
import { MintingForm } from './MintingForm';
import { NFTDetailsModal } from './NFTDetailsModal';
import { PublicKey } from '@solana/web3.js';

export const MemeWall: React.FC = () => {
  const { publicKey } = useWallet();
  const { slots, currentPhase, isLoading, error, fetchSlots, checkWhitelistStatus } = useMemeWall();
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectedNFT, setSelectedNFT] = useState<any>(null);
  const [isWhitelisted, setIsWhitelisted] = useState<boolean | null>(null);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  useEffect(() => {
    if (publicKey) {
      checkWhitelistStatus().then(setIsWhitelisted);
    }
  }, [publicKey, checkWhitelistStatus]);

  const handleMintClick = (slotNumber: number) => {
    if (!publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    if (currentPhase === 'Whitelist' && !isWhitelisted) {
      alert('You are not whitelisted for this phase. Please contact the admin.');
      return;
    }

    setSelectedSlot(slotNumber);
  };

  const handleMintSuccess = () => {
    setSelectedSlot(null);
    fetchSlots(); // Refresh the slots
  };

  const handleCloseForm = () => {
    setSelectedSlot(null);
  };

  const handleNFTClick = (slot: any) => {
    setSelectedNFT(slot);
  };

  const handleCloseNFTModal = () => {
    setSelectedNFT(null);
  };

  const canMint = (slot: any) => {
    if (!slot.isMinted) return true;
    return publicKey && slot.owner === publicKey.toString();
  };

  const getSlotStatus = (slot: any) => {
    if (!slot.isMinted) return 'Available';
    if (publicKey && slot.owner === publicKey.toString()) return 'Yours';
    return 'Minted';
  };

  const getSlotStatusColor = (slot: any) => {
    if (!slot.isMinted) return 'bg-green-100 text-green-800';
    if (publicKey && slot.owner === publicKey.toString()) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading meme wall...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Meme Wall</h1>
        <p className="text-lg text-gray-600 mb-4">
          Mint your favorite memes as NFTs on the Solana blockchain
        </p>
        <p className="text-sm text-gray-500 mb-4">
          {slots.filter(s => s.isMinted).length} of {slots.length} slots minted
        </p>
        
        {/* Phase and Wallet Status */}
        <div className="flex justify-center items-center gap-4 mb-6">
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Phase: {currentPhase}
          </div>
          
          {publicKey && (
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Wallet: {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
            </div>
          )}
          
          {currentPhase === 'Whitelist' && isWhitelisted !== null && (
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isWhitelisted 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isWhitelisted ? 'Whitelisted' : 'Not Whitelisted'}
            </div>
          )}
          
          <button
            onClick={fetchSlots}
            disabled={isLoading}
            className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-yellow-600 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Meme Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {slots.map((slot) => (
          <div
            key={slot.slotNumber}
            className={`relative bg-white rounded-lg shadow-md overflow-hidden border-2 transition-all duration-200 hover:shadow-lg ${
              slot.isMinted ? 'border-gray-300' : 'border-green-300'
            }`}
          >
            {/* Slot Number */}
            <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
              #{slot.slotNumber}
            </div>

            {/* Status Badge */}
            <div className="absolute top-2 right-2">
              <span className={`text-xs px-2 py-1 rounded-full ${getSlotStatusColor(slot)}`}>
                {getSlotStatus(slot)}
              </span>
            </div>

            {/* Content */}
            <div className="aspect-square flex items-center justify-center bg-gray-100">
              {slot.isMinted ? (
                <div className="text-center p-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">NFT</span>
                  </div>
                  <p className="text-xs text-gray-600 break-words">
                    {publicKey && slot.owner === publicKey.toString() ? 'Your NFT' : 'Minted'}
                  </p>
                                      {publicKey && slot.owner === publicKey.toString() && (
                    <button
                      onClick={() => window.open(`https://explorer.solana.com/address/${slot.mint.toString()}?cluster=devnet`, '_blank')}
                      className="text-xs text-blue-500 hover:text-blue-700 mt-1"
                    >
                      View NFT
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center p-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-400 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">+</span>
                  </div>
                  <p className="text-xs text-gray-600">Available</p>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="p-3">
              {slot.isMinted ? (
                <button
                  className="w-full bg-blue-500 text-white text-sm py-2 px-3 rounded hover:bg-blue-600 transition-colors"
                  onClick={() => handleNFTClick(slot)}
                >
                  View NFT Details
                </button>
              ) : (
                <button
                  className="w-full bg-green-500 text-white text-sm py-2 px-3 rounded hover:bg-green-600 transition-colors"
                  onClick={() => handleMintClick(slot.slotNumber)}
                >
                  Mint
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Minting Form Modal */}
      {selectedSlot && (
        <MintingForm
          slotNumber={selectedSlot}
          onMintSuccess={handleMintSuccess}
          onClose={handleCloseForm}
        />
      )}

      {/* NFT Details Modal */}
      {selectedNFT && (
        <NFTDetailsModal
          slot={selectedNFT}
          onClose={handleCloseNFTModal}
        />
      )}

      {/* Stats */}
      <div className="mt-8 text-center">
        <div className="inline-flex gap-8 bg-white rounded-lg shadow-md px-6 py-4">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {slots.length}
            </div>
            <div className="text-sm text-gray-600">Total Slots</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {slots.filter(s => s.isMinted).length}
            </div>
            <div className="text-sm text-gray-600">Minted</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {slots.filter(s => !s.isMinted).length}
            </div>
            <div className="text-sm text-gray-600">Available</div>
          </div>
        </div>
      </div>
    </div>
  );
}; 