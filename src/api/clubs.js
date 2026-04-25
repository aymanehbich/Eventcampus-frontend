import api from './axios'

export const getClubs = (params) => api.get('/clubs', { params })
