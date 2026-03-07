'use client'

import { useEffect, useRef, useState } from 'react'
import { TokenInfo } from '@/store/tokenStore'

interface ChartProps {
  type: 'bonding' | 'amm'
  selectedToken: TokenInfo | null
}

export default function Chart({ type, selectedToken }: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h'>('1m')
  const [isClient, setIsClient] = useState(false)
  const [priceHistory, setPriceHistory] = useState<{ time: number; value: number }[]>([])

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !chartContainerRef.current || !selectedToken) return

    const initChart = async () => {
      try {
        const { createChart } = await import('lightweight-charts')
        
        if (chartRef.current) {
          try {
            chartRef.current.remove()
          } catch (e) {
            // ignore
          }
          chartRef.current = null
        }

        if (!chartContainerRef.current) return

        const chart = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth || 600,
          height: 300,
          layout: {
            background: { color: '#1A1A1A' },
            textColor: '#9CA3AF',
          },
          grid: {
            vertLines: { color: '#2D2D2D' },
            horzLines: { color: '#2D2D2D' },
          },
          crosshair: {
            mode: 1,
            vertLine: {
              color: '#00FF7F',
              width: 1,
              style: 2,
            },
            horzLine: {
              color: '#00FF7F',
              width: 1,
              style: 2,
            },
          },
          rightPriceScale: {
            borderColor: '#2D2D2D',
          },
          timeScale: {
            borderColor: '#2D2D2D',
            timeVisible: true,
          },
        })

        chartRef.current = chart

        if (type === 'bonding') {
          const lineSeries = chart.addLineSeries({
            color: '#00FF7F',
            lineWidth: 2,
          })
          
          const now = Math.floor(Date.now() / 1000)
          const data: any[] = []
          let price = selectedToken.price
          
          for (let i = 0; i < 100; i++) {
            data.push({
              time: now - 100 + i,
              value: price,
            })
            price *= 1 + (Math.random() * 0.02 - 0.01)
          }
          
          lineSeries.setData(data)
        } else {
          const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#00FF7F',
            downColor: '#FF4444',
            borderUpColor: '#00FF7F',
            borderDownColor: '#FF4444',
            wickUpColor: '#00FF7F',
            wickDownColor: '#FF4444',
          })
          
          const now = Math.floor(Date.now() / 1000)
          const data: any[] = []
          let price = selectedToken.price
          
          for (let i = 0; i < 100; i++) {
            const open = price
            const close = price * (1 + (Math.random() * 0.1 - 0.05))
            const high = Math.max(open, close) * (1 + Math.random() * 0.02)
            const low = Math.min(open, close) * (1 - Math.random() * 0.02)
            
            data.push({
              time: now - 100 + i,
              open,
              high,
              low,
              close,
            })
            
            price = close
          }
          
          candlestickSeries.setData(data)
        }

        const handleResize = () => {
          if (chartContainerRef.current && chartRef.current) {
            try {
              chartRef.current.applyOptions({
                width: chartContainerRef.current.clientWidth,
              })
            } catch (e) {
              // ignore
            }
          }
        }

        window.addEventListener('resize', handleResize)
      } catch (error) {
        console.error('Chart error:', error)
      }
    }

    initChart()

    return () => {
      if (chartRef.current) {
        try {
          chartRef.current.remove()
        } catch (e) {
          // ignore
        }
        chartRef.current = null
      }
    }
  }, [type, isClient, selectedToken])

  if (!isClient) {
    return (
      <div className="card">
        <div className="h-[300px] flex items-center justify-center text-gray-400">
          加载图表中...
        </div>
      </div>
    )
  }

  if (!selectedToken) {
    return (
      <div className="card">
        <div className="h-[300px] flex items-center justify-center text-gray-400">
          请先选择一个代币
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">
          {type === 'bonding' ? '联合曲线' : 'K线图'}
        </h2>
        <div className="flex gap-2">
          {(['1m', '5m', '15m', '1h'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded text-sm ${
                timeframe === tf
                  ? 'bg-pump-green text-black'
                  : 'bg-pump-bg text-white border border-pump-border'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      
      <div ref={chartContainerRef} className="w-full min-h-[300px]" />
      
      {type === 'bonding' && (
        <div className="mt-4 p-3 bg-pump-bg rounded-lg">
          <div className="text-sm text-gray-400 mb-2">联合曲线进度</div>
          <div className="h-2 bg-pump-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-pump-green transition-all" 
              style={{ width: `${Math.min(selectedToken.progress, 100)}%` }} 
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{selectedToken.progress.toFixed(1)}%</span>
            <span>迁移阈值: ~69 SOL</span>
          </div>
        </div>
      )}
    </div>
  )
}
