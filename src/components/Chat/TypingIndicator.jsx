import React from 'react'

const TypingIndicator = () => {
  return (
    <div className="flex justify-start mb-4">
      <div className="glass max-w-xs px-4 py-3 rounded-2xl">
        <div className="typing-indicator">
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
        </div>
      </div>
    </div>
  )
}

export default TypingIndicator