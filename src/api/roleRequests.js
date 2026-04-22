import api from './axios'

export const checkEmail = (email) => api.get('/check-email', { params: { email } })
export const submitRoleRequest = (data) => api.post('/role-requests', data)
