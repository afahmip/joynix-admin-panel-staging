import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { API_ENDPOINTS } from '../config/api'
import { apiClient } from '../lib/api-client'

interface PromoteTalentResponse {
  data: {
    email: string
    full_name: string
    is_available_for_booking: boolean
    is_talent: boolean
    message: string
    phone_number: string
    roles: string[]
    user_id: number
    username: string
  }
  message: string
  metadata: string
  status: number
  success: boolean
}

export function VerifyTalentPage() {
  const [userId, setUserId] = useState('')
  const [toast, setToast] = useState<{ type: 'error' | 'success'; message: string } | null>(null)

  interface GetUserResponse {
    status: number
    success: boolean
    message: string
    data: {
      id: number
      email: string
      username: string
      full_name: string
      profile_image_url: string
      is_talent: boolean
      is_verified: boolean
      roles: string
      is_available_for_booking: boolean
      timezone: string
      last_active_at: string
    }
    metadata: unknown | null
  }

  const validateUserMutation = useMutation({
    mutationFn: (id: string) => apiClient.get<GetUserResponse>(API_ENDPOINTS.USER_BY_ID(id)),
  })

  const promoteMutation = useMutation({
    mutationFn: (payload: { userId: string }) =>
      apiClient.post<PromoteTalentResponse>(API_ENDPOINTS.PROMOTE_TALENT(payload.userId)),
    onError: (error: unknown) => {
      const message = (error as Error)?.message || 'Failed to promote user'
      if (message === 'Failed to promote user to talent') {
        setToast({ type: 'error', message: 'This user is already a talent.' })
      } else {
        setToast({ type: 'error', message })
      }
      window.setTimeout(() => setToast(null), 4000)
    },
    onSuccess: () => {
      setToast({ type: 'success', message: 'User promoted to talent successfully.' })
      window.setTimeout(() => setToast(null), 3000)
    },
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    try {
      await validateUserMutation.mutateAsync(userId)
      promoteMutation.mutate({ userId })
    } catch (err) {
      // validation failed; errors are shown below
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Promote User to Talent</h1>
      <form onSubmit={handleSubmit} className="mt-4 max-w-xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter user ID"
            required
          />
        </div>

        {validateUserMutation.isSuccess && (
          <div className="rounded border p-4 bg-gray-50">
            <div className="font-semibold mb-2">User Preview</div>
            <div className="text-sm text-gray-700 space-y-1">
              <div><span className="font-medium">ID:</span> {validateUserMutation.data.data.id}</div>
              <div><span className="font-medium">Username:</span> {validateUserMutation.data.data.username}</div>
              <div><span className="font-medium">Full Name:</span> {validateUserMutation.data.data.full_name}</div>
              <div><span className="font-medium">Email:</span> {validateUserMutation.data.data.email}</div>
              <div><span className="font-medium">Roles:</span> {validateUserMutation.data.data.roles}</div>
              <div><span className="font-medium">Is Talent:</span> {validateUserMutation.data.data.is_talent ? 'Yes' : 'No'}</div>
              <div><span className="font-medium">Available for Booking:</span> {validateUserMutation.data.data.is_available_for_booking ? 'Yes' : 'No'}</div>
            </div>
          </div>
        )}

        {validateUserMutation.isError && (
          <div className="text-red-600">{(validateUserMutation.error as Error).message}</div>
        )}

        <div className="flex items-center gap-3 mt-2">
          <button
            type="submit"
            disabled={promoteMutation.isPending || validateUserMutation.isPending || !userId}
            className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {promoteMutation.isPending || validateUserMutation.isPending ? 'Submitting...' : 'Validate & Promote'}
          </button>
          {promoteMutation.isSuccess && (
            <span className="text-green-700">{promoteMutation.data.message}</span>
          )}
          {promoteMutation.isError && (
            <span className="text-red-600">{(promoteMutation.error as Error).message}</span>
          )}
        </div>

        {promoteMutation.isSuccess && (
          <div className="mt-4 rounded border p-4 bg-gray-50">
            <div className="font-semibold mb-2">Result</div>
            <div className="text-sm text-gray-700 space-y-1">
              <div><span className="font-medium">User ID:</span> {promoteMutation.data.data.user_id}</div>
              <div><span className="font-medium">Username:</span> {promoteMutation.data.data.username}</div>
              <div><span className="font-medium">Full Name:</span> {promoteMutation.data.data.full_name}</div>
              <div><span className="font-medium">Email:</span> {promoteMutation.data.data.email}</div>
              <div><span className="font-medium">Phone:</span> {promoteMutation.data.data.phone_number}</div>
              <div><span className="font-medium">Is Talent:</span> {promoteMutation.data.data.is_talent ? 'Yes' : 'No'}</div>
              <div><span className="font-medium">Available for Booking:</span> {promoteMutation.data.data.is_available_for_booking ? 'Yes' : 'No'}</div>
              <div><span className="font-medium">Roles:</span> {promoteMutation.data.data.roles.join(', ')}</div>
              <div><span className="font-medium">Message:</span> {promoteMutation.data.data.message}</div>
            </div>
          </div>
        )}
      </form>

      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-md px-4 py-3 shadow-lg border ${
            toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-green-50 border-green-200 text-green-800'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default VerifyTalentPage
