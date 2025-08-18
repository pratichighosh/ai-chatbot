import { useState, useCallback } from 'react'
import { useMutation } from '@apollo/client'
import { useUserData } from '@nhost/react'
import { 
  CREATE_CHAT, 
  INSERT_MESSAGE, 
  GET_AI_RESPONSE,
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
  const [getAIResponse] = useMutation(GET_AI_RESPONSE)
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

      // Step 2: Get AI response
      console.log('🤖 Calling Gemini AI...')
      
      const aiResult = await getAIResponse({
        variables: {
          message: message.trim(),
          chat_id: chatId
        },
        errorPolicy: 'all'
      })

      console.log('🔍 AI Result:', aiResult)

      if (aiResult.errors) {
        console.error('❌ AI errors:', aiResult.errors)
        throw new Error('AI service error: ' + aiResult.errors[0].message)
      }

      const aiMessage = aiResult.data?.getAIResponse

      if (aiMessage && typeof aiMessage === 'string' && aiMessage.trim().length > 0) {
        console.log('✅ AI responded:', aiMessage.substring(0, 100) + '...')
        
        // Step 3: Save AI response
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
        console.log('⚠️ No valid AI response received')
        throw new Error('AI returned empty or invalid response')
      }

    } catch (error) {
      console.error('❌ Send message error:', error)
      
      if (error.message.includes('permission')) {
        toast.error('Permission denied. Please refresh and try again.')
      } else if (error.message.includes('user_id')) {
        toast.error('Authentication error. Please refresh the page.')
      } else if (error.message.includes('network')) {
        toast.error('Network error. Please check your connection.')
      } else if (error.message.includes('AI service error')) {
        toast.error('AI service temporarily unavailable. Please try again.')
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
  }, [insertMessage, getAIResponse, user?.id])

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