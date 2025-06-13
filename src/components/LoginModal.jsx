// src/components/LoginModal.jsx
import React, { useState } from 'react'
import { X, LogIn, UserPlus, Loader } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const LoginModal = ({ isOpen, onClose, onSuccess, message = "Save this trip?" }) => {
  const { loginWithGoogle, loginAnonymously } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError('')
      await loginWithGoogle()
      onSuccess?.()
      onClose()
    } catch (error) {
      setError('Failed to sign in with Google. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAnonymousLogin = async () => {
    try {
      setLoading(true)
      setError('')
      await loginAnonymously()
      onSuccess?.()
      onClose()
    } catch (error) {
      setError('Failed to continue anonymously. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{message}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors "
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        <p className="text-gray-600 mb-8">
          Choose how you'd like to save your trip plans:
        </p>

        <div className="space-y-4">
          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 px-6 py-4 rounded-2xl transition-all duration-200 font-medium disabled:opacity-50"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <img 
                  src="https://developers.google.com/identity/images/g-logo.png" 
                  alt="Google" 
                  className="w-5 h-5"
                />
                <span className="text-black">Continue with Google</span>
              </>
            )}
          </button>

          {/* Anonymous Login */}
          <button
            onClick={handleAnonymousLogin}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-4 rounded-2xl transition-all duration-200 font-medium hover:from-blue-600 hover:to-purple-600 disabled:opacity-50"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>Continue Anonymously</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
        )}

        <div className="mt-6 text-sm text-gray-500 text-center">
          <p className="mb-2">🔐 <strong>With Google:</strong> Get to save your trips! </p>
          <p>👤 <strong>Anonymous:</strong>Not bad, still can generate your itinerary!</p>
        </div>
      </div>
    </div>
  )
}

export default LoginModal