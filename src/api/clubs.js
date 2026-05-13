import api from './axios'

export const getClubs = (params) => api.get('/clubs', { params })
export const getClub = (id) => api.get(`/clubs/${id}`)
export const joinClub = (clubId) => api.post('/adhesions', { club_id: clubId })
export const leaveClub = (clubId) => api.post(`/clubs/${clubId}/leave`)
export const createClub = (formData) => api.post('/clubs', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
})
export const getPendingAdhesions = () => api.get('/adhesions', { params: { statut: 'pending' } })
export const accepterAdhesion = (id) => api.put(`/adhesions/${id}/accepter`)
export const refuserAdhesion = (id) => api.put(`/adhesions/${id}/refuser`)
export const getOrganizerClubs = () => api.get('/organiser/clubs')
