import { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { login as loginApi } from '../../api/auth'
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
    <div className="admin-login-body">
      <div className="admin-card">
        <div className="admin-left">
          <div className="admin-emoji">⚙️</div>
          <h2>EventCampus Admin</h2>
          <p>Espace d'administration de la plateforme.</p>
        </div>
        <div className="admin-right">
          <h3>Connexion Admin</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Adresse e-mail</label>
              <input
                name="email"
                type="email"
                placeholder="admin@eventcampus.ma"
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
            {errors.general && <div className="form-error">{errors.general[0]}</div>}
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
