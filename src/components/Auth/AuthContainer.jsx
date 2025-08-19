import React, { useState, useEffect } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const AuthContainer = ({ verificationMessage, showSuccessMessage }) => {
  const [isLogin, setIsLogin] = useState(true)

  useEffect(() => {
    if (verificationMessage) {
      toast.success(verificationMessage, { duration: 6000 })
      setIsLogin(true) // Switch to login form after verification
    }
    
    if (showSuccessMessage) {
      toast.success('🎉 Email verified! Please sign in to continue.', { duration: 6000 })
      setIsLogin(true)
    }
  }, [verificationMessage, showSuccessMessage])

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-dark-bg dark:via-gray-900 dark:to-dark-bg">
      <div className="max-w-md w-full space-y-8">
        {/* Enhanced Logo/Brand */}
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              ✨
            </div>
          </div>
          
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 dark:from-gray-200 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
            AI Chatbot
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Your intelligent conversation partner
          </p>
          
          {/* Verification Success Message */}
          {(verificationMessage || showSuccessMessage) && (
            <div className="mt-6 glass-card rounded-2xl p-4 border-l-4 border-green-500 animate-fade-in">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-green-800 dark:text-green-200">
                    Email Verified Successfully! 🎉
                  </h4>
                  <p className="text-xs text-green-600 dark:text-green-300">
                    You can now sign in to start chatting with AI
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Auth Forms */}
        <div className="glass-strong rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/50">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <LoginForm onToggle={() => setIsLogin(false)} />
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <RegisterForm onToggle={() => setIsLogin(true)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div className="glass rounded-2xl p-4 text-center border border-white/20 dark:border-gray-700/50 hover:scale-105 transition-transform duration-200">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200">Fast AI</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">Instant responses</p>
          </div>
          
          <div className="glass rounded-2xl p-4 text-center border border-white/20 dark:border-gray-700/50 hover:scale-105 transition-transform duration-200">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200">Secure</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">Privacy first</p>
          </div>
          
          <div className="glass rounded-2xl p-4 text-center border border-white/20 dark:border-gray-700/50 hover:scale-105 transition-transform duration-200">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200">Smart</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">Learns from you</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Join thousands of users already chatting with AI
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthContainer