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

    const trimmedMessage = message.trim()
    setIsTyping(true)
    
    try {
      console.log('📨 Sending REAL message:', { 
        chatId, 
        message: trimmedMessage, 
        userId: user.id,
        messageLength: trimmedMessage.length 
      })
      
      // Step 1: Insert user message
      const userMessageResult = await insertMessage({
        variables: {
          chat_id: chatId,
          content: trimmedMessage,
          role: 'user'
        },
        errorPolicy: 'all'
      })

      if (userMessageResult.errors && userMessageResult.errors.length > 0) {
        throw new Error('Failed to save user message: ' + userMessageResult.errors[0].message)
      }

      console.log('✅ User message saved')

      // Step 2: Call AI with the EXACT message
      try {
        console.log('🤖 Calling AI with EXACT message:', trimmedMessage)
        
        const actionResult = await sendMessageAction({
          variables: {
            chat_id: chatId,
            message: trimmedMessage  // Make sure this is the EXACT user message
          },
          errorPolicy: 'all'
        })

        console.log('🔍 Full Action Result:', JSON.stringify(actionResult, null, 2))

        if (actionResult.data?.sendMessage) {
          const response = actionResult.data.sendMessage
          console.log('✅ AI Action Response:', response)
          
          // Check different possible response formats
          let aiMessage = null
          
          if (typeof response === 'string') {
            aiMessage = response.trim()
          } else if (response.message && typeof response.message === 'string') {
            aiMessage = response.message.trim()
          } else if (response.response && response.response.message) {
            aiMessage = response.response.message.trim()
          }
          
          if (aiMessage && aiMessage.length > 0 && !aiMessage.includes('Hello there!')) {
            console.log('✅ Got SPECIFIC AI response for message:', trimmedMessage)
            console.log('✅ AI response:', aiMessage.substring(0, 100) + '...')
            
            // Insert the AI response
            const aiMessageResult = await insertMessage({
              variables: {
                chat_id: chatId,
                content: aiMessage,
                role: 'assistant'
              },
              errorPolicy: 'all'
            })

            if (aiMessageResult.errors && aiMessageResult.errors.length > 0) {
              console.error('❌ Failed to save AI message:', aiMessageResult.errors)
              toast.error('AI responded but failed to save the message')
            } else {
              console.log('✅ AI message saved successfully')
              toast.success('🤖 AI responded!')
            }
          } else {
            console.log('⚠️ Got generic or invalid AI response:', aiMessage)
            throw new Error('AI gave generic response instead of specific answer')
          }
        } else if (actionResult.errors) {
          console.log('⚠️ Action errors:', actionResult.errors)
          throw new Error('AI service error: ' + actionResult.errors[0].message)
        } else {
          console.log('⚠️ No response from action')
          throw new Error('No response from AI service')
        }

      } catch (actionError) {
        console.log('⚠️ AI action failed:', actionError.message)
        
        // Add specific error message that includes the user's question
        const errorMessage = `I had trouble processing your question: "${trimmedMessage}". Please try rephrasing it or ask something else. 🤖`
        
        setTimeout(async () => {
          try {
            await insertMessage({
              variables: {
                chat_id: chatId,
                content: errorMessage,
                role: 'assistant'
              }
            })
            console.log('🤖 Specific error message added')
          } catch (err) {
            console.log('❌ Error message failed:', err)
          }
        }, 1000)
        
        toast.error('AI service temporarily unavailable.')
      }

    } catch (error) {
      console.error('❌ Error sending message:', error)
      toast.error('Failed to send message. Please try again.')
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