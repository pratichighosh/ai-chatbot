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
      
      // Use signUpEmailPassword with email verification enabled
      const result = await signUpEmailPassword(email, password, {
        // This forces email verification to be required
        redirectTo: `${window.location.origin}/verify-email`,
        options: {
          // Additional options to ensure email verification
          emailRedirectTo: `${window.location.origin}/verify-email`
        }
      })
      
      console.log('📋 Registration result:', result)
      console.log('✅ Success:', result.isSuccess)
      
      if (result.error) {
        console.log('❌ Error details:', JSON.stringify(result.error, null, 2))
      }
      
      if (result.isSuccess) {
        console.log('✅ Registration successful! Email verification required.')
        
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
        
        // Important: Clear form but DON'T log the user in
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        
        console.log('📧 User must verify email before accessing the app')
        
      } else {
        console.error('❌ Registration failed:', result.error)
        handleRegistrationError(result.error)
      }
      
    } catch (err) {
      console.error('❌ Registration error:', err)
      toast.error('Registration failed. Please try again.')
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

  // Enhanced success state - User must verify email
  if (registrationSuccess) {
    return (
      <div className="text-center space-y-8 animate-fade-in">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
            ✉️
          </div>
        </div>
        
        <div>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Check Your Email! 📧
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
            We've sent a verification email to:
          </p>
          <p className="font-semibold text-blue-600 dark:text-blue-400 break-words text-lg">
            {userEmail}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            You must verify your email before you can access the AI Chatbot
          </p>
        </div>
        
        <div className="space-y-6">
          {/* Step-by-step instructions */}
          <div className="glass-card rounded-2xl p-6 border-l-4 border-blue-500">
            <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
              <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm mr-3">📋</span>
              Follow These Steps:
            </h4>
            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-3 list-none">
              <li className="flex items-start space-x-3">
                <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">1</span>
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">Check your email inbox</p>
                  <p className="text-xs">Look for an email from Nhost (check spam folder too)</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">2</span>
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">Click "Verify Email" button</p>
                  <p className="text-xs">This will open in a new tab/window</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">3</span>
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">AI Chatbot will open automatically</p>
                  <p className="text-xs">You'll be redirected to the chatbot after verification</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">4</span>
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">Sign in and start chatting!</p>
                  <p className="text-xs">Use your email and password to sign in</p>
                </div>
              </li>
            </ol>
          </div>
          
          {/* Email verification details */}
          <div className="glass-card rounded-2xl p-6 border-l-4 border-green-500">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  🔒 Email Verification Required
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                  For security, you must verify your email address before accessing the AI Chatbot.
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  ✨ The verification link will take you directly to: <br/>
                  <span className="font-mono bg-green-50 dark:bg-green-900/20 px-1 rounded">
                    superb-starlight-670243.netlify.app
                  </span>
                </p>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={onToggle}
              className="flex-1 rounded-2xl border-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              variant="secondary"
            >
              Already verified? Sign In
            </Button>
            <Button
              onClick={() => setRegistrationSuccess(false)}
              className="flex-1 rounded-2xl"
            >
              Try Different Email
            </Button>
          </div>
        </div>

        {/* Help section */}
        <div className="glass rounded-2xl p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start space-x-2">
            <span className="text-yellow-500">💡</span>
            <div className="text-left">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                Didn't receive the email?
              </p>
              <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• Check your spam/junk folder</li>
                <li>• Wait 2-3 minutes for the email to arrive</li>
                <li>• Make sure {userEmail} is correct</li>
                <li>• Try registering again if needed</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Warning about verification requirement */}
        <div className="glass-card rounded-2xl p-4 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
              ⚠️ You cannot access the AI Chatbot until you verify your email
            </p>
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

      {/* Important note about email verification */}
      <div className="mt-8 glass-card rounded-2xl p-4 border-l-4 border-blue-500">
        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
          <span className="text-blue-500 mr-2">🔐</span>
          Email Verification Required:
        </h4>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
          <li className="flex items-start space-x-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>After registration, you MUST verify your email</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>You cannot access the AI Chatbot without verification</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>The verification email will contain a direct link to the chatbot</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>Click the link → Chatbot opens → Sign in → Start chatting!</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default RegisterForm