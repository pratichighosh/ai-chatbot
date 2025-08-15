import React, { useState } from 'react'
import { useQuery } from '@apollo/client'
import { PlusIcon, ChatBubbleLeftIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline'
import { GET_CHATS } from '../../graphql/queries'
import { useChat } from '../../hooks/useChat'
import Button from '../UI/Button'
import clsx from 'clsx'

const ChatList = ({ onSelectChat, selectedChatId }) => {
  const { data, loading } = useQuery(GET_CHATS)
  const { createNewChat } = useChat()
  const [creatingChat, setCreatingChat] = useState(false)

  const handleNewChat = async () => {
    setCreatingChat(true)
    try {
      const newChat = await createNewChat()
      onSelectChat(newChat.id, newChat.title)
    } catch (error) {
      console.error('Failed to create chat:', error)
    } finally {
      setCreatingChat(false)
    }
  }

  const formatLastMessage = (messages) => {
    if (!messages || messages.length === 0) return 'No messages yet'
    const lastMessage = messages[0]
    const preview = lastMessage.content.length > 50 
      ? lastMessage.content.substring(0, 50) + '...'
      : lastMessage.content
    return `${lastMessage.role === 'user' ? 'You: ' : 'AI: '}${preview}`
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
    
    return date.toLocaleDateString()
  }

  return (
    <div className="w-80 glass-strong border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Chats
        </h1>
        <Button
          onClick={handleNewChat}
          loading={creatingChat}
          className="w-full rounded-xl shadow-lg"
          size="lg"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="mb-4 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : data?.chats?.length === 0 ? (
          <div className="flex items-center justify-center h-full p-6">
            <div className="text-center">
              <ChatBubbleLeftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No chats yet. Create your first chat to get started!
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3">
            {data.chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id, chat.title)}
                className={clsx(
                  'p-4 rounded-xl cursor-pointer transition-all duration-200 mb-2 group hover:shadow-lg',
                  selectedChatId === chat.id
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                    : 'hover:bg-white/70 dark:hover:bg-gray-800/70 glass'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className={clsx(
                      'font-medium truncate mb-1',
                      selectedChatId === chat.id
                        ? 'text-white'
                        : 'text-gray-800 dark:text-gray-200'
                    )}>
                      {chat.title}
                    </h3>
                    <p className={clsx(
                      'text-sm truncate',
                      selectedChatId === chat.id
                        ? 'text-blue-100'
                        : 'text-gray-500 dark:text-gray-400'
                    )}>
                      {formatLastMessage(chat.messages)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end ml-2">
                    <span className={clsx(
                      'text-xs',
                      selectedChatId === chat.id
                        ? 'text-blue-100'
                        : 'text-gray-400'
                    )}>
                      {formatTime(chat.updated_at)}
                    </span>
                    <div className={clsx(
                      'text-xs px-2 py-1 rounded-full mt-2',
                      selectedChatId === chat.id
                        ? 'bg-white/20 text-blue-100'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    )}>
                      {chat.messages_aggregate.aggregate.count}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatList