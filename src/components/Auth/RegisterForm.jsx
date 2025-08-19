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
  const [userEmail, setUserEmail] = useState('')
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

    // Check password strength
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      toast.error('Password must contain uppercase, lowercase, and numbers')
      return
    }

    try {
      console.log('📝 Attempting registration with email verification...')
      
      // Method 1: Try with minimal parameters (most compatible)
      let result = await signUpEmailPassword(email, password)
      
      console.log('📋 Registration result:', result)
      console.log('✅ Success:', result.isSuccess)
      
      if (result.error) {
        console.log('❌ Error details:', JSON.stringify(result.error, null, 2))
      }
      
      // If minimal registration fails with 401, try alternative approach
      if (!result.isSuccess && result.error) {
        const errorMessage = result.error?.message || ''
        const errorStatus = result.error?.status
        
        console.log('❌ Registration failed, trying alternative method...')
        
        // Method 2: Try with redirectTo parameter
        if (errorStatus !== 401) {
          result = await signUpEmailPassword(email, password, {
            redirectTo: window.location.origin
          })
          console.log('📋 Alternative registration result:', result)
        }
      }
      
      if (result.isSuccess) {
        console.log('✅ Registration successful! Email verification may be required.')
        
        // Store the email for display
        setUserEmail(email)
        setRegistrationSuccess(true)
        
        // Show success message
        toast.success(
          '🎉 Account created! Check your email for verification link.', 
          { 
            duration: 8000,
            icon: '📧'
          }
        )
        
        // Clear form
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        
        console.log('📧 User may need to verify email before accessing the app')
        
      } else {
        console.error('❌ Registration failed:', result.error)
        handleRegistrationError(result.error)
      }
      
    } catch (err) {
      console.error('❌ Registration error:', err)
      
      if (err.message && err.message.includes('401')) {
        toast.error('Authentication error. Please check your configuration and try again.')
      } else {
        toast.error('Registration failed. Please try again.')
      }
    }
  }

  const handleRegistrationError = (errorDetails) => {
    console.log('Handling error:', errorDetails)
    
    let errorMessage = 'Registration failed'
    
    if (errorDetails) {
      const message = errorDetails.message?.toLowerCase() || ''
      const status = errorDetails.status
      
      if (status === 401) {
        errorMessage = 'Authentication configuration error. Please contact support or try again later.'
      } else if (status === 400) {
        if (message.includes('email')) {
          errorMessage = 'Invalid email format. Please use a valid email address.'
        } else if (message.includes('password')) {
          errorMessage = 'Password does not meet requirements. Must be 8+ characters with uppercase, lowercase, and numbers.'
        } else if (message.includes('user-already-exists') || message.includes('already exists')) {
          errorMessage = 'This email is already registered. Try signing in instead.'
          setTimeout(() => {
            toast.success('Switching to login...', { duration: 2000 })
            onToggle()
          }, 2000)
          return
        } else {
          errorMessage = 'Invalid registration data. Please check your information.'
        }
      } else if (status === 422) {
        errorMessage = 'Validation error. Please check your email and password format.'
      } else if (status === 429) {
        errorMessage = 'Too many registration attempts. Please wait and try again.'
      } else if (message.includes('network')) {
        errorMessage = 'Network error. Please check your connection.'
      } else {
        errorMessage = errorDetails.message || 'Registration failed. Please try again.'
      }
    } else {
      // Handle null error case (common with 401 errors)
      errorMessage = 'Registration service temporarily unavailable. Please try again in a few minutes.'
    }
    
    toast.error(errorMessage, { duration: 6000 })
  }

  // Test function for debugging 401 errors
  const testRegistration = async () => {
    try {
      console.log('🧪 Testing minimal registration...')
      
      // Test with a unique email
      const testEmail = `test-${Date.now()}@gmail.com`
      const testPassword = 'TestPassword123'
      
      const result = await signUpEmailPassword(testEmail, testPassword)
      
      console.log('🧪 Test result:', result)
      
      if (result.isSuccess) {
        toast.success('✅ Test registration successful!')
      } else {
        toast.error(`❌ Test failed: ${result.error?.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('🧪 Test error:', error)
      toast.error(`❌ Test error: ${error.message}`)
    }
  }

  // Success state
  if (registrationSuccess) {
    return (
      <div className="text-center space-y-8 animate-fade-in">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
            📧
          </div>
        </div>
        
        <div>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Account Created! 🎉
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
            Registration successful for:
          </p>
          <p className="font-semibold text-blue-600 dark:text-blue-400 break-words text-lg">
            {userEmail}
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border-l-4 border-green-500">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  ✅ What's Next?
                </h4>
                <ol className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>1. Check your email for verification link</li>
                  <li>2. Click the verification link</li>
                  <li>3. You'll be redirected to the chatbot</li>
                  <li>4. Sign in and start chatting!</li>
                </ol>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button
              onClick={onToggle}
              className="flex-1 rounded-2xl border-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              variant="secondary"
            >
              Sign In Now
            </Button>
            <Button
              onClick={() => setRegistrationSuccess(false)}
              className="flex-1 rounded-2xl"
            >
              Register Another
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 dark:from-gray-200 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
          Create Account
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Start your AI conversation journey
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={EnvelopeIcon}
          required
          className="w-full"
        />

        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Create password (8+ chars, A-z, 0-9)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={LockClosedIcon}
            required
            className="w-full pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
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
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>

        {/* Password Requirements */}
        {password && (
          <div className="space-y-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Password requirements:
            </div>
            <div className="space-y-2">
              <div className={`flex items-center space-x-2 text-sm ${password.length >= 8 ? 'text-green-600' : 'text-red-600'}`}>
                <span>{password.length >= 8 ? '✓' : '✗'}</span>
                <span>At least 8 characters</span>
              </div>
              <div className={`flex items-center space-x-2 text-sm ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-red-600'}`}>
                <span>{/[A-Z]/.test(password) ? '✓' : '✗'}</span>
                <span>Uppercase letter</span>
              </div>
              <div className={`flex items-center space-x-2 text-sm ${/[a-z]/.test(password) ? 'text-green-600' : 'text-red-600'}`}>
                <span>{/[a-z]/.test(password) ? '✓' : '✗'}</span>
                <span>Lowercase letter</span>
              </div>
              <div className={`flex items-center space-x-2 text-sm ${/\d/.test(password) ? 'text-green-600' : 'text-red-600'}`}>
                <span>{/\d/.test(password) ? '✓' : '✗'}</span>
                <span>Number</span>
              </div>
            </div>
          </div>
        )}

        <Button
          type="submit"
          loading={isLoading}
          className="w-full rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <span>Creating Account...</span>
            </div>
          ) : (
            'Create Account'
          )}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={onToggle}
            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors"
          >
            Already have an account? Sign in
          </button>
        </div>
      </form>

      {/* Debug section for development */}
      {import.meta.env.DEV && (
        <div className="mt-8 p-4 border border-yellow-500 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
          <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-3">
            🐛 Debug Tools (Development Only)
          </h4>
          <div className="space-y-2">
            <Button
              onClick={testRegistration}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
              size="sm"
            >
              🧪 Test Registration
            </Button>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              This will test registration with a random email to debug 401 errors
            </p>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded border-l-4 border-red-500">
              <p className="text-sm text-red-600 dark:text-red-400 font-semibold mb-2">
                Last Error Details:
              </p>
              <pre className="text-xs text-red-600 dark:text-red-400 overflow-auto">
                {JSON.stringify(error, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default RegisterForm