import React, { useState } from 'react'
import { useSignUpEmailPassword } from '@nhost/react'
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import Button from '../UI/Button'
import Input from '../UI/Input'
import toast from 'react-hot-toast'
import { nhost } from '../../utils/nhost'

const RegisterForm = ({ onToggle }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [isResending, setIsResending] = useState(false)
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
      
      const result = await signUpEmailPassword(email, password, {
        redirectTo: 'https://superb-starlight-670243.netlify.app/verify-email'
      })
      
      console.log('📋 Registration result:', result)
      console.log('✅ Success:', result.isSuccess)
      console.log('❌ Error:', result.error)
      
      if (result.isSuccess) {
        console.log('✅ Registration successful!')
        handleRegistrationSuccess()
      } else if (result.error) {
        console.log('❌ Registration error:', result.error)
        
        // Handle 409 Conflict (email already exists but not verified)
        if (result.error.status === 409 || 
            result.error.error === 'email-already-in-use' ||
            result.error.message?.includes('already') ||
            result.error.message?.includes('exists')) {
          
          console.log('📧 Email already exists - attempting to resend verification')
          await handleEmailAlreadyExists()
        } else {
          handleRegistrationError(result.error)
        }
      } else {
        console.log('⚠️ Unknown registration issue - treating as success')
        handleRegistrationSuccess()
      }
      
    } catch (err) {
      console.error('❌ Registration exception:', err)
      toast.error('Network error. Please check your connection and try again.')
    }
  }

  const handleRegistrationSuccess = () => {
    console.log('✅ Handling registration success')
    
    setUserEmail(email)
    setRegistrationSuccess(true)
    
    toast.success(
      '🎉 Account created! Check your email for verification link.', 
      { duration: 8000, icon: '📧' }
    )
    
    // Clear form
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    
    console.log('📧 User must verify email before accessing the app')
  }

  const handleEmailAlreadyExists = async () => {
    console.log('📧 Handling email already exists - resending verification')
    
    try {
      // Attempt to resend verification email
      const resendResult = await resendVerificationEmail(email)
      
      if (resendResult.success) {
        toast.success('📧 New verification email sent! Check your inbox.', { duration: 6000 })
        setUserEmail(email)
        setRegistrationSuccess(true)
        setEmail('')
        setPassword('')
        setConfirmPassword('')
      } else {
        // If resend fails, still show success (user might just need to check existing email)
        toast.error('This email is already registered!', { duration: 3000 })
        
        setTimeout(() => {
          toast.success('Check your email for the verification link or sign in if already verified', { 
            duration: 6000,
            icon: '💡'
          })
        }, 1000)

        // Show success screen anyway
        setUserEmail(email)
        setRegistrationSuccess(true)
        setEmail('')
        setPassword('')
        setConfirmPassword('')
      }
    } catch (error) {
      console.error('❌ Failed to resend verification:', error)
      
      // Fallback: show helpful message
      toast.error('This email is already registered!', { duration: 3000 })
      
      setTimeout(() => {
        toast.success('Try signing in or check your email for verification link', { 
          duration: 6000,
          icon: '💡'
        })
      }, 1000)

      // Show success screen anyway
      setUserEmail(email)
      setRegistrationSuccess(true)
      setEmail('')
      setPassword('')
      setConfirmPassword('')
    }
  }

  const resendVerificationEmail = async (emailAddress) => {
    try {
      console.log('📤 Attempting to resend verification email to:', emailAddress)
      
      // Try using Nhost's built-in resend verification method
      const response = await fetch(`https://monujjeszxsjvhmhbgek.auth.ap-south-1.nhost.run/v1/user/email/send-verification-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailAddress,
          redirectTo: 'https://superb-starlight-670243.netlify.app/verify-email'
        })
      })

      console.log('📤 Resend verification response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Verification email resent successfully:', data)
        return { success: true, data }
      } else {
        const errorData = await response.json()
        console.log('❌ Failed to resend verification email:', errorData)
        return { success: false, error: errorData }
      }
    } catch (error) {
      console.error('❌ Error resending verification email:', error)
      return { success: false, error }
    }
  }

  const handleResendVerification = async () => {
    if (!userEmail) return
    
    setIsResending(true)
    
    try {
      const result = await resendVerificationEmail(userEmail)
      
      if (result.success) {
        toast.success('📧 New verification email sent! Check your inbox.', { duration: 6000 })
      } else {
        toast.error('Failed to resend email. Please try registering again.', { duration: 4000 })
      }
    } catch (error) {
      console.error('❌ Resend error:', error)
      toast.error('Failed to resend email. Please try again.', { duration: 4000 })
    } finally {
      setIsResending(false)
    }
  }

  const handleRegistrationError = (errorDetails) => {
    console.log('Handling registration error:', errorDetails)
    
    let errorMessage = 'Registration failed'
    
    if (errorDetails) {
      const message = errorDetails.message?.toLowerCase() || ''
      const status = errorDetails.status
      
      if (status === 400) {
        if (message.includes('email')) {
          errorMessage = 'Invalid email format. Please use a valid email address.'
        } else if (message.includes('password')) {
          errorMessage = 'Password does not meet requirements.'
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

  // Enhanced success state
  if (registrationSuccess) {
    return (
      <div className="text-center space-y-8 animate-fade-in">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
            ✅
          </div>
        </div>
        
        <div>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Check Your Email! 📧
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
            We've sent a verification email to:
          </p>
          <p className="font-semibold text-blue-600 dark:text-blue-400 break-words text-lg">
            {userEmail}
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border-l-4 border-green-500">
            <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
              <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm mr-3">✓</span>
              Verification Email Sent!
            </h4>
            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-3 list-none">
              <li className="flex items-start space-x-3">
                <span className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 text-xs font-bold">1</span>
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">Check your email inbox</p>
                  <p className="text-xs">Look for verification email (check spam folder too)</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 text-xs font-bold">2</span>
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">Click the verification link</p>
                  <p className="text-xs">This will verify your email and open the chatbot</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 text-xs font-bold">3</span>
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">AI Chatbot opens automatically!</p>
                  <p className="text-xs">Sign in and start chatting immediately</p>
                </div>
              </li>
            </ol>
          </div>
          
          <div className="glass-card rounded-2xl p-6 border-l-4 border-blue-500">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  🚀 Direct Chatbot Access
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                  The verification link will take you directly to your AI Chatbot!
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-mono bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                  superb-starlight-670243.netlify.app
                </p>
              </div>
            </div>
          </div>
          
          {/* Resend verification button */}
          <div className="glass-card rounded-2xl p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                  📧 Didn't receive the email?
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Check spam folder or get a new verification email
                </p>
              </div>
              <Button
                onClick={handleResendVerification}
                loading={isResending}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl"
                size="sm"
              >
                {isResending ? 'Sending...' : 'Resend Email'}
              </Button>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button
              onClick={onToggle}
              className="flex-1 rounded-2xl border-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              variant="secondary"
            >
              Sign In Instead
            </Button>
            <Button
              onClick={() => setRegistrationSuccess(false)}
              className="flex-1 rounded-2xl"
            >
              Try Different Email
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

      {/* Information about email verification */}
      <div className="mt-8 glass-card rounded-2xl p-4 border-l-4 border-blue-500">
        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
          <span className="text-blue-500 mr-2">🔐</span>
          Email Verification Required:
        </h4>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
          <li className="flex items-start space-x-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>You must verify your email to access the AI Chatbot</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>The verification email contains a direct link to the chatbot</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>If you already registered, you can use the "Resend Email" button</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default RegisterForm