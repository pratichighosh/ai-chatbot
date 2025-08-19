import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { nhost } from '../../utils/nhost'
import toast from 'react-hot-toast'

const EmailVerification = () => {
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [message, setMessage] = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get verification parameters from URL
        const searchParams = new URLSearchParams(location.search)
        const ticket = searchParams.get('ticket')
        const type = searchParams.get('type')

        console.log('🔍 Verification params:', { ticket, type })

        if (!ticket) {
          setStatus('error')
          setMessage('Invalid verification link. Please check your email for the correct link.')
          return
        }

        // Call Nhost email verification
        const { error } = await nhost.auth.confirm(ticket, type || 'emailConfirm')

        if (error) {
          console.error('❌ Email verification failed:', error)
          setStatus('error')
          setMessage(error.message || 'Email verification failed. Please try again.')
        } else {
          console.log('✅ Email verified successfully')
          setStatus('success')
          setMessage('Email verified successfully! You can now sign in to your account.')
          
          toast.success('🎉 Email verified! Redirecting to login...')
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/')
          }, 3000)
        }
      } catch (err) {
        console.error('❌ Verification error:', err)
        setStatus('error')
        setMessage('An unexpected error occurred. Please try again.')
      }
    }

    verifyEmail()
  }, [location, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Logo */}
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Email Verification
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            AI Chatbot Account Verification
          </p>
        </div>

        <div className="glass-strong rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            {status === 'verifying' && (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  Verifying your email...
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Please wait while we verify your email address.
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-green-800 dark:text-green-200">
                  Email Verified Successfully!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {message}
                </p>
                <div className="glass rounded-lg p-4 border-l-4 border-green-500">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    🎉 Welcome to AI Chatbot! You can now sign in and start chatting with our AI assistant.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/')}
                  className="mt-4 w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Go to Login
                </button>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-red-800 dark:text-red-200">
                  Verification Failed
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {message}
                </p>
                <div className="glass rounded-lg p-4 border-l-4 border-red-500">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    ❌ Please check your email for a new verification link or contact support if the problem persists.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => navigate('/')}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200"
                  >
                    Back to Login
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help? Contact us at{' '}
            <a href="mailto:support@example.com" className="text-blue-600 hover:text-blue-500">
              support@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default EmailVerification