// Fixed ChatList.jsx - Remove days_old reference
import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { PlusIcon, ChatBubbleLeftIcon, TrashIcon, PencilIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline'
import { GET_CHATS } from '../../graphql/queries'
import { DELETE_CHAT, UPDATE_CHAT_TITLE } from '../../graphql/mutations'
import { useChat } from '../../hooks/useChat'
import Button from '../UI/Button'
import { ConfirmModal } from '../UI/Modal'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const ChatList = ({ onSelectChat, selectedChatId }) => {
  const { data, loading, error } = useQuery(GET_CHATS, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  })
  
  const [deleteChat] = useMutation(DELETE_CHAT, {
    refetchQueries: [{ query: GET_CHATS }],
    awaitRefetchQueries: true,
  })
  
  const [updateChatTitle] = useMutation(UPDATE_CHAT_TITLE, {
    refetchQueries: [{ query: GET_CHATS }],
  })

  const { createNewChat } = useChat()
  const [creatingChat, setCreatingChat] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, chatId: null, chatTitle: '' })
  const [editingChat, setEditingChat] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [activeMenu, setActiveMenu] = useState(null)

  const handleNewChat = async () => {
    setCreatingChat(true)
    try {
      const newChat = await createNewChat()
      onSelectChat(newChat.id, newChat.title)
      toast.success('🎉 New chat created!')
    } catch (error) {
      console.error('Failed to create chat:', error)
      toast.error('Failed to create chat. Please try again.')
    } finally {
      setCreatingChat(false)
    }
  }

  const handleDeleteChat = async (chatId) => {
    try {
      await deleteChat({ variables: { id: chatId } })
      if (selectedChatId === chatId) {
        onSelectChat(null, '')
      }
      toast.success('🗑️ Chat deleted successfully')
      setDeleteModal({ isOpen: false, chatId: null, chatTitle: '' })
    } catch (error) {
      console.error('❌ Failed to delete chat:', error)
      toast.error('Failed to delete chat')
    }
  }

  const handleEditTitle = async (chatId) => {
    if (!editTitle.trim()) {
      toast.error('Chat title cannot be empty')
      return
    }

    try {
      await updateChatTitle({
        variables: { id: chatId, title: editTitle.trim() }
      })
      setEditingChat(null)
      setEditTitle('')
      toast.success('✏️ Chat title updated')
    } catch (error) {
      console.error('❌ Failed to update title:', error)
      toast.error('Failed to update title')
    }
  }

  const startEditing = (chat) => {
    setEditingChat(chat.id)
    setEditTitle(chat.title)
    setActiveMenu(null)
  }

  const cancelEditing = () => {
    setEditingChat(null)
    setEditTitle('')
  }

  const openDeleteModal = (chat) => {
    setDeleteModal({ 
      isOpen: true, 
      chatId: chat.id, 
      chatTitle: chat.title 
    })
    setActiveMenu(null)
  }

  // FIXED: formatTime function without days_old reference
  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffMs = now - date
      const diffMinutes = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)
      
      if (diffMinutes < 1) return 'Just now'
      if (diffMinutes < 60) return `${diffMinutes}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays < 7) return `${diffDays}d ago`
      
      return date.toLocaleDateString()
    } catch (error) {
      console.error('Error formatting time:', error)
      return 'Unknown'
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

  return (
    <div className="h-full glass-strong border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col shadow-xl">
      {/* Enhanced Header */}
      <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-gray-800/50 dark:to-purple-900/50">
        <div className="flex items-center space-x-3 mb-4">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <ChatBubbleLeftIcon className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 dark:from-gray-200 dark:to-blue-400 bg-clip-text text-transparent">
              Conversations
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Powered by Gemini AI ✨
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleNewChat}
          loading={creatingChat}
          className="w-full rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700"
          size="lg"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          {creatingChat ? 'Creating...' : 'New Conversation'}
        </Button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="glass rounded-2xl p-4 animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-2xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <ChatBubbleLeftIcon className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-2">
                Failed to load chats
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        ) : !data?.chats?.length ? (
          <div className="flex items-center justify-center h-full p-6">
            <div className="text-center max-w-sm">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <ChatBubbleLeftIcon className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No conversations yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Start your first conversation with Gemini AI! Click the button above to begin. 🚀
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {data.chats.map((chat, index) => (
              <div
                key={chat.id}
                className={clsx(
                  'group relative rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden',
                  'hover:shadow-lg hover:scale-[1.02] stagger-item',
                  selectedChatId === chat.id
                    ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white shadow-xl scale-[1.02]'
                    : 'glass hover:bg-white/90 dark:hover:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50'
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div 
                  className="p-4"
                  onClick={() => onSelectChat(chat.id, chat.title)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-3">
                      {editingChat === chat.id ? (
                        <div className="space-y-3" onClick={e => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full bg-white/20 border border-white/30 rounded-xl px-3 py-2 text-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                            placeholder="Enter chat title..."
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleEditTitle(chat.id)
                              if (e.key === 'Escape') cancelEditing()
                            }}
                          />
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleEditTitle(chat.id)}
                              className="bg-white/20 hover:bg-white/30 text-white text-xs px-4 py-1 rounded-lg"
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={cancelEditing}
                              className="text-white/80 hover:text-white hover:bg-white/10 text-xs px-4 py-1 rounded-lg"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className={clsx(
                            'font-semibold truncate mb-2 text-sm',
                            selectedChatId === chat.id
                              ? 'text-white'
                              : 'text-gray-800 dark:text-gray-200'
                          )}>
                            {chat.title}
                          </h3>
                          <p className={clsx(
                            'text-xs truncate leading-relaxed mb-2',
                            selectedChatId === chat.id
                              ? 'text-blue-100'
                              : 'text-gray-500 dark:text-gray-400'
                          )}>
                            {formatLastMessage(chat.messages)}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className={clsx(
                              'text-xs',
                              selectedChatId === chat.id
                                ? 'text-blue-100'
                                : 'text-gray-400'
                            )}>
                              {formatTime(chat.updated_at)}
                            </span>
                            <div className={clsx(
                              'text-xs px-2 py-1 rounded-full font-medium',
                              selectedChatId === chat.id
                                ? 'bg-white/20 text-blue-100'
                                : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                            )}>
                              {chat.messages_aggregate.aggregate.count}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {/* Action Menu */}
                    {editingChat !== chat.id && (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveMenu(activeMenu === chat.id ? null : chat.id)
                          }}
                          className={clsx(
                            'p-2 rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100',
                            selectedChatId === chat.id
                              ? 'text-white/80 hover:text-white hover:bg-white/20'
                              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          )}
                        >
                          <EllipsisVerticalIcon className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenu === chat.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 glass-strong border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-xl z-10 py-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                startEditing(chat)
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-2"
                            >
                              <PencilIcon className="w-4 h-4" />
                              <span>Rename</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                openDeleteModal(chat)
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                            >
                              <TrashIcon className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected chat indicator */}
                {selectedChatId === chat.id && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/30 to-purple-50/30 dark:from-gray-800/30 dark:to-purple-900/30">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center space-y-1">
          <div>{data?.chats?.length || 0} total conversations</div>
          <div className="flex items-center justify-center space-x-1">
            <span>⚡ Powered by</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">Google Gemini</span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, chatId: null, chatTitle: '' })}
        onConfirm={() => handleDeleteChat(deleteModal.chatId)}
        title="Delete Conversation"
        message={
          <div>
            <p className="mb-2">Are you sure you want to delete this conversation?</p>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              "{deleteModal.chatTitle}"
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
              This action cannot be undone.
            </p>
          </div>
        }
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Click outside to close menu */}
      {activeMenu && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setActiveMenu(null)}
        />
      )}
    </div>
  )
}

export default ChatList