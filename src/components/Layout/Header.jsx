import React from 'react'
import { useSignOut } from '@nhost/react'
import { useAuth } from '../../hooks/useAuth'
import ThemeToggle from './ThemeToggle'
import toast from 'react-hot-toast'

const Header = () => {
  const { signOut } = useSignOut()
  const { user } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out successfully')
  }

  return (
    <header className="glass-strong border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg p-1">
            <img 
              src="/Screenshot__291_-removebg-preview.png" 
              alt="AI Assistant Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            AI Chatbot
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          <div className="flex items-center space-x-3 glass rounded-lg px-3 py-2">
            <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">
              {user?.email}
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="glass rounded-lg px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover-lift transition-all duration-200 flex items-center space-x-2"
            title="Sign out"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header