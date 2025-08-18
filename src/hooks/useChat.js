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
      // Step 1: Insert user message
      await insertMessage({
        variables: {
          chat_id: chatId,
          content: message.trim(),
          role: 'user'
        },
        errorPolicy: 'all'
      })

      // Step 2: Call Gemini AI
      const actionResult = await sendMessageAction({
        variables: {
          chat_id: chatId,
          message: message.trim()
        },
        errorPolicy: 'all'
      })

      if (actionResult.data?.sendMessage?.message) {
        toast.success('🤖 AI responded!')
      } else {
        throw new Error('No AI response')
      }

    } catch (error) {
      console.error('❌ Error:', error)
      toast.error('Failed to send message')
    } finally {
      setIsTyping(false)
    }
  }, [insertMessage, sendMessageAction, user?.id])

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