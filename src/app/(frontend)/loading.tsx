export default function Loading() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Page header skeleton */}
      <div style={{ height: '32px', width: '200px', background: '#f0f0f0', borderRadius: '8px', marginBottom: '32px', animation: 'pulse 1.5s ease-in-out infinite' }} />

      {/* Grid skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ height: '200px', background: '#f0f0f0', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ height: '12px', width: '60px', background: '#f0f0f0', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ height: '16px', width: '80%', background: '#f0f0f0', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ height: '16px', width: '40%', background: '#f0f0f0', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
