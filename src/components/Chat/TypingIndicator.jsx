import React, { useState, useEffect } from 'react'
import { SparklesIcon } from '@heroicons/react/24/solid'

const TypingIndicator = () => {
  const [currentMessage, setCurrentMessage] = useState(0)
  
  // Rotating messages to show while Gemini is thinking
  const thinkingMessages = [
    "AI is analyzing your question...",
    "Processing with Google's AI...",
    "Generating thoughtful response...",
    "Applying safety filters...",
    "Almost ready with an answer..."
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % thinkingMessages.length)
    }, 2000) // Change message every 2 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex justify-start mb-6 animate-fade-in">
      <div className="flex max-w-xs lg:max-w-md">
        {/* Gemini Avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center mr-4 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 shadow-lg relative">
          <SparklesIcon className="h-5 w-5 text-white animate-pulse" />
          
          {/* AI indicator */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
        </div>

        {/* Typing Bubble */}
        <div className="relative">
          {/* Main typing bubble */}
          <div className="glass-strong rounded-3xl rounded-bl-lg px-6 py-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 animate-pulse"></div>
            </div>

            {/* Typing animation */}
            <div className="relative z-10 flex items-center space-x-3">
              <div className="typing-indicator">
                <div className="typing-dot bg-gradient-to-r from-purple-500 to-blue-500"></div>
                <div className="typing-dot bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                <div className="typing-dot bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              </div>
              
              <div className="flex items-center space-x-2">
                <SparklesIcon className="w-4 h-4 text-purple-500 animate-spin" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                   AI
                </span>
              </div>
            </div>

            {/* Thinking status */}
            <div className="relative z-10 mt-2 pt-2 border-t border-gray-200/30 dark:border-gray-700/30">
              <p className="text-xs text-gray-600 dark:text-gray-400 animate-fade-in">
                {thinkingMessages[currentMessage]}
              </p>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-2 right-2 w-1 h-1 bg-purple-400/40 rounded-full animate-ping"></div>
            <div className="absolute bottom-2 left-2 w-1 h-1 bg-blue-400/40 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center mt-1 px-2">
            <div className="flex items-center space-x-1 text-xs text-purple-500 dark:text-purple-400">
              <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
              <span> </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TypingIndicator