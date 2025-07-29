'use client'

export default function TestResultsPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl font-bold text-green-600 mb-4">✅ TEST RESULTS PAGE</h1>
        <p className="text-xl mb-8">This page is OUTSIDE the /patient directory</p>
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h2 className="text-2xl font-semibold mb-4">Assessment Results Would Go Here</h2>
          <div className="text-left max-w-2xl mx-auto">
            <h3 className="font-bold mb-2">Based on your SQL data:</h3>
            <ul className="space-y-1">
              <li>• 3 mild assessments (avg score: 3.33)</li>
              <li>• 2 very severe assessments (avg score: 49)</li>
              <li>• Detailed symptom breakdown</li>
              <li>• Risk factors analysis</li>
              <li>• Clinical recommendations</li>
            </ul>
          </div>
        </div>
        <p className="mt-8 text-gray-600">If this page loads without redirecting, the issue is specific to /patient routes</p>
      </div>
    </div>
  )
}