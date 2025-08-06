interface Props {
    data: {
      probability: number
      explain: string
    }
  }
  
  export default function PumpProbability({ data }: Props) {
    const percentage = Math.round(data.probability * 100)
    
    const getColor = (prob: number) => {
      if (prob < 0.3) return '#ff4757'
      if (prob < 0.7) return '#ffa502'
      return '#14F195'
    }
  
    return (
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>🚀 Pump Probability</h3>
        
        <div className="probability-meter">
          <div 
            className="probability-fill"
            style={{ 
              width: `${percentage}%`,
              background: getColor(data.probability)
            }}
          />
          <div className="probability-text">
            {percentage}%
          </div>
        </div>
  
        <p style={{ marginTop: '1rem', opacity: 0.9 }}>
          {data.explain}
        </p>
      </div>
    )
  }