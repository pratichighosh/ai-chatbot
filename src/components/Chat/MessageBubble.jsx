import React, { useState } from 'react'
import { UserIcon, SparklesIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/solid'
import clsx from 'clsx'

const MessageBubble = ({ message, isUser, isLast }) => {
  const [copied, setCopied] = useState(false)

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className={clsx(
      'flex mb-6 group',
      isUser ? 'justify-end' : 'justify-start',
      'animate-fade-in'
    )}>
      <div className={clsx(
        'flex max-w-[80%] lg:max-w-[70%]',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}>
        {/* Enhanced Avatar */}
        <div className={clsx(
          'flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg relative',
          isUser 
            ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 ml-4' 
            : 'bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 mr-4'
        )}>
          {isUser ? (
            <UserIcon className="h-5 w-5 text-white" />
          ) : (
            <SparklesIcon className="h-5 w-5 text-white" />
          )}
          
          {/* Status indicator */}
          <div className={clsx(
            'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800',
            isUser ? 'bg-green-400' : 'bg-purple-400'
          )}></div>
        </div>

        {/* Enhanced Message Content */}
        <div className={clsx(
          'relative group/message',
          isUser ? 'items-end' : 'items-start'
        )}>
          {/* Message bubble */}
          <div className={clsx(
            'rounded-3xl px-6 py-4 shadow-lg relative overflow-hidden',
            'transform transition-all duration-200 hover:scale-[1.02]',
            isUser
              ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white rounded-br-lg'
              : 'glass-strong text-gray-800 dark:text-gray-200 rounded-bl-lg border border-gray-200/50 dark:border-gray-700/50'
          )}>
            {/* Background pattern for AI messages */}
            {!isUser && (
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500"></div>
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  <defs>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#grid)" />
                </svg>
              </div>
            )}

            {/* Message text */}
            <div className="relative z-10">
              <p className={clsx(
                'text-sm leading-relaxed whitespace-pre-wrap break-words',
                isUser ? 'text-white' : 'text-gray-800 dark:text-gray-200'
              )}>
                {message.content}
              </p>
            </div>

            {/* Timestamp and actions */}
            <div className={clsx(
              'flex items-center justify-between mt-3 pt-2 border-t',
              isUser 
                ? 'border-blue-400/30' 
                : 'border-gray-200/50 dark:border-gray-700/50'
            )}>
              <p className={clsx(
                'text-xs opacity-75',
                isUser 
                  ? 'text-blue-100' 
                  : 'text-gray-500 dark:text-gray-400'
              )}>
                {formatTime(message.created_at)}
              </p>

              {/* Copy button for AI messages */}
              {!isUser && (
                <button
                  onClick={copyToClipboard}
                  className={clsx(
                    'opacity-0 group-hover/message:opacity-100 transition-all duration-200',
                    'p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800',
                    'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  )}
                  title="Copy message"
                >
                  {copied ? (
                    <CheckIcon className="h-3 w-3" />
                  ) : (
                    <ClipboardDocumentIcon className="h-3 w-3" />
                  )}
                </button>
              )}
            </div>

            {/* Decorative elements */}
            {isUser && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-white/20 rounded-full"></div>
            )}
            
            {!isUser && (
              <>
                <div className="absolute top-2 left-2 w-1 h-1 bg-purple-400/40 rounded-full"></div>
                <div className="absolute bottom-2 right-2 w-1 h-1 bg-blue-400/40 rounded-full"></div>
              </>
            )}
          </div>

          {/* Message status indicators */}
          <div className={clsx(
            'flex items-center mt-1 px-2',
            isUser ? 'justify-end' : 'justify-start'
          )}>
            {isUser && (
              <div className="flex items-center space-x-1 text-xs text-gray-400">
                <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                <span>Delivered</span>
              </div>
            )}
            
            {!isUser && isLast && (
              <div className="flex items-center space-x-1 text-xs text-gray-400">
                <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
                <span>AI Assistant</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessageBubble