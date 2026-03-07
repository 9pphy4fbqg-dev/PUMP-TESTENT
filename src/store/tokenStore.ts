import { create } from 'zustand'

export interface TokenInfo {
  mint: string
  name: string
  symbol: string
  uri: string
  bondingCurve: string
  creator: string
  virtualTokenReserves: bigint
  virtualSolReserves: bigint
  realTokenReserves: bigint
  realSolReserves: bigint
  tokenTotalSupply: bigint
  complete: boolean
  price: number
  marketCapSol: number
  progress: number
  isMigrated: boolean
}

export interface TradeInfo {
  signature: string
  type: 'buy' | 'sell'
  mint: string
  user: string
  solAmount: bigint
  tokenAmount: bigint
  price: number
  timestamp: number
  virtualSolReserves: bigint
  virtualTokenReserves: bigint
}

interface TokenStore {
  selectedToken: TokenInfo | null
  setSelectedToken: (token: TokenInfo | null) => void
  tokens: TokenInfo[]
  setTokens: (tokens: TokenInfo[]) => void
  addToken: (token: TokenInfo) => void
  updateToken: (mint: string, updates: Partial<TokenInfo>) => void
  trades: TradeInfo[]
  setTrades: (trades: TradeInfo[]) => void
  addTrade: (trade: TradeInfo) => void
}

export const useTokenStore = create<TokenStore>((set) => ({
  selectedToken: null,
  setSelectedToken: (token) => set({ selectedToken: token }),
  tokens: [],
  setTokens: (tokens) => set({ tokens }),
  addToken: (token) => set((state) => ({ 
    tokens: [token, ...state.tokens.filter(t => t.mint !== token.mint)] 
  })),
  updateToken: (mint, updates) => set((state) => ({
    tokens: state.tokens.map(t => t.mint === mint ? { ...t, ...updates } : t),
    selectedToken: state.selectedToken?.mint === mint 
      ? { ...state.selectedToken, ...updates } 
      : state.selectedToken
  })),
  trades: [],
  setTrades: (trades) => set({ trades }),
  addTrade: (trade) => set((state) => ({ 
    trades: [trade, ...state.trades.slice(0, 99)] 
  })),
}))

export const PUMP_PROGRAM_ID = '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P'
export const PUMP_AMM_PROGRAM_ID = 'pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA'
export const GLOBAL_ACCOUNT = '4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf'
export const EVENT_AUTHORITY = 'Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1'
export const FEE_RECIPIENT = 'CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM'

export const INITIAL_VIRTUAL_TOKEN_RESERVES = BigInt('1073000000000000')
export const INITIAL_VIRTUAL_SOL_RESERVES = BigInt('30000000000')
export const INITIAL_REAL_TOKEN_RESERVES = BigInt('793000000000000')
export const TOKEN_TOTAL_SUPPLY = BigInt('1000000000000000')
export const MIGRATION_THRESHOLD = BigInt('69000000000000')

export function calculatePrice(
  virtualSolReserves: bigint,
  virtualTokenReserves: bigint
): number {
  if (virtualTokenReserves === BigInt(0)) return 0
  return Number(virtualSolReserves) / Number(virtualTokenReserves)
}

export function calculateMarketCapSol(
  virtualSolReserves: bigint,
  virtualTokenReserves: bigint,
  tokenTotalSupply: bigint
): number {
  const price = calculatePrice(virtualSolReserves, virtualTokenReserves)
  return price * Number(tokenTotalSupply) / 1e9
}

export function calculateProgress(realSolReserves: bigint): number {
  const progress = (Number(realSolReserves) / Number(MIGRATION_THRESHOLD)) * 100
  return Math.min(progress, 100)
}
