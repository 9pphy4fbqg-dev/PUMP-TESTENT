'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useState, useCallback } from 'react'
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js'
import dynamic from 'next/dynamic'

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
)

export default function Header() {
  const { publicKey, connected } = useWallet()
  const [balance, setBalance] = useState<number>(0)

  const fetchBalance = useCallback(async () => {
    if (publicKey) {
      try {
        const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8899')
        const bal = await connection.getBalance(publicKey)
        setBalance(bal / LAMPORTS_PER_SOL)
      } catch (error) {
        console.error('Failed to fetch balance:', error)
      }
    }
  }, [publicKey])

  useEffect(() => {
    fetchBalance()
    const interval = setInterval(fetchBalance, 5000)
    return () => clearInterval(interval)
  }, [fetchBalance])

  useEffect(() => {
    const handleRefresh = () => fetchBalance()
    window.addEventListener('refreshBalance', handleRefresh)
    return () => window.removeEventListener('refreshBalance', handleRefresh)
  }, [fetchBalance])

  return (
    <header className="bg-pump-card border-b border-pump-border sticky top-0 z-50">
      <div className="container mx-auto px-2 py-2 md:px-4 md:py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <h1 className="text-lg md:text-2xl font-bold text-pump-green">Pump测试网</h1>
          <span className="text-xs md:text-sm text-gray-400 hidden sm:inline">本地测试环境</span>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          {connected && publicKey && (
            <div className="bg-pump-bg px-2 py-1 md:px-4 md:py-2 rounded-lg border border-pump-border">
              <div className="text-xs text-gray-400">余额</div>
              <div className="text-sm md:text-lg font-bold text-pump-green">{balance.toFixed(4)} SOL</div>
            </div>
          )}
          <WalletMultiButtonDynamic className="!bg-pump-green !text-black !font-bold !rounded-lg !py-2 !px-2 md:!px-4 !text-sm md:!text-base" />
        </div>
      </div>
    </header>
  )
}
