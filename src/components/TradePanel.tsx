'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useState, useEffect } from 'react'
import { Connection, LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
import { TokenInfo, PUMP_PROGRAM_ID, GLOBAL_ACCOUNT, FEE_RECIPIENT, EVENT_AUTHORITY } from '@/store/tokenStore'
import { getBondingCurvePDA, calculateBuyAmount, calculateSellAmount } from '@/utils/pump'
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token'

interface TradePanelProps {
  token: TokenInfo
  isMigrated: boolean
}

export default function TradePanel({ token, isMigrated }: TradePanelProps) {
  const { publicKey, signTransaction, sendTransaction } = useWallet()
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount] = useState('')
  const [tokenAmount, setTokenAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [slippage, setSlippage] = useState(10)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (tradeType === 'buy' && amount && token.price > 0) {
      const solAmount = parseFloat(amount)
      const tokens = solAmount / token.price
      setTokenAmount(tokens.toLocaleString('en-US', { maximumFractionDigits: 0 }))
    }
  }, [amount, token.price, tradeType])

  useEffect(() => {
    if (tradeType === 'sell' && tokenAmount && token.price > 0) {
      const tokens = parseFloat(tokenAmount.replace(/,/g, ''))
      const sol = tokens * token.price
      setAmount(sol.toFixed(6))
    }
  }, [tokenAmount, token.price, tradeType])

  const handleTrade = async () => {
    if (!publicKey || !amount) return
    
    setLoading(true)
    setMessage('')
    
    try {
      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8899'
      const connection = new Connection(rpcUrl, 'confirmed')
      
      const mintPubkey = new PublicKey(token.mint)
      const [bondingCurvePDA] = getBondingCurvePDA(mintPubkey)
      
      if (tradeType === 'buy') {
        const solAmount = parseFloat(amount) * LAMPORTS_PER_SOL
        const expectedTokens = calculateBuyAmount(
          token.virtualSolReserves,
          token.virtualTokenReserves,
          BigInt(solAmount)
        )
        
        setMessage(`买入交易已构建 (模拟)\nSOL: ${amount}\n预期代币: ${expectedTokens.toString()}`)
        
      } else {
        const tokenAmountNum = parseFloat(tokenAmount.replace(/,/g, ''))
        const expectedSol = calculateSellAmount(
          token.virtualSolReserves,
          token.virtualTokenReserves,
          BigInt(Math.floor(tokenAmountNum))
        )
        
        setMessage(`卖出交易已构建 (模拟)\n代币: ${tokenAmount}\n预期SOL: ${(Number(expectedSol) / LAMPORTS_PER_SOL).toFixed(6)}`)
      }
      
    } catch (error: any) {
      setMessage(`错误: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card md:sticky md:top-24">
      <div className="flex gap-2 mb-3 md:mb-4">
        <button
          onClick={() => setTradeType('buy')}
          className={`flex-1 py-2 md:py-3 rounded-lg font-bold text-sm md:text-base transition-all ${
            tradeType === 'buy'
              ? 'bg-pump-green text-black'
              : 'bg-pump-bg text-white border border-pump-border'
          }`}
        >
          买入
        </button>
        <button
          onClick={() => setTradeType('sell')}
          className={`flex-1 py-2 md:py-3 rounded-lg font-bold text-sm md:text-base transition-all ${
            tradeType === 'sell'
              ? 'bg-pump-red text-white'
              : 'bg-pump-bg text-white border border-pump-border'
          }`}
        >
          卖出
        </button>
      </div>
      
      <div className="space-y-3 md:space-y-4">
        {tradeType === 'buy' ? (
          <div>
            <label className="text-xs md:text-sm text-gray-400 block mb-1 md:mb-2">
              支付 SOL
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="input-field pr-14 md:pr-16 text-base md:text-lg"
                step="0.001"
                min="0"
              />
              <span className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm md:text-base">
                SOL
              </span>
            </div>
            <div className="text-xs md:text-sm text-gray-400 mt-1 md:mt-2">
              ≈ {tokenAmount || '0'} {token.symbol}
            </div>
          </div>
        ) : (
          <div>
            <label className="text-xs md:text-sm text-gray-400 block mb-1 md:mb-2">
              卖出 {token.symbol}
            </label>
            <div className="relative">
              <input
                type="text"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value.replace(/[^0-9,]/g, ''))}
                placeholder="0"
                className="input-field pr-16 md:pr-20 text-base md:text-lg"
              />
              <span className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs md:text-sm">
                {token.symbol}
              </span>
            </div>
            <div className="text-xs md:text-sm text-gray-400 mt-1 md:mt-2">
              ≈ {amount || '0'} SOL
            </div>
          </div>
        )}
        
        <div>
          <label className="text-xs md:text-sm text-gray-400 block mb-1 md:mb-2">
            滑点容忍度
          </label>
          <div className="flex gap-1 md:gap-2">
            {[1, 5, 10, 20].map((s) => (
              <button
                key={s}
                onClick={() => setSlippage(s)}
                className={`flex-1 px-2 md:px-3 py-1 rounded text-xs md:text-sm ${
                  slippage === s
                    ? 'bg-pump-green text-black'
                    : 'bg-pump-bg text-white border border-pump-border'
                }`}
              >
                {s}%
              </button>
            ))}
          </div>
        </div>
        
        <button
          onClick={handleTrade}
          disabled={loading || !amount || !publicKey}
          className={`w-full py-3 md:py-4 rounded-lg font-bold text-base md:text-lg transition-all ${
            tradeType === 'buy'
              ? 'bg-pump-green text-black hover:bg-opacity-80'
              : 'bg-pump-red text-white hover:bg-opacity-80'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading
            ? '处理中...'
            : !publicKey
            ? '请先连接钱包'
            : tradeType === 'buy'
            ? `买入 ${token.symbol}`
            : `卖出 ${token.symbol}`}
        </button>
      </div>
      
      {message && (
        <div className={`mt-3 md:mt-4 p-2 md:p-3 rounded-lg text-xs md:text-sm whitespace-pre-wrap ${
          message.includes('错误') ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'
        }`}>
          {message}
        </div>
      )}
      
      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-pump-border text-xs md:text-sm text-gray-400 space-y-1">
        <div className="flex justify-between">
          <span>交易模式</span>
          <span className="text-white">{isMigrated ? 'AMM' : '联合曲线'}</span>
        </div>
        <div className="flex justify-between">
          <span>当前价格</span>
          <span className="text-white">{token.price.toExponential(4)} SOL</span>
        </div>
        <div className="flex justify-between">
          <span>市值</span>
          <span className="text-white">{token.marketCapSol.toFixed(4)} SOL</span>
        </div>
        <div className="flex justify-between">
          <span>进度</span>
          <span className="text-white">{token.progress.toFixed(2)}%</span>
        </div>
      </div>
    </div>
  )
}
