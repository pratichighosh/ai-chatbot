import { gql } from '@apollo/client'

// Chat Management Mutations
export const CREATE_CHAT = gql`
  mutation CreateChat($title: String!) {
    insert_chats_one(object: { title: $title }) {
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

export const UPDATE_CHAT_TITLE = gql`
  mutation UpdateChatTitle($id: uuid!, $title: String!) {
    update_chats_by_pk(pk_columns: { id: $id }, _set: { title: $title }) {
      id
      title
      updated_at
      user_id
    }
  }
`

export const DELETE_CHAT = gql`
  mutation DeleteChat($id: uuid!) {
    delete_messages(where: { chat_id: { _eq: $id } }) {
      affected_rows
    }
    delete_chats_by_pk(id: $id) {
      id
      title
      user_id
      created_at
      updated_at
    }
  }
`

export const UPDATE_CHAT_TIMESTAMP = gql`
  mutation UpdateChatTimestamp($id: uuid!) {
    update_chats_by_pk(
      pk_columns: { id: $id }, 
      _set: { updated_at: "now()" }
    ) {
      id
      updated_at
    }
  }
`

// Message Management Mutations
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
      chat_id
      created_at
      updated_at
    }
  }
`

export const UPDATE_MESSAGE = gql`
  mutation UpdateMessage($id: uuid!, $content: String!) {
    update_messages_by_pk(
      pk_columns: { id: $id }, 
      _set: { content: $content, updated_at: "now()" }
    ) {
      id
      content
      role
      updated_at
      chat_id
    }
  }
`

export const DELETE_MESSAGE = gql`
  mutation DeleteMessage($id: uuid!) {
    delete_messages_by_pk(id: $id) {
      id
      content
      role
      chat_id
      created_at
    }
  }
`

export const DELETE_MESSAGES_BY_CHAT = gql`
  mutation DeleteMessagesByChat($chat_id: uuid!) {
    delete_messages(where: { chat_id: { _eq: $chat_id } }) {
      affected_rows
      returning {
        id
        content
        role
      }
    }
  }
`

// AI Service Actions
export const SEND_MESSAGE_ACTION = gql`
  mutation SendMessage($chat_id: uuid!, $message: String!) {
    sendMessage(chat_id: $chat_id, message: $message) {
      message
      success
    }
  }
`

// Batch Operations
export const INSERT_MULTIPLE_MESSAGES = gql`
  mutation InsertMultipleMessages($messages: [messages_insert_input!]!) {
    insert_messages(objects: $messages) {
      affected_rows
      returning {
        id
        content
        role
        chat_id
        created_at
      }
    }
  }
`

export const BULK_DELETE_CHATS = gql`
  mutation BulkDeleteChats($chat_ids: [uuid!]!) {
    delete_messages(where: { chat_id: { _in: $chat_ids } }) {
      affected_rows
    }
    delete_chats(where: { id: { _in: $chat_ids } }) {
      affected_rows
      returning {
        id
        title
      }
    }
  }
`

// Chat Search and Filter
export const ARCHIVE_CHAT = gql`
  mutation ArchiveChat($id: uuid!, $archived: Boolean = true) {
    update_chats_by_pk(
      pk_columns: { id: $id }, 
      _set: { archived: $archived, updated_at: "now()" }
    ) {
      id
      title
      archived
      updated_at
    }
  }
`

export const SET_CHAT_FAVORITE = gql`
  mutation SetChatFavorite($id: uuid!, $is_favorite: Boolean = true) {
    update_chats_by_pk(
      pk_columns: { id: $id }, 
      _set: { is_favorite: $is_favorite, updated_at: "now()" }
    ) {
      id
      title
      is_favorite
      updated_at
    }
  }
`

// Message Reactions (if you want to add this feature)
export const ADD_MESSAGE_REACTION = gql`
  mutation AddMessageReaction($message_id: uuid!, $reaction: String!) {
    insert_message_reactions_one(object: {
      message_id: $message_id,
      reaction: $reaction
    }) {
      id
      reaction
      message_id
      user_id
      created_at
    }
  }
`

export const REMOVE_MESSAGE_REACTION = gql`
  mutation RemoveMessageReaction($message_id: uuid!, $reaction: String!) {
    delete_message_reactions(where: {
      message_id: { _eq: $message_id },
      reaction: { _eq: $reaction },
      user_id: { _eq: "X-Hasura-User-Id" }
    }) {
      affected_rows
    }
  }
`

// User Preferences
export const UPDATE_USER_PREFERENCES = gql`
  mutation UpdateUserPreferences($user_id: uuid!, $preferences: jsonb!) {
    update_users_by_pk(
      pk_columns: { id: $user_id },
      _set: { preferences: $preferences }
    ) {
      id
      preferences
      updated_at
    }
  }
`

// Chat Statistics
export const UPDATE_CHAT_STATS = gql`
  mutation UpdateChatStats($chat_id: uuid!) {
    update_chats_by_pk(
      pk_columns: { id: $chat_id },
      _inc: { message_count: 1 },
      _set: { last_activity: "now()", updated_at: "now()" }
    ) {
      id
      message_count
      last_activity
      updated_at
    }
  }
`

// Error Recovery
export const RETRY_FAILED_MESSAGE = gql`
  mutation RetryFailedMessage($original_message_id: uuid!, $chat_id: uuid!, $message: String!) {
    delete_messages_by_pk(id: $original_message_id) {
      id
    }
    sendMessage(chat_id: $chat_id, message: $message) {
      message
      success
    }
  }
`

// Export Management
export const EXPORT_CHAT_DATA = gql`
  mutation ExportChatData($chat_id: uuid!) {
    export_chat(chat_id: $chat_id) {
      success
      download_url
      expires_at
    }
  }
`

// Maintenance Operations (Admin only)
export const CLEANUP_OLD_MESSAGES = gql`
  mutation CleanupOldMessages($days_old: Int = 90) {
    delete_messages(where: {
      created_at: { _lt: "now() - interval '${days_old} days'" },
      role: { _eq: "system" }
    }) {
      affected_rows
    }
  }
`

// Chat Templates (for future use)
export const CREATE_CHAT_FROM_TEMPLATE = gql`
  mutation CreateChatFromTemplate($template_id: uuid!, $title: String!) {
    insert_chats_one(object: {
      title: $title,
      template_id: $template_id
    }) {
      id
      title
      template_id
      created_at
      template {
        id
        name
        description
      }
    }
  }
`

// Conversation Sharing (for future use)
export const SHARE_CONVERSATION = gql`
  mutation ShareConversation($chat_id: uuid!, $share_settings: jsonb!) {
    insert_shared_chats_one(object: {
      chat_id: $chat_id,
      settings: $share_settings,
      expires_at: "now() + interval '7 days'"
    }) {
      id
      share_token
      expires_at
      settings
      chat {
        id
        title
      }
    }
  }
`

export const REVOKE_CHAT_SHARE = gql`
  mutation RevokeChatShare($share_token: String!) {
    delete_shared_chats(where: { share_token: { _eq: $share_token } }) {
      affected_rows
    }
  }
`