import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client'
import { Toaster } from 'react-hot-toast'
import { NhostProvider } from '@nhost/react'
import { nhost } from './utils/nhost'
import { apolloClient } from './graphql/client'
import { ThemeProvider } from './contexts/ThemeContext'
import { useAuth } from './hooks/useAuth'
import AuthContainer from './components/Auth/AuthContainer'
import Header from './components/Layout/Header'
import ChatContainer from './components/Chat/ChatContainer'
import EmailVerification from './components/Auth/EmailVerification'
import LoadingSpinner from './components/UI/LoadingSpinner'

// Import styles
import './styles/globals.css'
import './styles/themes.css'
import './styles/animations.css'

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth()
  const [verificationMessage, setVerificationMessage] = useState('')

  useEffect(() => {
    // Check if user just completed email verification
    const urlParams = new URLSearchParams(window.location.search)
    const verified = urlParams.get('verified')
    
    if (verified === 'true') {
      setVerificationMessage('Email verified successfully! You can now sign in.')
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-pulse">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="space-y-4">
            <LoadingSpinner size="lg" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Initializing your AI Assistant...
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we set up your experience
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {/* Email Verification Route */}
        <Route 
          path="/verify-email" 
          element={<EmailVerification />} 
        />
        
        {/* Success Route after email verification */}
        <Route 
          path="/verification-success" 
          element={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
              <AuthContainer showSuccessMessage={true} />
            </div>
          } 
        />
        
        {/* Main App Routes */}
        <Route 
          path="/*" 
          element={
            !isAuthenticated ? (
              <AuthContainer verificationMessage={verificationMessage} />
            ) : (
              <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <Header />
                <ChatContainer />
              </div>
            )
          } 
        />
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <NhostProvider nhost={nhost}>
      <ThemeProvider>
        <ApolloProvider client={apolloClient}>
          <div className="antialiased min-h-screen">
            <AppContent />
            <Toaster 
              position="top-center"
              toastOptions={{
                className: 'glass-strong border-0 text-gray-800 dark:text-gray-200',
                duration: 5000,
                style: {
                  backdropFilter: 'blur(16px)',
                  maxWidth: '400px',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#ffffff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#ffffff',
                  },
                },
              }}
            />
          </div>
        </ApolloProvider>
      </ThemeProvider>
    </NhostProvider>
  )
}

export default App