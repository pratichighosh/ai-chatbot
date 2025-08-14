import React, { useState } from 'react'
import { useSignInEmailPassword } from '@nhost/react'
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import Button from '../UI/Button'
import Input from '../UI/Input'
import toast from 'react-hot-toast'

const LoginForm = ({ onToggle }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { signInEmailPassword, isLoading, error } = useSignInEmailPassword()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    console.log('Attempting to login with:', email)
    
    try {
      const result = await signInEmailPassword(email, password)
      
      console.log('Login result:', result)
      
      if (result.isSuccess) {
        toast.success('🎉 Welcome back! Login successful!', {
          duration: 3000
        })
        // Clear form
        setEmail('')
        setPassword('')
      } else {
        // Handle specific error cases
        console.log('Login error:', result.error)
        
        if (result.error?.status === 401) {
          toast.error('❌ Invalid email or password. Please check your credentials.', {
            duration: 4000
          })
        } else if (result.error?.status === 404) {
          toast.error('📧 Account not found. Would you like to create an account?', {
            duration: 4000
          })
          setTimeout(() => {
            toast.success('Switching to registration form...', { duration: 2000 })
            onToggle()
          }, 2000)
        } else if (result.error?.message) {
          const errorMessage = result.error.message.toLowerCase()
          if (errorMessage.includes('email')) {
            toast.error('❌ Please check your email address')
          } else if (errorMessage.includes('password')) {
            toast.error('❌ Please check your password')
          } else if (errorMessage.includes('verification') || errorMessage.includes('verify')) {
            toast.error('📧 Please verify your email address first', {
              duration: 5000
            })
          } else {
            toast.error(`❌ Login failed: ${result.error.message}`)
          }
        } else {
          toast.error('❌ Login failed. Please try again.')
        }
      }
    } catch (err) {
      console.error('Login error:', err)
      toast.error('❌ Network error. Please check your connection and try again.')
    }
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Welcome back
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Sign in to continue your conversations
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={EnvelopeIcon}
            required
            className="w-full"
          />
        </div>

        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={LockClosedIcon}
            required
            className="w-full pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        <Button
          type="submit"
          loading={isLoading}
          className="w-full rounded-xl shadow-lg hover-lift"
          size="lg"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={onToggle}
            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
          >
            Don't have an account? Sign up
          </button>
        </div>
      </form>

      {/* Helper Information */}
      <div className="mt-6 space-y-3">
        <div className="glass rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            🔐 Login Help:
          </h4>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Use the email and password you registered with</li>
            <li>• Make sure your email is verified</li>
            <li>• Check your email for verification link if needed</li>
            <li>• If account doesn't exist, we'll help you create one</li>
          </ul>
        </div>

        {/* Test Credentials Helper */}
        <div className="glass rounded-lg p-4 border-l-4 border-blue-500">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            🧪 Testing Steps:
          </h4>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <p><strong>New User:</strong> Try registering with a fresh email</p>
            <p><strong>Existing User:</strong> Use your registered credentials</p>
            <p><strong>Email in use:</strong> We'll auto-switch you to login</p>
          </div>
        </div>
        
        {error && (
          <div className="glass rounded-lg p-4 border-l-4 border-red-500">
            <p className="text-sm text-red-600 dark:text-red-400">
              Debug info: {JSON.stringify(error, null, 2)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoginForm