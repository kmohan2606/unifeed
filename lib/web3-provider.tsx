"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider, http } from "wagmi"
import { mainnet, polygon, base, arbitrum } from "wagmi/chains"
import { getDefaultConfig, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit"
import "@rainbow-me/rainbowkit/styles.css"

const config = getDefaultConfig({
  appName: "UniFeed",
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "4a8c1db02e4c80d8ac679ca26d6fa0ed",
  chains: [mainnet, polygon, base, arbitrum],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
  },
})

const queryClient = new QueryClient()

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({ accentColor: "#7c3aed", borderRadius: "medium" })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
