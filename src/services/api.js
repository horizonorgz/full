import axios from 'axios'
import { supabase } from './supabase'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000'

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get current session from Supabase
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`
      }
    } catch (error) {
      console.error('Failed to get auth token:', error)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    
    // Check for rate limit errors
    const errorMessage = error.response?.data?.error || error.message || ''
    if (
      error.response?.status === 429 ||
      errorMessage.includes('RATE_LIMIT_EXCEEDED') ||
      errorMessage.toLowerCase().includes('rate limit') ||
      errorMessage.toLowerCase().includes('too many requests')
    ) {
      // Modify the error object to clearly indicate it's a rate limit error
      error.isRateLimitError = true
      error.rateLimitMessage = 'Rate limit reached. Please wait 3-4 seconds and try again.'
    }
    
    return Promise.reject(error)
  }
)

export const fileAPI = {
  // Upload file
  uploadFile: async (file, userId) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('user_id', userId)
    
    const response = await apiClient.post('/api/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for file upload
      transformRequest: [(data, headers) => {
        // Remove Content-Type header to let axios set it with boundary
        delete headers['Content-Type']
        return data
      }]
    })
    
    return response.data
  },

  // Get user files
  getUserFiles: async (userId) => {
    const response = await apiClient.get(`/api/files?user_id=${userId}`)
    return response.data
  },

  // Get file datatypes
  getFileDatatypes: async (fileId) => {
    const response = await apiClient.get(`/api/files/${fileId}/datatypes`)
    return response.data
  },
}

export const queryAPI = {
  // Process query
  processQuery: async (query, fileId, userId) => {
    const response = await apiClient.post('/api/query/process', {
      query,
      file_id: fileId,
      user_id: userId,
    })
    
    return response.data
  },

  // Get query history
  getQueryHistory: async (userId, limit = 50) => {
    const response = await apiClient.get(`/api/query/history?user_id=${userId}&limit=${limit}`)
    return response.data
  },
}

export const feedbackAPI = {
  // Submit feedback
  submitFeedback: async (feedbackData) => {
    const response = await apiClient.post('/api/feedback', feedbackData)
    return response.data
  },

  // Get user feedback
  getUserFeedback: async (userId) => {
    const response = await apiClient.get(`/api/feedback/${userId}`)
    return response.data
  },
}

export const healthAPI = {
  // Check API health
  checkHealth: async () => {
    const response = await apiClient.get('/')
    return response.data
  },
}

export default apiClient
