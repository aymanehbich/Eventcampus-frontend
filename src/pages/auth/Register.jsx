import { useState } from 'react'
import { register } from '../../api/auth'
import { checkEmail } from '../../api/roleRequests'
import './Register.css'

function Register() {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    password: '',
    role: 'etudiant'
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)

  const [orgStep, setOrgStep] = useState('email')
  const [orgEmail, setOrgEmail] = useState('')
  const [orgData, setOrgData] = useState({ prenom: '', nom: '', student_id: '', password: '', password_confirmation: '' })

  const handleOrgDataChange = (e) => {
    setOrgData({ ...orgData, [e.target.name]: e.target.value })
  }

  const handleCheckEmail = async () => {
    setErrors({})
    setLoading(true)
    try {
      const response = await checkEmail(orgEmail)
      setOrgStep(response.data.exists ? 'exists' : 'not_exists')
    } catch {
      setErrors({ general: ['Une erreur est survenue. Veuillez réessayer.'] })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role })
    setOrgStep('email')
    setOrgEmail('')
    setOrgData({ prenom: '', nom: '', student_id: '', password: '', password_confirmation: '' })
    setErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setSuccess(null)
    setLoading(true)

    try {
      const response = await register(formData)
      localStorage.setItem('token', response.data.token)
      setSuccess('Compte créé avec succès !')
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {})
      } else {
        setErrors({ general: ['Une erreur est survenue. Veuillez réessayer.'] })
      }
    } finally {
      setLoading(false)
    }
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
          <h3>Créer un compte</h3>
          <form onSubmit={handleSubmit}>
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

            {formData.role === 'etudiant' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Prénom</label>
                    <input
                      name="prenom"
                      placeholder="Aymane"
                      value={formData.prenom}
                      onChange={handleChange}
                    />
                    {errors.prenom && <div className="field-error">{errors.prenom[0]}</div>}
                  </div>
                  <div className="form-group">
                    <label>Nom</label>
                    <input
                      name="nom"
                      placeholder="Hbich"
                      value={formData.nom}
                      onChange={handleChange}
                    />
                    {errors.nom && <div className="field-error">{errors.nom[0]}</div>}
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
                {success && <div className="form-success">{success}</div>}
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Création…' : 'Créer mon compte'}
                </button>
              </>
            )}

            {formData.role === 'organisateur' && orgStep === 'email' && (
              <>
                <div className="form-group">
                  <label>E-mail universitaire</label>
                  <input
                    type="email"
                    placeholder="prenom.nom@univ.ma"
                    value={orgEmail}
                    onChange={(e) => setOrgEmail(e.target.value)}
                  />
                  {errors.email && <div className="field-error">{errors.email[0]}</div>}
                </div>
                {errors.general && <div className="form-error">{errors.general[0]}</div>}
                <button type="button" className="btn-submit" disabled={loading} onClick={handleCheckEmail}>
                  {loading ? 'Vérification…' : 'Vérifier'}
                </button>
              </>
            )}

            {formData.role === 'organisateur' && orgStep === 'exists' && (
              <>
                <div className="form-info">
                  Un compte existe déjà avec cet e-mail, votre demande sera liée à ce compte.
                </div>
                <div className="form-group">
                  <label>Numéro étudiant (optionnel)</label>
                  <input
                    name="student_id"
                    placeholder="Ex: 12345678"
                    value={orgData.student_id}
                    onChange={handleOrgDataChange}
                  />
                  {errors.student_id && <div className="field-error">{errors.student_id[0]}</div>}
                </div>
                {errors.general && <div className="form-error">{errors.general[0]}</div>}
                <button type="button" className="btn-submit" disabled={loading}>
                  {loading ? 'Envoi…' : 'Soumettre ma demande'}
                </button>
              </>
            )}

            {formData.role === 'organisateur' && orgStep === 'not_exists' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Prénom</label>
                    <input
                      name="prenom"
                      placeholder="Aymane"
                      value={orgData.prenom}
                      onChange={handleOrgDataChange}
                    />
                    {errors.prenom && <div className="field-error">{errors.prenom[0]}</div>}
                  </div>
                  <div className="form-group">
                    <label>Nom</label>
                    <input
                      name="nom"
                      placeholder="Hbich"
                      value={orgData.nom}
                      onChange={handleOrgDataChange}
                    />
                    {errors.nom && <div className="field-error">{errors.nom[0]}</div>}
                  </div>
                </div>
                <div className="form-group">
                  <label>Mot de passe</label>
                  <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={orgData.password}
                    onChange={handleOrgDataChange}
                  />
                  {errors.password && <div className="field-error">{errors.password[0]}</div>}
                </div>
                <div className="form-group">
                  <label>Confirmer le mot de passe</label>
                  <input
                    name="password_confirmation"
                    type="password"
                    placeholder="••••••••"
                    value={orgData.password_confirmation}
                    onChange={handleOrgDataChange}
                  />
                </div>
                <div className="form-group">
                  <label>Numéro étudiant (optionnel)</label>
                  <input
                    name="student_id"
                    placeholder="Ex: 12345678"
                    value={orgData.student_id}
                    onChange={handleOrgDataChange}
                  />
                  {errors.student_id && <div className="field-error">{errors.student_id[0]}</div>}
                </div>
                {errors.general && <div className="form-error">{errors.general[0]}</div>}
                <button type="button" className="btn-submit" disabled={loading}>
                  {loading ? 'Envoi…' : 'Créer mon compte et soumettre ma demande'}
                </button>
              </>
            )}
          </form>
          <p className="footer-text">Déjà un compte ? <a href="#">Se connecter</a></p>
        </div>
      </div>
    </div>
  )
}

export default Register
