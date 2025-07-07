import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor';
import { IDL } from '../idl/meme_wall';

// Program ID
const PROGRAM_ID = new PublicKey("3GYFAZwmiaisxDrLuEufKSn7wm56UVsSZSKrJyCXerS9");

export const useAnchorProgram = () => {
  // Prevent SSR hydration errors by only running on client
  const isClient = typeof window !== 'undefined';
  
  const { connection } = useConnection();
  const wallet = useWallet();
  const [provider, setProvider] = useState<AnchorProvider | null>(null);
  const [program, setProgram] = useState<any>(null);

  // Create provider
  useEffect(() => {
    if (!isClient || !wallet || !wallet.publicKey) {
      setProvider(null);
      return;
    }
    
    try {
      const newProvider = new AnchorProvider(connection, wallet as any, {
        commitment: 'confirmed',
      });
      setProvider(newProvider);
    } catch (error) {
      console.error('Error creating Anchor provider:', error);
      setProvider(null);
    }
  }, [isClient, connection, wallet]);

  // Create program
  useEffect(() => {
    if (!isClient || !provider || !IDL) {
      setProgram(null);
      return;
    }
    
    try {
      console.log('Creating Anchor program with IDL:', IDL);
      console.log('Program ID:', PROGRAM_ID.toString());
      console.log('Provider:', provider);
      
      // Check if IDL has required properties
      if (!IDL.instructions || !IDL.accounts) {
        console.error('IDL is missing required properties:', IDL);
        setProgram(null);
        return;
      }
      
      // Create program directly without useMemo
      const newProgram = new (Program as any)(IDL as any, PROGRAM_ID.toString(), provider);
      console.log('✅ Program created successfully:', newProgram);
      setProgram(newProgram);
    } catch (error) {
      console.error('Error creating Anchor program:', error);
      console.error('IDL:', IDL);
      console.error('Program ID:', PROGRAM_ID.toString());
      setProgram(null);
    }
  }, [isClient, provider]);

  return { program, provider };
}; 