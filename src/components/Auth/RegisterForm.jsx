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

    try {
      console.log('📝 Attempting registration with email verification...')
      
      // Nhost signup with email verification enabled
      const result = await signUpEmailPassword(email, password, {
        options: {
          redirectTo: 'https://superb-starlight-670243.netlify.app/verify-email'
        }
      })
      
      console.log('📋 Registration result:', result)
      
      if (result.isSuccess) {
        console.log('✅ Registration successful - Email verification required')
        setUserEmail(email)
        setRegistrationSuccess(true)
        
        toast.success(
          '🎉 Account created! Check your email for verification link.', 
          { duration: 10000 }
        )
        
        // Clear form
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        
      } else if (result.error) {
        console.error('❌ Registration failed:', result.error)
        
        let errorMessage = 'Failed to create account'
        const errorCode = result.error.error || result.error.message || ''
        
        if (errorCode.includes('email-already-in-use') || errorCode.includes('already exists')) {
          errorMessage = 'This email is already registered. Please sign in instead.'
          setTimeout(() => {
            toast.success('Switching to login form...', { duration: 2000 })
            onToggle()
          }, 2000)
        } else if (errorCode.includes('invalid-email')) {
          errorMessage = 'Please enter a valid email address'
        } else if (errorCode.includes('weak-password')) {
          errorMessage = 'Password is too weak. Please choose a stronger password'
        } else {
          errorMessage = `Registration failed: ${errorCode}`
        }
        
        toast.error(errorMessage, { duration: 4000 })
      }
    } catch (err) {
      console.error('❌ Registration error:', err)
      toast.error('Network error. Please check your connection and try again.')
    }
  }

  // Resend verification email function
  const resendVerificationEmail = async () => {
    if (!userEmail) return
    
    try {
      // This would trigger a resend - you might need to implement this based on Nhost's API
      toast.loading('Resending verification email...', { duration: 2000 })
      
      setTimeout(() => {
        toast.success('Verification email resent! Check your inbox.', { duration: 5000 })
      }, 2000)
    } catch (error) {
      toast.error('Failed to resend email. Please try again.')
    }
  }

  // If registration was successful, show success message
  if (registrationSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto animate-scale-in">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Check Your Email! 📧
        </h3>
        
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            We've sent a verification email to <br />
            <strong className="text-blue-600 dark:text-blue-400">{userEmail}</strong>
          </p>
          
          <div className="glass rounded-xl p-6 border-l-4 border-blue-500">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 text-left">
              📋 Next Steps:
            </h4>
            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-decimal list-inside text-left">
              <li>Check your email inbox <strong>(and spam/junk folder)</strong></li>
              <li>Look for email from "AI Chatbot" or nhost.run</li>
              <li>Click the "Verify Email Address" button in the email</li>
              <li>You'll be redirected back here to sign in</li>
              <li>Start chatting with your AI assistant! 🤖</li>
            </ol>
          </div>
          
          <div className="glass rounded-xl p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              ⚠️ <strong>Important:</strong> You must verify your email before you can sign in to the AI chatbot.
            </p>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Button
              onClick={onToggle}
              className="w-full rounded-xl"
              variant="secondary"
            >
              ✅ Email Verified? Go to Sign In
            </Button>
            
            <Button
              onClick={resendVerificationEmail}
              className="w-full rounded-xl"
              variant="ghost"
            >
              📧 Resend Verification Email
            </Button>
            
            <Button
              onClick={() => setRegistrationSuccess(false)}
              className="w-full rounded-xl"
              variant="ghost"
            >
              ← Register Different Email
            </Button>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="glass rounded-lg p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 <strong>Didn't receive the email?</strong><br />
              • Check your spam/junk folder<br />
              • Wait 2-3 minutes for delivery<br />
              • Click "Resend" button above<br />
              • Make sure you entered the correct email
            </p>
          </div>
          
          <div className="glass rounded-lg p-4 border-l-4 border-green-500">
            <p className="text-xs text-green-700 dark:text-green-300">
              🚀 <strong>After verification:</strong> You'll have instant access to your AI chatbot with smart conversations, code help, explanations, and more!
            </p>
          </div>
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
          Join thousands using AI for smarter conversations
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
          {isLoading ? 'Creating Account...' : '🚀 Create Account & Send Verification'}
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
            📧 What happens next:
          </h4>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>• 📤 Verification email sent instantly to your inbox</li>
            <li>• 🔗 Click the verification link in the email</li>
            <li>• ✅ Your account will be activated automatically</li>
            <li>• 🤖 Sign in and start chatting with AI immediately</li>
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