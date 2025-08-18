import { useState, useCallback } from 'react'
import { useMutation } from '@apollo/client'
import { useUserData } from '@nhost/react'
import { 
  CREATE_CHAT, 
  INSERT_MESSAGE, 
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

      // Step 2: Call n8n webhook directly (BYPASS HASURA ACTION)
      console.log('🤖 Calling webhook directly...')
      
      const webhookResponse = await fetch('https://pratichi.app.n8n.cloud/webhook/98daad64-3b9f-4db3-8cf7-8aec2306445f', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            message: message.trim(),
            chat_id: chatId,
            user_id: user.id
          }
        })
      })

      console.log('🔍 Webhook response status:', webhookResponse.status)

      if (!webhookResponse.ok) {
        throw new Error(`Webhook failed with status: ${webhookResponse.status}`)
      }

      const result = await webhookResponse.json()
      console.log('🔍 Webhook result:', result)

      let aiMessage = null

      // Handle different response formats
      if (typeof result === 'string') {
        aiMessage = result
      } else if (result.message) {
        aiMessage = result.message
      } else if (result.response && result.response.message) {
        aiMessage = result.response.message
      }

      if (aiMessage && typeof aiMessage === 'string' && aiMessage.trim().length > 0) {
        console.log('✅ AI responded:', aiMessage.substring(0, 100) + '...')
        
        // Step 3: Save AI response to database
        const aiMessageResult = await insertMessage({
          variables: {
            chat_id: chatId,
            content: aiMessage.trim(),
            role: 'assistant'
          },
          errorPolicy: 'all'
        })

        if (aiMessageResult.errors && aiMessageResult.errors.length > 0) {
          console.error('❌ Failed to save AI message:', aiMessageResult.errors)
          toast.error('AI responded but failed to save the message')
        } else {
          console.log('✅ AI message saved successfully')
          toast.success('🤖 Gemini AI responded!')
        }
      } else {
        console.log('⚠️ No valid AI response received:', result)
        throw new Error('AI returned empty or invalid response')
      }

    } catch (error) {
      console.error('❌ Send message error:', error)
      
      // User-friendly error messages
      if (error.message.includes('Failed to save user message')) {
        toast.error('Failed to save your message. Please try again.')
      } else if (error.message.includes('Webhook failed')) {
        toast.error('AI service is temporarily unavailable. Please try again.')
      } else if (error.message.includes('permission')) {
        toast.error('Permission denied. Please refresh and try again.')
      } else if (error.message.includes('network') || error.message.includes('Failed to fetch')) {
        toast.error('Network error. Please check your connection and try again.')
      } else if (error.message.includes('empty or invalid response')) {
        toast.error('AI service returned an invalid response. Please try again.')
      } else {
        toast.error('Failed to send message. Please try again.')
      }
      
      // Add fallback message in case of error
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
  }, [insertMessage, user?.id])

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