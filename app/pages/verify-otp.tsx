import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { useAuth } from '../hooks/auth'

export default function VerifyOtpPage() {
  const { verifyOtp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get state passed from signin page
  const { session_id, delivery, contact } = location.state || {}
  
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (!session_id) throw new Error('Missing session id')
      await verifyOtp(session_id, otp)
      navigate('/dashboard')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-2">Verify OTP</h1>
        {delivery && contact && (
          <p className="text-sm text-gray-600 mb-4">We sent a code via {delivery} to {contact}.</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">One-Time Password</label>
            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-widest text-center"
              placeholder="000000"
              required
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>
    </div>
  )
}
