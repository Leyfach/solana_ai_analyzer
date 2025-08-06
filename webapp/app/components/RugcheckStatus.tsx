interface Props {
    data: {
      status: string
      risk: string
      details?: any
    }
  }
  
  export default function RugCheckStatus({ data }: Props) {
    const getRiskBadge = (risk: string) => {
      switch (risk?.toLowerCase()) {
        case 'low':
          return <span className="badge badge-success">✅ LOW RISK</span>
        case 'medium':
          return <span className="badge badge-warning">⚠️ MEDIUM RISK</span>
        case 'high':
          return <span className="badge badge-danger">🚨 HIGH RISK</span>
        default:
          return <span className="badge">❓ UNKNOWN</span>
      }
    }
  
    return (
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>🔍 Security Analysis (RugCheck)</h3>
        
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ marginRight: '1rem' }}>Status: {data.status}</span>
          {getRiskBadge(data.risk)}
        </div>
  
        {data.details && (
          <details>
            <summary>View detailed analysis</summary>
            <pre style={{ 
              overflow: 'auto', 
              padding: '1rem',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '8px',
              marginTop: '0.5rem',
              fontSize: '0.875rem'
            }}>
              {JSON.stringify(data.details, null, 2)}
            </pre>
          </details>
        )}
      </div>
    )
  }