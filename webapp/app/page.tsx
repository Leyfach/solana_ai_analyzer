'use client'

import { useState } from 'react'
import TokenAnalyzer from './components/TokenAnalyzer'

export default function Home() {
  const [isDemoMode] = useState(() => !process.env.NEXT_PUBLIC_HELIUS_API_KEY)

  return (
    <div className="container">
      {isDemoMode && (
        <div className="demo-badge">
          🎮 DEMO MODE
        </div>
      )}
      
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
          🚀 Solana Token Analyzer
        </h1>
        <p style={{ opacity: 0.8, fontSize: '1.2rem' }}>
          Analyze tokens for risk and pump probability using AI
        </p>
      </header>

      <TokenAnalyzer />
    </div>
  )
}