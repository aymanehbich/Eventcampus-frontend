import api from './axios'

export const getEvents = (params) => api.get('/events', { params })
export const getEvent = (id) => api.get(`/events/${id}`)
export const registerEvent = (id) => api.post(`/events/${id}/inscriptions`)
export const unregisterEvent = (id) => api.delete(`/events/${id}/inscriptions`)
export const getEventInscrits = (id) => api.get(`/events/${id}/inscrits`)