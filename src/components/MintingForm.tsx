import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useMemeWall, MintFormData } from '../hooks/useMemeWall';
import Image from 'next/image';

interface MintingFormProps {
  slotNumber: number;
  onMintSuccess: () => void;
  onClose: () => void;
}

export const MintingForm: React.FC<MintingFormProps> = ({ 
  slotNumber, 
  onMintSuccess, 
  onClose 
}) => {
  const { publicKey } = useWallet();
  const { mintSlot, isLoading, error, initializeServices } = useMemeWall();
  const [formData, setFormData] = useState<MintFormData>({
    slotNumber,
    title: '',
    description: '',
    image: null,
    tokenName: '',
    tokenSymbol: '',
    tokenDescription: '',
    tokenImage: '',
    tokenExternalUrl: '',
    tokenAttributes: [],
  });

  useEffect(() => {
    initializeServices();
  }, [initializeServices]);

  const handleInputChange = (field: keyof MintFormData, value: string | File | Array<{ trait_type: string; value: string }>) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleInputChange('image', file);
      // Auto-fill token image URL with a placeholder
      handleInputChange('tokenImage', URL.createObjectURL(file));
    }
  };

  const handleAttributeChange = (index: number, field: 'trait_type' | 'value', value: string) => {
    const newAttributes = [...formData.tokenAttributes];
    newAttributes[index] = { ...newAttributes[index], [field]: value };
    handleInputChange('tokenAttributes', newAttributes);
  };

  const addAttribute = () => {
    handleInputChange('tokenAttributes', [
      ...formData.tokenAttributes,
      { trait_type: '', value: '' }
    ]);
  };

  const removeAttribute = (index: number) => {
    const newAttributes = formData.tokenAttributes.filter((_, i) => i !== index);
    handleInputChange('tokenAttributes', newAttributes);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    // Validate required fields
    if (!formData.title || !formData.tokenName || !formData.tokenSymbol) {
      alert('Please fill in all required fields');
      return;
    }

    if (!formData.image) {
      alert('Please select an image');
      return;
    }

    try {
      const result = await mintSlot(formData);
      if (result?.success) {
        alert('🎉 Slot minted successfully! Check your wallet for the NFT.');
        onMintSuccess();
        onClose();
      } else {
        alert(`Minting failed: ${result?.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Minting error:', err);
      alert('Minting failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Mint Slot #{slotNumber}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter meme title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter description"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {formData.image && (
              <div className="mt-2">
                <Image
                  src={URL.createObjectURL(formData.image)}
                  alt="Preview"
                  width={128}
                  height={128}
                  className="w-32 h-32 object-cover rounded-md"
                />
              </div>
            )}
          </div>

          {/* NFT Token Information */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">NFT Token Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Token Name *
                </label>
                <input
                  type="text"
                  value={formData.tokenName}
                  onChange={(e) => handleInputChange('tokenName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Meme #1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Token Symbol *
                </label>
                <input
                  type="text"
                  value={formData.tokenSymbol}
                  onChange={(e) => handleInputChange('tokenSymbol', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., MEME"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Token Description
              </label>
              <textarea
                value={formData.tokenDescription}
                onChange={(e) => handleInputChange('tokenDescription', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe your NFT token"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                External URL
              </label>
              <input
                type="url"
                value={formData.tokenExternalUrl}
                onChange={(e) => handleInputChange('tokenExternalUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://your-website.com"
              />
            </div>
          </div>

          {/* Attributes */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Attributes</h3>
              <button
                type="button"
                onClick={addAttribute}
                className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
              >
                Add Attribute
              </button>
            </div>

            {formData.tokenAttributes.map((attr, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={attr.trait_type}
                  onChange={(e) => handleAttributeChange(index, 'trait_type', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Trait type (e.g., Rarity)"
                />
                <input
                  type="text"
                  value={attr.value}
                  onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Value (e.g., Legendary)"
                />
                <button
                  type="button"
                  onClick={() => removeAttribute(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Minting...' : 'Mint Slot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 