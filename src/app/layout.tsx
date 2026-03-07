import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import dynamic from 'next/dynamic'

const inter = Inter({ subsets: ['latin'] })

const WalletProvider = dynamic(
  () => import('@/components/WalletProvider'),
  { ssr: false }
)

export const metadata: Metadata = {
  title: 'Pump测试网 - 本地测试环境',
  description: 'Pump.fun本地测试网前端，支持Bonding Curve和AMM交易',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  )
}
