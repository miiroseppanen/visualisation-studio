export default function SimpleTest() {
  return (
    <div className="min-h-screen bg-blue-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-sm shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Simple Test</h1>
        <p className="text-gray-600 mb-4">
          This is a simple test to verify that Tailwind CSS is working.
        </p>
        <div className="space-y-2">
          <div className="bg-red-500 text-white p-2 rounded-sm">Red Background</div>
          <div className="bg-green-500 text-white p-2 rounded-sm">Green Background</div>
          <div className="bg-blue-500 text-white p-2 rounded-sm">Blue Background</div>
        </div>
        <button className="mt-4 bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-sm">
          Test Button
        </button>
      </div>
    </div>
  )
} 