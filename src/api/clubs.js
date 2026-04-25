import api from './axios'

export const getClubs = (params) => api.get('/clubs', { params })
export const getClub = (id) => api.get(`/clubs/${id}`)
export const joinClub = (id) => api.post(`/clubs/${id}/join`)
export const leaveClub = (id) => api.post(`/clubs/${id}/leave`)