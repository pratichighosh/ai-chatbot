import React, { useEffect, useRef, useState } from 'react'
import { useSubscription } from '@apollo/client'
import { SUBSCRIBE_MESSAGES } from '../../graphql/subscriptions'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import { useChat } from '../../hooks/useChat'
import { MESSAGE_ROLES } from '../../utils/constants'
import { ChevronDownIcon, SparklesIcon } from '@heroicons/react/24/outline'

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
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50/30 via-white/50 to-purple-50/30 dark:from-gray-900/30 dark:via-gray-800/50 dark:to-purple-900/30">
        <div className="text-center max-w-lg mx-auto px-6">
          <div className="relative mb-8">
            {/* Main Gemini Logo */}
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 relative overflow-hidden">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-indigo-500 opacity-20 animate-pulse"></div>
              
              <SparklesIcon className="w-16 h-16 text-white relative z-10" />
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              🧠
            </div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '0.5s' }}>
              ⚡
            </div>
          </div>
          
          <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 dark:from-gray-200 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
            Welcome to Gemini AI
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-8">
            Start a conversation with Google's most advanced AI. 
            Ask questions, get explanations, or just chat! 🚀
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
            <div className="glass-card p-4 rounded-2xl border border-blue-200/50 dark:border-blue-800/50 hover:shadow-lg transition-all duration-200">
              <div className="text-2xl mb-3">🧠</div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Advanced Reasoning</h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs">Powered by Google's Gemini Pro for intelligent conversations</p>
            </div>
            
            <div className="glass-card p-4 rounded-2xl border border-purple-200/50 dark:border-purple-800/50 hover:shadow-lg transition-all duration-200">
              <div className="text-2xl mb-3">🛡️</div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Safety First</h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs">Built-in safety filters for responsible AI interactions</p>
            </div>
            
            <div className="glass-card p-4 rounded-2xl border border-green-200/50 dark:border-green-800/50 hover:shadow-lg transition-all duration-200">
              <div className="text-2xl mb-3">⚡</div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Fast & Reliable</h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs">Quick responses with high-quality answers</p>
            </div>
            
            <div className="glass-card p-4 rounded-2xl border border-orange-200/50 dark:border-orange-800/50 hover:shadow-lg transition-all duration-200">
              <div className="text-2xl mb-3">🌍</div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Multilingual</h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs">Communicate in multiple languages naturally</p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="glass-card p-4 rounded-2xl border border-indigo-200/50 dark:border-indigo-800/50">
            <p className="text-indigo-600 dark:text-indigo-400 font-medium text-sm">
              💡 Ready to explore? Create a new chat or select an existing conversation to begin!
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-purple-200 dark:border-purple-800 rounded-full animate-spin border-t-purple-500 dark:border-t-purple-400"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent rounded-full animate-ping border-t-purple-300 dark:border-t-purple-600"></div>
          </div>
          <div>
            <p className="font-medium flex items-center space-x-2">
              <SparklesIcon className="w-4 h-4" />
              <span>Loading messages...</span>
            </p>
            <p className="text-sm opacity-75">Connecting to Gemini AI</p>
          </div>
        </div>
      </div>
    )
  }

  const messages = data?.messages || []

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Enhanced Chat Header */}
      <div className="glass-strong border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 truncate max-w-xs flex items-center space-x-2">
                <span>{chatTitle || 'Chat'}</span>
                <div className="text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-1 rounded-full">
                  Gemini
                </div>
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                <span>{messages.length} messages</span>
                {isTyping && (
                  <>
                    <span>•</span>
                    <span className="text-purple-500 dark:text-purple-400 flex items-center space-x-1">
                      <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full animate-pulse"></div>
                      <span>AI is thinking...</span>
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="px-3 py-1 glass rounded-full text-xs font-medium text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-800/50">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Online</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100/50 dark:bg-gray-800/50 px-2 py-1 rounded-lg">
              Powered by Google
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Messages Container */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6 bg-gradient-to-b from-transparent via-blue-50/20 to-purple-50/20 dark:via-gray-900/20 dark:to-purple-900/20 relative"
        style={{ 
          scrollBehavior: 'smooth',
          overflowAnchor: 'none' 
        }}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-200 to-blue-200 dark:from-purple-800 dark:to-blue-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <SparklesIcon className="w-10 h-10 text-purple-500 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Start your conversation with Gemini
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4">
                Ask anything you'd like to know! Gemini AI is ready to help with explanations, 
                analysis, creative tasks, and much more. 💬
              </p>
              
              {/* Example prompts */}
              <div className="space-y-2 text-xs">
                <p className="text-gray-400 dark:text-gray-500 font-medium">Try asking:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="glass px-2 py-1 rounded-lg text-gray-600 dark:text-gray-400">"Explain quantum computing"</span>
                  <span className="glass px-2 py-1 rounded-lg text-gray-600 dark:text-gray-400">"Help with my project"</span>
                  <span className="glass px-2 py-1 rounded-lg text-gray-600 dark:text-gray-400">"Creative writing ideas"</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isUser={message.role === MESSAGE_ROLES.USER}
                isLast={index === messages.length - 1}
              />
            ))}
            {isTyping && <TypingIndicator />}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Scroll to Bottom Button */}
      {showScrollToBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-6 w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group z-10"
          title="Scroll to bottom"
        >
          <ChevronDownIcon className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
        </button>
      )}
    </div>
  )
}

export default ChatWindow