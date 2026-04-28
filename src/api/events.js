import api from './axios'

export const getEvents = (params) => api.get('/events', { params })
export const getEvent = (id) => api.get(`/events/${id}`)
export const registerEvent = (eventId) => api.post('/inscriptions', { event_id: eventId })
