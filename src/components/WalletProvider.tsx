'use client'

import { FC, ReactNode, useMemo } from 'react'
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { BaseWalletAdapter, WalletReadyState, WalletName, WalletError } from '@solana/wallet-adapter-base'
import { PublicKey, Transaction, VersionedTransaction, TransactionVersion } from '@solana/web3.js'

import '@solana/wallet-adapter-react-ui/styles.css'

interface Props {
  children: ReactNode
}

const LEGACY_TRANSACTION_VERSION = 'legacy' as const
const VERSIONED_TRANSACTION_VERSION = 0 as const

class TokenPocketWalletAdapter extends BaseWalletAdapter<string> {
  name: WalletName<string> = 'TokenPocket' as WalletName<string>
  url = 'https://www.tokenpocket.pro/'
  icon = 'https://www.tokenpocket.pro/_nuxt/img/logo.13f5074.png'
  readyState: WalletReadyState = WalletReadyState.Installed
  supportedTransactionVersions: ReadonlySet<TransactionVersion> = new Set<TransactionVersion>([
    LEGACY_TRANSACTION_VERSION as TransactionVersion,
    VERSIONED_TRANSACTION_VERSION as TransactionVersion
  ])
  private _publicKey: PublicKey | null = null
  private _connecting: boolean = false

  get publicKey(): PublicKey | null {
    return this._publicKey
  }

  get connecting(): boolean {
    return this._connecting
  }

  get connected(): boolean {
    return this._publicKey !== null
  }

  async autoConnect(): Promise<void> {
    return this.connect()
  }

  async connect(): Promise<void> {
    try {
      this._connecting = true
      
      const tp = (window as any).solana
      if (!tp) {
        const error = new Error('TokenPocket wallet not found') as WalletError
        this.emit('error', error)
        throw error
      }
      
      const response = await tp.connect()
      if (response.publicKey) {
        this._publicKey = new PublicKey(response.publicKey)
      } else if (tp.publicKey) {
        this._publicKey = new PublicKey(tp.publicKey.toBase58())
      }
      
      if (this._publicKey) {
        this.emit('connect', this._publicKey)
      }
    } catch (error) {
      this.emit('error', error as WalletError)
      throw error
    } finally {
      this._connecting = false
    }
  }

  async disconnect(): Promise<void> {
    const tp = (window as any).solana
    if (tp && tp.disconnect) {
      await tp.disconnect()
    }
    this._publicKey = null
    this.emit('disconnect')
  }

  async sendTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T,
    connection: any,
    options?: any
  ): Promise<string> {
    const tp = (window as any).solana
    if (!tp) {
      throw new Error('TokenPocket wallet not found')
    }
    
    if (tp.sendTransaction) {
      return await tp.sendTransaction(transaction, connection, options)
    }
    
    const signed = await this.signTransaction(transaction)
    const signature = await connection.sendRawTransaction(signed.serialize(), options)
    return signature
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
    const tp = (window as any).solana
    if (!tp) {
      throw new Error('TokenPocket wallet not found')
    }
    
    const response = await tp.signTransaction(transaction)
    return response
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
    const tp = (window as any).solana
    if (!tp) {
      throw new Error('TokenPocket wallet not found')
    }
    
    const response = await tp.signAllTransactions(transactions)
    return response
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    const tp = (window as any).solana
    if (!tp) {
      throw new Error('TokenPocket wallet not found')
    }
    
    const response = await tp.signMessage(message)
    return response.signature
  }
}

export const WalletProvider: FC<Props> = ({ children }) => {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8899'
  const endpoint = useMemo(() => rpcUrl, [rpcUrl])
  
  const wallets = useMemo(
    () => [
      new TokenPocketWalletAdapter(),
    ],
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  )
}

export default WalletProvider
