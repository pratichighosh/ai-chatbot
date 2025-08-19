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
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
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

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    try {
      console.log('📝 Attempting registration with email verification...')
      
      // Use Nhost signup with proper options
      const result = await signUpEmailPassword(email, password, {
        redirectTo: 'https://superb-starlight-670243.netlify.app/verify-email',
        allowedRoles: ['user'],
        defaultRole: 'user',
        metadata: {
          source: 'chatbot-app'
        }
      })
      
      console.log('📋 Registration result:', result)
      console.log('✅ Success:', result.isSuccess)
      console.log('❌ Error:', result.error)
      
      if (result.isSuccess) {
        console.log('✅ Registration successful! Email verification required.')
        setRegistrationSuccess(true)
        
        toast.success(
          '🎉 Account created! Check your email for verification link.', 
          { duration: 8000 }
        )
        
        // Clear form
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        
      } else {
        // Enhanced error handling
        console.error('❌ Registration failed:', result.error)
        
        let errorMessage = 'Failed to create account'
        
        if (result.error) {
          const errorDetails = result.error
          console.log('Error details:', errorDetails)
          
          // Handle different error types
          if (errorDetails.message) {
            const message = errorDetails.message.toLowerCase()
            
            if (message.includes('email-already-in-use') || message.includes('already exists') || message.includes('duplicate')) {
              errorMessage = 'This email is already registered. Try signing in instead.'
              setTimeout(() => {
                toast.success('Switching to login form...', { duration: 2000 })
                onToggle()
              }, 2000)
            } else if (message.includes('invalid-email') || message.includes('email')) {
              errorMessage = 'Please enter a valid email address'
            } else if (message.includes('weak-password') || message.includes('password')) {
              errorMessage = 'Password is too weak. Please choose a stronger password (min 8 characters)'
            } else if (message.includes('network') || message.includes('connection')) {
              errorMessage = 'Network error. Please check your connection and try again'
            } else if (message.includes('signup') || message.includes('registration')) {
              errorMessage = 'Registration is currently disabled. Please contact support.'
            } else {
              errorMessage = `Registration failed: ${errorDetails.message}`
            }
          } else if (errorDetails.error) {
            errorMessage = `Error: ${errorDetails.error}`
          } else {
            errorMessage = 'Registration failed. Please check your email and password.'
          }
        }
        
        toast.error(errorMessage, { duration: 5000 })
      }
    } catch (err) {
      console.error('❌ Registration error:', err)
      toast.error('Network error. Please check your connection and try again.')
    }
  }

  // Success state after registration
  if (registrationSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Check Your Email! 📧
        </h3>
        
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            We've sent a verification email to <strong>{email}</strong>
          </p>
          
          <div className="glass rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
              Next Steps:
            </h4>
            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
              <li>Check your email inbox (and spam folder)</li>
              <li>Click the "Verify Email" button in the email</li>
              <li>You'll be redirected to the AI Chatbot automatically</li>
              <li>Sign in with your email and password</li>
            </ol>
          </div>
          
          <div className="glass rounded-lg p-4 border-l-4 border-green-500">
            <p className="text-sm text-green-700 dark:text-green-300">
              🤖 <strong>Direct Link:</strong> The verification email will take you directly to 
              <br />
              <a href="https://superb-starlight-670243.netlify.app" className="underline">
                superb-starlight-670243.netlify.app
              </a>
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Button
              onClick={onToggle}
              className="flex-1 rounded-xl"
              variant="secondary"
            >
              Go to Sign In
            </Button>
            <Button
              onClick={() => setRegistrationSuccess(false)}
              className="flex-1 rounded-xl"
            >
              Register Another Account
            </Button>
          </div>
        </div>
        
        <div className="glass rounded-lg p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            💡 <strong>Didn't receive the email?</strong> Check your spam folder or wait a few minutes and try again.
          </p>
        </div>
      </div>
    )
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
            🚀 After Registration:
          </h4>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>• You'll receive a verification email instantly</li>
            <li>• Click the verification button in the email</li>
            <li>• You'll be redirected directly to the AI Chatbot</li>
            <li>• Sign in and start chatting immediately!</li>
          </ul>
        </div>
        
        {/* Debug info for development */}
        {import.meta.env.DEV && error && (
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