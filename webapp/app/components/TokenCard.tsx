interface Props {
    data: {
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
    }
  }
  
  export default function TokenCard({ data }: Props) {
    const formatNumber = (num: number) => {
      if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
      if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
      if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
      return `$${num.toFixed(2)}`
    }
  
    return (
      <div className="card">
        <div className="token-header">
          {data.image && (
            <img 
              src={data.image} 
              alt={data.name}
              className="token-logo"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="white"><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="24">🪙</text></svg>'
              }}
            />
          )}
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
              {data.name || 'Unknown Token'}
            </h2>
            <span style={{ opacity: 0.8, fontSize: '1.1rem' }}>
              ${data.symbol || 'N/A'}
            </span>
          </div>
        </div>
  
        {data.description && (
          <p style={{ marginBottom: '1rem', opacity: 0.9 }}>
            {data.description}
          </p>
        )}
  
        <div style={{ marginBottom: '1rem' }}>
          {data.socials.twitter && (
            <a 
              href={`https://twitter.com/${data.socials.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="badge badge-success"
              style={{ textDecoration: 'none' }}
            >
              🐦 Twitter
            </a>
          )}
          {data.socials.telegram && (
            <a 
              href={data.socials.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="badge badge-success"
              style={{ textDecoration: 'none' }}
            >
              📱 Telegram
            </a>
          )}
          {data.socials.website && (
            <a 
              href={data.socials.website}
              target="_blank"
              rel="noopener noreferrer"
              className="badge badge-success"
              style={{ textDecoration: 'none' }}
            >
              🌐 Website
            </a>
          )}
        </div>
  
        <div className="metrics-grid">
          <div className="metric">
            <div className="metric-label">Price</div>
            <div className="metric-value">
              ${data.market.price < 0.01 ? data.market.price.toExponential(2) : data.market.price.toFixed(4)}
            </div>
          </div>
          <div className="metric">
            <div className="metric-label">Liquidity</div>
            <div className="metric-value">{formatNumber(data.market.liquidity)}</div>
          </div>
          <div className="metric">
            <div className="metric-label">24h Volume</div>
            <div className="metric-value">{formatNumber(data.market.volume24h)}</div>
          </div>
        </div>
      </div>
    )
  }