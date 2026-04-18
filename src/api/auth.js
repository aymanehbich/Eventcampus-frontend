import api from './axios'

export const register = (data) => api.post('/register', data)
