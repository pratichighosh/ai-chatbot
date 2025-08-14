import React, { useState, useEffect } from 'react'
import { Bars3Icon } from '@heroicons/react/24/outline'
import ChatList from './ChatList'
import ChatWindow from './ChatWindow'
import MessageInput from './MessageInput'

const ChatContainer = () => {
  const [selectedChatId, setSelectedChatId] = useState(null)
  const [selectedChatTitle, setSelectedChatTitle] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (!mobile) {
        setSidebarOpen(true)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSelectChat = (chatId, title) => {
    setSelectedChatId(chatId)
    setSelectedChatTitle(title)
    
    // Close sidebar on mobile after selecting chat
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex-1 flex overflow-hidden relative">
      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed' : 'relative'} 
        inset-y-0 left-0 z-40 w-80 
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${!isMobile ? 'translate-x-0' : ''}
      `}>
        <ChatList 
          onSelectChat={handleSelectChat}
          selectedChatId={selectedChatId}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatWindow 
          chatId={selectedChatId}
          chatTitle={selectedChatTitle}
        />
        <MessageInput chatId={selectedChatId} />
      </div>

      {/* Mobile Sidebar Toggle */}
      {isMobile && !sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-20 left-4 z-50 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}

export default ChatContainer