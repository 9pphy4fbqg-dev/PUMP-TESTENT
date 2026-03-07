'use client'

import { FC, ReactNode, useMemo } from 'react'
import dynamic from 'next/dynamic'

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
)

export const WalletButton: FC = () => {
  return (
    <WalletMultiButtonDynamic className="!bg-pump-green !text-black !font-bold !rounded-lg !py-2 !px-4" />
  )
}

export default WalletButton
