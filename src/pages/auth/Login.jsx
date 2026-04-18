import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as loginApi } from '../../api/auth'
import './Login.css'

function Login() {
  const [role, setRole] = useState('etudiant')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (sessionStorage.getItem('sessionExpired') === '1') {
      setInfo('Votre session a expiré. Veuillez vous reconnecter.')
      sessionStorage.removeItem('sessionExpired')
    }
  }, [])

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
        navigate('/student')
      } else if (user.role === 'organisateur') {
        navigate('/organiser')
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
          <p className="footer-text">Pas encore de compte ? <a href="/register">S'inscrire</a></p>
        </div>
      </div>
    </div>
  )
}

export default Login
