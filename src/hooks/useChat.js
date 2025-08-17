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

        console.log('🔍 Full Action Result:', JSON.stringify(actionResult, null, 2))

        // Check the action response structure
        if (actionResult.data?.sendMessage) {
          const response = actionResult.data.sendMessage
          console.log('✅ Gemini AI Action Response:', response)
          
          // Check if the webhook already saved the message to database
          if (response.success && response.message) {
            console.log('✅ Gemini AI responded:', response.message)
            
            // Check if message was already saved by webhook (success = true)
            if (response.success === true) {
              console.log('✅ AI message already saved by webhook')
              toast.success('🤖 Gemini AI responded!')
            } else {
              // Manually save if webhook couldn't save to database
              console.log('⚠️ Webhook responded but didn\'t save to DB, saving manually...')
              
              try {
                const aiMessageResult = await insertMessage({
                  variables: {
                    chat_id: chatId,
                    content: response.message,
                    role: 'assistant'
                  },
                  errorPolicy: 'all'
                })

                if (aiMessageResult.errors && aiMessageResult.errors.length > 0) {
                  console.error('❌ Failed to manually save AI message:', aiMessageResult.errors)
                  toast.error('AI responded but failed to save the message')
                } else {
                  console.log('✅ AI message manually saved to database')
                  toast.success('🤖 Gemini AI responded!')
                }
              } catch (insertError) {
                console.error('❌ Error manually inserting AI message:', insertError)
                toast.error('AI responded but couldn\'t save the message')
              }
            }
          } else {
            console.log('⚠️ AI action unsuccessful or no message:', response)
            throw new Error(response.message || 'Gemini AI did not provide a response')
          }
        } else if (actionResult.errors) {
          console.log('⚠️ Action errors:', actionResult.errors)
          throw new Error('Gemini AI service error: ' + actionResult.errors[0].message)
        } else {
          console.log('⚠️ No response from Gemini AI action')
          throw new Error('No response from Gemini AI service')
        }

      } catch (actionError) {
        console.log('⚠️ Gemini AI action failed:', actionError.message)
        
        // Provide user-friendly error messages
        let errorMessage = "I'm having trouble responding right now. "
        
        if (actionError.message.includes('network') || actionError.message.includes('timeout')) {
          errorMessage += "Please check your internet connection and try again."
          toast.error('🌐 Network error. Please check your connection.')
        } else if (actionError.message.includes('rate limit') || actionError.message.includes('quota')) {
          errorMessage += "I'm experiencing high demand. Please wait a moment before trying again."
          toast.error('⏱️ Too many requests. Please wait a moment.')
        } else if (actionError.message.includes('authentication') || actionError.message.includes('API key')) {
          errorMessage += "There's an authentication issue with the AI service."
          toast.error('🔐 Authentication error with AI service.')
        } else if (actionError.message.includes('safety') || actionError.message.includes('blocked')) {
          errorMessage += "Your message was blocked by safety filters. Please try rephrasing."
          toast.error('🛡️ Message blocked by safety filters.')
        } else {
          errorMessage += "This might be due to high demand. Please try again in a moment."
          toast.error('🤖 AI service temporarily unavailable.')
        }
        
        // Insert helpful fallback message
        setTimeout(async () => {
          try {
            await insertMessage({
              variables: {
                chat_id: chatId,
                content: errorMessage + " 🤖\n\nIn the meantime, feel free to:\n• Try rephrasing your question\n• Ask about a different topic\n• Check back in a few minutes",
                role: 'assistant'
              }
            })
            console.log('🤖 Helpful fallback message added')
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