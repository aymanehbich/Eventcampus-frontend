import api from './axios' 

export const getMyInscriptions = () =>api.get('/profil/inscriptions')
