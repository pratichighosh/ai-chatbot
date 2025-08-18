import React, { useState } from 'react'
import { useSignUpEmailPassword } from '@nhost/react'
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import Button from '../UI/Button'
import Input from '../UI/Input'
import toast from 'react-hot-toast'

const RegisterForm = ({ onToggle }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { signUpEmailPassword, isLoading, error } = useSignUpEmailPassword()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    console.log('🔐 Registration attempt:', { email, passwordLength: password.length })
    
    // Enhanced validation
    if (!email || !password || !confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    // Password strength validation
    if (password.length < 8) {
      toast.error('Password should be at least 8 characters for better security')
      return
    }

    try {
      console.log('📝 Attempting registration...')
      
      const result = await signUpEmailPassword(email, password)
      
      console.log('📋 Registration result:', result)
      console.log('✅ Success:', result.isSuccess)
      console.log('❌ Error:', result.error)
      
      if (result.isSuccess) {
        console.log('✅ Registration successful!')
        toast.success('🎉 Account created successfully! Please check your email to verify your account.', {
          duration: 5000
        })
        
        // Clear form
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        
        // Optional: Auto-switch to login after a delay
        setTimeout(() => {
          toast.success('Switching to login...', { duration: 2000 })
          onToggle()
        }, 3000)
        
      } else {
        // Handle different types of errors
        console.error('❌ Registration failed:', result.error)
        
        let errorMessage = 'Failed to create account'
        
        if (result.error) {
          const errorCode = result.error.error || result.error.message || result.error
          
          if (typeof errorCode === 'string') {
            if (errorCode.includes('email-already-in-use') || errorCode.includes('already exists')) {
              errorMessage = 'This email is already registered. Try signing in instead.'
              setTimeout(() => {
                toast.success('Switching to login form...', { duration: 2000 })
                onToggle()
              }, 2000)
            } else if (errorCode.includes('invalid-email')) {
              errorMessage = 'Please enter a valid email address'
            } else if (errorCode.includes('weak-password')) {
              errorMessage = 'Password is too weak. Please choose a stronger password'
            } else if (errorCode.includes('network')) {
              errorMessage = 'Network error. Please check your connection and try again'
            } else {
              errorMessage = `Registration failed: ${errorCode}`
            }
          }
        }
        
        toast.error(errorMessage, { duration: 4000 })
      }
    } catch (err) {
      console.error('❌ Registration error:', err)
      toast.error('Network error. Please check your connection and try again.')
    }
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Create account
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Start your AI conversation journey
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={EnvelopeIcon}
          required
          className="w-full"
        />

        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a password (min 8 characters)"
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

        <div className="relative">
          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={LockClosedIcon}
            required
            className="w-full pr-12"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Password Strength Indicator */}
        {password && (
          <div className="space-y-2">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Password strength:
            </div>
            <div className="flex space-x-1">
              <div className={`h-1 flex-1 rounded ${password.length >= 6 ? 'bg-red-400' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
              <div className={`h-1 flex-1 rounded ${password.length >= 8 ? 'bg-yellow-400' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
              <div className={`h-1 flex-1 rounded ${password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {password.length < 6 && 'Too short'}
              {password.length >= 6 && password.length < 8 && 'Weak'}
              {password.length >= 8 && password.length < 10 && 'Good'}
              {password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password) && 'Strong'}
            </div>
          </div>
        )}

        <Button
          type="submit"
          loading={isLoading}
          className="w-full rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={onToggle}
            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
          >
            Already have an account? Sign in
          </button>
        </div>
      </form>

      {/* Helper Information */}
      <div className="mt-6 space-y-3">
        <div className="glass rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            📧 Registration Help:
          </h4>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Use a valid email address</li>
            <li>• Password must be at least 8 characters</li>
            <li>• Check your email for verification link</li>
            <li>• Make sure passwords match</li>
          </ul>
        </div>
        
        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && error && (
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

export default RegisterForm