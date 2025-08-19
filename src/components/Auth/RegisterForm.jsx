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
      
      // Use Nhost signup with enhanced configuration
      const result = await signUpEmailPassword(email, password, {
        redirectTo: `${window.location.origin}/verify-email`,
        allowedRoles: ['user', 'me'],
        defaultRole: 'user',
        displayName: email.split('@')[0], // Use email prefix as display name
        metadata: {
          source: 'ai-chatbot-app',
          registrationDate: new Date().toISOString(),
          appVersion: '1.0.0'
        },
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`
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
          { 
            duration: 8000,
            icon: '📧'
          }
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
              toast.error(errorMessage, { duration: 4000 })
              setTimeout(() => {
                toast.success('Switching to login form...', { duration: 2000 })
                onToggle()
              }, 2000)
              return
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

  // Enhanced success state after registration
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
              <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm mr-2">1</span>
              Next Steps:
            </h4>
            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-none">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>Check your email inbox (and spam/junk folder)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>Click the <strong>"Verify Email"</strong> button in the email</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>You'll be redirected back to the AI Chatbot</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">•</span>
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
                  🚀 Direct Access Link
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  The verification email will redirect you directly to:
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
              Register Another Account
            </Button>
          </div>
        </div>
        
        <div className="glass rounded-2xl p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start space-x-2">
            <span className="text-yellow-500">💡</span>
            <div className="text-left">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Didn't receive the email?
              </p>
              <ul className="text-xs text-yellow-700 dark:text-yellow-300 mt-1 space-y-1">
                <li>• Check your spam/junk folder</li>
                <li>• Wait a few minutes and refresh your inbox</li>
                <li>• Make sure the email address is correct</li>
                <li>• Try registering again if needed</li>
              </ul>
            </div>
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
            placeholder="Create a strong password (min 8 characters)"
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
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Enhanced Password Strength Indicator */}
        {password && (
          <div className="space-y-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Password strength:
            </div>
            <div className="flex space-x-1">
              <div className={`h-2 flex-1 rounded-full transition-colors ${
                password.length >= 6 ? 'bg-red-400' : 'bg-gray-200 dark:bg-gray-700'
              }`}></div>
              <div className={`h-2 flex-1 rounded-full transition-colors ${
                password.length >= 8 ? 'bg-yellow-400' : 'bg-gray-200 dark:bg-gray-700'
              }`}></div>
              <div className={`h-2 flex-1 rounded-full transition-colors ${
                password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password) 
                ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'
              }`}></div>
            </div>
            <div className="text-sm">
              {password.length < 6 && (
                <span className="text-red-600 dark:text-red-400">Too short</span>
              )}
              {password.length >= 6 && password.length < 8 && (
                <span className="text-red-600 dark:text-red-400">Weak</span>
              )}
              {password.length >= 8 && password.length < 10 && (
                <span className="text-yellow-600 dark:text-yellow-400">Good</span>
              )}
              {password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password) && (
                <span className="text-green-600 dark:text-green-400">Strong</span>
              )}
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
            <span className="text-blue-500 mr-2">🚀</span>
            After Registration:
          </h4>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 font-bold">1.</span>
              <span>You'll receive a verification email instantly</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 font-bold">2.</span>
              <span>Click the verification button in the email</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 font-bold">3.</span>
              <span>You'll be redirected directly to the AI Chatbot</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 font-bold">4.</span>
              <span>Sign in and start chatting immediately!</span>
            </li>
          </ul>
        </div>
        
        {/* Debug info for development */}
        {import.meta.env.DEV && error && (
          <div className="glass rounded-2xl p-4 border-l-4 border-red-500">
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