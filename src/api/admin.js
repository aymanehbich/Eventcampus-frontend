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

export const getPendingClubs   = ()  => api.get('/admin/clubs/pending')
export const getValidatedClubs = ()  => api.get('/admin/clubs/validated')
export const getSuspendedClubs = ()  => api.get('/admin/clubs/suspended')
export const approveClub       = (id) => api.put(`/admin/clubs/${id}/valider`)
export const rejectClub        = (id) => api.put(`/admin/clubs/${id}/refuser`)
export const suspendClub       = (id) => api.put(`/admin/clubs/${id}/suspendre`)
export const reactivateClub    = (id) => api.put(`/admin/clubs/${id}/reactiver`)
export const deleteClub        = (id) => api.delete(`/admin/clubs/${id}`)

export const getPendingEvents  = ()         => api.get('/admin/events/pending')
export const getAllEvents       = (params={}) => api.get('/admin/events', { params })
export const validateEvent     = (id)       => api.put(`/admin/events/${id}/valider`)
export const rejectEvent       = (id)       => api.put(`/admin/events/${id}/refuser`)

export const getStats = () => api.get('/admin/stats')

export const getRoleRequests    = ()   => api.get('/admin/role-requests')
export const approveRoleRequest = (id) => api.put(`/admin/role-requests/${id}/approve`)
export const refuseRoleRequest  = (id) => api.put(`/admin/role-requests/${id}/refuse`)

export const rejectUser = (userId) => api.put(`/admin/users/${userId}/reject`)