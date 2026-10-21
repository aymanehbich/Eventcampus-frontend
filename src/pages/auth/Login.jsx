import { useState, useEffect } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { login as loginApi } from '../../api/auth'
import logo from '../../assets/logo-fssm.png'
import './Login.css'

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '')
const GOOGLE_AUTH_URL = `${API_BASE_URL || (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '')}/auth/google/redirect`

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
  const [info] = useState(() => {
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
      } else if (err.response?.status === 403) {
        setErrors({ general: [err.response.data.message || 'Votre compte a été désactivé.'] })
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
    <div className="au">
      <section className="au__intro" aria-label="Présentation">
        <img className="au__logo" src={logo} alt="Faculté des Sciences Semlalia Marrakech" />
        <h1 className="au__title">Explorez la vie étudiante &amp; scientifique à Semlalia</h1>
        <p className="au__lead">
          EventCampus rassemble les événements, clubs et conférences de la faculté au même endroit.
        </p>
        <div className="au__promo">
          <p className="au__promo-title">
            <svg className="au__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            Ne manquez plus rien
          </p>
          <p className="au__promo-text">
            Inscrivez-vous en un clic aux événements de vos clubs et suivez toute l&apos;actualité du campus.
          </p>
        </div>
      </section>

      <main className="au__main">
        <div className="au__card">
          <img className="au__card-logo" src={logo} alt="Faculté des Sciences Semlalia Marrakech" />
          <h2 className="au__card-title">Connexion</h2>
          <p className="au__card-sub">Heureux de vous revoir sur EventCampus.</p>

          <form onSubmit={handleSubmit}>
            <fieldset className="au__group">
              <legend>Je me connecte en tant que</legend>
              <div className="au__seg">
                <button
                  type="button"
                  className="au__seg-btn"
                  aria-pressed={role === 'etudiant'}
                  onClick={() => setRole('etudiant')}
                >
                  <svg className="au__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 10 12 5 2 10l10 5 10-5z" />
                    <path d="M6 12v5c3 2 9 2 12 0v-5" />
                  </svg>
                  Étudiant
                </button>
                <button
                  type="button"
                  className="au__seg-btn"
                  aria-pressed={role === 'organisateur'}
                  onClick={() => setRole('organisateur')}
                >
                  <svg className="au__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6" />
                  </svg>
                  Organisateur
                </button>
              </div>
            </fieldset>

            <div className="ec-field">
              <label className="ec-label" htmlFor="login-email">Adresse e-mail universitaire</label>
              <input
                id="login-email"
                className={`ec-input${errors.email ? ' is-error' : ''}`}
                name="email"
                type="email"
                autoComplete="email"
                placeholder="prenom.nom@univ.ma"
                value={formData.email}
                onChange={handleChange}
                aria-invalid={errors.email ? 'true' : undefined}
                aria-describedby={errors.email ? 'login-email-err' : undefined}
              />
              {errors.email && <div className="ec-error" id="login-email-err" role="alert">{errors.email[0]}</div>}
            </div>
            <div className="ec-field">
              <label className="ec-label" htmlFor="login-password">Mot de passe</label>
              <input
                id="login-password"
                className={`ec-input${errors.password ? ' is-error' : ''}`}
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                aria-invalid={errors.password ? 'true' : undefined}
                aria-describedby={errors.password ? 'login-password-err' : undefined}
              />
              {errors.password && <div className="ec-error" id="login-password-err" role="alert">{errors.password[0]}</div>}
            </div>

            {info && <div className="ec-alert ec-alert--info au__alert" role="status">{info}</div>}
            {errors.general && <div className="ec-alert ec-alert--error au__alert" role="alert">{errors.general[0]}</div>}

            <button type="submit" className="ec-btn ec-btn--primary ec-btn--block au__submit" disabled={loading}>
              {loading && <span className="au__spinner" aria-hidden="true" />}
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <div className="au__divider" aria-hidden="true">ou</div>

          <a href={GOOGLE_AUTH_URL} className="ec-btn ec-btn--ghost ec-btn--block">
            <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path fill="#4285F4" d="M47.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.6h13.2c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.3 7.3-10.6 7.3-17.3z"/>
              <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-6c-2.1 1.4-4.8 2.3-8 2.3-6.1 0-11.3-4.1-13.2-9.7H2.7v6.2C6.6 42.8 14.8 48 24 48z"/>
              <path fill="#FBBC05" d="M10.8 28.8c-.5-1.4-.8-2.8-.8-4.3s.3-3 .8-4.3v-6.2H2.7C1 17.4 0 20.6 0 24s1 6.6 2.7 9.1l8.1-4.3z"/>
              <path fill="#EA4335" d="M24 9.5c3.4 0 6.5 1.2 8.9 3.5l6.6-6.6C35.9 2.4 30.5 0 24 0 14.8 0 6.6 5.2 2.7 12.9l8.1 4.3C12.7 11.6 17.9 9.5 24 9.5z"/>
            </svg>
            Se connecter avec Google
          </a>

          <p className="au__footer">Pas encore de compte ? <a className="au__link" href="/register">S&apos;inscrire</a></p>
        </div>
      </main>
    </div>
  )
}

export default Login
