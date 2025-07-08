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
  phase: { whitelist?: object } | { public?: object };
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
  const [currentPhase, setCurrentPhase] = useState<'Whitelist' | 'Public'>('Whitelist');
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
      console.log('🏗️  Program ID:', program.programId.toString());
      
      // Refresh phase from blockchain to ensure we have the latest
      console.log('🔄 Refreshing phase from blockchain...');
      const [globalStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('global-state')],
        program.programId
      );
      
      try {
        const latestGlobalState = await (program.account as Record<string, any>).globalState.fetch(globalStatePda);
        console.log('🔍 Latest phase object:', latestGlobalState.phase);
        
        let latestPhase: 'Whitelist' | 'Public' = 'Whitelist';
        if (latestGlobalState.phase) {
          if (latestGlobalState.phase.public !== undefined) {
            latestPhase = 'Public';
          } else if (latestGlobalState.phase.whitelist !== undefined) {
            latestPhase = 'Whitelist';
          }
        }
        console.log('📋 Latest phase from blockchain:', latestPhase);
        setCurrentPhase(latestPhase);
      } catch {
        console.log('⚠️ Could not refresh phase, using current:', currentPhase);
      }
      
      const [slotPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('slot'),
          new BN(formData.slotNumber).toArrayLike(Buffer, 'le', 2),
        ],
        program.programId
      );

      const [whitelistPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('whitelist')],
        program.programId
      );
      
      console.log('📍 PDAs:');
      console.log('  🎯 Slot PDA:', slotPda.toString());
      console.log('  🌐 Global State PDA:', globalStatePda.toString());
      console.log('  📋 Whitelist PDA:', whitelistPda.toString());
      console.log('🔗 Solana Explorer Links:');
      console.log('  🎯 Slot Account:', `https://explorer.solana.com/address/${slotPda.toString()}?cluster=devnet`);
      console.log('  🌐 Global State:', `https://explorer.solana.com/address/${globalStatePda.toString()}?cluster=devnet`);
      console.log('  📋 Whitelist:', `https://explorer.solana.com/address/${whitelistPda.toString()}?cluster=devnet`);

      // Prepare transaction
      const tx = new Transaction();
      
      // Get recent blockhash (required for transaction)
      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;
      
      // Fetch the current admin from global state
      let currentAdmin: PublicKey;
      try {
        const globalStateAccount = await (program.account as Record<string, any>).globalState.fetch(globalStatePda);
        currentAdmin = globalStateAccount.admin;
        console.log('✅ Admin fetched from blockchain:', currentAdmin.toString());
      } catch {
        console.error('❌ Failed to fetch admin from global state');
        throw new Error('Failed to fetch admin address from blockchain');
      }

      // Add mint slot instruction
      const accounts: any = {
        slot: slotPda,
        globalState: globalStatePda,
        payer: publicKey, // Changed from 'minter' to 'payer'
        admin: currentAdmin, // Admin from on-chain global state
        systemProgram: SystemProgram.programId,
      };

      // Only include whitelist account if in Whitelist phase
      if (currentPhase === 'Whitelist') {
        accounts.whitelist = whitelistPda;
      }

      console.log('📋 Transaction accounts:', accounts);
      console.log('🔑 Admin account:', accounts.admin.toString());
      console.log('👛 Payer account:', accounts.payer.toString());
      console.log('🎯 Current phase:', currentPhase);
      console.log('🪙 NFT Mint address:', nftResult.mint.toString());
      console.log('📄 Metadata URL:', metadataUrl);
      console.log('🔢 Slot number:', formData.slotNumber);

      const mintSlotIx = await program.methods
        .mintSlot(formData.slotNumber, metadataUrl, nftResult.mint)
        .accounts(accounts)
        .instruction();
        
      console.log('✅ Instruction created successfully');

      tx.add(mintSlotIx);
      
      console.log('📦 Transaction built with instruction');
      console.log('🔍 Transaction details:', {
        instructions: tx.instructions.length,
        signers: tx.signatures.length,
        recentBlockhash: tx.recentBlockhash ? 'Set' : 'Not set'
      });

      // Send transaction
      console.log('🚀 Sending transaction...');
      const signature = await sendTransaction(tx, connection);
      console.log('✅ Transaction sent:', signature);
      console.log('🔗 Transaction Explorer:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`);

      // Wait for confirmation
      console.log('⏳ Waiting for transaction confirmation...');
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      console.log('🎉 Slot minted successfully!');
      console.log('🪙 NFT Mint:', nftResult.mint.toString());
      console.log('📄 Metadata:', metadataUrl);
      console.log('🔗 Transaction:', signature);
      console.log('🔗 Final Links:');
      console.log('  🎯 Slot Account:', `https://explorer.solana.com/address/${slotPda.toString()}?cluster=devnet`);
      console.log('  🪙 NFT Mint:', `https://explorer.solana.com/address/${nftResult.mint.toString()}?cluster=devnet`);
      console.log('  📄 Transaction:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
      console.log('  🖼️  Image Gateway:', metadataUrl.replace('ipfs://', 'https://ipfs.io/ipfs/'));
      console.log('  📋 Metadata Gateway:', metadataUrl.replace('ipfs://', 'https://ipfs.io/ipfs/'));

      // Update local state immediately for better UX
      const newSlot: Slot = {
        slotNumber: formData.slotNumber,
        owner: publicKey.toString(),
        metadataUri: metadataUrl,
        mint: nftResult.mint.toString(),
        isMinted: true,
      };

      // Update local slots state immediately
      setSlots(prevSlots => {
        const updatedSlots = [...prevSlots];
        const slotIndex = formData.slotNumber - 1; // Convert to 0-based index
        if (slotIndex >= 0 && slotIndex < updatedSlots.length) {
          updatedSlots[slotIndex] = newSlot;
        }
        return updatedSlots;
      });

      // Also refresh from blockchain to ensure consistency
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
        [Buffer.from('global-state')],
        program.programId
      );
      
      // Use any to bypass type checking but still fetch real data
      let blockchainGlobalState;
      try {
        blockchainGlobalState = await (program.account as Record<string, any>).globalState.fetch(globalStatePda);
        console.log('✅ Global state fetched:', blockchainGlobalState);
        console.log('🔍 Phase object:', blockchainGlobalState.phase);
        console.log('🔍 Phase object keys:', Object.keys(blockchainGlobalState.phase || {}));
        console.log('🔍 Phase object values:', Object.values(blockchainGlobalState.phase || {}));
        
        // Convert phase object to string - check both properties
        let phaseString: 'Whitelist' | 'Public' = 'Whitelist'; // default
        if (blockchainGlobalState.phase) {
          if (blockchainGlobalState.phase.public !== undefined) {
            phaseString = 'Public';
            console.log('✅ Detected Public phase');
          } else if (blockchainGlobalState.phase.whitelist !== undefined) {
            phaseString = 'Whitelist';
            console.log('✅ Detected Whitelist phase');
          } else {
            console.log('⚠️ Unknown phase structure:', blockchainGlobalState.phase);
          }
        }
        console.log('📋 Final detected phase:', phaseString);
        setCurrentPhase(phaseString);
      } catch {
        console.log('⚠️ Global state not initialized yet, using default values');
        // Use default values if global state is not initialized
        blockchainGlobalState = {
          totalSlots: 10000,
          mintedSlots: 0,
          phase: { whitelist: {} },
          admin: PublicKey.default,
          mintedSlotsArray: [],
        };
        setCurrentPhase('Whitelist');
      }

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
        admin: blockchainGlobalState.admin.toString(),
        mintedSlotsArray: blockchainGlobalState.mintedSlotsArray || []
      });

      const fetchedSlots: Slot[] = [];
      const mintedSlotsSet = new Set(blockchainGlobalState.mintedSlotsArray || []);
      
      // Create a map of minted slots for efficient lookup
      const mintedSlotsMap = new Map<number, any>();
      
      // Fetch only the minted slots (much more efficient!)
      for (const slotNumber of mintedSlotsSet) {
        try {
          const [slotPda] = PublicKey.findProgramAddressSync(
            [
              Buffer.from('slot'),
              new BN(Number(slotNumber)).toArrayLike(Buffer, 'le', 2),
            ],
            program.programId
          );
          
          // Try to fetch the slot account with proper error handling
          let slotAccount;
          
          // Debug: Log available accounts
          console.log('🔍 Available program accounts:', Object.keys(program.account));
          
          try {
            // Try different ways to access the Slot account
            if ((program.account as any).Slot) {
              slotAccount = await (program.account as any).Slot.fetch(slotPda);
            } else if ((program.account as any)['Slot']) {
              slotAccount = await (program.account as any)['Slot'].fetch(slotPda);
            } else if ((program.account as any).slot) {
              slotAccount = await (program.account as any).slot.fetch(slotPda);
            } else {
              console.log('⚠️ Slot account not accessible via program.account, trying raw account data...');
              // Fallback: try to get account data directly
              const accountInfo = await connection.getAccountInfo(slotPda);
              if (accountInfo && accountInfo.data.length > 8) {
                // Parse the account data manually
                let offset = 8; // Skip discriminator
                const slotNumberData = accountInfo.data.readUInt16LE(offset);
                offset += 2;
                const owner = new PublicKey(accountInfo.data.slice(offset, offset + 32));
                offset += 32;
                const mint = new PublicKey(accountInfo.data.slice(offset, offset + 32));
                offset += 32;
                
                // Parse the metadata URI (string)
                let metadataUri = '';
                if (offset < accountInfo.data.length) {
                  try {
                    // Read string length (4 bytes for u32)
                    const stringLength = accountInfo.data.readUInt32LE(offset);
                    offset += 4;
                    
                    // Read the string data
                    if (offset + stringLength <= accountInfo.data.length) {
                      const stringData = accountInfo.data.slice(offset, offset + stringLength);
                      metadataUri = stringData.toString('utf8');
                    }
                  } catch (stringError) {
                    console.log(`Could not parse metadata URI for slot ${slotNumber}:`, stringError);
                    metadataUri = 'Unknown';
                  }
                }
                
                const bump = offset < accountInfo.data.length ? accountInfo.data.readUInt8(offset) : 0;
                
                slotAccount = {
                  slotNumber: slotNumberData,
                  owner,
                  mint,
                  metadataUri,
                  bump
                };
              } else {
                throw new Error('Slot account not accessible in program and no raw data available');
              }
            }
          } catch (slotError) {
            console.error(`❌ Failed to fetch slot ${slotNumber} account:`, slotError);
            // If Slot account is not available, try to get basic info from the account data
            const slotInfo = await connection.getAccountInfo(slotPda);
            if (slotInfo && slotInfo.data.length > 8) {
              // Parse basic slot data manually
              let offset = 8; // Skip discriminator
              const slotNumberData = slotInfo.data.readUInt16LE(offset);
              offset += 2;
              const owner = new PublicKey(slotInfo.data.slice(offset, offset + 32));
              offset += 32;
              const mint = new PublicKey(slotInfo.data.slice(offset, offset + 32));
              offset += 32;
              
              // Parse the metadata URI (string)
              let metadataUri = '';
              if (offset < slotInfo.data.length) {
                try {
                  // Read string length (4 bytes for u32)
                  const stringLength = slotInfo.data.readUInt32LE(offset);
                  offset += 4;
                  
                  // Read the string data
                  if (offset + stringLength <= slotInfo.data.length) {
                    const stringData = slotInfo.data.slice(offset, offset + stringLength);
                    metadataUri = stringData.toString('utf8');
                  }
                } catch (stringError) {
                  console.log(`Could not parse metadata URI for slot ${slotNumber}:`, stringError);
                  metadataUri = 'Unknown';
                }
              }
              
              const bump = offset < slotInfo.data.length ? slotInfo.data.readUInt8(offset) : 0;
              
              slotAccount = {
                slotNumber: slotNumberData,
                owner,
                mint,
                metadataUri,
                bump
              };
            } else {
              throw slotError;
            }
          }
          console.log(`✅ Slot ${slotNumber} is minted:`, {
            owner: slotAccount.owner.toString(),
            mint: slotAccount.mint.toString(),
            metadataUri: slotAccount.metadataUri
          });
          
          mintedSlotsMap.set(Number(slotNumber), {
            slotNumber: Number(slotNumber),
            owner: slotAccount.owner.toString(),
            metadataUri: slotAccount.metadataUri,
            mint: slotAccount.mint.toString(),
            isMinted: true,
          });
        } catch (error) {
          console.error(`❌ Failed to fetch slot ${slotNumber}:`, error);
        }
      }

      // Build the complete slots array
      const slotsToDisplay = Math.min(100, blockchainGlobalState.totalSlots);
      
      for (let i = 1; i <= slotsToDisplay; i++) {
        if (mintedSlotsMap.has(i)) {
          // Slot is minted
          fetchedSlots.push(mintedSlotsMap.get(i));
        } else {
          // Slot is not minted
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
      for (let i = slotsToDisplay + 1; i <= blockchainGlobalState.totalSlots; i++) {
        fetchedSlots.push({
          slotNumber: i,
          owner: PublicKey.default.toString(),
          metadataUri: '',
          mint: PublicKey.default.toString(),
          isMinted: false,
        });
      }
      
      setSlots(fetchedSlots);
          } catch {
        console.error('Error fetching slots');
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
    } catch {
      console.error('Error checking whitelist');
      return false;
    }
  }, [program, publicKey]);

  // Fetch slots on mount and when program changes
  useEffect(() => {
    if (program) {
      fetchSlots();
    }
  }, [program, fetchSlots]);

  // Helper function to get all minted slots efficiently
  const getMintedSlots = useCallback(async () => {
    if (!program || !connection) return [];

    try {
      const [globalStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('global-state')],
        program.programId
      );
      
              const blockchainGlobalState = await (program.account as Record<string, any>).globalState.fetch(globalStatePda);
      return blockchainGlobalState.mintedSlotsArray || [];
    } catch {
      console.error('Error fetching minted slots');
      return [];
    }
  }, [program, connection]);

  return {
    mintSlot,
    fetchSlots,
    checkWhitelistStatus,
    getMintedSlots,
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