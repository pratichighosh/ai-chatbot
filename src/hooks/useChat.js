import { useMutation } from '@apollo/client';
import { INSERT_MESSAGE, SEND_MESSAGE_ACTION } from '../graphql/mutations';
import { MESSAGE_ROLES } from '../utils/constants';
import { useState } from 'react';

export const useChat = () => {
  const [insertMessage] = useMutation(INSERT_MESSAGE);
  const [sendMessageAction] = useMutation(SEND_MESSAGE_ACTION);
  const [isTyping, setIsTyping] = useState(false);

  const createNewChat = async () => {
    // ... (unchanged, assuming it’s correct from prior context)
  };

  const sendMessage = async (chatId, messageContent) => {
    console.log('📨 Sending message:', { chatId, messageContent });
    try {
      // Save user message
      const userMessageResult = await insertMessage({
        variables: {
          chat_id: chatId,
          content: messageContent,
          role: MESSAGE_ROLES.USER,
        },
      });
      console.log('✅ User message saved successfully:', userMessageResult);

      setIsTyping(true);
      console.log('🤖 Calling AI service...');
      const startTime = Date.now();

      // Call AI service via Hasura action
      const aiResult = await sendMessageAction({
        variables: { chat_id: chatId, message: messageContent },
      });
      console.log('🔍 AI Response time:', `${Date.now() - startTime}ms`);
      console.log('✅ AI responded successfully:', JSON.stringify(aiResult, null, 2));

      const aiMessage = aiResult?.data?.sendMessage?.message;
      if (!aiMessage || typeof aiMessage !== 'string') {
        console.error('❌ Invalid AI message:', aiMessage);
        throw new Error('Invalid or missing AI message in response');
      }

      // Save AI response
      const aiMessageResult = await insertMessage({
        variables: {
          chat_id: chatId,
          content: aiMessage,
          role: MESSAGE_ROLES.ASSISTANT,
        },
      });
      console.log('✅ AI message saved:', aiMessageResult);

      return aiMessageResult;
    } catch (error) {
      console.error('❌ Send message error:', error);
      throw error;
    } finally {
      setIsTyping(false);
    }
  };

  return { createNewChat, sendMessage, isTyping };
};