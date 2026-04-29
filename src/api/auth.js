import api from './axios'

export const register = (data) => api.post('/register', data)
export const login = (data) => api.post('/login', data)
export const me = () => api.get('/me')
export const logout = () => api.post('/logout')
export const updatePreferences = (data) => api.patch('/users/me/preferences', data)
