import { NextRequest, NextResponse } from 'next/server'
import { mockScoreData } from '@/lib/mock_data'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Check if ML service is configured
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000'
    
    try {
      // Try to call ML service
      const response = await fetch(`${mlServiceUrl}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch (mlError) {
      console.log('ML service not available, using heuristic scoring')
    }

    // Fallback to heuristic scoring
    const score = calculateHeuristicScore(body)
    return NextResponse.json(score)

  } catch (error: any) {
    console.error('Score API Error:', error)
    return NextResponse.json(mockScoreData)
  }
}

function calculateHeuristicScore(data: any): any {
  let score = 0.5 // Base score
  let factors: string[] = []

  // Name/description analysis
  const text = `${data.name} ${data.description}`.toLowerCase()
  const pumpKeywords = ['moon', 'rocket', 'pump', 'gem', '100x', 'pepe', 'doge', 'elon', 'bonk']
  const scamKeywords = ['scam', 'rug', 'honeypot', 'fake', 'warning']

  pumpKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score += 0.05
      factors.push(`+${keyword}`)
    }
  })

  scamKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score -= 0.15
      factors.push(`-${keyword}`)
    }
  })

  // Social presence
  if (data.socials?.twitter) {
    score += 0.1
    factors.push('+twitter')
  }
  if (data.socials?.telegram) {
    score += 0.05
    factors.push('+telegram')
  }
  if (data.socials?.website) {
    score += 0.05
    factors.push('+website')
  }

  // Market metrics
  if (data.market?.liquidity > 100000) {
    score += 0.15
    factors.push('+liquidity')
  } else if (data.market?.liquidity < 10000) {
    score -= 0.1
    factors.push('-low_liquidity')
  }

  if (data.market?.volume24h > 50000) {
    score += 0.1
    factors.push('+volume')
  }

  // Rug risk
  if (data.rug?.risk === 'low') {
    score += 0.15
    factors.push('+low_risk')
  } else if (data.rug?.risk === 'high') {
    score -= 0.25
    factors.push('-high_risk')
  }

  // Clamp score between 0.01 and 0.99
  score = Math.max(0.01, Math.min(0.99, score))

  const explain = `Analysis based on: ${factors.join(', ')}. ` +
    (score > 0.7 ? 'Strong pump potential detected!' :
     score > 0.4 ? 'Moderate potential with some risk factors.' :
     'High risk detected, proceed with caution.')

  return {
    probability: score,
    explain
  }
}