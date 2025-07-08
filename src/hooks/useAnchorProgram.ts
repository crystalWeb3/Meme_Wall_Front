import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import IDL from '../idl/meme_wall.json'; // Import JSON IDL directly

export const useAnchorProgram = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const provider = useMemo(() => {
    if (!wallet.publicKey) return null;
    return new AnchorProvider(connection, wallet as any, { commitment: 'confirmed' });
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;

    console.log('Creating Anchor program with IDL:', IDL);
    console.log('IDL accounts:', IDL.accounts);
    console.log('IDL instructions:', IDL.instructions?.map(i => i.name));
    
    // Check if Slot account exists in IDL
    const hasSlotAccount = IDL.accounts?.some(acc => acc.name === 'Slot');
    console.log('Has Slot account in IDL:', hasSlotAccount);
    
    // Check if migrate_slots instruction exists
    const hasMigrateSlots = IDL.instructions?.some(inst => inst.name === 'migrate_slots');
    console.log('Has migrate_slots instruction in IDL:', hasMigrateSlots);
    
    console.log('Provider:', provider);

    try {
      const prog = new Program(IDL, provider);
      console.log('✅ Program created:', prog);
      
      // Test if Slot account is accessible
      if ((prog.account as any).Slot) {
        console.log('✅ Slot account is accessible in program');
        console.log('Available accounts:', Object.keys(prog.account));
      } else {
        console.log('❌ Slot account is NOT accessible in program');
        console.log('Available accounts:', Object.keys(prog.account));
        
        // Try to access it differently
        try {
          const slotAccount = (prog.account as Record<string, any>)['Slot'];
          console.log('Slot account via bracket notation:', slotAccount);
        } catch {
          console.log('Slot account not accessible via bracket notation either');
        }
      }
      
      return prog;
    } catch (err) {
      console.error('❌ Anchor Program creation error:', err);
      return null;
    }
  }, [provider]);

  return { program, provider };
};
