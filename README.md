# Meme Wall Frontend

A React frontend for minting meme NFTs on the Solana blockchain.

## Features

- 🎨 **Real NFT Minting**: Mint actual NFTs using Metaplex
- 📤 **IPFS Upload**: Upload images and metadata to IPFS via NFT.Storage
- 🔗 **Smart Contract Integration**: Full integration with Solana smart contract
- 🎯 **Whitelist Support**: Whitelist and public minting phases
- 📱 **Modern UI**: Beautiful, responsive interface

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the frontend directory:

```env
# NFT.Storage API Key for IPFS uploads
# Get your free API key from https://nft.storage/
NEXT_PUBLIC_NFT_STORAGE_API_KEY=your_nft_storage_api_key_here
```

### 3. Get NFT.Storage API Key

1. Go to [NFT.Storage](https://nft.storage/)
2. Sign up for a free account
3. Create an API key
4. Add it to your `.env.local` file

### 4. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## How It Works

### Minting Flow

1. **Image Upload**: User selects an image file
2. **IPFS Upload**: Image is uploaded to IPFS via NFT.Storage
3. **Metadata Creation**: NFT metadata is generated with all form data
4. **Metadata Upload**: Metadata JSON is uploaded to IPFS
5. **NFT Minting**: Metaplex mints the actual NFT on Solana
6. **Slot Registration**: Smart contract registers the slot with NFT info

### Smart Contract Integration

- Fetches real slot data from the blockchain
- Supports whitelist and public minting phases
- Validates wallet permissions
- Updates slot ownership and metadata

### NFT Features

- **Metadata**: Complete NFT metadata with attributes
- **Royalties**: 5% creator royalties
- **Immutable**: NFTs are immutable once minted
- **Explorer Links**: Direct links to Solana Explorer

## File Structure

```
src/
├── components/
│   ├── MemeWall.tsx          # Main meme wall display
│   └── MintingForm.tsx       # NFT minting form
├── hooks/
│   ├── useAnchorProgram.ts   # Anchor program connection
│   └── useMemeWall.ts        # Main meme wall logic
├── services/
│   ├── uploadService.ts      # IPFS upload service
│   └── nftService.ts         # Metaplex NFT minting
└── utils/
    └── constants.ts          # Program IDs and constants
```

## Troubleshooting

### NFT.Storage API Key Missing

If you don't have an NFT.Storage API key, the app will use placeholder images. To get real IPFS uploads:

1. Sign up at [NFT.Storage](https://nft.storage/)
2. Create an API key
3. Add it to `.env.local`

### Wallet Connection Issues

- Make sure you have a Solana wallet extension installed (Phantom, Solflare, etc.)
- Ensure you're connected to Devnet
- Check that your wallet has SOL for transaction fees

### Minting Failures

- Verify the smart contract is deployed and initialized
- Check that you're in the correct minting phase (Whitelist/Public)
- Ensure your wallet has sufficient SOL for fees
- Check browser console for detailed error messages

## Development

### Adding New Features

1. **New NFT Attributes**: Modify the `MemeMetadata` interface in `uploadService.ts`
2. **Custom Upload Service**: Extend the `UploadService` class
3. **Additional Minting Options**: Update the `NFTService` class

### Testing

- Test with small images first
- Use Devnet for all testing
- Monitor transaction logs in browser console
- Verify NFTs appear in your wallet

## Production Deployment

For production deployment:

1. Update program IDs to mainnet
2. Configure production IPFS gateway
3. Set up proper error monitoring
4. Add rate limiting and security measures
5. Configure proper CORS settings
