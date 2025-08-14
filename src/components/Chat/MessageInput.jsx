import React, { useState, useRef, useEffect } from 'react'
import { PaperAirplaneIcon, MicrophoneIcon } from '@heroicons/react/24/solid'
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

  return (
    <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
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
                    ? "AI is typing..." 
                    : "Type your message..."
              }
              disabled={!chatId || isTyping}
              className="w-full resize-none rounded-2xl glass placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent px-4 py-3 text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed custom-scrollbar"
              rows="1"
              style={{ 
                minHeight: '44px', 
                maxHeight: '120px',
                fontFamily: 'inherit'
              }}
            />
            
            {/* Character Counter (only show when approaching limit) */}
            {message.length > 800 && (
              <div className="absolute bottom-1 right-12 text-xs text-gray-400">
                {1000 - message.length}
              </div>
            )}
          </div>

          {/* Send Button */}
          <Button
            type="submit"
            disabled={!message.trim() || !chatId || isTyping}
            loading={isTyping}
            className="rounded-2xl p-3 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              !chatId 
                ? "Select a chat first" 
                : !message.trim() 
                  ? "Enter a message" 
                  : isTyping 
                    ? "AI is responding..." 
                    : "Send message"
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
          <div className="mt-2 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              💡 Create a new chat or select an existing one to start conversations
            </p>
          </div>
        )}

        {isTyping && (
          <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
            <span>AI is thinking...</span>
          </div>
        )}

        {/* Quick Actions (when not typing) */}
        {chatId && !isTyping && message.length === 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "Hello! How can you help me today?",
              "Explain something complex in simple terms",
              "Help me brainstorm ideas",
              "What are the latest trends?"
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setMessage(suggestion)}
                className="text-xs px-3 py-1.5 glass rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageInput