import React from 'react'
import clsx from 'clsx'

const LoadingSpinner = ({ 
  size = 'md', 
  className, 
  color = 'primary',
  label = 'Loading...' 
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const colors = {
    primary: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-400',
    inherit: 'text-current'
  }

  return (
    <div className={clsx('inline-flex items-center', className)}>
      <svg
        className={clsx(
          'animate-spin',
          sizes[size],
          colors[color]
        )}
        fill="none"
        viewBox="0 0 24 24"
        aria-label={label}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  )
}

// Skeleton Loading Components
export const SkeletonLine = ({ className, width = 'full' }) => {
  const widths = {
    full: 'w-full',
    '3/4': 'w-3/4',
    '1/2': 'w-1/2',
    '1/4': 'w-1/4'
  }

  return (
    <div
      className={clsx(
        'h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse',
        widths[width],
        className
      )}
    />
  )
}

export const SkeletonBox = ({ className, height = 'h-12' }) => (
  <div
    className={clsx(
      'bg-gray-200 dark:bg-gray-700 rounded animate-pulse',
      height,
      className
    )}
  />
)

export const SkeletonText = ({ lines = 3, className }) => (
  <div className={clsx('space-y-3', className)}>
    {[...Array(lines)].map((_, i) => (
      <SkeletonLine
        key={i}
        width={i === lines - 1 ? '3/4' : 'full'}
      />
    ))}
  </div>
)

export const SkeletonCard = ({ className }) => (
  <div className={clsx('glass p-4 rounded-lg', className)}>
    <div className="flex items-center space-x-3 mb-4">
      <SkeletonBox className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <SkeletonLine width="1/2" />
        <SkeletonLine width="1/4" />
      </div>
    </div>
    <SkeletonText lines={2} />
  </div>
)

// Pulsing Dot Loader
export const DotLoader = ({ className, color = 'primary' }) => {
  const colors = {
    primary: 'bg-blue-500',
    gray: 'bg-gray-400',
    white: 'bg-white'
  }

  return (
    <div className={clsx('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={clsx(
            'w-2 h-2 rounded-full animate-bounce',
            colors[color]
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  )
}

// Spinner with text
export const LoadingState = ({ 
  message = 'Loading...', 
  className,
  size = 'md' 
}) => (
  <div className={clsx('flex flex-col items-center justify-center', className)}>
    <LoadingSpinner size={size} className="mb-3" />
    <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
      {message}
    </p>
  </div>
)

// Page Loading Overlay
export const LoadingOverlay = ({ message = 'Loading...', isVisible = true }) => {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="glass-strong rounded-2xl p-8 mx-4 max-w-sm w-full">
        <LoadingState message={message} size="lg" />
      </div>
    </div>
  )
}

export default LoadingSpinner