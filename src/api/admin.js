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

export const getRoleRequests    = ()   => api.get('/admin/role-requests')
export const approveRoleRequest = (id) => api.put(`/admin/role-requests/${id}/approve`)
export const refuseRoleRequest  = (id) => api.put(`/admin/role-requests/${id}/refuse`)

export const rejectUser = (userId) => api.put(`/admin/users/${userId}/reject`)