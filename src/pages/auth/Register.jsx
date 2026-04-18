import { useState } from 'react'
import './Register.css'

function Register() {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    password: '',
    role: 'etudiant'
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Register:', formData)
  }

  return (
    <div className="register-body">
      <div className="card">
        <div className="left">
          <div className="emoji">✨</div>
          <h2>Rejoignez EventCampus</h2>
          <p>Créez votre compte et participez pleinement à la vie universitaire.</p>
        </div>
        <div className="right">
          <div className="label-tag">Module 1 — Authentification</div>
          <h3>Créer un compte</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Prénom</label>
                <input
                  name="prenom"
                  placeholder="Aymane"
                  value={formData.prenom}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Nom</label>
                <input
                  name="nom"
                  placeholder="Hbich"
                  value={formData.nom}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label>E-mail universitaire</label>
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
            <div className="form-group">
              <label>Je suis…</label>
              <div className="role-options">
                <div
                  className={`role-card${formData.role === 'etudiant' ? ' selected' : ''}`}
                  onClick={() => handleRoleSelect('etudiant')}
                >
                  <div className="r-icon">🎓</div>
                  <div className="r-label">Étudiant</div>
                  <div className="r-sub">Découvrir et s'inscrire</div>
                </div>
                <div
                  className={`role-card${formData.role === 'organisateur' ? ' selected' : ''}`}
                  onClick={() => handleRoleSelect('organisateur')}
                >
                  <div className="r-icon">🏛️</div>
                  <div className="r-label">Organisateur</div>
                  <div className="r-sub">Gérer un club</div>
                </div>
              </div>
            </div>
            <button type="submit" className="btn-submit">Créer mon compte</button>
          </form>
          <p className="footer-text">Déjà un compte ? <a href="#">Se connecter</a></p>
        </div>
      </div>
    </div>
  )
}

export default Register
