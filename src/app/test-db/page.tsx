'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { testSupabaseConnection, testPatientInsert } from '@/lib/supabase/test-connection'

export default function TestDatabasePage() {
  const [connectionResult, setConnectionResult] = useState<any>(null)
  const [insertResult, setInsertResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleTestConnection = async () => {
    setLoading(true)
    try {
      const result = await testSupabaseConnection()
      setConnectionResult(result)
      console.log('Connection test result:', result)
    } catch (error) {
      console.error('Connection test failed:', error)
      setConnectionResult({ success: false, error })
    } finally {
      setLoading(false)
    }
  }

  const handleTestInsert = async () => {
    setLoading(true)
    try {
      const result = await testPatientInsert()
      setInsertResult(result)
      console.log('Insert test result:', result)
    } catch (error) {
      console.error('Insert test failed:', error)
      setInsertResult({ success: false, error })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Database Connection Test</CardTitle>
          <CardDescription>
            Test Supabase connection and database operations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={handleTestConnection} 
              disabled={loading}
              variant="outline"
            >
              Test Connection
            </Button>
            <Button 
              onClick={handleTestInsert} 
              disabled={loading}
              variant="outline"
            >
              Test Patient Insert
            </Button>
          </div>

          {connectionResult && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Connection Test Result:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(connectionResult, null, 2)}
              </pre>
            </div>
          )}

          {insertResult && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Insert Test Result:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(insertResult, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-6 text-sm text-gray-600">
            <p>Check the browser console for detailed logs.</p>
            <p>Make sure to check the Network tab for any failed requests.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}