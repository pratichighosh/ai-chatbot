// src/graphql/queries.js - Updated with user_id support and proper filtering
import { gql } from '@apollo/client'

export const GET_CHATS = gql`
  query GetChats {
    chats(order_by: { updated_at: desc }) {
      id
      title
      user_id
      created_at
      updated_at
      messages_aggregate {
        aggregate {
          count
        }
      }
      messages(limit: 1, order_by: { created_at: desc }) {
        id
        content
        role
        created_at
      }
    }
  }
`

export const GET_MESSAGES = gql`
  query GetMessages($chat_id: uuid!) {
    messages(
      where: { chat_id: { _eq: $chat_id } }
      order_by: { created_at: asc }
    ) {
      id
      content
      role
      created_at
      chat_id
    }
  }
`

export const GET_CHAT_DETAILS = gql`
  query GetChatDetails($id: uuid!) {
    chats_by_pk(id: $id) {
      id
      title
      user_id
      created_at
      updated_at
      messages_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`

// Alternative query with explicit user filtering (if permissions don't work)
export const GET_CHATS_WITH_USER_FILTER = gql`
  query GetChatsWithUserFilter($user_id: uuid!) {
    chats(
      where: { user_id: { _eq: $user_id } }
      order_by: { updated_at: desc }
    ) {
      id
      title
      user_id
      created_at
      updated_at
      messages_aggregate {
        aggregate {
          count
        }
      }
      messages(limit: 1, order_by: { created_at: desc }) {
        id
        content
        role
        created_at
      }
    }
  }
`

// Query to get current user info
export const GET_USER_INFO = gql`
  query GetUserInfo {
    users {
      id
      email
      displayName
      createdAt
    }
  }
`

// Query with all relationships for debugging
export const GET_CHATS_DETAILED = gql`
  query GetChatsDetailed {
    chats(order_by: { updated_at: desc }) {
      id
      title
      user_id
      created_at
      updated_at
      
      # User relationship
      user {
        id
        email
        displayName
      }
      
      # Messages count
      messages_aggregate {
        aggregate {
          count
        }
      }
      
      # Latest message
      messages(limit: 1, order_by: { created_at: desc }) {
        id
        content
        role
        created_at
      }
      
      # All messages (for debugging - remove in production)
      all_messages: messages(order_by: { created_at: asc }) {
        id
        content
        role
        created_at
      }
    }
  }
`

// Subscription for real-time chat updates
export const SUBSCRIBE_CHATS = gql`
  subscription SubscribeChats {
    chats(order_by: { updated_at: desc }) {
      id
      title
      user_id
      created_at
      updated_at
      messages_aggregate {
        aggregate {
          count
        }
      }
      messages(limit: 1, order_by: { created_at: desc }) {
        id
        content
        role
        created_at
      }
    }
  }
`