import React, { useState,useEffect } from 'react'
import { ArrowLeft,Calendar,CalendarPlus } from 'lucide-react'
import { useTrip } from '../context/TripContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const ViewTrip = () => {
  const navigate = useNavigate()
  const { currentTrip, error, clearError } = useTrip()
  const { user } = useAuth()
  //const [saveLoading, setSaveLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)


  const [calendarLoading, setCalendarLoading] = useState(false)
const [hasCalendarPermissions, setHasCalendarPermissions] = useState(false)
const [calendarStatus, setCalendarStatus] = useState('')

useEffect(() => {
  checkCalendarPermissions()
}, [user])

const checkCalendarPermissions = async () => {
  if (!user) return
  
  try {
    console.log('Checking calendar permissions...')
    const token = await user.getIdToken()
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/calendar/permissions`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
   
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('Calendar permissions:', data)
    setHasCalendarPermissions(data.hasPermissions)
  } catch (error) {
    console.error('Error checking calendar permissions:', error)
    setHasCalendarPermissions(false)
  }
}

const requestCalendarPermissions = async () => {
  if (!user) return
  
  try {
    setCalendarLoading(true)
    setCalendarStatus('Requesting permissions...')
    
    console.log('Requesting calendar permissions...')
    const token = await user.getIdToken()
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/calendar/auth-url`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('Auth URL response:', data)
    
    if (data.authUrl) {
      console.log('Opening OAuth popup...')
      const authWindow = window.open(
        data.authUrl, 
        'google_oauth', 
        'width=500,height=600,scrollbars=yes,resizable=yes'
      )
      
      if (!authWindow) {
        throw new Error('Popup blocked. Please allow popups for this site.')
      }
      
      const checkMessage = (event) => {
        console.log('Received message:', event.data, 'from:', event.origin)
        
        if (event.origin !== window.location.origin) {
          console.log('Ignoring message from different origin')
          return
        }
        
        if (event.data === 'oauth_success') {
          console.log('OAuth success received')
          window.removeEventListener('message', checkMessage)
          setCalendarStatus('✅ Calendar connected successfully!')
          setTimeout(() => {
            checkCalendarPermissions()
            setCalendarStatus('')
          }, 2000)
          setCalendarLoading(false)
        } else if (event.data === 'oauth_error') {
          console.log('OAuth error received')
          window.removeEventListener('message', checkMessage)
          setCalendarStatus('❌ Failed to connect calendar')
          setTimeout(() => setCalendarStatus(''), 3000)
          setCalendarLoading(false)
        }
      }
      
      window.addEventListener('message', checkMessage)
      
      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (authWindow.closed) {
          clearInterval(checkClosed)
          window.removeEventListener('message', checkMessage)
          if (calendarLoading) {
            setCalendarStatus('❌ Authorization cancelled')
            setTimeout(() => setCalendarStatus(''), 3000)
            setCalendarLoading(false)
          }
        }
      }, 1000)
      
    } else {
      throw new Error('No auth URL received from server')
    }
  } catch (error) {
    console.error('Error requesting calendar permissions:', error)
    setCalendarStatus(`❌ Error: ${error.message}`)
    setTimeout(() => setCalendarStatus(''), 5000)
    setCalendarLoading(false)
  }
}

