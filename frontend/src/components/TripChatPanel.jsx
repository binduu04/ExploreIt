
import React, { useState, useRef, useEffect } from 'react'
import { 
  MessageCircle, X, Send, User, Bot, Loader2, 
  MapPin, Calendar, Heart, DollarSign 
} from 'lucide-react'

const TripChatPanel = ({ trip, isOpen, onClose }) => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Sample AI responses - In real implementation, this would call your AI service
  const generateAIResponse = async (userMessage, tripContext) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))
    
    const responses = [
      `Based on your ${tripContext.duration}-day trip to ${tripContext.destination}, I'd be happy to help! What specific aspect would you like to know more about?`,
      `Great question about your ${tripContext.destination} adventure! Here are some suggestions...`,
      `For your ${tripContext.budget} budget trip to ${tripContext.destination}, I recommend...`,
      `That's an interesting point about ${tripContext.destination}. Let me provide some insights...`,
      `Considering your preferences for ${tripContext.preferences}, here's what I suggest...`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && trip) {
      // Initialize with a welcome message when chat opens
      const welcomeMessage = {
        id: Date.now(),
        type: 'ai',
        content: `Hi! I'm here to help you with your ${trip.destination} trip. Feel free to ask me anything about your itinerary, recommendations, or travel tips!`,
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
      
      // Focus input after a short delay
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }
  }, [isOpen, trip])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const aiResponse = await generateAIResponse(inputMessage, trip)
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
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
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 lg:hidden"
        onClick={onClose}
      />
      
      {/* Chat Panel */}
      <div className={`fixed right-0 top-0 h-full w-full lg:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Trip Assistant</h3>
              <p className="text-sm text-indigo-100">Ask about your {trip?.destination} trip</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trip Context Card */}
        {trip && (
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b flex-shrink-0">
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
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
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-indigo-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
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
        <div className="p-4 border-t bg-gray-50 flex-shrink-0">
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
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="w-12 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-3xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 shadow-lg shadow-indigo-500/25 flex items-center justify-center flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          {/* Quick suggestions */}
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
                className="px-3 py-1 text-xs bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-indigo-300 transition-colors text-gray-600"
              >
                {suggestion}
              </button>
            ))}
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
 
export  default TripChatPanel
