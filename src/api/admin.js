import api from './axios'

export const getUsers = (params = {}) => {
  return api.get('/admin/users', { params })
}

export const activateUser = (userId) => {
  return api.put(`/admin/users/${userId}/activate`)
}

export const deactivateUser = (userId) => {
  return api.put(`/admin/users/${userId}/deactivate`)
}

export const getPendingUsers = () => {
  return api.get('/admin/users', { params: { status: 'pending' } })
}
