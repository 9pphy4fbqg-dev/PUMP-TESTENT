'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useTokenStore } from '@/store/tokenStore'

const Header = dynamic(() => import('@/components/Header'), { ssr: false })
const Faucet = dynamic(() => import('@/components/Faucet'), { ssr: false })
const TokenList = dynamic(() => import('@/components/TokenList'), { ssr: false })
const TradePanel = dynamic(() => import('@/components/TradePanel'), { ssr: false })
const Chart = dynamic(() => import('@/components/Chart'), { ssr: false })
const TradeHistory = dynamic(() => import('@/components/TradeHistory'), { ssr: false })

export default function Home() {
  const { selectedToken } = useTokenStore()
  const [activeTab, setActiveTab] = useState<'bonding' | 'amm'>('bonding')
  const [showTokenList, setShowTokenList] = useState(false)

  return (
    <main className="min-h-screen bg-pump-bg">
      <Header />
      
      <div className="container mx-auto px-2 py-4 md:px-4 md:py-6">
        <Faucet />
        
        {/* 移动端布局 */}
        <div className="md:hidden">
          {/* 代币选择栏 */}
          <div 
            className="mt-4 p-3 bg-pump-card rounded-lg border border-pump-border cursor-pointer"
            onClick={() => setShowTokenList(!showTokenList)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">当前代币:</span>
                {selectedToken ? (
                  <span className="text-white font-bold">{selectedToken.symbol}</span>
                ) : (
                  <span className="text-gray-500">点击选择</span>
                )}
              </div>
              <svg 
                className={`w-5 h-5 text-gray-400 transition-transform ${showTokenList ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {showTokenList && (
              <div className="mt-3 pt-3 border-t border-pump-border">
                <TokenList />
              </div>
            )}
          </div>

          {/* 内盘/AMM切换 */}
          <div className="flex gap-2 mt-4 mb-2">
            <button
              className={`flex-1 px-3 py-2 rounded-lg font-bold text-sm transition-all ${
                activeTab === 'bonding'
                  ? 'bg-pump-green text-black'
                  : 'bg-pump-card text-white border border-pump-border'
              }`}
              onClick={() => setActiveTab('bonding')}
            >
              内盘
            </button>
            <button
              className={`flex-1 px-3 py-2 rounded-lg font-bold text-sm transition-all ${
                activeTab === 'amm'
                  ? 'bg-pump-green text-black'
                  : 'bg-pump-card text-white border border-pump-border'
              }`}
              onClick={() => setActiveTab('amm')}
            >
              AMM
            </button>
          </div>

          {/* 图表和交易面板 */}
          <div className="mt-4 space-y-4">
            <Chart type={activeTab} selectedToken={selectedToken} />
            
            {selectedToken ? (
              <TradePanel 
                token={selectedToken} 
                isMigrated={activeTab === 'amm' || selectedToken.isMigrated} 
              />
            ) : (
              <div className="card text-center text-gray-400 py-6 text-sm">
                请先选择一个代币
              </div>
            )}
            
            <TradeHistory selectedToken={selectedToken} />
          </div>
        </div>

        {/* 桌面端布局 */}
        <div className="hidden md:grid grid-cols-12 gap-4 mt-6">
          <div className="col-span-2">
            <TokenList />
          </div>
          
          <div className="col-span-7">
            <div className="flex gap-2 mb-4">
              <button
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  activeTab === 'bonding'
                    ? 'bg-pump-green text-black'
                    : 'bg-pump-card text-white border border-pump-border'
                }`}
                onClick={() => setActiveTab('bonding')}
              >
                联合曲线 (内盘)
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  activeTab === 'amm'
                    ? 'bg-pump-green text-black'
                    : 'bg-pump-card text-white border border-pump-border'
                }`}
                onClick={() => setActiveTab('amm')}
              >
                AMM (已迁移)
              </button>
            </div>
            
            <Chart type={activeTab} selectedToken={selectedToken} />
            
            <div className="mt-4">
              <TradeHistory selectedToken={selectedToken} />
            </div>
          </div>
          
          <div className="col-span-3">
            {selectedToken ? (
              <TradePanel 
                token={selectedToken} 
                isMigrated={activeTab === 'amm' || selectedToken.isMigrated} 
              />
            ) : (
              <div className="card text-center text-gray-400 py-8">
                请先选择一个代币
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
