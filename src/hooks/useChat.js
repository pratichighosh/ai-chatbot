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

      // Step 2: Call Gemini AI through Hasura action
      console.log('🤖 Calling Gemini AI action...')
      
      const actionResult = await sendMessageAction({
        variables: {
          chat_id: chatId,
          message: message.trim()
        },
        errorPolicy: 'all'
      })

      console.log('🔍 Full Action Result:', JSON.stringify(actionResult, null, 2))

      // Enhanced response handling
      if (actionResult.errors) {
        console.error('❌ Action errors:', actionResult.errors)
        
        // Check for authentication errors
        const authError = actionResult.errors.find(error => 
          error.message.includes('401') || 
          error.message.includes('Unauthorized') || 
          error.message.includes('permission')
        )
        
        if (authError) {
          throw new Error('Authentication failed. Please refresh the page and try again.')
        } else {
          throw new Error('AI service error: ' + actionResult.errors[0].message)
        }
      }

      if (actionResult.data?.sendMessage) {
        const response = actionResult.data.sendMessage
        console.log('✅ Gemini Action Response:', response)
        
        // Handle different response formats
        let aiMessage = null
        
        if (typeof response === 'string') {
          aiMessage = response
        } else if (response.message) {
          aiMessage = response.message
        } else if (response.response && response.response.message) {
          aiMessage = response.response.message
        }
        
        if (aiMessage && aiMessage.trim().length > 0) {
          console.log('✅ AI responded:', aiMessage.substring(0, 100) + '...')
          
          // The webhook should have saved the message, but let's verify by manually inserting if needed
          // Wait a moment for the webhook to process
          setTimeout(async () => {
            try {
              // Check if we need to manually save the AI response
              await insertMessage({
                variables: {
                  chat_id: chatId,
                  content: aiMessage,
                  role: 'assistant'
                },
                errorPolicy: 'all'
              })
              console.log('✅ AI message saved (backup)')
            } catch (err) {
              console.log('ℹ️ Message may already exist:', err.message)
            }
          }, 1000)
          
          toast.success('🤖 Gemini AI responded!')
        } else {
          console.log('⚠️ Empty AI response')
          throw new Error('AI returned an empty response')
        }
      } else {
        console.log('⚠️ No action response data')
        throw new Error('No response from AI service')
      }

    } catch (error) {
      console.error('❌ Send message error:', error)
      
      // User-friendly error messages
      if (error.message.includes('Authentication failed') || error.message.includes('401')) {
        toast.error('Authentication error. Please refresh the page and try again.')
      } else if (error.message.includes('permission')) {
        toast.error('Permission denied. Please check your account settings.')
      } else if (error.message.includes('network') || error.message.includes('timeout')) {
        toast.error('Network error. Please check your connection.')
      } else if (error.message.includes('empty response')) {
        toast.error('AI service returned an empty response. Please try again.')
      } else {
        toast.error('Failed to send message. Please try again.')
      }
      
      // Add a helpful fallback message in case of errors
      setTimeout(async () => {
        try {
          await insertMessage({
            variables: {
              chat_id: chatId,
              content: "I'm experiencing some technical difficulties right now. Please try sending your message again! 🤖",
              role: 'assistant'
            }
          })
          console.log('🤖 Fallback message added')
        } catch (err) {
          console.log('❌ Fallback message failed:', err)
        }
      }, 2000)
      
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