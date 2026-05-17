import api from './axios'

export const getEvents = (params) => api.get('/events', { params })
export const getEventCategories = () => api.get('/events/categories')
export const getEvent = (id) => api.get(`/events/${id}`)
export const registerEvent = (id) => api.post(`/events/${id}/inscriptions`)
export const unregisterEvent = (id) => api.delete(`/events/${id}/inscriptions`)
export const getEventInscrits = (id) => api.get(`/events/${id}/inscrits`)
export const getOrganizerEvents = () => api.get('/organiser/events')
export const deleteEvent = (id) => api.delete(`/events/${id}`)
export const createEvent = (eventData) => api.post('/events', eventData)
export const updateEvent = (id, eventData) => api.put(`/events/${id}`, eventData)