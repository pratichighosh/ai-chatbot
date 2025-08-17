import React, { useState, useRef, useEffect } from 'react'
import { PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/solid'
import { useChat } from '../../hooks/useChat'
import Button from '../UI/Button'

const MessageInput = ({ chatId }) => {
  const [message, setMessage] = useState('')
  const { sendMessage, isTyping } = useChat()
  const textareaRef = useRef()

  // Auto-focus when chat is selected
  useEffect(() => {
    if (chatId && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [chatId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!message.trim()) {
      textareaRef.current?.focus()
      return
    }
    
    if (!chatId) {
      alert('Please select a chat first')
      return
    }

    if (isTyping) return

    const messageText = message.trim()
    setMessage('')
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      await sendMessage(chatId, messageText)
    } catch (error) {
      // Error is already handled in useChat hook
      console.error('Message send failed:', error)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleTextareaChange = (e) => {
    setMessage(e.target.value)
    
    // Auto-resize textarea
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }

  // Gemini-optimized suggestions
  const suggestionPrompts = [
    "Explain this concept simply",
    "Help me understand this topic",
    "What are the key points about...",
    "Can you break this down for me?",
    "Give me practical examples of...",
    "What should I know about...",
    "Help me learn about...",
    "Compare and contrast..."
  ]

  return (
    <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-white/50 via-blue-50/30 to-purple-50/30 dark:from-gray-900/50 dark:via-gray-800/50 dark:to-purple-900/30 backdrop-blur-sm">
      <div className="p-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={
                !chatId 
                  ? "Select a chat to start messaging..." 
                  : isTyping 
                    ? "Gemini AI is thinking..." 
                    : "Ask anything... Gemini is ready to help! 🧠"
              }
              disabled={!chatId || isTyping}
              className="w-full resize-none rounded-2xl glass-strong placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent px-4 py-3 text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed custom-scrollbar border border-gray-200/30 dark:border-gray-700/30"
              rows="1"
              style={{ 
                minHeight: '44px', 
                maxHeight: '120px',
                fontFamily: 'inherit'
              }}
            />
            
            {/* Character Counter */}
            {message.length > 800 && (
              <div className="absolute bottom-1 right-12 text-xs text-gray-400 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded-full">
                {1000 - message.length}
              </div>
            )}

            {/* AI Status Indicator */}
            {isTyping && (
              <div className="absolute top-3 right-12 flex items-center space-x-1 text-xs text-purple-500 dark:text-purple-400">
                <SparklesIcon className="w-3 h-3 animate-pulse" />
                <span>AI</span>
              </div>
            )}
          </div>

          {/* Send Button */}
          <Button
            type="submit"
            disabled={!message.trim() || !chatId || isTyping}
            loading={isTyping}
            className="rounded-2xl p-3 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700"
            title={
              !chatId 
                ? "Select a chat first" 
                : !message.trim() 
                  ? "Enter a message" 
                  : isTyping 
                    ? "Gemini is responding..." 
                    : "Send to Gemini AI"
            }
          >
            {isTyping ? (
              <div className="animate-spin">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              </div>
            ) : (
              <PaperAirplaneIcon className="h-5 w-5" />
            )}
          </Button>
        </form>

        {/* Status Messages */}
        {!chatId && (
          <div className="mt-3 text-center">
            <div className="glass-card rounded-xl p-3 border border-blue-200/50 dark:border-blue-800/50">
              <div className="flex items-center justify-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                <SparklesIcon className="w-4 h-4" />
                <span>Create a new chat or select an existing one to start conversations with Gemini AI</span>
              </div>
            </div>
          </div>
        )}

        {isTyping && (
          <div className="mt-3 flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-purple-600 dark:text-purple-400">
              <div className="typing-indicator">
                <div className="typing-dot bg-purple-500"></div>
                <div className="typing-dot bg-purple-500"></div>
                <div className="typing-dot bg-purple-500"></div>
              </div>
              <span className="font-medium">Gemini AI is thinking...</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Powered by Google's Gemini Pro
            </div>
          </div>
        )}

        {/* Enhanced Quick Actions for Gemini */}
        {chatId && !isTyping && message.length === 0 && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
              ✨ Try these with Gemini AI:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestionPrompts.slice(0, 4).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setMessage(suggestion)}
                  className="text-xs px-3 py-2 glass-card rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-200/30 dark:border-gray-700/30 hover:border-blue-300/50 dark:hover:border-blue-700/50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            
            {/* Gemini AI Features */}
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <div className="glass-subtle rounded-lg px-2 py-1 text-gray-500 dark:text-gray-400 border border-gray-200/30 dark:border-gray-700/30">
                🧠 Advanced reasoning
              </div>
              <div className="glass-subtle rounded-lg px-2 py-1 text-gray-500 dark:text-gray-400 border border-gray-200/30 dark:border-gray-700/30">
                🛡️ Safety filtered
              </div>
              <div className="glass-subtle rounded-lg px-2 py-1 text-gray-500 dark:text-gray-400 border border-gray-200/30 dark:border-gray-700/30">
                ⚡ Fast responses
              </div>
              <div className="glass-subtle rounded-lg px-2 py-1 text-gray-500 dark:text-gray-400 border border-gray-200/30 dark:border-gray-700/30">
                🌍 Multilingual
              </div>
            </div>
          </div>
        )}

        {/* Content Guidelines */}
        {chatId && !isTyping && message.length > 500 && (
          <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/20 rounded-lg p-2 border border-amber-200/50 dark:border-amber-800/50">
            💡 Tip: Shorter messages often get better responses from Gemini AI
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageInput