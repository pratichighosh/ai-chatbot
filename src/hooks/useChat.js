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
      console.log('📨 Sending message to Gemini AI:', { chatId, message: message.trim(), userId: user.id })
      
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
      try {
        console.log('🤖 Calling Gemini AI through Hasura action...')
        
        const actionResult = await sendMessageAction({
          variables: {
            chat_id: chatId,
            message: message.trim()
          },
          errorPolicy: 'all'
        })

        console.log('🔍 Gemini Action Result:', actionResult)

        // Enhanced response handling for Gemini AI
        if (actionResult.data?.sendMessage) {
          const response = actionResult.data.sendMessage
          console.log('✅ Gemini AI Action Response:', response)
          
          if (response.message && typeof response.message === 'string' && response.message.trim().length > 0) {
            console.log('✅ Gemini AI responded with:', response.message.substring(0, 100) + '...')
            
            // The message should already be saved by the webhook, but let's verify
            if (response.success) {
              console.log('✅ Gemini AI message saved successfully to database')
              toast.success('🤖 Gemini AI responded!')
            } else {
              console.log('⚠️ Gemini AI responded but database save may have failed')
              
              // Manually save the AI response as a backup
              try {
                await insertMessage({
                  variables: {
                    chat_id: chatId,
                    content: response.message,
                    role: 'assistant'
                  },
                  errorPolicy: 'all'
                })
                console.log('✅ Manually saved Gemini AI response')
                toast.success('🤖 Gemini AI responded!')
              } catch (backupError) {
                console.error('❌ Failed to backup save AI message:', backupError)
                toast.error('AI responded but couldn\'t save the message')
              }
            }
          } else {
            console.log('⚠️ Empty or invalid response from Gemini AI')
            throw new Error('Gemini AI returned an empty response')
          }
        } else if (actionResult.errors) {
          console.log('⚠️ Gemini AI action errors:', actionResult.errors)
          throw new Error('Gemini AI service error: ' + actionResult.errors[0].message)
        } else {
          console.log('⚠️ No response from Gemini AI action')
          throw new Error('No response from Gemini AI service')
        }

      } catch (actionError) {
        console.log('⚠️ Gemini AI action failed:', actionError.message)
        
        // Provide user-friendly error messages based on error type
        let fallbackMessage = "I'm having trouble connecting to my AI capabilities right now. "
        
        if (actionError.message.includes('network') || actionError.message.includes('timeout')) {
          fallbackMessage += "This seems to be a network issue. Please check your connection and try again."
          toast.error('Network error. Please check your connection.')
        } else if (actionError.message.includes('rate limit') || actionError.message.includes('429')) {
          fallbackMessage += "I'm experiencing high demand right now. Please wait a moment and try again! 🚀"
          toast.error('High demand detected. Please wait a moment.')
        } else if (actionError.message.includes('authentication') || actionError.message.includes('403')) {
          fallbackMessage += "There's an authentication issue. Please refresh the page and try again."
          toast.error('Authentication error. Please refresh and try again.')
        } else if (actionError.message.includes('empty response')) {
          fallbackMessage += "I had trouble generating a response to your specific question. Could you try rephrasing it?"
          toast.error('Please try rephrasing your question.')
        } else {
          fallbackMessage += "This might be due to high demand or a temporary service issue. Please try again in a moment!"
          toast.error('AI service temporarily unavailable.')
        }
        
        fallbackMessage += "\n\nI'm powered by Gemini AI and I'm here to help with programming, explanations, creative projects, and much more! 🤖"
        
        // Insert helpful fallback message
        setTimeout(async () => {
          try {
            await insertMessage({
              variables: {
                chat_id: chatId,
                content: fallbackMessage,
                role: 'assistant'
              }
            })
            console.log('🤖 Gemini AI fallback message added')
          } catch (err) {
            console.log('❌ Fallback message failed:', err)
          }
        }, 1500)
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