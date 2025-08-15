// src/components/Chat/ChatList.jsx
import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { PlusIcon, ChatBubbleLeftIcon, TrashIcon } from '@heroicons/react/24/outline'
import { GET_CHATS } from '../../graphql/queries'
import { DELETE_CHAT } from '../../graphql/mutations'
import { useChat } from '../../hooks/useChat'
import Button from '../UI/Button'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const ChatList = ({ onSelectChat, selectedChatId }) => {
  const { data, loading, error, refetch } = useQuery(GET_CHATS, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  })
  const { createNewChat } = useChat()
  const [creatingChat, setCreatingChat] = useState(false)
  const [deletingChatId, setDeletingChatId] = useState(null)

  const [deleteChat] = useMutation(DELETE_CHAT, {
    onCompleted: () => {
      toast.success('Chat deleted successfully')
      refetch()
      if (selectedChatId === deletingChatId) onSelectChat(null, '')
      setDeletingChatId(null)
    },
    onError: () => toast.error('Failed to delete chat')
  })

  const handleDelete = (chatId) => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      setDeletingChatId(chatId)
      deleteChat({ variables: { id: chatId } })
    }
  }

  const handleNewChat = async () => {
    setCreatingChat(true)
    try {
      const newChat = await createNewChat()
      onSelectChat(newChat.id, newChat.title)
      toast.success('New chat created!')
    } catch (error) {
      toast.error('Failed to create chat.')
    } finally {
      setCreatingChat(false)
    }
  }

  const formatTime = (timestamp) => {
    // ... (keep existing)
  }

  const formatLastMessage = (messages) => {
    // ... (keep existing)
  }

  return (
    <div className="h-full glass-strong border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col lg:w-80 w-full max-w-xs lg:max-w-none">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
            <ChatBubbleLeftIcon className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Conversations
          </h1>
        </div>
        <Button
          onClick={handleNewChat}
          loading={creatingChat}
          className="w-full rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
          size="lg"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          {creatingChat ? 'Creating...' : 'New Conversation'}
        </Button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center p-6 text-red-600 dark:text-red-400">
            Failed to load conversations. Try refreshing.
          </div>
        ) : !data?.chats?.length ? (
          <div className="text-center p-6 text-gray-500 dark:text-gray-400">
            No conversations yet. Create one to start!
          </div>
        ) : (
          data.chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id, chat.title)}
              className={clsx(
                'group p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:bg-white/80 dark:hover:bg-gray-800/80 glass flex items-start justify-between',
                selectedChatId === chat.id && 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
              )}
            >
              <div className="flex-1">
                <h3 className="font-medium text-sm truncate">{chat.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {formatLastMessage(chat.messages)}
                </p>
                <span className="text-xs text-gray-400">{formatTime(chat.updated_at)}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(chat.id);
                }}
                className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ChatList