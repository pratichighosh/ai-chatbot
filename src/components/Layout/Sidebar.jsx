// src/components/Layout/Sidebar.jsx - Updated to use new queries
import React, { useState } from 'react'
import {
  ChatBubbleLeftIcon,
  PlusIcon,
  Bars3Icon,
  XMarkIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { useQuery, useMutation } from '@apollo/client'
import { useUserData } from '@nhost/react'
import { DELETE_CHAT, UPDATE_CHAT_TITLE } from '../../graphql/mutations'
import { GET_CHATS, GET_CHATS_WITH_USER_FILTER } from '../../graphql/queries'
import { useChat } from '../../hooks/useChat'
import Button from '../UI/Button'
import { ConfirmModal } from '../UI/Modal'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const Sidebar = ({ 
  onSelectChat, 
  selectedChatId, 
  isOpen = true, 
  onToggle 
}) => {
  const user = useUserData()
  
  // Try permissions-based query first, fallback to explicit filtering
  const { data, loading, error } = useQuery(GET_CHATS, {
    skip: !user?.id,
    errorPolicy: 'all',
    onError: (error) => {
      console.log('🔍 Permissions-based query failed:', error.message)
    }
  })

  // Fallback query with explicit user filtering
  const { data: fallbackData, loading: fallbackLoading } = useQuery(GET_CHATS_WITH_USER_FILTER, {
    variables: { user_id: user?.id },
    skip: !user?.id || !error, // Only run if main query failed
    errorPolicy: 'all'
  })

  // Use main data or fallback data
  const chatsData = data || fallbackData
  const isLoading = loading || fallbackLoading

  const { createNewChat } = useChat()
  const [deleteChat] = useMutation(DELETE_CHAT, {
    refetchQueries: [
      { query: GET_CHATS },
      { query: GET_CHATS_WITH_USER_FILTER, variables: { user_id: user?.id } }
    ]
  })
  const [updateChatTitle] = useMutation(UPDATE_CHAT_TITLE)
  
  const [creatingChat, setCreatingChat] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, chatId: null })
  const [editingChat, setEditingChat] = useState(null)
  const [editTitle, setEditTitle] = useState('')

  // Enhanced debug logging
  console.log('🔍 Sidebar Debug:', {
    user: user ? { id: user.id, email: user.email } : null,
    isOpen,
    hasOnToggle: !!onToggle,
    loading: isLoading,
    error: error?.message,
    mainData: data?.chats?.length,
    fallbackData: fallbackData?.chats?.length,
    usingFallback: !data && !!fallbackData,
    chatsCount: chatsData?.chats?.length,
    selectedChatId,
    querySkipped: !user?.id
  })

  const handleNewChat = async () => {
    if (!user?.id) {
      toast.error('Please log in to create a chat')
      return
    }

    setCreatingChat(true)
    try {
      console.log('📝 Creating new chat for user:', user.id)
      const newChat = await createNewChat()
      console.log('✅ New chat created:', newChat)
      onSelectChat(newChat.id, newChat.title)
      toast.success('New chat created!')
    } catch (error) {
      console.error('❌ Failed to create chat:', error)
      
      // Enhanced error handling
      if (error.message.includes('user_id')) {
        toast.error('Authentication error. Please refresh the page and try again.')
      } else if (error.message.includes('permission')) {
        toast.error('Permission denied. Please check your account permissions.')
      } else if (error.message.includes('Not-NULL violation')) {
        toast.error('Database error: Missing required fields. Please contact support.')
      } else {
        toast.error('Failed to create chat. Please try again.')
      }
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
      toast.success('Chat deleted')
    } catch (error) {
      console.error('❌ Failed to delete chat:', error)
      toast.error('Failed to delete chat')
    }
  }

  const handleEditTitle = async (chatId) => {
    if (!editTitle.trim()) return

    try {
      await updateChatTitle({
        variables: { id: chatId, title: editTitle.trim() }
      })
      setEditingChat(null)
      setEditTitle('')
      toast.success('Chat title updated')
    } catch (error) {
      console.error('❌ Failed to update title:', error)
      toast.error('Failed to update title')
    }
  }

  const startEditing = (chat) => {
    setEditingChat(chat.id)
    setEditTitle(chat.title)
  }

  const cancelEditing = () => {
    setEditingChat(null)
    setEditTitle('')
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

  const formatLastMessage = (messages) => {
    if (!messages || messages.length === 0) return 'No messages yet'
    const lastMessage = messages[0]
    const preview = lastMessage.content.length > 40 
      ? lastMessage.content.substring(0, 40) + '...'
      : lastMessage.content
    return `${lastMessage.role === 'user' ? 'You: ' : 'AI: '}${preview}`
  }

  // Show hamburger button only on mobile when closed
  if (!isOpen && onToggle && window.innerWidth < 1024) {
    return (
      <Button
        onClick={onToggle}
        variant="ghost"
        size="sm"
        className="fixed top-20 left-4 z-40 lg:hidden bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg"
      >
        <Bars3Icon className="w-5 h-5" />
      </Button>
    )
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && onToggle && window.innerWidth < 1024 && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        'w-80 flex flex-col h-full bg-white/85 dark:bg-gray-800/85 border-r border-gray-200/50 dark:border-gray-700/50',
        'fixed lg:relative inset-y-0 left-0 z-40',
        window.innerWidth < 1024 ? (
          isOpen ? 'translate-x-0' : '-translate-x-full'
        ) : 'translate-x-0',
        'transform transition-transform duration-300 ease-in-out lg:transform-none',
        'backdrop-blur-sm shadow-lg'
      )}>
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <ChatBubbleLeftIcon className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Chats
              </h1>
            </div>
            
            {onToggle && window.innerWidth < 1024 && (
              <Button
                onClick={onToggle}
                variant="ghost"
                size="sm"
                className="lg:hidden"
              >
                <XMarkIcon className="w-5 h-5" />
              </Button>
            )}
          </div>

          <Button
            onClick={handleNewChat}
            loading={creatingChat}
            disabled={creatingChat || !user?.id}
            className="w-full rounded-xl shadow-lg hover-lift bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white disabled:opacity-50"
            size="lg"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            {creatingChat ? 'Creating...' : 'New Chat'}
          </Button>
        </div>

        {/* Enhanced Debug Info in Development */}
        {import.meta.env.DEV && (
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900 border-b text-xs space-y-1">
            <div><strong>User:</strong> {user ? `${user.email} (${user.id.substring(0, 8)})` : 'None'}</div>
            <div><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</div>
            <div><strong>Error:</strong> {error ? error.message.substring(0, 50) : 'None'}</div>
            <div><strong>Main Query:</strong> {data ? `${data.chats?.length} chats` : 'Failed'}</div>
            <div><strong>Fallback Query:</strong> {fallbackData ? `${fallbackData.chats?.length} chats` : 'Not used'}</div>
            <div><strong>Total Chats:</strong> {chatsData?.chats?.length || 0}</div>
            {chatsData?.chats?.length > 0 && (
              <div><strong>Sample Chat Owner:</strong> {chatsData.chats[0].user_id.substring(0, 8)}</div>
            )}
          </div>
        )}

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {!user?.id ? (
            <div className="flex items-center justify-center h-full p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ChatBubbleLeftIcon className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Please log in to view your chats
                </p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl p-4 animate-pulse">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : error && !fallbackData ? (
            <div className="flex items-center justify-center h-full p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ChatBubbleLeftIcon className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-2">
                  Error loading chats
                </p>
                <p className="text-red-500 dark:text-red-400 text-xs mb-4">
                  {error.message}
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={() => window.location.reload()}
                    size="sm"
                    variant="danger"
                  >
                    Reload
                  </Button>
                  <div className="text-xs text-gray-500">
                    Check Hasura permissions setup
                  </div>
                </div>
              </div>
            </div>
          ) : chatsData?.chats?.length === 0 ? (
            <div className="flex items-center justify-center h-full p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ChatBubbleLeftIcon className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No chats yet. Create your first chat to get started!
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                  Click the "New Chat" button above
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {chatsData.chats.map((chat, index) => (
                <div
                  key={chat.id}
                  className={clsx(
                    'group relative rounded-xl transition-all duration-200 cursor-pointer hover-lift stagger-item',
                    selectedChatId === chat.id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'bg-white/70 dark:bg-gray-800/70 hover:bg-white/90 dark:hover:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50'
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div 
                    className="p-4"
                    onClick={() => onSelectChat(chat.id, chat.title)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {editingChat === chat.id ? (
                          <div className="space-y-2" onClick={e => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-1 text-sm text-white placeholder-white/70"
                              placeholder="Chat title..."
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
                                className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1"
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={cancelEditing}
                                className="text-white/80 hover:text-white hover:bg-white/10 text-xs px-3 py-1"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <h3 className={clsx(
                              'font-medium truncate mb-1 text-sm',
                              selectedChatId === chat.id
                                ? 'text-white'
                                : 'text-gray-800 dark:text-gray-200'
                            )}>
                              {chat.title}
                            </h3>
                            <p className={clsx(
                              'text-xs truncate leading-relaxed',
                              selectedChatId === chat.id
                                ? 'text-blue-100'
                                : 'text-gray-500 dark:text-gray-400'
                            )}>
                              {formatLastMessage(chat.messages)}
                            </p>
                            {/* Debug info for development */}
                            {import.meta.env.DEV && (
                              <p className="text-xs opacity-50 mt-1">
                                Owner: {chat.user_id.substring(0, 8)}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end ml-3 space-y-2">
                        <span className={clsx(
                          'text-xs',
                          selectedChatId === chat.id
                            ? 'text-blue-100'
                            : 'text-gray-400'
                        )}>
                          {formatTime(chat.updated_at)}
                        </span>
                        
                        <div className={clsx(
                          'text-xs px-2 py-1 rounded-full',
                          selectedChatId === chat.id
                            ? 'bg-white/20 text-blue-100'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        )}>
                          {chat.messages_aggregate.aggregate.count}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {editingChat !== chat.id && (
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          startEditing(chat)
                        }}
                        className={clsx(
                          'p-1.5',
                          selectedChatId === chat.id
                            ? 'text-white/80 hover:text-white hover:bg-white/10'
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        )}
                      >
                        <PencilIcon className="w-3 h-3" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteModal({ isOpen: true, chatId: chat.id })
                        }}
                        className={clsx(
                          'p-1.5',
                          selectedChatId === chat.id
                            ? 'text-red-200 hover:text-red-100 hover:bg-red-500/20'
                            : 'text-red-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                        )}
                      >
                        <TrashIcon className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {chatsData?.chats?.length || 0} total chats
            {!data && fallbackData && (
              <div className="text-yellow-600 mt-1">Using fallback query</div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, chatId: null })}
        onConfirm={() => handleDeleteChat(deleteModal.chatId)}
        title="Delete Chat"
        message="Are you sure you want to delete this chat? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  )
}

export default Sidebar