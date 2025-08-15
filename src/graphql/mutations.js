// src/graphql/mutations.js
import { gql } from '@apollo/client'

export const CREATE_CHAT = gql`
  mutation CreateChat($title: String!) {
    insert_chats_one(object: { title: $title }) {
      id
      title
      user_id
      created_at
      updated_at
    }
  }
`

export const INSERT_MESSAGE = gql`
  mutation InsertMessage($chat_id: uuid!, $content: String!, $role: String!) {
    insert_messages_one(object: {
      chat_id: $chat_id,
      content: $content,
      role: $role
    }) {
      id
      content
      role
      user_id
      created_at
    }
  }
`

export const SEND_MESSAGE_ACTION = gql`
  mutation SendMessage($chat_id: uuid!, $message: String!) {
    sendMessage(chat_id: $chat_id, message: $message) {
      message
      success
    }
  }
`

export const UPDATE_CHAT_TITLE = gql`
  mutation UpdateChatTitle($id: uuid!, $title: String!) {
    update_chats_by_pk(pk_columns: { id: $id }, _set: { title: $title }) {
      id
      title
      updated_at
    }
  }
`

export const DELETE_CHAT = gql`
  mutation DeleteChat($id: uuid!) {
    delete_chats_by_pk(id: $id) {
      id
      title
    }
  }
`