const addToCalendar = async () => {
  if (!user || !currentTrip) {
    setCalendarStatus('❌ No trip data available')
    setTimeout(() => setCalendarStatus(''), 3000)
    return
  }
  
  if (!hasCalendarPermissions) {
    setCalendarStatus('❌ Calendar permissions required')
    setTimeout(() => setCalendarStatus(''), 3000)
    return
  }
  
  try {
    setCalendarLoading(true)
    setCalendarStatus('Adding events to calendar...')
    
    console.log('Adding trip to calendar:', currentTrip)
    const token = await user.getIdToken()
    
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/calendar/add-trip`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tripData: currentTrip })
    })
    
    console.log('Add to calendar response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Server error: ${response.status} - ${errorText}`)
    }
    
    const data = await response.json()
    console.log('Add to calendar response:', data)
    
    if (data.success) {
      setCalendarStatus(`✅ ${data.message}`)
      setTimeout(() => setCalendarStatus(''), 5000)
    } else {
      setCalendarStatus(`❌ ${data.error || 'Failed to add to calendar'}`)
      setTimeout(() => setCalendarStatus(''), 5000)
    }
  } catch (error) {
    console.error('Error adding to calendar:', error)
    setCalendarStatus(`❌ Error: ${error.message}`)
    setTimeout(() => setCalendarStatus(''), 5000)
  } finally {
    setCalendarLoading(false)
  }
}

//   const [calendarLoading, setCalendarLoading] = useState(false)
//   const [hasCalendarPermissions, setHasCalendarPermissions] = useState(false)
//   const [calendarStatus, setCalendarStatus] = useState('')


//    useEffect(() => {
//     checkCalendarPermissions()
//   }, [user])

//   const checkCalendarPermissions = async () => {
//     if (!user) return

//     try {
//       const token = await user.getIdToken()
//       const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/calendar/permissions`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       })
      
//       const data = await response.json()
//       setHasCalendarPermissions(data.hasPermissions)
//     } catch (error) {
//       console.error('Error checking calendar permissions:', error)
//     }
//   }

//   // const requestCalendarPermissions = async () => {
//   //   if (!user) return

//   //   try {
//   //     setCalendarLoading(true)
//   //     const token = await user.getIdToken()
      
//   //     const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/calendar/auth-url`, {
//   //       method: 'POST',
//   //       headers: {
//   //         'Authorization': `Bearer ${token}`,
//   //         'Content-Type': 'application/json'
//   //       }
//   //     })

//   //     const data = await response.json()
      
//   //     if (data.authUrl) {
//   //       // Open Google OAuth in a new window
//   //       const authWindow = window.open(data.authUrl, 'GoogleAuth', 'width=500,height=600')
        
//   //       // Listen for the OAuth completion
//   //       const checkClosed = setInterval(() => {
//   //         if (authWindow.closed) {
//   //           clearInterval(checkClosed)
//   //           // Check permissions again after OAuth
//   //           setTimeout(checkCalendarPermissions, 1000)
//   //           setCalendarLoading(false)
//   //         }
//   //       }, 1000)
//   //     }
//   //   } catch (error) {
//   //     console.error('Error requesting calendar permissions:', error)
//   //     setCalendarLoading(false)
//   //   }
//   // }


//   const requestCalendarPermissions = async () => {
//   if (!user) return

//   try {
//     setCalendarLoading(true)
//     const token = await user.getIdToken()

//     const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/calendar/auth-url`, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       }
//     })

//     const data = await response.json()

//     if (data.authUrl) {
//       const authWindow = window.open(data.authUrl, '_blank', 'width=500,height=600')

//       const checkMessage = (event) => {
//         if (event.origin !== window.location.origin) return
//         if (event.data === 'oauth_success') {
//           window.removeEventListener('message', checkMessage)
//           setTimeout(checkCalendarPermissions, 500)
//           setCalendarLoading(false)
//         }
//       }

//       window.addEventListener('message', checkMessage)
//     }
//   } catch (error) {
//     console.error('Error requesting calendar permissions:', error)
//     setCalendarLoading(false)
//   }
// }


//   const addToCalendar = async () => {
//     if (!user || !currentTrip) return

//     try {
//       setCalendarLoading(true)
//       setCalendarStatus('Adding to calendar...')
      
//       const token = await user.getIdToken()
      
//       const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/calendar/add-trip`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ tripData: currentTrip })
//       })

//       const data = await response.json()
      
