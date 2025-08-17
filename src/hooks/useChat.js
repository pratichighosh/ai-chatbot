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

      // Step 2: Call AI action with timeout and error handling
      try {
        console.log('🤖 Calling AI action...')
        
        const actionResult = await sendMessageAction({
          variables: {
            chat_id: chatId,
            message: message.trim()
          },
          errorPolicy: 'all'
        })

        console.log('🔍 Action Result:', actionResult)

        // Handle the response
        if (actionResult.data?.sendMessage) {
          const response = actionResult.data.sendMessage
          console.log('✅ AI Response:', response)
          
          if (response.message && typeof response.message === 'string') {
            console.log('✅ AI responded with:', response.message.substring(0, 100) + '...')
            
            // The webhook should have already saved the message to the database
            // But let's verify by checking if we need to save manually
            if (response.success) {
              console.log('✅ Response marked as successful')
              toast.success('🤖 AI responded!')
            } else {
              console.log('⚠️ Response not marked as successful, saving manually...')
              
              // Manual save as fallback
              try {
                await insertMessage({
                  variables: {
                    chat_id: chatId,
                    content: response.message,
                    role: 'assistant'
                  },
                  errorPolicy: 'all'
                })
                console.log('✅ Manually saved AI message')
                toast.success('🤖 AI responded!')
              } catch (manualSaveError) {
                console.error('❌ Manual save failed:', manualSaveError)
                toast.error('AI responded but message might not be saved')
              }
            }
          } else {
            console.log('⚠️ Invalid message format:', response)
            throw new Error('Invalid AI response format')
          }
        } else if (actionResult.errors) {
          console.log('⚠️ Action had errors:', actionResult.errors)
          throw new Error('AI service error: ' + actionResult.errors[0].message)
        } else {
          console.log('⚠️ No response from AI action')
          throw new Error('No response from AI service')
        }

      } catch (actionError) {
        console.log('⚠️ AI action failed:', actionError.message)
        
        // Provide helpful fallback message based on error type
        let fallbackMessage = "I'm having trouble responding right now. "
        
        if (actionError.message.includes('rate limit') || actionError.message.includes('too many requests')) {
          fallbackMessage += "I'm experiencing high demand. Please try again in a moment! 🕐"
          toast.error('🕐 High demand - please try again shortly')
        } else if (actionError.message.includes('network') || actionError.message.includes('timeout')) {
          fallbackMessage += "Please check your connection and try again. 🌐"
          toast.error('🌐 Network error - please try again')
        } else if (actionError.message.includes('authentication')) {
          fallbackMessage += "There's an authentication issue. Please refresh the page. 🔄"
          toast.error('🔄 Please refresh the page')
        } else {
          fallbackMessage += "Please try again in a moment. 🤖"
          toast.error('🤖 AI temporarily unavailable')
        }
        
        // Add a helpful fallback message
        setTimeout(async () => {
          try {
            await insertMessage({
              variables: {
                chat_id: chatId,
                content: fallbackMessage + "\n\nI'm still here to help! Feel free to:\n• Try rephrasing your question\n• Ask about something else\n• Try again in a few moments",
                role: 'assistant'
              }
            })
            console.log('🤖 Fallback message added')
          } catch (err) {
            console.log('❌ Fallback message failed:', err)
          }
        }, 2000)
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