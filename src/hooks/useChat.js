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
  const [lastMessageId, setLastMessageId] = useState(null)
  const user = useUserData()
  
  const [createChat] = useMutation(CREATE_CHAT, {
    refetchQueries: [{ query: GET_CHATS }],
    awaitRefetchQueries: true,
    errorPolicy: 'all'
  })
  
  const [insertMessage] = useMutation(INSERT_MESSAGE, {
    errorPolicy: 'all'
  })
  
  const [sendMessageAction] = useMutation(SEND_MESSAGE_ACTION, {
    errorPolicy: 'all'
  })
  
  const [updateChatTitle] = useMutation(UPDATE_CHAT_TITLE, {
    refetchQueries: [{ query: GET_CHATS }],
    errorPolicy: 'all'
  })

  const createNewChat = useCallback(async (title = 'New Chat') => {
    try {
      console.log('🆕 Creating new chat with title:', title)
      
      const { data, errors } = await createChat({
        variables: { title },
        errorPolicy: 'all'
      })

      if (errors && errors.length > 0) {
        console.error('❌ GraphQL errors:', errors)
        const errorMessage = errors[0].message
        
        if (errorMessage.includes('permission')) {
          toast.error('Permission denied. Please refresh and try again.')
        } else if (errorMessage.includes('user_id')) {
          toast.error('Authentication error. Please login again.')
        } else {
          toast.error('Failed to create chat. Please try again.')
        }
        throw new Error(errorMessage)
      }

      if (!data?.insert_chats_one) {
        throw new Error('No data returned from chat creation')
      }

      console.log('✅ Chat created successfully:', data.insert_chats_one)
      toast.success('🎉 New chat created!')
      return data.insert_chats_one
      
    } catch (error) {
      console.error('❌ Failed to create chat:', error)
      
      // Don't show toast if we already showed one above
      if (!error.message.includes('permission') && !error.message.includes('user_id')) {
        toast.error('Failed to create chat. Please try again.')
      }
      throw error
    }
  }, [createChat])

  const sendMessage = useCallback(async (chatId, message) => {
    // Validation
    if (!message || !message.trim()) {
      toast.error('Please enter a message')
      return
    }

    if (!chatId) {
      toast.error('Please select a chat first')
      return
    }

    if (!user?.id) {
      toast.error('Please login to send messages')
      return
    }

    const trimmedMessage = message.trim()
    
    // Prevent duplicate messages
    if (isTyping) {
      console.log('⚠️ Already processing a message, skipping...')
      return
    }

    setIsTyping(true)
    
    try {
      console.log('📨 Sending message:', { 
        chatId, 
        message: trimmedMessage, 
        userId: user.id,
        timestamp: new Date().toISOString()
      })
      
      // Step 1: Insert user message to database
      const userMessageResult = await insertMessage({
        variables: {
          chat_id: chatId,
          content: trimmedMessage,
          role: 'user'
        }
      })

      if (userMessageResult.errors && userMessageResult.errors.length > 0) {
        const errorMessage = userMessageResult.errors[0].message
        console.error('❌ Failed to save user message:', errorMessage)
        
        if (errorMessage.includes('permission')) {
          toast.error('Permission denied. Please refresh and try again.')
        } else if (errorMessage.includes('Foreign key violation')) {
          toast.error('Chat not found. Please refresh the page.')
        } else {
          toast.error('Failed to save your message. Please try again.')
        }
        throw new Error('Failed to save user message: ' + errorMessage)
      }

      console.log('✅ User message saved successfully')
      setLastMessageId(userMessageResult.data?.insert_messages_one?.id)

      // Step 2: Call AI service via Hasura action
      try {
        console.log('🤖 Calling AI service...')
        
        const aiStartTime = Date.now()
        
        const actionResult = await sendMessageAction({
          variables: {
            chat_id: chatId,
            message: trimmedMessage
          }
        })

        const aiResponseTime = Date.now() - aiStartTime
        console.log(`🔍 AI Response time: ${aiResponseTime}ms`)

        // Enhanced response validation
        if (actionResult.errors && actionResult.errors.length > 0) {
          const actionError = actionResult.errors[0]
          console.error('❌ AI Action GraphQL errors:', actionError)
          throw new Error(`AI Action failed: ${actionError.message}`)
        }

        if (!actionResult.data) {
          console.error('❌ No data returned from AI action')
          throw new Error('No response from AI service')
        }

        const aiResponse = actionResult.data.sendMessage
        if (!aiResponse) {
          console.error('❌ No sendMessage data in response')
          throw new Error('Invalid AI service response format')
        }

        // Check for successful AI response
        if (aiResponse.success && aiResponse.message && aiResponse.message.trim()) {
          console.log('✅ AI responded successfully:', {
            messageLength: aiResponse.message.length,
            responseTime: aiResponseTime,
            preview: aiResponse.message.substring(0, 100) + '...'
          })
          
          // Show success notification
          toast.success('🤖 AI responded!', {
            duration: 2000,
            icon: '🎉'
          })
        } else {
          console.error('❌ AI response validation failed:', {
            success: aiResponse.success,
            hasMessage: !!aiResponse.message,
            messageLength: aiResponse.message?.length || 0,
            fullResponse: aiResponse
          })
          throw new Error('AI service returned invalid response')
        }

      } catch (actionError) {
        console.error('❌ AI Action failed:', actionError)
        
        // Enhanced error handling with specific error types
        const errorMessage = actionError.message.toLowerCase()
        
        if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          toast.error('🌐 Network error. Please check your connection.', { duration: 4000 })
        } else if (errorMessage.includes('timeout')) {
          toast.error('⏱️ Request timeout. Please try again.', { duration: 4000 })
        } else if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
          toast.error('🚦 Service is busy. Please try again in a moment.', { duration: 4000 })
        } else if (errorMessage.includes('authentication') || errorMessage.includes('unauthorized')) {
          toast.error('🔐 Authentication error. Please refresh and login again.', { duration: 4000 })
        } else if (errorMessage.includes('webhook') || errorMessage.includes('action')) {
          toast.error('🔧 AI service temporarily unavailable. Please try again.', { duration: 4000 })
        } else {
          toast.error('🤖 AI service error. Please try rephrasing your message.', { duration: 4000 })
        }
        
        // Provide helpful fallback response after a delay
        setTimeout(async () => {
          try {
            const fallbackMessages = [
              "I apologize, but I'm having trouble responding right now. This might be due to high demand or a temporary service issue. Please try asking your question again in a moment. 🤖",
              "Sorry for the inconvenience! I'm experiencing some technical difficulties. Please rephrase your question and try again. 🔧",
              "I'm currently unable to process your request properly. Please try again in a few moments. Thank you for your patience! 🙏"
            ]
            
            const fallbackMessage = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)]
            
            await insertMessage({
              variables: {
                chat_id: chatId,
                content: fallbackMessage,
                role: 'assistant'
              }
            })
            
            console.log('🤖 Fallback message added successfully')
            toast.info('💬 Added fallback response', { duration: 2000 })
            
          } catch (fallbackError) {
            console.error('❌ Fallback message failed:', fallbackError)
          }
        }, 2000) // 2 second delay for better UX
      }

    } catch (error) {
      console.error('❌ Send message error:', error)
      
      // Don't show duplicate toasts if already shown above
      const errorMessage = error.message.toLowerCase()
      if (!errorMessage.includes('permission') && 
          !errorMessage.includes('foreign key') && 
          !errorMessage.includes('save') &&
          !errorMessage.includes('network') &&
          !errorMessage.includes('timeout') &&
          !errorMessage.includes('rate limit') &&
          !errorMessage.includes('authentication') &&
          !errorMessage.includes('webhook')) {
        toast.error('Failed to send message. Please try again.')
      }
    } finally {
      setIsTyping(false)
    }
  }, [insertMessage, sendMessageAction, user?.id, isTyping])

  const updateTitle = useCallback(async (chatId, newTitle) => {
    if (!newTitle || !newTitle.trim()) {
      toast.error('Chat title cannot be empty')
      return
    }

    if (newTitle.trim().length > 100) {
      toast.error('Chat title is too long (max 100 characters)')
      return
    }

    try {
      console.log('✏️ Updating chat title:', { chatId, newTitle: newTitle.trim() })
      
      const { data, errors } = await updateChatTitle({
        variables: {
          id: chatId,
          title: newTitle.trim()
        }
      })

      if (errors && errors.length > 0) {
        const errorMessage = errors[0].message
        console.error('❌ Failed to update title:', errorMessage)
        
        if (errorMessage.includes('permission')) {
          toast.error('Permission denied. You can only edit your own chats.')
        } else if (errorMessage.includes('not found')) {
          toast.error('Chat not found. Please refresh the page.')
        } else {
          toast.error('Failed to update chat title.')
        }
        throw new Error(errorMessage)
      }

      if (data?.update_chats_by_pk) {
        console.log('✅ Chat title updated successfully')
        toast.success('✏️ Chat title updated!')
      } else {
        throw new Error('No data returned from title update')
      }
      
    } catch (error) {
      console.error('❌ Failed to update title:', error)
      
      // Don't show duplicate toast if already shown above
      if (!error.message.includes('permission') && 
          !error.message.includes('not found')) {
        toast.error('Failed to update chat title')
      }
      throw error
    }
  }, [updateChatTitle])

  // Utility function to retry failed messages
  const retryLastMessage = useCallback(async (chatId) => {
    if (!lastMessageId || isTyping) return

    setIsTyping(true)
    try {
      // Get the last user message and retry AI response
      const actionResult = await sendMessageAction({
        variables: {
          chat_id: chatId,
          message: "Please try responding to my previous message."
        }
      })

      if (actionResult.data?.sendMessage?.success) {
        toast.success('🔄 Retry successful!')
      } else {
        throw new Error('Retry failed')
      }
    } catch (error) {
      console.error('❌ Retry failed:', error)
      toast.error('Retry failed. Please try sending your message again.')
    } finally {
      setIsTyping(false)
    }
  }, [lastMessageId, isTyping, sendMessageAction])

  return {
    createNewChat,
    sendMessage,
    updateTitle,
    retryLastMessage,
    isTyping,
    lastMessageId
  }
}