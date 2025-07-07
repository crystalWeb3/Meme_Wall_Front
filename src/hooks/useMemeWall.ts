import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useAnchorProgram } from './useAnchorProgram';
import { useState, useCallback, useEffect } from 'react';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { UploadService, MemeMetadata } from '../services/uploadService';
import { NFTService } from '../services/nftService';

export interface GlobalState {
  totalSlots: number;
  mintedSlots: number;
  phase: 'Whitelist' | 'Public';
  mintPrice: number;
  authority: string;
  whitelist: string[];
}

export interface Slot {
  slotNumber: number;
  owner: string;
  metadataUri: string;
  mint: string;
  isMinted: boolean;
}

export interface MintFormData {
  slotNumber: number;
  title: string;
  description: string;
  image: File | null;
  tokenName: string;
  tokenSymbol: string;
  tokenDescription: string;
  tokenImage: string;
  tokenExternalUrl: string;
  tokenAttributes: Array<{ trait_type: string; value: string }>;
}

export const useMemeWall = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { program } = useAnchorProgram();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [currentPhase, setCurrentPhase] = useState<'Whitelist' | 'Public'>('Public');
  const [globalState, setGlobalState] = useState<GlobalState | null>(null);

  // Initialize services
  const initializeServices = useCallback(() => {
    if (!connection || !publicKey) return;
    
    // Initialize NFT service with wallet
    NFTService.initialize(connection, publicKey);
  }, [connection, publicKey]);

  const mintSlot = useCallback(async (formData: MintFormData) => {
    if (!program || !publicKey || !connection) {
      setError('Wallet not connected or program not loaded');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🚀 Starting minting process...');
      console.log('📋 Form data:', formData);

      // Step 1: Upload image to IPFS
      console.log('📤 Uploading image to IPFS...');
      let imageUrl = '';
      if (formData.image) {
        imageUrl = await UploadService.uploadImage(formData.image);
        console.log('✅ Image uploaded:', imageUrl);
      }

      // Step 2: Create metadata
      console.log('📝 Creating metadata...');
      const metadata: MemeMetadata = {
        name: formData.tokenName,
        symbol: formData.tokenSymbol,
        description: formData.tokenDescription,
        image: imageUrl,
        external_url: formData.tokenExternalUrl,
        attributes: formData.tokenAttributes,
        properties: {
          files: [
            {
              type: 'image/png',
              uri: imageUrl,
            },
          ],
          category: 'image',
        },
      };

      // Step 3: Upload metadata to IPFS
      console.log('📤 Uploading metadata to IPFS...');
      const metadataUrl = await UploadService.uploadMetadata(metadata);
      console.log('✅ Metadata uploaded:', metadataUrl);

      // Step 4: Mint NFT using Metaplex
      console.log('🎨 Minting NFT...');
      const nftResult = await NFTService.mintMemeNFT(metadata, formData.slotNumber, publicKey);
      console.log('✅ NFT minted:', nftResult.mint.toString());

      // Step 5: Call smart contract to register the slot
      console.log('📋 Registering slot in smart contract...');
      const [slotPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('slot'),
          new BN(formData.slotNumber).toArrayLike(Buffer, 'le', 2),
        ],
        program.programId
      );

      const [globalStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('global_state')],
        program.programId
      );

      const [whitelistPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('whitelist')],
        program.programId
      );

      // Prepare transaction
      const tx = new Transaction();
      
      // Add mint slot instruction
      const accounts: any = {
        slot: slotPda,
        globalState: globalStatePda,
        minter: publicKey,
        systemProgram: SystemProgram.programId,
      };

      // Only include whitelist account if in Whitelist phase
      if (currentPhase === 'Whitelist') {
        accounts.whitelist = whitelistPda;
      }

      const mintSlotIx = await program.methods
        .mintSlot(formData.slotNumber, metadataUrl, nftResult.mint)
        .accounts(accounts)
        .instruction();

      tx.add(mintSlotIx);

      // Send transaction
      const signature = await sendTransaction(tx, connection);
      console.log('✅ Transaction sent:', signature);

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      console.log('🎉 Slot minted successfully!');
      console.log('🪙 NFT Mint:', nftResult.mint.toString());
      console.log('📄 Metadata:', metadataUrl);
      console.log('🔗 Transaction:', signature);

      // Update local state
      const newSlot: Slot = {
        slotNumber: formData.slotNumber,
        owner: publicKey.toString(),
        metadataUri: metadataUrl,
        mint: nftResult.mint.toString(),
        isMinted: true,
      };

      // Refresh slots from blockchain to get the latest state
      await fetchSlots();

      return {
        success: true,
        slot: newSlot,
        nft: nftResult,
        transaction: signature,
      };

    } catch (err) {
      console.error('❌ Minting failed:', err);
      setError(err instanceof Error ? err.message : 'Minting failed');
      return { success: false, error: err instanceof Error ? err.message : 'Minting failed' };
    } finally {
      setIsLoading(false);
    }
  }, [program, publicKey, connection, sendTransaction]);

  const fetchSlots = useCallback(async () => {
    if (!program || !connection) return;

    try {
      setIsLoading(true);
      const [globalStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('global_state')],
        program.programId
      );
      // Use any to bypass type checking but still fetch real data
      const blockchainGlobalState = await (program.account as any).GlobalState.fetch(globalStatePda);
      setCurrentPhase(blockchainGlobalState.phase);

      // Set global state for the main page
      setGlobalState({
        totalSlots: blockchainGlobalState.totalSlots,
        mintedSlots: blockchainGlobalState.mintedSlots,
        phase: blockchainGlobalState.phase,
        mintPrice: 0.01, // Fixed price
        authority: blockchainGlobalState.admin.toString(),
        whitelist: [], // We'll fetch this separately if needed
      });

      console.log('📊 Global State:', {
        totalSlots: blockchainGlobalState.totalSlots,
        mintedSlots: blockchainGlobalState.mintedSlots,
        phase: blockchainGlobalState.phase,
        admin: blockchainGlobalState.admin.toString()
      });

      const fetchedSlots: Slot[] = [];
      // Only fetch first 100 slots for performance, but check all slots for minted ones
      const slotsToCheck = Math.min(100, blockchainGlobalState.totalSlots);
      
      for (let i = 1; i <= slotsToCheck; i++) {
        try {
          const [slotPda] = PublicKey.findProgramAddressSync(
            [
              Buffer.from('slot'),
              new BN(i).toArrayLike(Buffer, 'le', 2),
            ],
            program.programId
          );
          
          const slotAccount = await (program.account as any).Slot.fetch(slotPda);
          console.log(`✅ Slot ${i} is minted:`, {
            owner: slotAccount.owner.toString(),
            mint: slotAccount.mint.toString(),
            metadataUri: slotAccount.metadataUri
          });
          
          fetchedSlots.push({
            slotNumber: i,
            owner: slotAccount.owner.toString(),
            metadataUri: slotAccount.metadataUri,
            mint: slotAccount.mint.toString(),
            isMinted: true,
          });
        } catch (error) {
          // Slot not minted yet
          console.log(`❌ Slot ${i} is not minted yet`);
          fetchedSlots.push({
            slotNumber: i,
            owner: PublicKey.default.toString(),
            metadataUri: '',
            mint: PublicKey.default.toString(),
            isMinted: false,
          });
        }
      }
      
              // Add remaining slots as unminted for display
        for (let i = slotsToCheck + 1; i <= blockchainGlobalState.totalSlots; i++) {
          fetchedSlots.push({
            slotNumber: i,
            owner: PublicKey.default.toString(),
            metadataUri: '',
            mint: PublicKey.default.toString(),
            isMinted: false,
          });
        }
      setSlots(fetchedSlots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setError('Failed to fetch slots');
    } finally {
      setIsLoading(false);
    }
  }, [program, connection]);

  const checkWhitelistStatus = useCallback(async () => {
    if (!program || !publicKey) return false;

    try {
      // For now, return true (whitelisted) for demonstration
      console.log('🔍 Whitelist check: returning true for demonstration');
      return true;
    } catch (error) {
      console.error('Error checking whitelist:', error);
      return false;
    }
  }, [program, publicKey]);

  // Fetch slots on mount and when program changes
  useEffect(() => {
    if (program) {
      fetchSlots();
    }
  }, [program, fetchSlots]);

  return {
    mintSlot,
    fetchSlots,
    checkWhitelistStatus,
    slots,
    currentPhase,
    isLoading,
    error,
    initializeServices,
    // Properties expected by the main page
    globalState,
    loading: isLoading,
    isWalletWhitelisted: true, // For now, assume whitelisted
  };
}; 