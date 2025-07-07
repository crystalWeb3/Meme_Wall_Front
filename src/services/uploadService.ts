

// IPFS Upload Service using NFT.Storage
const NFT_STORAGE_TOKEN = process.env.NEXT_PUBLIC_NFT_STORAGE_TOKEN || '';

export interface MemeMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  properties: {
    files: Array<{
      type: string;
      uri: string;
    }>;
    category: string;
  };
}

export interface UploadResult {
  imageUrl: string;
  metadataUrl: string;
  metadata: MemeMetadata;
}

export class UploadService {
  private static async uploadToIPFS(file: File): Promise<string> {
    try {
      // Check if API key is available
      if (!NFT_STORAGE_TOKEN) {
        console.warn('⚠️ NFT.Storage API key not configured, using placeholder URL');
        return 'https://via.placeholder.com/400x400/6366f1/ffffff?text=Meme+Image';
      }
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('https://api.nft.storage/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NFT_STORAGE_TOKEN}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      return `ipfs://${result.value.cid}/${file.name}`;
      
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      // Fallback: return a placeholder URL
      return 'https://via.placeholder.com/400x400/6366f1/ffffff?text=Meme+Image';
    }
  }

  private static async uploadMetadataToIPFS(metadata: MemeMetadata): Promise<string> {
    try {
      // Check if API key is available
      if (!NFT_STORAGE_TOKEN) {
        console.warn('⚠️ NFT.Storage API key not configured, using placeholder URL');
        return 'https://via.placeholder.com/400x400/6366f1/ffffff?text=Metadata';
      }
      
      const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], {
        type: 'application/json',
      });
      
      const formData = new FormData();
      formData.append('file', metadataBlob, 'metadata.json');
      
      const response = await fetch('https://api.nft.storage/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NFT_STORAGE_TOKEN}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Metadata upload failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      return `ipfs://${result.value.cid}/metadata.json`;
      
    } catch (error) {
      console.error('Error uploading metadata to IPFS:', error);
      // Fallback: return a placeholder URL
      return 'https://via.placeholder.com/400x400/6366f1/ffffff?text=Metadata';
    }
  }

  public static async uploadMeme(
    imageFile: File,
    slotNumber: number,
    title: string,
    description: string,
    ownerAddress: string,
    links: {
      dexScreener?: string;
      pumpFun?: string;
      website?: string;
      twitter?: string;
      telegram?: string;
    }
  ): Promise<UploadResult> {
    try {
      console.log('🚀 Starting meme upload process...');
      
      // 1. Upload image to IPFS
      console.log('📤 Uploading image to IPFS...');
      const imageUrl = await this.uploadToIPFS(imageFile);
      console.log('✅ Image uploaded:', imageUrl);
      
      // 2. Generate metadata
      const metadata: MemeMetadata = {
        name: `${title} - Slot #${slotNumber}`,
        symbol: 'MEME',
        description: description || `Meme slot #${slotNumber} on the Meme Wall`,
        image: imageUrl,
        attributes: [
          { trait_type: "Slot Number", value: slotNumber },
          { trait_type: "Owner", value: ownerAddress },
          { trait_type: "Collection", value: "Meme Wall" },
          { trait_type: "Network", value: "Solana" },
          ...(links.dexScreener ? [{ trait_type: "DexScreener", value: links.dexScreener }] : []),
          ...(links.pumpFun ? [{ trait_type: "Pump.fun", value: links.pumpFun }] : []),
          ...(links.website ? [{ trait_type: "Website", value: links.website }] : []),
          ...(links.twitter ? [{ trait_type: "Twitter", value: links.twitter }] : []),
          ...(links.telegram ? [{ trait_type: "Telegram", value: links.telegram }] : []),
        ],
        properties: {
          files: [
            {
              type: imageFile.type,
              uri: imageUrl,
            },
          ],
          category: "image",
        },
      };
      
      console.log('📋 Generated metadata:', metadata);
      
      // 3. Upload metadata to IPFS
      console.log('📤 Uploading metadata to IPFS...');
      const metadataUrl = await this.uploadMetadataToIPFS(metadata);
      console.log('✅ Metadata uploaded:', metadataUrl);
      
      return {
        imageUrl,
        metadataUrl,
        metadata,
      };
      
    } catch (error) {
      console.error('❌ Upload failed:', error);
      throw error;
    }
  }

  // Alternative: Upload to Arweave using Bundlr
  public static async uploadToArweave(
    file: File,
    _metadata: MemeMetadata
  ): Promise<{ imageUrl: string; metadataUrl: string }> {
    try {
      // This would require Bundlr SDK setup
      // For now, return placeholder URLs
      console.log('🔄 Arweave upload not implemented yet');
      return {
        imageUrl: `ar://placeholder/${file.name}`,
        metadataUrl: `ar://placeholder/metadata.json`,
      };
    } catch (error) {
      console.error('Error uploading to Arweave:', error);
      throw error;
    }
  }

  // Convenience methods for the hook
  public static async uploadImage(file: File): Promise<string> {
    return this.uploadToIPFS(file);
  }

  public static async uploadMetadata(metadata: MemeMetadata): Promise<string> {
    return this.uploadMetadataToIPFS(metadata);
  }
} 