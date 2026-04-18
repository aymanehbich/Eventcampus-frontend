import { useState } from 'react'
import './Login.css'

function Login() {
  const [role, setRole] = useState('etudiant')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Login:', { ...formData, role })
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
            </div>
            <button type="submit" className="btn-submit">Se connecter</button>
          </form>
          <p className="footer-text">Pas encore de compte ? <a href="/register">S'inscrire</a></p>
        </div>
      </div>
    </div>
  )
}

export default Login
