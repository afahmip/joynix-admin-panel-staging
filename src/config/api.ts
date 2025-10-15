// API Configuration
const getApiBaseUrl = () => {
  const env = import.meta.env.VITE_API_MODE || 'development'

  console.log('env', env)
  console.log('import.meta.env.VITE_API_BASE_URL_PROD', import.meta.env.VITE_API_BASE_URL_PROD)
  console.log('import.meta.env.VITE_API_BASE_URL_STAGING', import.meta.env.VITE_API_BASE_URL_STAGING)
  console.log('import.meta.env.VITE_API_BASE_URL_DEV', import.meta.env.VITE_API_BASE_URL_DEV)

  switch (env) {
    case 'production':
      return import.meta.env.VITE_API_BASE_URL_PROD || 'https://api.joynix.id/api/v1/'
    case 'staging':
      return import.meta.env.VITE_API_BASE_URL_STAGING || 'https://stg.joynix.id/api/v1/'
    case 'development':
    default:
      return import.meta.env.VITE_API_BASE_URL_DEV || 'https://stg.joynix.id/api/v1/'
  }
}

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  HEADERS: {
    'Content-Type': 'application/json',
    'X-Admin-User-Id': '-1',
  },
} as const

// API Endpoints
export const API_ENDPOINTS = {
  GIFT_TYPES: 'gifts/types',
  GIFT_TYPE_BY_ID: (id: number) => `gifts/types/${id}`,
  ACTIVITIES: 'activities',
  ACTIVITY_BY_ID: (id: number) => `activities/admin/${id}`,
  AUTH_SIGNIN: 'auth/otp-signin',
  AUTH_VERIFY_OTP: 'auth/verify-otp',
  AUTH_REFRESH: 'auth/refresh',
  PROMOTE_TALENT: (userId: number | string) => `users/admin/${userId}/promote-to-talent`,
  USER_BY_ID: (userId: number | string) => `users/${userId}`,
} as const

export function getAuthHeaders(accessToken?: string) {
  if (!accessToken) return API_CONFIG.HEADERS
  return {
    ...API_CONFIG.HEADERS,
    Authorization: `Bearer ${accessToken}`,
  }
}
