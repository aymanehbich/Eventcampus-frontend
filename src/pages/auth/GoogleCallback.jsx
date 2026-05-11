import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function GoogleCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const userRaw = params.get('user')
    const error = params.get('error')

    if (error || !token || !userRaw) {
      navigate('/login?error=google_auth_failed', { replace: true })
      return
    }

    try {
      const user = JSON.parse(decodeURIComponent(userRaw))
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      if (user.role === 'etudiant') {
        navigate('/student/clubs', { replace: true })
      } else if (user.role === 'organisateur') {
        navigate('/organiser', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch {
      navigate('/login?error=google_auth_failed', { replace: true })
    }
  }, [navigate])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#EAEAEF' }}>
      <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#7A7A8C' }}>Connexion en cours…</p>
    </div>
  )
}

export default GoogleCallback
