import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, User, Bot, Loader2, MapPin, Calendar, Heart, DollarSign, Maximize, Minimize } from 'lucide-react'
import { collection, addDoc, getDocs, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../context/AuthContext'
import { sendChatMessage } from '../services/apiService'

const TripChatPanel = ({ trip, isOpen, onClose }) => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatLoading, setChatLoading] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load chat history when panel opens
  useEffect(() => {
    if (isOpen && trip && user) {
      loadChatHistory()
      // Focus input after loading
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }
  }, [isOpen, trip, user])

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscapeKey)
      return () => {
        document.removeEventListener('keydown', handleEscapeKey)
      }
    }
  }, [isFullscreen])

  const loadChatHistory = async () => {
    setChatLoading(true)
    try {
      const chatId = `${user.uid}_${trip.id || trip.firestoreId}`
      
      // Simplified query - just use chatId and timestamp
      const q = query(
        collection(db, 'chatHistory'),
        where('chatId', '==', chatId),
        orderBy('createdAt', 'asc'),
        limit(50)
      )
      
      const querySnapshot = await getDocs(q)
      const chatHistory = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        chatHistory.push({ 
          id: doc.id, 
          ...data,
          // Handle different timestamp formats
          timestamp: data.createdAt?.toDate() || new Date(data.timestamp) || new Date()
        })
      })

      if (chatHistory.length > 0) {
        setMessages(chatHistory)
      } else {
        // Initialize with welcome message if no history
        await initializeWelcomeMessage(chatId)
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
      
      // If it's an index error, fall back to basic query
      if (error.code === 'failed-precondition') {
        console.log('Index not ready, using fallback query...')
        await loadChatHistoryFallback()
      } else {
        // Fallback to welcome message
        const chatId = `${user.uid}_${trip.id || trip.firestoreId}`
        await initializeWelcomeMessage(chatId)
      }
    } finally {
      setChatLoading(false)
    }
  }

  // Fallback method without orderBy (for when index is not ready)
  const loadChatHistoryFallback = async () => {
    try {
      const chatId = `${user.uid}_${trip.id || trip.firestoreId}`
      
      // Simple query without orderBy
      const q = query(
        collection(db, 'chatHistory'),
        where('chatId', '==', chatId),
        limit(50)
      )
      
      const querySnapshot = await getDocs(q)
      const chatHistory = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        chatHistory.push({ 
          id: doc.id, 
          ...data,
          timestamp: data.createdAt?.toDate() || new Date(data.timestamp) || new Date()
        })
      })

      // Sort manually by timestamp
      chatHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

      if (chatHistory.length > 0) {
        setMessages(chatHistory)
      } else {
        await initializeWelcomeMessage(chatId)
      }
    } catch (error) {
      console.error('Fallback query also failed:', error)
      const chatId = `${user.uid}_${trip.id || trip.firestoreId}`
      await initializeWelcomeMessage(chatId)
    }
  }

  const initializeWelcomeMessage = async (chatId) => {
    const welcomeMessage = {
      id: `welcome_${Date.now()}`,
      type: 'ai',
      content: `Hi! I'm here to help you with your ${trip.destination} trip. Feel free to ask me anything about your itinerary, recommendations, or travel tips!`,
      timestamp: new Date(),
      chatId: chatId
    }
    setMessages([welcomeMessage])
    
    // Save welcome message to Firebase
    try {
      await saveChatMessage(welcomeMessage)
    } catch (error) {
      console.log('Could not save welcome message:', error)
    }
  }

  const saveChatMessage = async (message) => {
    try {
      const messageData = {
        type: message.type,
        content: message.content,
        userId: user.uid,
        tripId: trip.id || trip.firestoreId,
        chatId: `${user.uid}_${trip.id || trip.firestoreId}`,
        createdAt: serverTimestamp(), // Use server timestamp for consistency
        timestamp: new Date().toISOString() // Keep as backup
      }

      await addDoc(collection(db, 'chatHistory'), messageData)
    } catch (error) {
      console.error('Error saving chat message:', error)
    }
  }

  const generateAIResponse = async (userMessage, tripContext, chatHistory) => {
    try {
      const response = await sendChatMessage(
        userMessage,
        trip.id || trip.firestoreId,
        user.uid,
        tripContext,
        chatHistory
      )
      return response.response
    } catch (error) {
      console.error('Error generating AI response:', error)
      throw error
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !user) return

    const chatId = `${user.uid}_${trip.id || trip.firestoreId}`
    
    const userMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
      chatId: chatId
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputMessage.trim()
    setInputMessage('')
    setIsLoading(true)

    // Save user message to Firebase
    await saveChatMessage(userMessage)

    try {
      // Prepare chat history for context (last 8 messages)
      const recentHistory = messages.slice(-8).map(msg => ({
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp
      }))

      // Prepare trip context
      const tripContext = {
        destination: trip.destination,
        duration: trip.duration,
        startDate: trip.startDate,
        preferences: trip.preferences,
        budget: trip.budget,
        groupType: trip.groupType,
        itinerary: trip.itinerary,
        weather: trip.weather
      }

      const aiResponse = await generateAIResponse(currentInput, tripContext, recentHistory)
      
      const aiMessage = {
        id: `ai_${Date.now()}`,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        chatId: chatId
      }
      
      setMessages(prev => [...prev, aiMessage])
      
      // Save AI message to Firebase
      await saveChatMessage(aiMessage)
      
    } catch (error) {
      console.error('Error in chat:', error)
      const errorMessage = {
        id: `error_${Date.now()}`,
        type: 'ai',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date(),
        chatId: chatId
      }
      setMessages(prev => [...prev, errorMessage])
      await saveChatMessage(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date) => {
    if (!date) return ''
    const messageDate = date instanceof Date ? date : new Date(date.seconds ? date.seconds * 1000 : date)
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-50 ${
          isFullscreen ? '' : 'lg:hidden'
        }`}
        onClick={onClose}
      />
      
      {/* Chat Panel */}
      <div className={`fixed bg-white shadow-2xl z-50 transform transition-all duration-300 ease-in-out flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } ${
        isFullscreen 
          ? 'inset-4 rounded-2xl' 
          : 'right-0 top-0 h-full w-full lg:w-96'
      }`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 flex items-center justify-between flex-shrink-0 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Trip Assistant</h3>
              <p className="text-sm text-indigo-100">Ask about your {trip?.destination} trip</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Trip Context Card */}
        {trip && (
          <div className={`p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b flex-shrink-0 ${
            isFullscreen ? 'px-8' : ''
          }`}>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-3">{trip.destination}</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                  <span>{trip.duration} days</span>
                </div>
                {trip.budget && (
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                    <span className="capitalize">{trip.budget}</span>
                  </div>
                )}
              </div>
              {trip.preferences && (
                <div className="mt-3 flex items-start text-gray-600">
                  <Heart className="w-4 h-4 mr-2 text-pink-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm leading-relaxed">
                    {trip.preferences.length > 80 
                      ? `${trip.preferences.substring(0, 80)}...` 
                      : trip.preferences
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className={`flex-1 overflow-y-auto space-y-4 min-h-0 ${
          isFullscreen ? 'px-8 py-6' : 'p-4'
        }`}>
          {chatLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading chat history...</span>
            </div>
          ) : (
            <div className={`space-y-4 ${isFullscreen ? 'max-w-4xl mx-auto' : ''}`}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex ${
                    isFullscreen ? 'max-w-[70%]' : 'max-w-[80%]'
                  } ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white ml-3' 
                        : 'bg-gray-100 text-gray-600 mr-3'
                    }`}>
                      {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    {/* Message Bubble */}
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-2 ${
                        message.type === 'user' ? 'text-indigo-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className={`flex justify-start ${isFullscreen ? 'max-w-4xl mx-auto' : ''}`}>
              <div className="flex">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-100 text-gray-600 mr-3">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={`border-t bg-gray-50 flex-shrink-0 ${
          isFullscreen ? 'p-8 rounded-b-2xl' : 'p-4'
        }`}>
          <div className={`${isFullscreen ? 'max-w-4xl mx-auto' : ''}`}>
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your trip..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all max-h-32"
                  rows="1"
                  style={{ minHeight: '48px' }}
                  disabled={!user || isLoading}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading || !user}
                className="w-12 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-3xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 shadow-lg shadow-indigo-500/25 flex items-center justify-center flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            {/* Quick suggestions */}
            {!isLoading && (
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  "Tell me more about day 1",
                  "Best restaurants there?", 
                  "Weather info",
                  "Packing tips"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(suggestion)}
                    className="px-3 py-1 text-xs bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-indigo-300 transition-colors text-gray-600 disabled:opacity-50"
                    disabled={isLoading || !user}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            
            {!user && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Please log in to use the chat feature
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// Chat Button Component
export const TripChatButton = ({ trip, onOpenChat }) => {
  return (
    <button
      onClick={() => onOpenChat(trip)}
      className="flex items-center px-3 py-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-xl transition-all duration-200 text-sm font-medium border border-indigo-200 hover:border-indigo-300"
      title="Chat about this trip"
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      Chat
    </button>
  )
}
 
export default TripChatPanel