// API Configuration
const getApiBaseUrl = () => {
  const env = import.meta.env.MODE || 'development'
  
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
} as const
