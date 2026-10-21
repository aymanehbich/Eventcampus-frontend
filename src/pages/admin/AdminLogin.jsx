import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { login as loginApi } from '../../api/auth'
import logo from '../../assets/logo-fssm.png'
import './AdminLogin.css'

function getRedirect() {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (!token || !user) return null
  if (user.role === 'admin') return '/admin/dashboard'
  return '/'
}

function AdminLogin() {
  const redirect = getRedirect()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

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

      if (user.role !== 'admin') {
        setErrors({ general: ['Accès réservé aux administrateurs.'] })
        setLoading(false)
        return
      }

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      navigate('/admin/dashboard')
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
    <div className="adl">
      <main className="adl__card">
        <img className="adl__logo" src={logo} alt="Faculté des Sciences Semlalia Marrakech" />
        <span className="ec-badge ec-badge--terra adl__badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6l-8-3z" />
          </svg>
          Espace administrateur
        </span>
        <h1 className="adl__title">Connexion Admin</h1>
        <p className="adl__sub">Espace d&apos;administration de la plateforme EventCampus.</p>

        <form onSubmit={handleSubmit}>
          <div className="ec-field">
            <label className="ec-label" htmlFor="adl-email">Adresse e-mail</label>
            <input
              id="adl-email"
              className={`ec-input${errors.email ? ' is-error' : ''}`}
              name="email"
              type="email"
              autoComplete="username"
              placeholder="admin@eventcampus.ma"
              value={formData.email}
              onChange={handleChange}
              aria-invalid={errors.email ? 'true' : undefined}
              aria-describedby={errors.email ? 'adl-email-err' : undefined}
            />
            {errors.email && <div className="ec-error" id="adl-email-err" role="alert">{errors.email[0]}</div>}
          </div>
          <div className="ec-field">
            <label className="ec-label" htmlFor="adl-password">Mot de passe</label>
            <input
              id="adl-password"
              className={`ec-input${errors.password ? ' is-error' : ''}`}
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              aria-invalid={errors.password ? 'true' : undefined}
              aria-describedby={errors.password ? 'adl-password-err' : undefined}
            />
            {errors.password && <div className="ec-error" id="adl-password-err" role="alert">{errors.password[0]}</div>}
          </div>
          {errors.general && <div className="ec-alert ec-alert--error adl__alert" role="alert">{errors.general[0]}</div>}
          <button type="submit" className="ec-btn ec-btn--primary ec-btn--block adl__submit" disabled={loading}>
            {loading && <span className="adl__spinner" aria-hidden="true" />}
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </main>
    </div>
  )
}

export default AdminLogin
