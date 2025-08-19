import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { nhost } from '../../utils/nhost'
import toast from 'react-hot-toast'

const EmailVerification = () => {
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [message, setMessage] = useState('')
  const [countdown, setCountdown] = useState(5)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get verification parameters from URL
        const searchParams = new URLSearchParams(location.search)
        const ticket = searchParams.get('ticket')
        const type = searchParams.get('type') || 'emailConfirm'

        console.log('🔍 Email verification started:', { ticket, type, fullUrl: window.location.href })

        if (!ticket) {
          console.error('❌ No verification ticket found in URL')
          setStatus('error')
          setMessage('Invalid verification link. Please check your email for the correct link.')
          return
        }

        console.log('📧 Attempting email verification with Nhost...')
        
        // Call Nhost email verification
        const result = await nhost.auth.confirm(ticket, type)

        console.log('📋 Verification result:', result)

        if (result.error) {
          console.error('❌ Email verification failed:', result.error)
          setStatus('error')
          
          // Handle specific error types
          if (result.error.message.includes('expired')) {
            setMessage('This verification link has expired. Please request a new verification email.')
          } else if (result.error.message.includes('invalid')) {
            setMessage('This verification link is invalid. Please check your email for the correct link.')
          } else if (result.error.message.includes('already')) {
            setMessage('This email has already been verified. You can now sign in to your account.')
            setStatus('success')
          } else {
            setMessage(result.error.message || 'Email verification failed. Please try again.')
          }
        } else {
          console.log('✅ Email verified successfully!')
          setStatus('success')
          setMessage('Email verified successfully! Redirecting to your AI Chatbot...')
          
          toast.success('🎉 Email verified! Welcome to AI Chatbot!', { duration: 3000 })
          
          // Start countdown
          startCountdown()
        }
      } catch (err) {
        console.error('❌ Verification error:', err)
        setStatus('error')
        setMessage('An unexpected error occurred. Please try again or contact support.')
      }
    }

    verifyEmail()
  }, [location])

  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // Redirect to main app with verification success flag
          window.location.href = 'https://superb-starlight-670243.netlify.app/?verified=true'
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleManualRedirect = () => {
    window.location.href = 'https://superb-starlight-670243.netlify.app/?verified=true'
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Enhanced Logo */}
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl animate-pulse">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            {status === 'success' && (
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                ✅
              </div>
            )}
          </div>

          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 dark:from-gray-200 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
            AI Chatbot
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Email Verification
          </p>
        </div>

        <div className="glass-strong rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/50">
          <div className="text-center">
            {status === 'verifying' && (
              <div className="space-y-6 animate-fade-in">
                <div className="relative">
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center mx-auto">
                    <svg className="w-10 h-10 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                  </div>
                  <div className="absolute inset-0 bg-blue-400 rounded-3xl animate-ping opacity-20"></div>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    Verifying Your Email...
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Please wait while we verify your email address.
                  </p>
                </div>

                <div className="glass rounded-2xl p-4 border-l-4 border-blue-500">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    🔐 This process is secure and encrypted
                  </p>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-6 animate-scale-in">
                <div className="relative">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-3xl flex items-center justify-center mx-auto">
                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 bg-green-400 rounded-3xl animate-ping opacity-20"></div>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
                    Email Verified Successfully! 🎉
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {message}
                  </p>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-center space-x-2 text-green-700 dark:text-green-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold">
                        Redirecting in {countdown} seconds...
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="glass rounded-2xl p-4 border-l-4 border-green-500">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                      🚀 What's Next?
                    </h4>
                    <ul className="text-sm text-green-700 dark:text-green-300 space-y-1 text-left">
                      <li>• You'll be redirected automatically</li>
                      <li>• Sign in with your email and password</li>
                      <li>• Start chatting with your AI assistant!</li>
                    </ul>
                  </div>

                  <button
                    onClick={handleManualRedirect}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Continue to AI Chatbot →
                  </button>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-6 animate-fade-in">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-3xl flex items-center justify-center mx-auto">
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">
                    Verification Failed
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {message}
                  </p>
                </div>

                <div className="glass rounded-2xl p-4 border-l-4 border-red-500">
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                    💡 What to try:
                  </h4>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 text-left">
                    <li>• Check your email for a new verification link</li>
                    <li>• Make sure you're clicking the latest email</li>
                    <li>• Try registering again if the link expired</li>
                    <li>• Contact support if problems persist</li>
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleManualRedirect}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200"
                  >
                    Back to Login
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200"
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
            <a href="mailto:support@aichatbot.com" className="text-blue-600 hover:text-blue-500 font-medium">
              support@aichatbot.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default EmailVerification