//       if (data.success) {
//         setCalendarStatus(`✅ ${data.message}`)
//         setTimeout(() => setCalendarStatus(''), 3000)
//       } else {
//         setCalendarStatus('❌ Failed to add to calendar')
//         setTimeout(() => setCalendarStatus(''), 3000)
//       }
//     } catch (error) {
//       console.error('Error adding to calendar:', error)
//       setCalendarStatus('❌ Error adding to calendar')
//       setTimeout(() => setCalendarStatus(''), 3000)
//     } finally {
//       setCalendarLoading(false)
//     }
//   }




  // Export to PDF function using browser's print functionality with better formatting
  const exportToPDF = async () => {
    setExportLoading(true)
    try {
      // Create a new window with the content
      const printWindow = window.open('', '_blank')
      const element = document.getElementById('itinerary-content')
      
      // Create optimized print styles
      const printStyles = `
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            font-size: 14px;
            margin: 0;
            padding: 20px;
            background: white;
          }
          
          @media print {
            body { 
              margin: 0; 
              padding: 15px; 
              font-size: 12px;
            }
            .no-print { 
              display: none !important; 
            }
            .break-inside-avoid { 
              break-inside: avoid; 
              page-break-inside: avoid;
            }
            .page-break-before {
              page-break-before: always;
            }
            .gradient-bg {
              background: #3b82f6 !important;
              color: white !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .gradient-card {
              background: #f8fafc !important;
              border: 1px solid #e2e8f0 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .activity-morning { 
              background: #fef3c7 !important; 
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .activity-afternoon { 
              background: #dbeafe !important; 
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .activity-evening { 
              background: #fce7f3 !important; 
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .tip-card {
              background: #f0f9ff !important;
              border: 1px solid #bae6fd !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
          
          .print-header {
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            padding: 25px;
            border-radius: 15px;
            margin-bottom: 25px;
            text-align: center;
          }
          
          .print-title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          
          .print-subtitle {
            font-size: 16px;
            opacity: 0.9;
            margin-bottom: 20px;
          }
          
          .print-details {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 20px;
            font-size: 14px;
          }
          
          .print-detail-item {
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 16px;
            border-radius: 20px;
            white-space: nowrap;
          }
          
          .day-section {
            margin-bottom: 30px;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          .day-header {
            background: #1e40af;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            margin-bottom: 15px;
            font-size: 18px;
            font-weight: bold;
          }
          
          .activity-block {
            margin-bottom: 20px;
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #3b82f6;
          }
          
          .activity-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #1f2937;
          }
          
          .activity-meta {
            display: flex;
            gap: 20px;
            margin-bottom: 10px;
            font-size: 12px;
            color: #6b7280;
          }
          
          .activity-description {
            font-size: 13px;
            line-height: 1.5;
            color: #374151;
          }
          
          .tips-section {
            margin-top: 30px;
            padding: 20px;
            background: #f8fafc;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
          }
          
          .tips-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #1f2937;
          }
          
          .tip-item {
            margin-bottom: 15px;
          }
          
          .tip-item h4 {
            font-weight: bold;
            margin-bottom: 5px;
            color: #374151;
          }
          
          .tip-list {
            list-style: none;
            padding-left: 0;
          }
          
          .tip-list li {
            margin-bottom: 5px;
            padding-left: 20px;
            position: relative;
          }
          
          .tip-list li::before {
            content: "•";
            position: absolute;
            left: 0;
            color: #3b82f6;
            font-weight: bold;
          }
          
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
        </style>
      `

      // Create structured content for better PDF formatting
      let structuredContent = `
        <div class="print-header gradient-bg">
          <div class="print-title">${currentTrip.summary?.title || `Journey to ${currentTrip.destination}`}</div>
          <div class="print-subtitle">${currentTrip.summary?.description || `Discover ${currentTrip.destination} in ${currentTrip.duration} incredible days`}</div>
          <div class="print-details">
            <div class="print-detail-item">📅 ${formatDate(currentTrip.startDate)}</div>
            <div class="print-detail-item">⏱️ ${currentTrip.duration} days</div>
            <div class="print-detail-item">💰 ${currentTrip.budget}</div>
            <div class="print-detail-item">👥 ${currentTrip.groupType}</div>
          </div>
        </div>
      `

      // Add highlights if available
      if (currentTrip.summary?.highlights) {
        structuredContent += `
          <div class="gradient-card" style="padding: 20px; margin-bottom: 25px; border-radius: 10px;">
            <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">✨ Trip Highlights</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px;">
              ${currentTrip.summary.highlights.map(highlight => 
                `<div style="display: flex; align-items: center; padding: 8px; background: #fef3c7; border-radius: 8px; font-size: 13px;">
                  <span style="margin-right: 8px;">⭐</span>
                  <span>${highlight}</span>
                </div>`
              ).join('')}
            </div>
          </div>
        `
      }

      // Add daily itinerary
      structuredContent += `<h2 style="font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #1f2937;">📋 Your Daily Adventure</h2>`
      
      currentTrip.itinerary?.forEach((day, index) => {
        structuredContent += `
          <div class="day-section">
            <div class="day-header gradient-bg">
              Day ${day.day} - ${formatDate(day.date)}
              ${day.temperature ? `<span style="float: right;">${getWeatherIcon(day.condition)} ${day.temperature}°C</span>` : ''}
            </div>
        `

        // Morning
        if (day.morning) {
          structuredContent += `
            <div class="activity-block activity-morning">
              <div class="activity-title">🌅 Morning: ${day.morning.activity}</div>
              <div class="activity-meta">
                <span>📍 ${day.morning.location}</span>
                <span>⏱️ ${day.morning.duration}</span>
                <span>💰 ${day.morning.cost}</span>
              </div>
              <div class="activity-description">${day.morning.description}</div>
            </div>
          `
        }

        // Afternoon
        if (day.afternoon) {
          structuredContent += `
            <div class="activity-block activity-afternoon">
              <div class="activity-title">☀️ Afternoon: ${day.afternoon.activity}</div>
              <div class="activity-meta">
                <span>📍 ${day.afternoon.location}</span>
                <span>⏱️ ${day.afternoon.duration}</span>
                <span>💰 ${day.afternoon.cost}</span>
              </div>
              <div class="activity-description">${day.afternoon.description}</div>
            </div>
          `
        }

        // Evening
        if (day.evening) {
          structuredContent += `
            <div class="activity-block activity-evening">
              <div class="activity-title">🌆 Evening: ${day.evening.activity}</div>
              <div class="activity-meta">
                <span>📍 ${day.evening.location}</span>
                <span>⏱️ ${day.evening.duration}</span>
                <span>💰 ${day.evening.cost}</span>
              </div>
              <div class="activity-description">${day.evening.description}</div>
            </div>
          `
        }

        structuredContent += `</div>`
      })

      // Add tips section
      if (currentTrip.tips) {
        structuredContent += `
          <div class="tips-section tip-card break-inside-avoid">
            <div class="tips-title">💡 Essential Travel Tips</div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
        `

        if (currentTrip.tips.transportation) {
          structuredContent += `
            <div class="tip-item">
              <h4>🚗 Getting Around</h4>
              <p style="font-size: 13px; line-height: 1.4;">${currentTrip.tips.transportation}</p>
            </div>
          `
        }

        if (currentTrip.tips.budget) {
          structuredContent += `
            <div class="tip-item">
              <h4>💰 Money Matters</h4>
              <ul class="tip-list">
                ${currentTrip.tips.budget.map(tip => `<li>${tip}</li>`).join('')}
              </ul>
            </div>
          `
        }

        if (currentTrip.tips.packing) {
          structuredContent += `
            <div class="tip-item">
              <h4>🎒 Pack Smart</h4>
              <ul class="tip-list">
                ${currentTrip.tips.packing.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
          `
        }

        structuredContent += `</div></div>`
      }

      // Add footer
      structuredContent += `
        <div class="footer">
          <p>🤖 AI-Generated Itinerary</p>
          <p>Created on ${new Date(currentTrip.generatedOn).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
      `

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${currentTrip.destination} Itinerary</title>
          <meta charset="utf-8">
          ${printStyles}
        </head>
        <body>
          ${structuredContent}
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                setTimeout(() => window.close(), 1000);
              }, 500);
            }
          </script>
        </body>
        </html>
      `)
      printWindow.document.close()
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setExportLoading(false)
    }
  }

  // Export to HTML/DOC function
  const exportToDoc = () => {
    try {
      const element = document.getElementById('itinerary-content')
      
      // Create a complete HTML document
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${currentTrip.destination} Itinerary</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              color: #333;
            }
            h1, h2, h3 { color: #2563eb; }
            .day-header { 
              background: linear-gradient(to right, #4f46e5, #7c3aed);
              color: white;
              padding: 15px;
              border-radius: 10px;
              margin: 20px 0 10px 0;
            }
            .activity-section { 
              margin: 15px 0;
              padding: 15px;
              border-left: 4px solid #e5e7eb;
              background: #f9fafb;
            }
            .highlight { 
              background: #fef3c7;
              padding: 10px;
              border-radius: 5px;
              margin: 5px 0;
            }
            .tip-section {
              background: #f0f9ff;
              padding: 15px;
              border-radius: 10px;
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          ${element.innerHTML}
        </body>
        </html>
      `
      
      const blob = new Blob([htmlContent], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${currentTrip.destination.replace(/[^a-z0-9]/gi, '_')}-itinerary.doc`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('DOC export failed:', error)
      alert('Export failed. Please try again.')
    }
  }

  // Alternative: Export as plain text
  const exportAsText = () => {
    try {
      let textContent = `${currentTrip.destination.toUpperCase()} ITINERARY\n`
      textContent += `${'='.repeat(50)}\n\n`
      textContent += `Destination: ${currentTrip.destination}\n`
      textContent += `Duration: ${currentTrip.duration} days\n`
      textContent += `Start Date: ${formatDate(currentTrip.startDate)}\n`
      textContent += `Budget: ${currentTrip.budget}\n`
      textContent += `Group Type: ${currentTrip.groupType}\n\n`

      if (currentTrip.summary?.description) {
        textContent += `DESCRIPTION:\n${currentTrip.summary.description}\n\n`
      }

      if (currentTrip.summary?.highlights) {
        textContent += `HIGHLIGHTS:\n`
        currentTrip.summary.highlights.forEach((highlight, index) => {
          textContent += `${index + 1}. ${highlight}\n`
        })
        textContent += '\n'
      }

      textContent += `DAILY ITINERARY:\n${'='.repeat(30)}\n\n`

      currentTrip.itinerary?.forEach((day, index) => {
        textContent += `DAY ${day.day} - ${formatDate(day.date)}\n`
        textContent += `${'-'.repeat(40)}\n`

        if (day.morning) {
          textContent += `MORNING: ${day.morning.activity}\n`
          textContent += `Location: ${day.morning.location}\n`
          textContent += `Duration: ${day.morning.duration}\n`
          textContent += `Cost: ${day.morning.cost}\n`
          textContent += `${day.morning.description}\n\n`
        }

        if (day.afternoon) {
          textContent += `AFTERNOON: ${day.afternoon.activity}\n`
          textContent += `Location: ${day.afternoon.location}\n`
          textContent += `Duration: ${day.afternoon.duration}\n`
          textContent += `Cost: ${day.afternoon.cost}\n`
          textContent += `${day.afternoon.description}\n\n`
        }

        if (day.evening) {
          textContent += `EVENING: ${day.evening.activity}\n`
          textContent += `Location: ${day.evening.location}\n`
          textContent += `Duration: ${day.evening.duration}\n`
          textContent += `Cost: ${day.evening.cost}\n`
          textContent += `${day.evening.description}\n\n`
        }
      })

      if (currentTrip.tips) {
        textContent += `TRAVEL TIPS:\n${'='.repeat(20)}\n\n`
        
        if (currentTrip.tips.transportation) {
          textContent += `Transportation: ${currentTrip.tips.transportation}\n\n`
        }
        
        if (currentTrip.tips.budget) {
          textContent += `Budget Tips:\n`
          currentTrip.tips.budget.forEach(tip => {
            textContent += `- ${tip}\n`
          })
          textContent += '\n'
        }
        
        if (currentTrip.tips.packing) {
          textContent += `Packing List:\n`
          currentTrip.tips.packing.forEach(item => {
            textContent += `- ${item}\n`
          })
        }
      }

      const blob = new Blob([textContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${currentTrip.destination.replace(/[^a-z0-9]/gi, '_')}-itinerary.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Text export failed:', error)
      alert('Export failed. Please try again.')
    }
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={clearError}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!currentTrip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-6">🗺️</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready for Your Next Adventure?</h2>
          <p className="text-gray-600 text-lg mb-8">Create a trip to see your personalized itinerary here</p>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <p className="text-sm text-gray-500">💡 Tip: Fill out the trip form to generate an amazing itinerary tailored just for you!</p>
          </div>
        </div>
      </div>
    )
  }
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }

  const getWeatherIcon = (condition) => {
    const icons = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Snow': '❄️',
      'Thunderstorm': '⛈️',
      'Drizzle': '🌦️',
      'Mist': '🌫️',
      'Fog': '🌫️'
    }
    return icons[condition] || '🌤️'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8" id="itinerary-content">
        {/* Enhanced Header Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl text-white p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">✈️</span>
                  <h1 className="text-3xl md:text-4xl font-bold">
                    {currentTrip.summary?.title || `Journey to ${currentTrip.destination}`}
                  </h1>
                </div>
                <p className="text-blue-100 mb-6 text-lg leading-relaxed">
                  {currentTrip.summary?.description || `Discover ${currentTrip.destination} in ${currentTrip.duration} incredible days`}
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                    <span>📅</span>
                    <span className="font-medium">{formatDate(currentTrip.startDate)}</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                    <span>⏱️</span>
                    <span className="font-medium">{currentTrip.duration} days</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                    <span>💰</span>
                    <span className="font-medium">{currentTrip.budget}</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                    <span>👥</span>
                    <span className="font-medium capitalize">{currentTrip.groupType}</span>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
    <div className="flex flex-col gap-3 no-print">
  {/* Regenerate Button */}
  <button
    onClick={() => navigate('/my-trips')}
    className="flex justify-center bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
  >
   <ArrowLeft className="w-5 h-5 mr-2" />
    Back to Home
  </button> 

  {/* Calendar Integration */}
                {user && (
                  <div className="space-y-2">
                    {!hasCalendarPermissions ? (
                      <button
                        onClick={requestCalendarPermissions}
                        disabled={calendarLoading}
                        className="flex justify-center bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                      >
                        <Calendar className="w-5 h-5 mr-2" />
                        {calendarLoading ? 'Connecting...' : 'Connect Calendar'}
                      </button>
                    ) : (
                      <button
                        onClick={addToCalendar}
                        disabled={calendarLoading}
                        className="flex justify-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                      >
                        <CalendarPlus className="w-5 h-5 mr-2" />
                        {calendarLoading ? 'Adding...' : 'Add to Calendar'}
                      </button>
                    )}
                    
                    {/* Calendar Status */}
                    {calendarStatus && (
                      <div className="text-center text-sm bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                        {calendarStatus}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Export Options */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={exportToPDF}
                    disabled={exportLoading}
                    className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-200 text-sm font-medium flex items-center gap-1"
                  >
                    {exportLoading ? '⏳' : '📄'} PDF
                  </button>
                  <button
                    onClick={exportToDoc}
                    className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-200 text-sm font-medium flex items-center gap-1"
                  >
                    📝 DOC
                  </button>
                  <button
                    onClick={exportAsText}
                    className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-200 text-sm font-medium flex items-center gap-1"
                  >
                    📋 TXT
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div> 

        {/* Trip Highlights */}
        {currentTrip.summary?.highlights && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 break-inside-avoid">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              ✨ Trip Highlights
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentTrip.summary.highlights.map((highlight, index) => (
                <div key={index} className="flex items-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                  <span className="text-2xl mr-3">⭐</span>
                  <span className="text-gray-700 font-medium">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Daily Itinerary */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            📋 Your Daily Adventure
          </h2>
          
          {currentTrip.itinerary?.map((day, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 break-inside-avoid">
              {/* Enhanced Day Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">
                      Day {day.day}
                    </h3>
                    <p className="text-indigo-100">{formatDate(day.date)}</p>
                  </div>
                  {day.temperature && (
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2 text-lg">
                        {getWeatherIcon(day.condition)}
                        <span className="text-2xl font-bold">{day.temperature}°C</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Time Periods */}
              <div className="divide-y divide-gray-100">
                {/* Morning */}
                {day.morning && (
                  <div className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl mb-2">
                          🌅
                        </div>
                        <div className="text-sm font-semibold text-gray-600">Morning</div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-xl text-gray-800 mb-3">{day.morning.activity}</h4>
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="text-lg">📍</span>
                            <span className="font-medium">{day.morning.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="text-lg">⏱️</span>
                            <span className="font-medium">{day.morning.duration}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="text-lg">💰</span>
                            <span className="font-medium">{day.morning.cost}</span>
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{day.morning.description}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Afternoon */}
                {day.afternoon && (
                  <div className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center text-2xl mb-2">
                          ☀️
                        </div>
                        <div className="text-sm font-semibold text-gray-600">Afternoon</div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-xl text-gray-800 mb-3">{day.afternoon.activity}</h4>
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="text-lg">📍</span>
                            <span className="font-medium">{day.afternoon.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="text-lg">⏱️</span>
                            <span className="font-medium">{day.afternoon.duration}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="text-lg">💰</span>
                            <span className="font-medium">{day.afternoon.cost}</span>
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{day.afternoon.description}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Evening */}
                {day.evening && (
                  <div className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-2xl mb-2">
                          🌆
                        </div>
                        <div className="text-sm font-semibold text-gray-600">Evening</div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-xl text-gray-800 mb-3">{day.evening.activity}</h4>
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="text-lg">📍</span>
                            <span className="font-medium">{day.evening.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="text-lg">⏱️</span>
                            <span className="font-medium">{day.evening.duration}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="text-lg">💰</span>
                            <span className="font-medium">{day.evening.cost}</span>
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{day.evening.description}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Tips Section */}
        {currentTrip.tips && (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              💡 Essential Travel Tips
            </h2>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Transportation */}
              {currentTrip.tips.transportation && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                    🚗 Getting Around
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{currentTrip.tips.transportation}</p>
                </div>
              )}

              {/* Budget Tips */}
              {currentTrip.tips.budget && (
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                    💰 Money Matters
                  </h3>
                  <ul className="space-y-3">
                    {currentTrip.tips.budget.map((tip, index) => (
                      <li key={index} className="text-gray-700 flex items-start gap-3">
                        <span className="text-green-500 mt-1 text-sm font-bold">✓</span>
                        <span className="leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Packing */}
              {currentTrip.tips.packing && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                    🎒 Pack Smart
                  </h3>
                  <ul className="space-y-3">
                    {currentTrip.tips.packing.map((item, index) => (
                      <li key={index} className="text-gray-700 flex items-start gap-3">
                        <span className="text-purple-500 mt-1 text-sm font-bold">•</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Trip Metadata */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-center text-white">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-lg">🤖</span>
            <span className="font-semibold">AI-Generated Itinerary</span>
          </div>
          <p className="text-gray-300 text-sm">
            Created on {new Date(currentTrip.generatedOn).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ViewTrip