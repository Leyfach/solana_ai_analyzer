import { NextRequest, NextResponse } from 'next/server'
import { validateSolanaAddress } from '@/lib/validators'
import { mockTokenData } from '@/lib/mock_data'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mint = searchParams.get('mint')

  if (!mint) {
    return NextResponse.json(
      { error: 'Mint address is required' },
      { status: 400 }
    )
  }

  // Validate address
  const validation = validateSolanaAddress(mint)
  
  // Demo mode or invalid address - return mock data
  if (!process.env.HELIUS_API_KEY || !validation.isValid) {
    console.log('Demo mode: returning mock token data')
    return NextResponse.json(mockTokenData)
  }

  try {
    // Fetch from Helius DAS API
    const heliusData = await fetchHeliusData(mint)
    
    // Fetch from Birdeye if available
    const birdeyeData = process.env.BIRDEYE_API_KEY 
      ? await fetchBirdeyeData(mint)
      : null

    // Extract and combine data with safe fallbacks
    const tokenData = {
      name: heliusData?.content?.metadata?.name || 
            heliusData?.content?.json?.name || 
            'Unknown Token',
      symbol: heliusData?.content?.metadata?.symbol || 
              heliusData?.content?.json?.symbol || 
              'N/A',
      description: heliusData?.content?.metadata?.description || 
                   heliusData?.content?.json?.description || 
                   '',
      image: heliusData?.content?.links?.image || 
             heliusData?.content?.json?.image || 
             heliusData?.content?.files?.[0]?.uri || 
             '',
      socials: {
        twitter: extractSocial(heliusData, 'twitter'),
        telegram: extractSocial(heliusData, 'telegram'),
        website: extractSocial(heliusData, 'website') || 
                heliusData?.content?.json?.external_url || 
                ''
      },
      market: {
        price: birdeyeData?.price || 0,
        liquidity: birdeyeData?.liquidity || 0,
        volume24h: birdeyeData?.v24hUSD || 0
      },
      raw: { 
        helius: heliusData, 
        birdeye: birdeyeData 
      }
    }

    return NextResponse.json(tokenData)

  } catch (error: any) {
    console.error('API Error:', error)
    // Return mock data on error to keep UI functional
    return NextResponse.json(mockTokenData)
  }
}

async function fetchHeliusData(mint: string) {
  try {
    const response = await fetch(
      `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'token-metadata',
          method: 'getAsset',
          params: {
            id: mint,
            displayOptions: { showFungible: true }
          }
        })
      }
    )

    const data = await response.json()
    
    // Check for RPC errors
    if (data.error) {
      console.error('Helius RPC Error:', data.error)
      return null
    }
    
    return data.result
  } catch (error) {
    console.error('Helius fetch error:', error)
    return null
  }
}

async function fetchBirdeyeData(mint: string) {
  try {
    const response = await fetch(
      `https://public-api.birdeye.so/defi/token_overview?address=${mint}`,
      {
        headers: {
          'accept': 'application/json',
          'x-chain': 'solana',
          'X-API-KEY': process.env.BIRDEYE_API_KEY!
        }
      }
    )

    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error('Birdeye fetch error:', error)
    return null
  }
}

function extractSocial(data: any, platform: string): string {
  try {
    // Check multiple possible locations for social links
    const metadata = data?.content?.metadata
    const json = data?.content?.json
    const links = data?.content?.links
    
    // Check in metadata attributes
    if (metadata?.attributes && Array.isArray(metadata.attributes)) {
      const socialAttr = metadata.attributes.find((attr: any) => 
        attr.trait_type?.toLowerCase().includes(platform) ||
        attr.value?.toLowerCase().includes(platform)
      )
      if (socialAttr?.value) return socialAttr.value
    }
    
    // Check in json object
    if (json) {
      if (json[platform]) return json[platform]
      if (json.external_url && platform === 'website') return json.external_url
    }
    
    // Check in links array (if it exists and is an array)
    if (Array.isArray(links)) {
      const socialLink = links.find((link: any) => 
        typeof link === 'string' && link.toLowerCase().includes(platform)
      )
      if (socialLink) return socialLink
    }
    
    // Check in links object (if it's an object)
    if (links && typeof links === 'object' && !Array.isArray(links)) {
      if (links[platform]) return links[platform]
    }
    
    return ''
  } catch (error) {
    console.error(`Error extracting ${platform}:`, error)
    return ''
  }
}