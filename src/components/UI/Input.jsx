import React from 'react'
import clsx from 'clsx'

const Input = ({ 
  label, 
  error, 
  className, 
  icon: Icon,
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          className={clsx(
            'block w-full rounded-lg border-0 glass placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200',
            Icon ? 'pl-10 pr-4 py-3' : 'px-4 py-3',
            error && 'ring-2 ring-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}

export default Input