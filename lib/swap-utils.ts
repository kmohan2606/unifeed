export const CHAINS = [
  { id: 1, name: "Ethereum" },
  { id: 8453, name: "Base" },
  { id: 137, name: "Polygon" },
  { id: 42161, name: "Arbitrum One" },
] as const;

export const NATIVE_TOKEN_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

export const TOKENS_BY_CHAIN: Record<number, { address: string; symbol: string; isNative?: boolean }[]> = {
  1: [
    { address: NATIVE_TOKEN_ADDRESS, symbol: "ETH", isNative: true },
    { address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", symbol: "USDC" },
    { address: "0xdac17f958d2ee523a2206206994597c13d831ec7", symbol: "USDT" },
  ],
  8453: [
    { address: NATIVE_TOKEN_ADDRESS, symbol: "ETH", isNative: true },
    { address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", symbol: "USDC" },
  ],
  137: [
    { address: NATIVE_TOKEN_ADDRESS, symbol: "POL", isNative: true },
    { address: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359", symbol: "USDC" },
  ],
  42161: [
    { address: NATIVE_TOKEN_ADDRESS, symbol: "ETH", isNative: true },
    { address: "0xaf88d065e77c8cc2239327c5edb3a432268e5831", symbol: "USDC" },
  ],
};
