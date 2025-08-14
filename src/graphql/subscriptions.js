import { gql } from '@apollo/client'

export const SUBSCRIBE_MESSAGES = gql`
  subscription SubscribeMessages($chat_id: uuid!) {
    messages(
      where: { chat_id: { _eq: $chat_id } }
      order_by: { created_at: asc }
    ) {
      id
      content
      role
      created_at
    }
  }
`

export const SUBSCRIBE_CHATS = gql`
  subscription SubscribeChats {
    chats(order_by: { updated_at: desc }) {
      id
      title
      created_at
      updated_at
      messages_aggregate {
        aggregate {
          count
        }
      }
      messages(limit: 1, order_by: { created_at: desc }) {
        content
        role
        created_at
      }
    }
  }
`