import React, { useEffect, useRef, useState } from 'react';
import { useSubscription } from '@apollo/client';
import { SUBSCRIBE_MESSAGES } from '../../graphql/subscriptions'; // Correct path
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { useChat } from '../../hooks/useChat';
import { MESSAGE_ROLES } from '../../utils/constants';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const ChatWindow = ({ chatId, chatTitle }) => {
  const { data, loading } = useSubscription(SUBSCRIBE_MESSAGES, {
    variables: { chat_id: chatId },
    skip: !chatId,
  });
  const { isTyping } = useChat();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      const nearBottom = distanceFromBottom < 100;

      setIsNearBottom(nearBottom);
      setShowScrollToBottom(!nearBottom && scrollHeight > clientHeight);
    }
  };

  useEffect(() => {
    if (isNearBottom) {
      scrollToBottom();
    }
  }, [data, isTyping, isNearBottom]);

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50/30 via-white/50 to-purple-50/30 dark:from-gray-900/30 dark:via-gray-800/50 dark:to-purple-900/30">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              ✨
            </div>
          </div>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 dark:from-gray-200 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
            Welcome to AI Assistant
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-8">
            Start a conversation by selecting a chat or creating a new one. Powered by Google Gemini for intelligent responses! 🚀
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="glass-card p-4 rounded-2xl border border-blue-200/50 dark:border-blue-800/50">
              <div className="text-blue-500 dark:text-blue-400 mb-2">💡</div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Smart Conversations</h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs">Powered by Google Gemini</p>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-purple-200/50 dark:border-purple-800/50">
              <div className="text-purple-500 dark:text-purple-400 mb-2">🎨</div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Beautiful Design</h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs">Elegant glass morphism UI</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
          <div className="relative">
            <div className="w-10 h-10 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-500 dark:border-t-blue-400"></div>
            <div className="absolute inset-0 w-10 h-10 border-4 border-transparent rounded-full animate-ping border-t-blue-300 dark:border-t-blue-600"></div>
          </div>
          <div>
            <p className="font-medium">Loading messages...</p>
            <p className="text-sm opacity-75">Please wait a moment</p>
          </div>
        </div>
      </div>
    );
  }

  const messages = data?.messages || [];

  return (
    <div className="flex-1 flex flex-col relative">
      <div className="glass-strong border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 truncate max-w-xs">
                {chatTitle || 'Chat'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                <span>{messages.length} messages</span>
                {isTyping && (
                  <>
                    <span>•</span>
                    <span className="text-blue-500 dark:text-blue-400 flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"></div>
                      <span>AI is typing...</span>
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 glass rounded-full text-xs font-medium text-gray-600 dark:text-gray-400">
              Online
            </div>
          </div>
        </div>
      </div>
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6 bg-gradient-to-b from-transparent via-blue-50/20 to-purple-50/20 dark:via-gray-900/20 dark:to-purple-900/20 relative"
        style={{
          scrollBehavior: 'smooth',
          overflowAnchor: 'none',
        }}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-sm">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Start the conversation
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Send a message below to begin chatting with your AI assistant. Powered by Google Gemini for accurate responses! 💬
              </p>
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
      {showScrollToBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-6 w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group z-10"
          title="Scroll to bottom"
        >
          <ChevronDownIcon className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        </button>
      )}
    </div>
  );
};

export default ChatWindow;