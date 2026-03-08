'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useState } from 'react'
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js'

export default function Faucet() {
  const { publicKey, connected } = useWallet()
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState(10)
  const [message, setMessage] = useState('')

  const requestAirdrop = async () => {
    if (!publicKey) return
    
    setLoading(true)
    setMessage('')
    
    try {
      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8899')
      
      // 1. 提交空投请求
      const signature = await connection.requestAirdrop(
        publicKey,
        amount * LAMPORTS_PER_SOL
      )
      
      // 2. 立即刷新余额（交易已提交）
      window.dispatchEvent(new Event('refreshBalance'))
      
      // 3. 显示成功消息
      setMessage(`成功获取 ${amount} SOL！`)
      
    } catch (error: any) {
      setMessage(`错误: ${error.message}`)
    } finally {
      // 4. 无论成功失败，都结束loading状态
      setLoading(false)
    }
  }

  if (!connected) {
    return (
      <div className="card bg-pump-bg border-pump-border">
        <div className="text-center text-gray-400 text-sm md:text-base">
          请先连接钱包以获取测试币
        </div>
      </div>
    )
  }

  return (
    <div className="card bg-pump-bg border-pump-border">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-base md:text-lg font-bold text-white">水龙头 (Faucet)</h2>
          <p className="text-xs md:text-sm text-gray-400">获取测试网SOL</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs md:text-sm text-gray-400">数量:</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="input-field w-20 md:w-24 text-center text-sm"
              min={1}
              max={10000}
            />
            <span className="text-xs md:text-sm text-gray-400">SOL</span>
          </div>
          
          <button
            onClick={requestAirdrop}
            disabled={loading}
            className="btn-primary text-sm md:text-base"
          >
            {loading ? '获取中...' : '获取测试币'}
          </button>
        </div>
      </div>
      
      {message && (
        <div className={`mt-3 md:mt-4 p-2 md:p-3 rounded-lg text-xs md:text-sm ${
          message.includes('成功') ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
        }`}>
          {message}
        </div>
      )}
    </div>
  )
}
