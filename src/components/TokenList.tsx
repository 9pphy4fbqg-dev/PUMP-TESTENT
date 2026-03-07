'use client'

import { useTokenStore, TokenInfo } from '@/store/tokenStore'
import { useState, useEffect, useCallback } from 'react'
import { Connection } from '@solana/web3.js'
import { fetchAllBondingCurves, fetchTokenMetadata } from '@/utils/pump'

export default function TokenList() {
  const { selectedToken, setSelectedToken, tokens, setTokens } = useTokenStore()
  const [loading, setLoading] = useState(false)

  const loadTokens = useCallback(async () => {
    setLoading(true)
    try {
      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8899'
      const connection = new Connection(rpcUrl, 'confirmed')
      
      const fetchedTokens = await fetchAllBondingCurves(connection)
      
      for (const token of fetchedTokens) {
        try {
          const metadata = await fetchTokenMetadata(connection, new Connection(rpcUrl).rpcEndpoint as any)
          if (metadata) {
            token.name = metadata.name
            token.symbol = metadata.symbol
            token.uri = metadata.uri
          }
        } catch (e) {
          // ignore metadata errors
        }
      }
      
      setTokens(fetchedTokens)
    } catch (error) {
      console.error('加载代币列表失败:', error)
    } finally {
      setLoading(false)
    }
  }, [setTokens])

  useEffect(() => {
    loadTokens()
    const interval = setInterval(loadTokens, 10000)
    return () => clearInterval(interval)
  }, [loadTokens])

  return (
    <div className="card h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">代币列表</h2>
        <button
          onClick={loadTokens}
          disabled={loading}
          className="text-sm text-pump-green hover:underline"
        >
          {loading ? '加载中...' : '刷新'}
        </button>
      </div>
      
      <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
        {tokens.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            暂无代币<br/>
            <span className="text-sm">等待发币通部署代币</span>
          </div>
        ) : (
          tokens.map((token) => (
            <div
              key={token.mint}
              onClick={() => setSelectedToken(token)}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                selectedToken?.mint === token.mint
                  ? 'bg-pump-green/10 border border-pump-green'
                  : 'bg-pump-bg border border-pump-border hover:border-pump-green/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white truncate">{token.symbol}</div>
                  <div className="text-xs text-gray-400 truncate">{token.name}</div>
                </div>
                <div className="text-right ml-2">
                  <div className="text-sm text-pump-green">
                    {token.isMigrated ? 'AMM' : `${token.progress.toFixed(1)}%`}
                  </div>
                  <div className="text-xs text-gray-400">
                    {token.marketCapSol.toFixed(2)} SOL
                  </div>
                </div>
              </div>
              
              {!token.isMigrated && (
                <div className="mt-2 h-1 bg-pump-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-pump-green transition-all"
                    style={{ width: `${Math.min(token.progress, 100)}%` }}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
