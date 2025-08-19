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

    // Check password strength
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      toast.error('Password must contain uppercase, lowercase, and numbers')
      return
    }

    try {
      console.log('📝 Attempting registration...')
      
      // Method 1: Try with minimal parameters first
      console.log('Trying minimal registration...')
      let result = await signUpEmailPassword(email, password)
      
      console.log('📋 Minimal registration result:', result)
      
      // If minimal registration fails, it's likely a fundamental issue
      if (!result.isSuccess && result.error) {
        console.log('❌ Minimal registration failed, trying alternative method...')
        
        // Method 2: Try with different parameter structure
        result = await signUpEmailPassword(email, password, {
          redirectTo: `${window.location.origin}/verify-email`
        })
        
        console.log('📋 Alternative registration result:', result)
      }
      
      // If still failing, try Method 3: Manual fetch
      if (!result.isSuccess && result.error) {
        console.log('❌ Hook method failed, trying manual fetch...')
        result = await manualRegistration(email, password)
      }
      
      if (result.isSuccess) {
        console.log('✅ Registration successful!')
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
        console.error('❌ All registration methods failed:', result.error)
        handleRegistrationError(result.error)
      }
      
    } catch (err) {
      console.error('❌ Registration error:', err)
      toast.error('Registration failed. Please try again.')
    }
  }

  // Manual registration method as fallback
  const manualRegistration = async (email, password) => {
    try {
      const response = await fetch(`https://monujjeszxsjvhmhbgek.auth.ap-south-1.nhost.run/v1/signup/email-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password: password,
          options: {
            redirectTo: `${window.location.origin}/verify-email`
          }
        })
      })

      console.log('Manual registration response status:', response.status)
      
      const data = await response.json()
      console.log('Manual registration data:', data)

      if (response.ok) {
        return { isSuccess: true, data }
      } else {
        return { isSuccess: false, error: data }
      }
    } catch (error) {
      console.error('Manual registration error:', error)
      return { isSuccess: false, error }
    }
  }

  const handleRegistrationError = (errorDetails) => {
    console.log('Handling error:', errorDetails)
    
    let errorMessage = 'Registration failed'
    
    if (errorDetails) {
      const message = errorDetails.message?.toLowerCase() || ''
      const status = errorDetails.status
      
      if (status === 400) {
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
    }
    
    toast.error(errorMessage, { duration: 6000 })
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
            Check Your Email! 📧
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            We've sent a verification email to
          </p>
          <p className="font-semibold text-blue-600 dark:text-blue-400 break-words">
            {email}
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border-l-4 border-blue-500">
            <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
              <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm mr-2">✓</span>
              Next Steps:
            </h4>
            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-none">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">1.</span>
                <span>Check your email inbox (and spam folder)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">2.</span>
                <span>Click the <strong>"Verify Email"</strong> button</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">3.</span>
                <span>You'll be redirected to the AI Chatbot</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">4.</span>
                <span>Sign in and start chatting! 🤖</span>
              </li>
            </ol>
          </div>
          
          <div className="glass-card rounded-2xl p-6 border-l-4 border-green-500">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">
                  🚀 Direct Redirect
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Clicking the verification link will open your AI Chatbot at:
                </p>
                <p className="text-xs font-mono bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded mt-1 break-all">
                  superb-starlight-670243.netlify.app
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button
              onClick={onToggle}
              className="flex-1 rounded-2xl border-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              variant="secondary"
            >
              Go to Sign In
            </Button>
            <Button
              onClick={() => setRegistrationSuccess(false)}
              className="flex-1 rounded-2xl"
            >
              Try Another Email
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

        {/* Enhanced Password Requirements */}
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

      {/* Enhanced Helper Information */}
      <div className="mt-8 space-y-4">
        <div className="glass-card rounded-2xl p-4">
          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <span className="text-blue-500 mr-2">📧</span>
            Email Verification Process:
          </h4>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 font-bold">1.</span>
              <span>Enter your email and create a strong password</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 font-bold">2.</span>
              <span>Click "Create Account" - we'll send verification email</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 font-bold">3.</span>
              <span>Check your email and click verification link</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 font-bold">4.</span>
              <span>Verification link opens your AI Chatbot automatically</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 font-bold">5.</span>
              <span>Sign in with your credentials and start chatting!</span>
            </li>
          </ul>
        </div>
        
        {/* Debug info for development */}
        {import.meta.env.DEV && error && (
          <div className="glass rounded-2xl p-4 border-l-4 border-red-500">
            <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">
              🐛 Debug Information:
            </h4>
            <div className="text-xs text-red-600 dark:text-red-400 space-y-1">
              <p><strong>Error Message:</strong> {error.message}</p>
              <p><strong>Error Status:</strong> {error.status}</p>
              <details className="mt-2">
                <summary className="cursor-pointer font-semibold">Full Error Details</summary>
                <pre className="mt-2 text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(error, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RegisterForm
