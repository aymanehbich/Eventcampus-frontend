import api from './axios'

export const getEvents = (params) => api.get('/events', { params })
export const getEvent = (id) => api.get(`/events/${id}`)
export const registerEvent = (id) => api.post(`/events/${id}/register`)
export const unregisterEvent = (id) => api.post(`/events/${id}/unregister`)
