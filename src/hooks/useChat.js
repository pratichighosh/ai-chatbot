// FIXED useChat.js - src/hooks/useChat.js
import { useState, useCallback } from 'react'
import { useMutation } from '@apollo/client'
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
        variables: { title },
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
      
      if (error.message.includes('permission')) {
        toast.error('Permission denied. Please refresh and try again.')
      } else if (error.message.includes('user_id')) {
        toast.error('Authentication error. Please refresh the page.')
      } else if (error.message.includes('jwt')) {
        toast.error('Session expired. Please refresh and login again.')
      } else {
        toast.error('Failed to create chat. Please try again.')
      }
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
      console.log('📨 DEBUGGING: Sending message:', { chatId, message: message.trim() })
      
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

      console.log('✅ DEBUGGING: User message saved successfully')

      // Step 2: Call chatbot action
      try {
        console.log('🤖 DEBUGGING: Calling sendMessage Action...')
        
        const actionResult = await sendMessageAction({
          variables: {
            chat_id: chatId,
            message: message.trim()
          },
          errorPolicy: 'all'
        })

        console.log('🔍 DEBUGGING: Full Action Result:', actionResult)

        if (actionResult.errors && actionResult.errors.length > 0) {
          console.error('❌ Chatbot action error:', actionResult.errors)
          throw new Error('Chatbot action failed: ' + actionResult.errors[0].message)
        }

        if (actionResult.data?.sendMessage?.message) {
          const aiResponse = actionResult.data.sendMessage.message
          console.log('✅ DEBUGGING: AI Response Received:', aiResponse)
          
          // ✅ FIXED: Save AI response as a message in the database
          const aiMessageResult = await insertMessage({
            variables: {
              chat_id: chatId,
              content: aiResponse,
              role: 'assistant'
            },
            errorPolicy: 'all'
          })

          if (aiMessageResult.errors && aiMessageResult.errors.length > 0) {
            console.error('❌ Failed to save AI response:', aiMessageResult.errors)
            throw new Error('Failed to save AI response: ' + aiMessageResult.errors[0].message)
          }

          console.log('✅ DEBUGGING: AI response saved to database successfully')
          toast.success('🤖 AI responded!')
        } else {
          console.log('⚠️ Chatbot action returned no response')
          toast.warning('AI action completed but no response received.')
        }

      } catch (actionError) {
        console.error('❌ Chatbot action failed:', actionError.message)
        
        // Show specific error messages
        if (actionError.message.includes('n8n') || actionError.message.includes('webhook')) {
          toast.error('🔧 AI service unavailable. Please check n8n workflow configuration.')
        } else if (actionError.message.includes('timeout')) {
          toast.error('⏱️ AI response timeout. Please try again.')
        } else if (actionError.message.includes('permission')) {
          toast.error('🔐 Permission denied for AI action. Check Hasura permissions.')
        } else {
          toast.error('🤖 AI service error: ' + actionError.message)
        }
      }

    } catch (error) {
      console.error('❌ Error sending message:', error)
      
      if (error.message.includes('permission')) {
        toast.error('Permission denied. Please refresh and try again.')
      } else if (error.message.includes('user_id')) {
        toast.error('Authentication error. Please refresh the page.')
      } else {
        toast.error('Failed to send message: ' + error.message)
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