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

// Generate or get consistent user ID for this session
const getSessionUserId = () => {
  let userId = localStorage.getItem('session-user-id')
  
  if (!userId) {
    // Try to get from auth first
    const authUser = nhost.auth.getUser()
    if (authUser?.id) {
      userId = authUser.id
    } else {
      // Generate a consistent session ID
      userId = 'user-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36)
    }
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
      const userId = getSessionUserId()
      
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
      const userId = getSessionUserId()
      
      console.log('📨 Sending message:', { chatId, message: message.trim(), userId })
      
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

      console.log('✅ User message saved')
      toast.success('Message sent!')

      // Step 2: Simulate AI response for demo
      setTimeout(async () => {
        try {
          await insertMessage({
            variables: {
              chat_id: chatId,
              content: "Hello! I'm your AI assistant. How can I help you today?",
              role: 'assistant',
              user_id: userId
            }
          })
          console.log('🤖 AI response added')
        } catch (err) {
          console.log('AI response failed:', err)
        }
        setIsTyping(false)
      }, 2000)

    } catch (error) {
      console.error('❌ Error sending message:', error)
      toast.error('Failed to send message: ' + error.message)
      setIsTyping(false)
    }
  }, [insertMessage])

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