import { Connection, PublicKey, AccountInfo } from '@solana/web3.js'
import { 
  TokenInfo, 
  TradeInfo, 
  PUMP_PROGRAM_ID,
  calculatePrice,
  calculateMarketCapSol,
  calculateProgress,
  TOKEN_TOTAL_SUPPLY
} from '@/store/tokenStore'

const BONDING_CURVE_DISCRIMINATOR = Buffer.from([23, 183, 248, 55, 96, 216, 172, 96])

export interface BondingCurveAccount {
  virtualTokenReserves: bigint
  virtualSolReserves: bigint
  realTokenReserves: bigint
  realSolReserves: bigint
  tokenTotalSupply: bigint
  complete: boolean
  creator: PublicKey
  isMayhemMode: boolean
  isCashbackCoin: boolean
}

export function decodeBondingCurve(data: Buffer): BondingCurveAccount {
  const virtualTokenReserves = data.readBigUInt64LE(8)
  const virtualSolReserves = data.readBigUInt64LE(16)
  const realTokenReserves = data.readBigUInt64LE(24)
  const realSolReserves = data.readBigUInt64LE(32)
  const tokenTotalSupply = data.readBigUInt64LE(40)
  const complete = data.readUInt8(48) === 1
  const creator = new PublicKey(data.slice(49, 81))
  const isMayhemMode = data.readUInt8(81) === 1
  const isCashbackCoin = data.readUInt8(82) === 1

  return {
    virtualTokenReserves,
    virtualSolReserves,
    realTokenReserves,
    realSolReserves,
    tokenTotalSupply,
    complete,
    creator,
    isMayhemMode,
    isCashbackCoin
  }
}

export function getBondingCurvePDA(mint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('bonding-curve'),
      mint.toBuffer()
    ],
    new PublicKey(PUMP_PROGRAM_ID)
  )
}

export async function fetchBondingCurve(
  connection: Connection,
  mint: PublicKey
): Promise<{ bondingCurve: BondingCurveAccount; address: PublicKey } | null> {
  const [bondingCurvePDA] = getBondingCurvePDA(mint)
  const account = await connection.getAccountInfo(bondingCurvePDA)
  
  if (!account) return null
  
  const bondingCurve = decodeBondingCurve(account.data)
  return { bondingCurve, address: bondingCurvePDA }
}

export async function fetchAllBondingCurves(
  connection: Connection
): Promise<TokenInfo[]> {
  const tokens: TokenInfo[] = []
  
  try {
    const accounts = await connection.getProgramAccounts(
      new PublicKey(PUMP_PROGRAM_ID),
      {
        filters: [
          { memcmp: { offset: 0, bytes: BONDING_CURVE_DISCRIMINATOR.toString('base64') } }
        ]
      }
    )

    for (const { pubkey, account } of accounts) {
      try {
        const bondingCurve = decodeBondingCurve(account.data)
        const price = calculatePrice(bondingCurve.virtualSolReserves, bondingCurve.virtualTokenReserves)
        const marketCapSol = calculateMarketCapSol(
          bondingCurve.virtualSolReserves,
          bondingCurve.virtualTokenReserves,
          bondingCurve.tokenTotalSupply
        )
        const progress = calculateProgress(bondingCurve.realSolReserves)

        const mintPDA = getMintFromBondingCurve(pubkey)
        
        tokens.push({
          mint: mintPDA.toBase58(),
          name: `Token ${mintPDA.toBase58().slice(0, 6)}`,
          symbol: mintPDA.toBase58().slice(0, 6).toUpperCase(),
          uri: '',
          bondingCurve: pubkey.toBase58(),
          creator: bondingCurve.creator.toBase58(),
          virtualTokenReserves: bondingCurve.virtualTokenReserves,
          virtualSolReserves: bondingCurve.virtualSolReserves,
          realTokenReserves: bondingCurve.realTokenReserves,
          realSolReserves: bondingCurve.realSolReserves,
          tokenTotalSupply: bondingCurve.tokenTotalSupply,
          complete: bondingCurve.complete,
          price,
          marketCapSol,
          progress,
          isMigrated: bondingCurve.complete
        })
      } catch (e) {
        console.error('Error decoding bonding curve:', e)
      }
    }
  } catch (error) {
    console.error('Error fetching bonding curves:', error)
  }

  return tokens
}

function getMintFromBondingCurve(bondingCurve: PublicKey): PublicKey {
  return new PublicKey('11111111111111111111111111111111')
}

export async function fetchTokenMetadata(
  connection: Connection,
  mint: PublicKey
): Promise<{ name: string; symbol: string; uri: string } | null> {
  try {
    const metadataPDA = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(),
        mint.toBuffer()
      ],
      new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
    )[0]

    const account = await connection.getAccountInfo(metadataPDA)
    if (!account) return null

    const data = account.data
    let offset = 1 + 32 + 4
    const nameLen = data.readUInt32LE(offset)
    offset += 4
    const name = data.slice(offset, offset + nameLen).toString('utf8').replace(/\0/g, '')
    offset += nameLen
    const symbolLen = data.readUInt32LE(offset)
    offset += 4
    const symbol = data.slice(offset, offset + symbolLen).toString('utf8').replace(/\0/g, '')
    offset += symbolLen
    const uriLen = data.readUInt32LE(offset)
    offset += 4
    const uri = data.slice(offset, offset + uriLen).toString('utf8').replace(/\0/g, '')

    return { name, symbol, uri }
  } catch (error) {
    console.error('Error fetching metadata:', error)
    return null
  }
}

export function calculateBuyAmount(
  virtualSolReserves: bigint,
  virtualTokenReserves: bigint,
  solAmount: bigint
): bigint {
  const k = virtualSolReserves * virtualTokenReserves
  const newVirtualSolReserves = virtualSolReserves + solAmount
  const newVirtualTokenReserves = k / newVirtualSolReserves
  return virtualTokenReserves - newVirtualTokenReserves
}

export function calculateSellAmount(
  virtualSolReserves: bigint,
  virtualTokenReserves: bigint,
  tokenAmount: bigint
): bigint {
  const k = virtualSolReserves * virtualTokenReserves
  const newVirtualTokenReserves = virtualTokenReserves + tokenAmount
  const newVirtualSolReserves = k / newVirtualTokenReserves
  return newVirtualSolReserves - virtualSolReserves
}
