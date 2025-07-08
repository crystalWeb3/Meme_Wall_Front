import React from 'react';

interface NFTDetailsModalProps {
  slot: {
    slotNumber: number;
    owner: string;
    metadataUri: string;
    mint: string;
    isMinted: boolean;
  };
  onClose: () => void;
}

export const NFTDetailsModal: React.FC<NFTDetailsModalProps> = ({ slot, onClose }) => {
  const handleViewOnExplorer = () => {
    window.open(`https://explorer.solana.com/address/${slot.mint}?cluster=devnet`, '_blank');
  };

  const handleViewMetadata = () => {
    if (slot.metadataUri && slot.metadataUri !== 'Unknown') {
      window.open(slot.metadataUri, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">NFT Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Slot Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Slot Number</label>
            <p className="text-lg font-semibold">#{slot.slotNumber}</p>
          </div>

          {/* Owner */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Owner</label>
            <p className="text-sm text-gray-600 break-all">{slot.owner}</p>
          </div>

          {/* Mint Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Mint Address</label>
            <p className="text-sm text-gray-600 break-all">{slot.mint}</p>
          </div>

          {/* Metadata URI */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Metadata URI</label>
            <p className="text-sm text-gray-600 break-all">
              {slot.metadataUri && slot.metadataUri !== 'Unknown' ? slot.metadataUri : 'Not available'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleViewOnExplorer}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
              View on Explorer
            </button>
            
            {slot.metadataUri && slot.metadataUri !== 'Unknown' && (
              <button
                onClick={handleViewMetadata}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
              >
                View Metadata
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 