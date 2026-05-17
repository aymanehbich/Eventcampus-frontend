import api from './axios'

export const getCalendarAuthUrl  = ()  => api.get('/google/calendar/auth-url')
export const getCalendarStatus   = ()  => api.get('/google/calendar/status')
export const disconnectCalendar  = ()  => api.delete('/google/calendar/disconnect')
