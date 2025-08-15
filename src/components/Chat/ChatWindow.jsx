// src/components/Chat/ChatWindow.jsx
import React, { useEffect, useRef } from 'react'
import { useSubscription } from '@apollo/client'
import { SUBSCRIBE_MESSAGES } from '../../graphql/subscriptions'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import { useChat } from '../../hooks/useChat'
import { MESSAGE_ROLES } from '../../utils/constants'

const ChatWindow = ({ chatId, chatTitle }) => {
  const { data, loading } = useSubscription(SUBSCRIBE_MESSAGES, {
    variables: { chat_id: chatId },
    skip: !chatId
  })
  const { isTyping } = useChat()
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  // Auto-scroll to bottom on new message or typing
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [data, isTyping])

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-900/50">
        <div className="text-center p-6 rounded-2xl glass-strong shadow-xl">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Welcome to AI Chatbot
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            Start a conversation or select an existing chat. Our AI is ready to assist you with anything!
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <span>Loading conversation...</span>
        </div>
      </div>
    )
  }

  const messages = data?.messages || []

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="glass-strong border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4 sticky top-0 z-10 backdrop-blur-md">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 truncate">
          {chatTitle || 'Conversation'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {messages.length} messages
        </p>
      </div>

      {/* Messages - Reverse flex for bottom alignment */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto custom-scrollbar px-4 py-6 bg-gradient-to-b from-transparent to-gray-50/20 dark:to-gray-900/20 flex flex-col-reverse"
      >
        <div className="flex flex-col space-y-4">
          {isTyping && <TypingIndicator />}
          {messages.slice().reverse().map((message) => (  // Reverse for display (newest at bottom)
            <MessageBubble
              key={message.id}
              message={message}
              isUser={message.role === MESSAGE_ROLES.USER}
            />
          ))}
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <p>Start the conversation below...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatWindow