export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
}

export const MESSAGE_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant'
}

export const CHAT_EVENTS = {
  NEW_MESSAGE: 'new_message',
  TYPING_START: 'typing_start',
  TYPING_END: 'typing_end'
}

// Gemini AI specific constants
export const AI_PROVIDER = {
  NAME: 'Google Gemini',
  MODEL: 'gemini-pro',
  VERSION: 'v1beta',
  MAX_TOKENS: 800,
  TEMPERATURE: 0.7
}

// Gemini API response statuses
export const GEMINI_FINISH_REASONS = {
  STOP: 'STOP',                    // Natural completion
  MAX_TOKENS: 'MAX_TOKENS',        // Hit token limit
  SAFETY: 'SAFETY',                // Content filtered for safety
  RECITATION: 'RECITATION',        // Content filtered for recitation
  OTHER: 'OTHER'                   // Other reason
}

// Content safety categories for Gemini
export const SAFETY_CATEGORIES = {
  HARASSMENT: 'HARM_CATEGORY_HARASSMENT',
  HATE_SPEECH: 'HARM_CATEGORY_HATE_SPEECH',
  SEXUALLY_EXPLICIT: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
  DANGEROUS_CONTENT: 'HARM_CATEGORY_DANGEROUS_CONTENT'
}

// Safety threshold levels
export const SAFETY_THRESHOLDS = {
  BLOCK_NONE: 'BLOCK_NONE',
  BLOCK_ONLY_HIGH: 'BLOCK_ONLY_HIGH',
  BLOCK_MEDIUM_AND_ABOVE: 'BLOCK_MEDIUM_AND_ABOVE',
  BLOCK_LOW_AND_ABOVE: 'BLOCK_LOW_AND_ABOVE'
}

// Error types for better error handling
export const ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  CONTENT_FILTERED: 'CONTENT_FILTERED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
}

// User-friendly error messages
export const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK_ERROR]: 'Network connection issue. Please check your internet and try again.',
  [ERROR_TYPES.API_ERROR]: 'AI service temporarily unavailable. Please try again in a moment.',
  [ERROR_TYPES.PERMISSION_ERROR]: 'Permission denied. Please refresh the page and try again.',
  [ERROR_TYPES.AUTHENTICATION_ERROR]: 'Authentication failed. Please log in again.',
  [ERROR_TYPES.RATE_LIMIT_ERROR]: 'Too many requests. Please wait a moment before trying again.',
  [ERROR_TYPES.CONTENT_FILTERED]: 'Content was filtered for safety. Please rephrase your message.',
  [ERROR_TYPES.QUOTA_EXCEEDED]: 'AI service is busy. Please try again later.',
  [ERROR_TYPES.UNKNOWN_ERROR]: 'Something went wrong. Please try again.'
}

// Gemini-specific configuration
export const GEMINI_CONFIG = {
  BASE_URL: 'https://generativelanguage.googleapis.com/v1beta',
  MODEL_NAME: 'gemini-pro',
  DEFAULT_GENERATION_CONFIG: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 800,
    stopSequences: []
  },
  DEFAULT_SAFETY_SETTINGS: [
    {
      category: SAFETY_CATEGORIES.HARASSMENT,
      threshold: SAFETY_THRESHOLDS.BLOCK_MEDIUM_AND_ABOVE
    },
    {
      category: SAFETY_CATEGORIES.HATE_SPEECH,
      threshold: SAFETY_THRESHOLDS.BLOCK_MEDIUM_AND_ABOVE
    },
    {
      category: SAFETY_CATEGORIES.SEXUALLY_EXPLICIT,
      threshold: SAFETY_THRESHOLDS.BLOCK_MEDIUM_AND_ABOVE
    },
    {
      category: SAFETY_CATEGORIES.DANGEROUS_CONTENT,
      threshold: SAFETY_THRESHOLDS.BLOCK_MEDIUM_AND_ABOVE
    }
  ]
}

// Chat interface constants
export const CHAT_LIMITS = {
  MAX_MESSAGE_LENGTH: 1000,
  MAX_TITLE_LENGTH: 100,
  TYPING_INDICATOR_TIMEOUT: 30000, // 30 seconds
  AUTO_SCROLL_THRESHOLD: 100
}

// Animation timings
export const ANIMATIONS = {
  MESSAGE_APPEAR: 300,
  TYPING_DOT_DELAY: 150,
  SCROLL_DURATION: 500,
  FADE_DURATION: 200
}

// Responsive breakpoints
export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 768,
  DESKTOP: 1024,
  LARGE: 1280
}

// Theme configuration
export const THEME_CONFIG = {
  STORAGE_KEY: 'chatbot-theme',
  DEFAULT_THEME: THEMES.SYSTEM,
  TRANSITION_DURATION: 150
}

// Toast notification settings
export const TOAST_CONFIG = {
  DURATION: {
    SUCCESS: 3000,
    ERROR: 4000,
    INFO: 3000,
    WARNING: 4000
  },
  POSITION: 'top-center',
  MAX_TOASTS: 3
}

// Feature flags
export const FEATURES = {
  VOICE_INPUT: false,          // Voice input feature
  MESSAGE_REACTIONS: false,    // Message reactions
  FILE_UPLOAD: false,          // File upload support
  MESSAGE_SEARCH: false,       // Search in messages
  EXPORT_CHAT: false,          // Export conversation
  DARK_MODE_AUTO: true,        // Auto dark mode
  TYPING_INDICATOR: true,      // Show typing indicator
  MESSAGE_TIMESTAMPS: true,    // Show message timestamps
  COPY_MESSAGES: true,         // Copy message functionality
  DELETE_MESSAGES: false       // Delete individual messages
}