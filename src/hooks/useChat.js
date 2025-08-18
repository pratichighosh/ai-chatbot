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
      const { data, errors } = await createChat({
        variables: { title },
        errorPolicy: 'all'
      })

      if (errors && errors.length > 0) {
        throw new Error(errors[0].message)
      }

      if (!data?.insert_chats_one) {
        throw new Error('No data returned from chat creation')
      }

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
      console.log('📨 Sending message to webhook directly')
      
      // Step 1: Save user message
      await insertMessage({
        variables: {
          chat_id: chatId,
          content: message.trim(),
          role: 'user'
        }
      })

      // Step 2: Call webhook directly
      const response = await fetch('https://pratichi.app.n8n.cloud/webhook/98daad64-3b9f-4db3-8cf7-8aec2306445f', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            message: message.trim(),
            chat_id: chatId
          }
        })
      })

      const result = await response.json()
      console.log('🔍 Webhook result:', result)

      if (result.message) {
        await insertMessage({
          variables: {
            chat_id: chatId,
            content: result.message,
            role: 'assistant'
          }
        })
        toast.success('🤖 AI responded!')
      } else {
        throw new Error('No AI response')
      }

    } catch (error) {
      console.error('❌ Error:', error)
      toast.error('Failed to get AI response')
    } finally {
      setIsTyping(false)
    }
  }, [insertMessage, user?.id])

  const updateTitle = useCallback(async (chatId, newTitle) => {
    try {
      await updateChatTitle({
        variables: { id: chatId, title: newTitle }
      })
      toast.success('Chat title updated')
    } catch (error) {
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