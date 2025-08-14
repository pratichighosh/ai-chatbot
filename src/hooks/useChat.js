// ===== CORRECTED useChat.js - src/hooks/useChat.js =====
import { useState, useCallback } from 'react'
import { useMutation } from '@apollo/client'
import { 
  CREATE_CHAT, 
  INSERT_MESSAGE, 
  SEND_MESSAGE_ACTION,
  UPDATE_CHAT_TITLE 
} from '../graphql/mutations'
import { GET_CHATS } from '../graphql/queries'
import { nhost } from '../utils/nhost'
import toast from 'react-hot-toast'

// Get authenticated user ID
const getUserId = () => {
  const authUser = nhost.auth.getUser()
  if (authUser?.id) {
    return authUser.id
  }
  
  // Fallback for development
  let userId = localStorage.getItem('session-user-id')
  if (!userId) {
    userId = 'user-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36)
    localStorage.setItem('session-user-id', userId)
  }
  return userId
}

export const useChat = () => {
  const [isTyping, setIsTyping] = useState(false)
  
  const [createChat] = useMutation(CREATE_CHAT, {
    refetchQueries: [{ query: GET_CHATS }],
    awaitRefetchQueries: true,
  })
  
  const [insertMessage] = useMutation(INSERT_MESSAGE)
  const [sendMessageAction] = useMutation(SEND_MESSAGE_ACTION)
  const [updateChatTitle] = useMutation(UPDATE_CHAT_TITLE)

  const createNewChat = useCallback(async (title = 'New Chat') => {
    try {
      const userId = getUserId()
      
      console.log('🆕 Creating chat for user:', userId)
      
      const { data, errors } = await createChat({
        variables: { 
          title,
          user_id: userId
        },
        errorPolicy: 'all'
      })

      if (errors && errors.length > 0) {
        console.error('❌ GraphQL errors:', errors)
        throw new Error(errors[0].message)
      }

      if (!data?.insert_chats_one) {
        throw new Error('No data returned from chat creation')
      }

      console.log('✅ Chat created successfully:', data.insert_chats_one)
      toast.success('Chat created!')
      return data.insert_chats_one
      
    } catch (error) {
      console.error('❌ Failed to create chat:', error)
      toast.error('Failed to create chat: ' + error.message)
      throw error
    }
  }, [createChat])

  const sendMessage = useCallback(async (chatId, message) => {
    if (!message.trim() || !chatId) {
      toast.error('Please enter a message')
      return
    }

    setIsTyping(true)
    
    try {
      const userId = getUserId()
      
      console.log('📨 DEBUGGING: Sending message:', { chatId, message: message.trim(), userId })
      
      // Step 1: Insert user message
      const userMessageResult = await insertMessage({
        variables: {
          chat_id: chatId,
          content: message.trim(),
          role: 'user',
          user_id: userId
        },
        errorPolicy: 'all'
      })

      if (userMessageResult.errors && userMessageResult.errors.length > 0) {
        throw new Error('Failed to save user message: ' + userMessageResult.errors[0].message)
      }

      console.log('✅ DEBUGGING: User message saved')

      // Step 2: Call REAL AI through Hasura Action (NOT DEMO!)
      console.log('🤖 DEBUGGING: Calling sendMessage Action...')
      
      const actionResult = await sendMessageAction({
        variables: {
          chat_id: chatId,
          message: message.trim()
        },
        errorPolicy: 'all'
      })

      console.log('🔍 DEBUGGING: Full Action Result:', JSON.stringify(actionResult, null, 2))

      if (actionResult.errors && actionResult.errors.length > 0) {
        console.error('❌ DEBUGGING: Action errors:', actionResult.errors)
        throw new Error('AI action failed: ' + actionResult.errors[0].message)
      }

      if (actionResult.data?.sendMessage?.message) {
        console.log('✅ DEBUGGING: AI Response Received:', actionResult.data.sendMessage.message)
        toast.success('🎉 AI responded!')
      } else {
        console.log('⚠️ DEBUGGING: Action completed but no AI message received')
        console.log('📋 DEBUGGING: Action data:', actionResult.data)
        toast.warning('🤖 AI action completed but no response received')
      }

    } catch (error) {
      console.error('❌ DEBUGGING: Complete error in sendMessage:', error)
      
      // User-friendly error messages
      if (error.message.includes('jwt') || error.message.includes('JWT')) {
        toast.error('🔐 Session expired. Please refresh the page and login again.')
      } else if (error.message.includes('permission') || error.message.includes('Permission')) {
        toast.error('🚫 Permission denied. Please check your account permissions.')
      } else if (error.message.includes('Network')) {
        toast.error('🌐 Network error. Please check your internet connection.')
      } else {
        toast.error('❌ Message failed: ' + error.message)
      }
    } finally {
      setIsTyping(false)
    }
  }, [insertMessage, sendMessageAction])

  const updateTitle = useCallback(async (chatId, newTitle) => {
    try {
      await updateChatTitle({
        variables: {
          id: chatId,
          title: newTitle
        }
      })
      toast.success('Chat title updated')
    } catch (error) {
      console.error('❌ Failed to update title:', error)
      toast.error('Failed to update title')
      throw error
    }
  }, [updateChatTitle])

  return {
    createNewChat,
    sendMessage,
    updateTitle,
    isTyping
  }
}
