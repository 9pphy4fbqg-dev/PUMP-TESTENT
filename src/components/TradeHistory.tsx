'use client'

import { useState, useEffect } from 'react'
import { TokenInfo, TradeInfo } from '@/store/tokenStore'

interface TradeHistoryProps {
  selectedToken: TokenInfo | null
}

export default function TradeHistory({ selectedToken }: TradeHistoryProps) {
  const [trades, setTrades] = useState<TradeInfo[]>([])
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedToken) {
      setTrades([])
      return
    }
    
    loadTrades()
  }, [selectedToken])

  const loadTrades = async () => {
    if (!selectedToken) return
    
    setLoading(true)
    try {
      setTrades([])
    } catch (error) {
      console.error('加载交易历史失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTrades = trades.filter((t) => 
    filter === 'all' ? true : t.type === filter
  )

  const formatTime = (timestamp: number) => {
    const diff = Date.now() / 1000 - timestamp
    if (diff < 60) return '刚刚'
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
    return `${Math.floor(diff / 86400)}天前`
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  if (!selectedToken) {
    return (
      <div className="card">
        <div className="text-center text-gray-400 py-4">
          请先选择一个代币查看交易历史
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">交易记录</h2>
        <div className="flex gap-1">
          {(['all', 'buy', 'sell'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 rounded text-xs ${
                filter === f
                  ? 'bg-pump-green text-black'
                  : 'bg-pump-bg text-white'
              }`}
            >
              {f === 'all' ? '全部' : f === 'buy' ? '买入' : '卖出'}
            </button>
          ))}
        </div>
      </div>
      
      {loading ? (
        <div className="text-center text-gray-400 py-4">加载中...</div>
      ) : filteredTrades.length === 0 ? (
        <div className="text-center text-gray-400 py-4">
          暂无交易记录
        </div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {filteredTrades.map((trade, i) => (
            <div
              key={i}
              className="p-3 bg-pump-bg rounded-lg border border-pump-border"
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold ${
                    trade.type === 'buy'
                      ? 'bg-pump-green/20 text-pump-green'
                      : 'bg-pump-red/20 text-pump-red'
                  }`}
                >
                  {trade.type === 'buy' ? '买入' : '卖出'}
                </span>
                <span className="text-xs text-gray-400">{formatTime(trade.timestamp)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-400">代币:</span>
                  <span className="text-white ml-1">{Number(trade.tokenAmount).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-400">SOL:</span>
                  <span className="text-pump-green ml-1">{(Number(trade.solAmount) / 1e9).toFixed(6)}</span>
                </div>
                <div>
                  <span className="text-gray-400">价格:</span>
                  <span className="text-white ml-1">{trade.price.toExponential(2)}</span>
                </div>
                <div>
                  <span className="text-gray-400">用户:</span>
                  <span className="text-white ml-1">{formatAddress(trade.user)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
