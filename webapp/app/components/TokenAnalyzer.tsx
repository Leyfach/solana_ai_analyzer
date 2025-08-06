'use client'

import { useState } from 'react'
import TokenCard from './TokenCard'
import RugCheckStatus from './RugcheckStatus'
import PumpProbability from './PumpProbability'

interface TokenData {
  name: string
  symbol: string
  description: string
  image: string
  socials: {
    twitter?: string
    telegram?: string
    website?: string
  }
  market: {
    price: number
    liquidity: number
    volume24h: number
  }
  raw?: any
}

interface RugCheckData {
  status: string
  risk: string
  details: any
}

interface ScoreData {
  probability: number
  explain: string
}

export default function TokenAnalyzer() {
  const [mintAddress, setMintAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [rugCheckData, setRugCheckData] = useState<RugCheckData | null>(null)
  const [scoreData, setScoreData] = useState<ScoreData | null>(null)

  const handleAnalyze = async () => {
    if (!mintAddress.trim()) {
      setError('Please enter a token mint address')
      return
    }

    setLoading(true)
    setError('')
    setTokenData(null)
    setRugCheckData(null)
    setScoreData(null)

    try {
      const tokenRes = await fetch(`/api/token?mint=${mintAddress}`)
      const token = await tokenRes.json()
      
      if (!tokenRes.ok) throw new Error(token.error || 'Failed to fetch token data')
      setTokenData(token)

      const rugRes = await fetch(`/api/rugcheck?mint=${mintAddress}`)
      const rug = await rugRes.json()
      setRugCheckData(rug)

      const scoreRes = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: token.name,
          description: token.description,
          socials: token.socials,
          image: token.image,
          market: token.market,
          rug: rug
        })
      })
      const score = await scoreRes.json()
      setScoreData(score)

    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="card">
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter Solana token mint address (e.g., So11111111111111111111111111111111111111112)"
            value={mintAddress}
            onChange={(e) => setMintAddress(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !loading && handleAnalyze()}
            disabled={loading}
          />
          <button onClick={handleAnalyze} disabled={loading}>
            {loading ? <span className="loading" /> : 'Analyze'}
          </button>
        </div>

        {error && (
          <div style={{ 
            padding: '1rem', 
            background: 'rgba(255, 71, 87, 0.2)', 
            borderRadius: '8px',
            marginTop: '1rem'
          }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {tokenData && (
        <>
          <TokenCard data={tokenData} />
          
          {rugCheckData && (
            <RugCheckStatus data={rugCheckData} />
          )}
          
          {scoreData && (
            <PumpProbability data={scoreData} />
          )}

          <details className="card">
            <summary>📊 Raw API Data</summary>
            <pre style={{ 
              overflow: 'auto', 
              padding: '1rem', 
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '8px',
              fontSize: '0.875rem'
            }}>
              {JSON.stringify({ tokenData, rugCheckData, scoreData }, null, 2)}
            </pre>
          </details>
        </>
      )}
    </>
  )
}