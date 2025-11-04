import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Key, Mail, Shield, ArrowLeft, Send } from 'lucide-react'
import toast from 'react-hot-toast'

export const ForgotPassword = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setEmailSent(true)
      toast.success('Password reset email sent!')
    }, 1500)
  }

  if (emailSent) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.1),transparent)]"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="card p-8 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-2 border-blue-200/50 dark:border-slate-700/50 shadow-2xl">
            {/* Success Icon */}
            <div className="text-center mb-8">
              <motion.div 
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-lg shadow-green-500/50 mx-auto"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              >
                <Mail className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Check Your Email
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium">
                Password reset link sent!
              </p>
            </div>

            {/* Instructions */}
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  We've sent a password reset link to <span className="font-semibold">{email}</span>
                </p>
              </div>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p><strong>Next steps:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Check your inbox for an email from Geofence Alert</li>
                  <li>Click the password reset link in the email</li>
                  <li>Create a new secure password</li>
                </ol>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {onSwitchToLogin && (
                <motion.button
                  onClick={onSwitchToLogin}
                  className="btn btn-primary w-full flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Login</span>
                </motion.button>
              )}
              <button
                onClick={() => setEmailSent(false)}
                className="btn btn-outline w-full text-sm"
              >
                Try different email
              </button>
            </div>

            {/* Help */}
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => handleSubmit({ preventDefault: () => {} })}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  resend
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.1),transparent)]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="card p-8 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-2 border-blue-200/50 dark:border-slate-700/50 shadow-2xl">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <motion.div 
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/50"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Forgot Password?
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium">
              No worries, we'll help you reset it
            </p>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full"
                placeholder="your.email@example.com"
                required
                autoFocus
              />
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Send Reset Link</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            {onSwitchToLogin && (
              <button
                onClick={onSwitchToLogin}
                className="flex items-center justify-center space-x-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

