import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : null)

if (!apiBaseUrl) {
  throw new Error('Set VITE_API_URL to the deployed backend URL ending in /api.')
}

const api = axios.create({
  // In development Vite proxies same-origin '/api' requests to Laravel.
  // In production set VITE_API_URL to the deployed API URL, including /api.
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url || ''
    const isAuthRoute = url.includes('/login') || url.includes('/register')

    if (status === 401 && !isAuthRoute) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      sessionStorage.setItem('sessionExpired', '1')

      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api
