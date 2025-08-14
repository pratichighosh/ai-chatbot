import React from 'react'
import { UserIcon, SparklesIcon } from '@heroicons/react/24/solid'
import clsx from 'clsx'

const MessageBubble = ({ message, isUser }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className={clsx(
      'flex mb-4 message-enter',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      <div className={clsx(
        'flex max-w-xs lg:max-w-md',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}>
        {/* Avatar */}
        <div className={clsx(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser 
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 ml-3' 
            : 'bg-gradient-to-r from-purple-500 to-pink-600 mr-3'
        )}>
          {isUser ? (
            <UserIcon className="h-4 w-4 text-white" />
          ) : (
            <SparklesIcon className="h-4 w-4 text-white" />
          )}
        </div>

        {/* Message Content */}
        <div className={clsx(
          'rounded-2xl px-4 py-3 shadow-lg',
          isUser
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
            : 'glass text-gray-800 dark:text-gray-200'
        )}>
          <p className="text-sm leading-relaxed">{message.content}</p>
          <p className={clsx(
            'text-xs mt-2 opacity-75',
            isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
          )}>
            {formatTime(message.created_at)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default MessageBubble