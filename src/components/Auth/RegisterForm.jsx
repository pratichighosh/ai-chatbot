import React, { useState } from 'react'
import { useSignUpEmailPassword } from '@nhost/react'
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import Button from '../UI/Button'
import Input from '../UI/Input'
import toast from 'react-hot-toast'

const RegisterForm = ({ onToggle }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { signUpEmailPassword, isLoading, error } = useSignUpEmailPassword()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !password || !confirmPassword) {
      toast.error('Please fill in all fields')
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

    const result = await signUpEmailPassword(email, password)
    
    if (result.isSuccess) {
      toast.success('Account created successfully! Please check your email to verify.')
    } else {
      toast.error(error?.message || 'Failed to create account')
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
        />

        <Input
          type="password"
          placeholder="Create a password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={LockClosedIcon}
          required
        />

        <Input
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          icon={LockClosedIcon}
          required
        />

        <Button
          type="submit"
          loading={isLoading}
          className="w-full rounded-xl shadow-lg"
          size="lg"
        >
          Create Account
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
    </div>
  )
}

export default RegisterForm