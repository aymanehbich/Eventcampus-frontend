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

export const activateRole = (userId, role) => {
  return api.put(`/users/${userId}/roles/${role}/activate`)
}

export const getPendingClubs = () => api.get('/admin/clubs/pending')
export const approveClub     = (id) => api.put(`/admin/clubs/${id}/valider`)
export const rejectClub      = (id) => api.put(`/admin/clubs/${id}/refuser`)
