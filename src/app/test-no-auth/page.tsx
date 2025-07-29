// This page bypasses all global components to test if the redirect is coming from them

export default function TestNoAuthPage() {
  return (
    <html lang="en">
      <body>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1 style={{ color: 'green', fontSize: '3rem' }}>✅ NO AUTH TEST PAGE</h1>
          <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
            This page bypasses AuthProvider and all global components
          </p>
          <div style={{ 
            backgroundColor: '#f0f9ff', 
            padding: '2rem', 
            borderRadius: '8px',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <h2 style={{ marginBottom: '1rem' }}>Assessment Results Preview</h2>
            <p>Your assessment data shows:</p>
            <ul style={{ textAlign: 'left', marginTop: '1rem' }}>
              <li>• 3 mild severity assessments (avg score: 3.33)</li>
              <li>• 2 very severe assessments (avg score: 49)</li>
              <li>• Complete symptom breakdown available</li>
              <li>• Risk factors and recommendations ready</li>
            </ul>
          </div>
          <p style={{ marginTop: '2rem', color: '#666' }}>
            If this page loads without redirecting, the issue is in AuthProvider or global components
          </p>
        </div>
      </body>
    </html>
  )
}