// components/APITestComponent.jsx
import React, { useState } from 'react'
import { testAPIIntegration, quickTest, getWeatherForecast, generateItineraryWithGemini } from '../services/apiTestService'

const APITestComponent = () => {
  const [testResults, setTestResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [testType, setTestType] = useState('')
  const [customData, setCustomData] = useState({
    destination: 'Bangalore, India',
    duration: 2,
    startDate: '2025-07-01',
    preferences: 'Tech hubs, gardens, local food',
    budget: 'Medium',
    groupType: 'solo',
    specificPlaces: 'Lalbagh Gardens, UB City Mall'
  })

  const runFullTest = async () => {
    setLoading(true)
    setTestType('Full Integration Test')
    try {
      const result = await testAPIIntegration(customData)
      setTestResults(result)
      console.log('✅ Full test completed:', result)
    } catch (error) {
      console.error('❌ Full test failed:', error)
      setTestResults({ error: error.message })
    }
    setLoading(false)
  }

  const runQuickTest = async () => {
    setLoading(true)
    setTestType('Quick Test (Tokyo)')
    try {
      const result = await quickTest()
      setTestResults(result)
      console.log('✅ Quick test completed:', result)
    } catch (error) {
      console.error('❌ Quick test failed:', error)
      setTestResults({ error: error.message })
    }
    setLoading(false)
  }

  const testWeatherOnly = async () => {
    setLoading(true)
    setTestType('Weather API Only')
    try {
      const result = await getWeatherForecast(customData.destination, customData.startDate)
      setTestResults({ weatherOnly: result })
      console.log('✅ Weather test completed:', result)
    } catch (error) {
      console.error('❌ Weather test failed:', error)
      setTestResults({ error: error.message })
    }
    setLoading(false)
  }

  const testGeminiOnly = async () => {
    setLoading(true)
    setTestType('Gemini API Only (with mock weather)')
    try {
      // Mock weather data for testing Gemini
      const mockWeather = {
        location: customData.destination,
        country: 'India',
        forecast: [
          { date: '7/1/2025', temperature: 28, description: 'partly cloudy', humidity: 65, windSpeed: 3 },
          { date: '7/2/2025', temperature: 30, description: 'sunny', humidity: 60, windSpeed: 2 }
        ]
      }
      
      const result = await generateItineraryWithGemini(customData, mockWeather)
      setTestResults({ geminiOnly: result, mockWeather })
      console.log('✅ Gemini test completed:', result)
    } catch (error) {
      console.error('❌ Gemini test failed:', error)
      setTestResults({ error: error.message })
    }
    setLoading(false)
  }

  const handleInputChange = (field, value) => {
    setCustomData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🧪 API Testing Dashboard</h2>
      
      {/* Custom Test Data Form */}
      <div style={{ 
        background: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h3>Custom Test Data</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          <input
            type="text"
            placeholder="Destination"
            value={customData.destination}
            onChange={(e) => handleInputChange('destination', e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="number"
            placeholder="Duration (days)"
            value={customData.duration}
            onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="date"
            value={customData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="text"
            placeholder="Preferences"
            value={customData.preferences}
            onChange={(e) => handleInputChange('preferences', e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="text"
            placeholder="Specific Places"
            value={customData.specificPlaces}
            onChange={(e) => handleInputChange('specificPlaces', e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
      </div>

      {/* Test Buttons */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <button
          onClick={runFullTest}
          disabled={loading}
          style={{
            padding: '10px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          🚀 Full Integration Test
        </button>
        
        <button
          onClick={runQuickTest}
          disabled={loading}
          style={{
            padding: '10px 15px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          ⚡ Quick Test (Tokyo)
        </button>
        
        <button
          onClick={testWeatherOnly}
          disabled={loading}
          style={{
            padding: '10px 15px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          🌤️ Weather Only
        </button>
        
        <button
          onClick={testGeminiOnly}
          disabled={loading}
          style={{
            padding: '10px 15px',
            backgroundColor: '#6f42c1',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          🤖 Gemini Only
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          background: '#fff3cd', 
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <p>🔄 Running {testType}... Check console for detailed logs!</p>
        </div>
      )}

      {/* Results Display */}
      {testResults && !loading && (
        <div style={{ 
          background: '#ffffff', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #ddd',
          maxHeight: '600px',
          overflow: 'auto'
        }}>
          <h3>📊 Test Results - {testType}</h3>
          <pre style={{ 
            background: '#f8f9fa', 
            padding: '15px', 
            borderRadius: '5px',
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </div>
      )}

      {/* Instructions */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        background: '#e7f3ff', 
        borderRadius: '5px' 
      }}>
        <h4>📝 Instructions:</h4>
        <ul>
          <li><strong>Full Integration Test:</strong> Tests both Weather + Gemini APIs with your custom data</li>
          <li><strong>Quick Test:</strong> Pre-configured test for Tokyo with sample data</li>
          <li><strong>Weather Only:</strong> Tests just the OpenWeather API</li>
          <li><strong>Gemini Only:</strong> Tests just the Gemini API with mock weather data</li>
        </ul>
        <p><strong>🔍 Pro Tip:</strong> Open your browser's Developer Console (F12) to see detailed logs and API responses!</p>
      </div>
    </div>
  )
}

export default APITestComponent