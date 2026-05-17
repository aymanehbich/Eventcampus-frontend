import { useState, useEffect } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { login as loginApi } from '../../api/auth'
import './Login.css'

const GOOGLE_AUTH_URL = 'http://127.0.0.1:8000/auth/google/redirect'

function getRedirect() {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (!token || !user) return null
  if (user.role === 'etudiant') return '/student/events'
  if (user.role === 'organisateur') return '/organiser/dashboard'
  return '/'
}

function Login() {
  const redirect = getRedirect()
  const [role, setRole] = useState('etudiant')
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [info, setInfo] = useState(() => {
    if (sessionStorage.getItem('sessionExpired') === '1') {
      sessionStorage.removeItem('sessionExpired')
      return 'Votre session a expiré. Veuillez vous reconnecter.'
    }
    return null
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('error') === 'google_auth_failed') {
      setErrors({ general: ['La connexion avec Google a échoué. Veuillez réessayer.'] })
    }
  }, [searchParams])

  if (redirect) return <Navigate to={redirect} replace />

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      const response = await loginApi(formData)
      const { token, user } = response.data

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      if (user.role === 'etudiant') {
        navigate('/student/events')
      } else if (user.role === 'organisateur') {
        navigate('/organiser/dashboard')
      } else {
        navigate('/')
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setErrors({ general: ['Email ou mot de passe incorrect.'] })
      } else if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {})
      } else {
        setErrors({ general: ['Une erreur est survenue. Veuillez réessayer.'] })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-body">
      <div className="card">
        <div className="left">
          <div className="emoji">🎓</div>
          <h2>EventCampus</h2>
          <p>La plateforme officielle des événements et clubs de votre université.</p>
        </div>
        <div className="right">
          <h3>Connexion</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Je me connecte en tant que</label>
              <div className="role-toggle">
                <button
                  type="button"
                  className={`role-btn${role === 'etudiant' ? ' active' : ''}`}
                  onClick={() => setRole('etudiant')}
                >
                  🎓 Étudiant
                </button>
                <button
                  type="button"
                  className={`role-btn${role === 'organisateur' ? ' active' : ''}`}
                  onClick={() => setRole('organisateur')}
                >
                  🏛️ Organisateur
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Adresse e-mail universitaire</label>
              <input
                name="email"
                type="email"
                placeholder="prenom.nom@univ.ma"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <div className="field-error">{errors.email[0]}</div>}
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <div className="field-error">{errors.password[0]}</div>}
            </div>
            {info && <div className="form-info">{info}</div>}
            {errors.general && <div className="form-error">{errors.general[0]}</div>}
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <div className="divider">
            <span>ou</span>
          </div>

          <a href={GOOGLE_AUTH_URL} className="btn-google">
            <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#4285F4" d="M47.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.6h13.2c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.3 7.3-10.6 7.3-17.3z"/>
              <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-6c-2.1 1.4-4.8 2.3-8 2.3-6.1 0-11.3-4.1-13.2-9.7H2.7v6.2C6.6 42.8 14.8 48 24 48z"/>
              <path fill="#FBBC05" d="M10.8 28.8c-.5-1.4-.8-2.8-.8-4.3s.3-3 .8-4.3v-6.2H2.7C1 17.4 0 20.6 0 24s1 6.6 2.7 9.1l8.1-4.3z"/>
              <path fill="#EA4335" d="M24 9.5c3.4 0 6.5 1.2 8.9 3.5l6.6-6.6C35.9 2.4 30.5 0 24 0 14.8 0 6.6 5.2 2.7 12.9l8.1 4.3C12.7 11.6 17.9 9.5 24 9.5z"/>
            </svg>
            Se connecter avec Google
          </a>

          <p className="footer-text">Pas encore de compte ? <a href="/register">S'inscrire</a></p>
        </div>
      </div>
    </div>
  )
}

export default Login
