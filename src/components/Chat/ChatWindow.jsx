import React, { useEffect, useRef, useState } from 'react'
import { useSubscription } from '@apollo/client'
import { SUBSCRIBE_MESSAGES } from '../../graphql/subscriptions'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import MessageInput from './MessageInput'
import { useChat } from '../../hooks/useChat'
import { MESSAGE_ROLES } from '../../utils/constants'
import { ChevronDownIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'

const ChatWindow = ({ chatId, chatTitle }) => {
  const { data, loading } = useSubscription(SUBSCRIBE_MESSAGES, {
    variables: { chat_id: chatId },
    skip: !chatId
  })
  const { isTyping } = useChat()
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const [isNearBottom, setIsNearBottom] = useState(true)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight
      const nearBottom = distanceFromBottom < 100
      
      setIsNearBottom(nearBottom)
      setShowScrollToBottom(!nearBottom && scrollHeight > clientHeight)
    }
  }

  // Auto-scroll when new messages arrive (only if user is near bottom)
  useEffect(() => {
    if (isNearBottom) {
      scrollToBottom()
    }
  }, [data, isTyping, isNearBottom])

  if (!chatId) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl p-2">
              <img 
                src="/Screenshot__291_-removebg-preview.png" 
                alt="AI Assistant Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
              Welcome to AI Assistant
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
              Start a conversation by selecting a chat or creating a new one. 
              Ask questions, get explanations, or just chat!
            </p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="glass p-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="text-blue-500 dark:text-blue-400 mb-2">💡</div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 text-xs">Smart Answers</h4>
              </div>
              
              <div className="glass p-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="text-green-500 dark:text-green-400 mb-2">⚡</div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 text-xs">Fast Responses</h4>
              </div>
            </div>
          </div>
        </div>
        
        {/* Message Input - Always visible */}
        <MessageInput chatId={null} />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
            <div className="relative">
              <div className="w-8 h-8 border-2 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-500 dark:border-t-blue-400"></div>
            </div>
            <div>
              <p className="font-medium">Loading messages...</p>
            </div>
          </div>
        </div>
        
        {/* Message Input - Always visible */}
        <MessageInput chatId={chatId} />
      </div>
    )
  }

  const messages = data?.messages || []

  return (
    <div className="h-full flex flex-col">
      {/* Clean Header */}
      <div className="flex-shrink-0 glass-strong border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <ChatBubbleLeftIcon className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 truncate max-w-xs">
                {chatTitle || 'Chat'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                <span>{messages.length} messages</span>
                {isTyping && (
                  <>
                    <span>•</span>
                    <span className="text-blue-500 dark:text-blue-400 flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"></div>
                      <span>AI is typing...</span>
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="px-2 py-1 glass rounded-full text-xs font-medium text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container - FIXED SCROLL */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-scroll custom-scrollbar px-6 py-6 bg-gradient-to-b from-gray-50/30 to-white dark:from-gray-900/30 dark:to-gray-800/30 min-h-0"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[300px]">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg p-2">
                <img 
                  src="/Screenshot__291_-removebg-preview.png" 
                  alt="AI Assistant Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Start the conversation
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Send a message below to begin chatting with your AI assistant.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isUser={message.role === MESSAGE_ROLES.USER}
                isLast={index === messages.length - 1}
              />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollToBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-6 w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group z-10"
          title="Scroll to bottom"
        >
          <ChevronDownIcon className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
        </button>
      )}

      {/* MESSAGE INPUT - ALWAYS AT BOTTOM */}
      <MessageInput chatId={chatId} />
    </div>
  )
}

export default ChatWindow