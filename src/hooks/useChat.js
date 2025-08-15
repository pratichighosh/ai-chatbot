import { useState, useCallback } from 'react'
import { useMutation } from '@apollo/client'
import { useUserData } from '@nhost/react'
import { 
  CREATE_CHAT, 
  INSERT_MESSAGE, 
  SEND_MESSAGE_ACTION,
  UPDATE_CHAT_TITLE 
} from '../graphql/mutations'
import { GET_CHATS } from '../graphql/queries'
import toast from 'react-hot-toast'

export const useChat = () => {
  const [isTyping, setIsTyping] = useState(false)
  const user = useUserData()
  
  const [createChat] = useMutation(CREATE_CHAT, {
    refetchQueries: [{ query: GET_CHATS }],
    awaitRefetchQueries: true,
  })
  
  const [insertMessage] = useMutation(INSERT_MESSAGE)
  const [sendMessageAction] = useMutation(SEND_MESSAGE_ACTION)
  const [updateChatTitle] = useMutation(UPDATE_CHAT_TITLE)

  const createNewChat = useCallback(async (title = 'New Chat') => {
    try {
      console.log('🆕 Creating new chat with title:', title)
      
      const { data, errors } = await createChat({
        variables: { 
          title  // Hasura will auto-inject user_id from JWT
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
      return data.insert_chats_one
      
    } catch (error) {
      console.error('❌ Failed to create chat:', error)
      throw error
    }
  }, [createChat])

  const sendMessage = useCallback(async (chatId, message) => {
    if (!message.trim() || !chatId || !user?.id) {
      toast.error('Please enter a message')
      return
    }

    setIsTyping(true)
    
    try {
      console.log('📨 Sending message:', { chatId, message: message.trim(), userId: user.id })
      
      // Step 1: Insert user message
      const userMessageResult = await insertMessage({
        variables: {
          chat_id: chatId,
          content: message.trim(),
          role: 'user'
        },
        errorPolicy: 'all'
      })

      if (userMessageResult.errors && userMessageResult.errors.length > 0) {
        throw new Error('Failed to save user message: ' + userMessageResult.errors[0].message)
      }

      console.log('✅ User message saved')

      // Step 2: Call AI chatbot action with proper data structure
      try {
        console.log('🤖 Calling chatbot action...')
        
        const actionResult = await sendMessageAction({
          variables: {
            chat_id: chatId,
            message: message.trim()
          },
          errorPolicy: 'all'
        })

        console.log('🔍 Action Result:', actionResult)

        if (actionResult.data?.sendMessage?.success && actionResult.data?.sendMessage?.message) {
          console.log('✅ Chatbot responded:', actionResult.data.sendMessage.message)
          toast.success('🤖 AI responded!')
        } else if (actionResult.errors) {
          console.log('⚠️ Chatbot action errors:', actionResult.errors)
          throw new Error('AI service error: ' + actionResult.errors[0].message)
        } else {
          console.log('⚠️ Chatbot action returned no response or failed')
          throw new Error('No AI response received')
        }

      } catch (actionError) {
        console.log('⚠️ Chatbot action failed:', actionError.message)
        
        // Enhanced fallback with better error handling
        if (actionError.message.includes('network') || actionError.message.includes('timeout')) {
          toast.error('Network error. Please check your connection.')
        } else if (actionError.message.includes('rate limit')) {
          toast.error('Too many requests. Please wait a moment.')
        } else {
          toast.error('AI service temporarily unavailable. Please try again.')
        }
        
        // Provide a helpful fallback response
        setTimeout(async () => {
          try {
            await insertMessage({
              variables: {
                chat_id: chatId,
                content: "I apologize, but I'm having trouble responding right now. This might be due to high demand or a temporary service issue. Please try asking your question again in a moment. 🤖",
                role: 'assistant'
              }
            })
            console.log('🤖 Fallback message added')
          } catch (err) {
            console.log('❌ Fallback message failed:', err)
          }
        }, 1000)
      }

    } catch (error) {
      console.error('❌ Error sending message:', error)
      
      if (error.message.includes('permission')) {
        toast.error('Permission denied. Please refresh and try again.')
      } else if (error.message.includes('user_id')) {
        toast.error('Authentication error. Please refresh the page.')
      } else if (error.message.includes('network')) {
        toast.error('Network error. Please check your connection.')
      } else {
        toast.error('Failed to send message. Please try again.')
      }
    } finally {
      setIsTyping(false)
    }
  }, [insertMessage, sendMessageAction, user?.id])

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