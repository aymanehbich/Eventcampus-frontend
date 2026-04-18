import { useNavigate } from 'react-router-dom'
import { logout as logoutApi } from '../api/auth'

export function useLogout() {
  const navigate = useNavigate()

  const clearSession = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    sessionStorage.clear()
  }

  const logout = async () => {
    try {
      await logoutApi()
    } catch (err) {
      // Token déjà invalide côté serveur — on nettoie quand même localement
    } finally {
      clearSession()
      navigate('/login', { replace: true })
    }
  }

  return logout
}
