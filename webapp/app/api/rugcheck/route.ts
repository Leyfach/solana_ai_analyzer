import { NextRequest, NextResponse } from 'next/server'
import { mockRugCheckData } from '@/lib/mock_data'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mint = searchParams.get('mint')

  if (!mint) {
    return NextResponse.json(
      { error: 'Mint address is required' },
      { status: 400 }
    )
  }

  // Check for API key
  if (!process.env.RUGCHECK_API_KEY) {
    console.log('Demo mode: returning mock rugcheck data')
    return NextResponse.json(mockRugCheckData)
  }

  try {
    // Use the working endpoint pattern
    const response = await fetch(
      `https://api.rugcheck.xyz/tokens/scan/solana/${mint}`,
      {
        headers: {
          'X-API-KEY': process.env.RUGCHECK_API_KEY,
          'Accept': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`RugCheck API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Transform to our format
    const rugCheckData = {
      status: 'ok',
      risk: determineRisk(data),
      details: data
    }

    return NextResponse.json(rugCheckData)

  } catch (error: any) {
    console.error('RugCheck API Error:', error)
    // Return mock data on error
    return NextResponse.json(mockRugCheckData)
  }
}

function determineRisk(data: any): string {
  // Simple risk determination based on response
  const score = data.score || data.riskScore || 0
  
  if (score < 30) return 'low'
  if (score < 70) return 'medium'
  return 'high'
}