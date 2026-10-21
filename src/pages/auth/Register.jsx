import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { register } from '../../api/auth'
import { checkEmail, submitRoleRequest } from '../../api/roleRequests'
import logo from '../../assets/logo-fssm.png'
import './Login.css'
import './Register.css'

function getRedirect() {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (!token || !user) return null
  if (user.role === 'etudiant') return '/student/events'
  if (user.role === 'organisateur') return '/organiser/dashboard'
  return '/'
}

function Register() {
  const redirect = getRedirect()
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

  const handleSubmitRoleRequest = async () => {
    setErrors({})
    setLoading(true)
    try {
      const payload = orgStep === 'exists'
        ? { name: orgEmail, email: orgEmail, student_id: orgData.student_id, is_existing_student: true }
        : { prenom: orgData.prenom, nom: orgData.nom, name: `${orgData.prenom} ${orgData.nom}`, email: orgEmail, student_id: orgData.student_id, password: orgData.password, password_confirmation: orgData.password_confirmation, is_existing_student: false }
      await submitRoleRequest(payload)
      setOrgStep('success')
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

  if (redirect) return <Navigate to={redirect} replace />

  return (
    <div className="au">
      <section className="au__intro" aria-label="Présentation">
        <img className="au__logo" src={logo} alt="Faculté des Sciences Semlalia Marrakech" />
        <h1 className="au__title">Rejoignez la vie étudiante &amp; scientifique de Semlalia</h1>
        <p className="au__lead">
          Créez votre compte et participez pleinement aux événements, clubs et conférences de la faculté.
        </p>
        <div className="au__promo">
          <p className="au__promo-title">
            <svg className="au__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3z" />
            </svg>
            Un seul compte, tout le campus
          </p>
          <p className="au__promo-text">
            Étudiants ou organisateurs de clubs, retrouvez les outils adaptés à votre rôle.
          </p>
        </div>
      </section>

      <main className="au__main">
        <div className="au__card">
          <img className="au__card-logo" src={logo} alt="Faculté des Sciences Semlalia Marrakech" />
          <h2 className="au__card-title">Créer un compte</h2>
          <p className="au__card-sub">Quelques informations suffisent pour commencer.</p>

          <form onSubmit={handleSubmit}>
            <fieldset className="au__group">
              <legend>Je suis…</legend>
              <div className="au__roles">
                <button
                  type="button"
                  className="au__role"
                  aria-pressed={formData.role === 'etudiant'}
                  onClick={() => handleRoleSelect('etudiant')}
                >
                  <svg className="au__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 10 12 5 2 10l10 5 10-5z" /><path d="M6 12v5c3 2 9 2 12 0v-5" /></svg>
                  <span className="au__role-label">Étudiant</span>
                  <span className="au__role-sub">Découvrir et s&apos;inscrire</span>
                </button>
                <button
                  type="button"
                  className="au__role"
                  aria-pressed={formData.role === 'organisateur'}
                  onClick={() => handleRoleSelect('organisateur')}
                >
                  <svg className="au__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6" /></svg>
                  <span className="au__role-label">Organisateur</span>
                  <span className="au__role-sub">Gérer un club</span>
                </button>
              </div>
            </fieldset>

            {formData.role === 'etudiant' && (
              <>
                <div className="au__row">
                <div className="ec-field">
                  <label className="ec-label" htmlFor="reg-prenom">Prénom</label>
                  <input
                  id="reg-prenom"
                  className={`ec-input${errors.prenom ? ' is-error' : ''}`}
                  name="prenom"
                  autoComplete="given-name"
                  placeholder="Aymane"
                  value={formData.prenom}
                  onChange={handleChange}
                  aria-invalid={errors.prenom ? 'true' : undefined}
                  aria-describedby={errors.prenom ? 'reg-prenom-err' : undefined}
                  />
                  {errors.prenom && <div className="ec-error" id="reg-prenom-err" role="alert">{errors.prenom[0]}</div>}
                </div>
                <div className="ec-field">
                  <label className="ec-label" htmlFor="reg-nom">Nom</label>
                  <input
                  id="reg-nom"
                  className={`ec-input${errors.nom ? ' is-error' : ''}`}
                  name="nom"
                  autoComplete="family-name"
                  placeholder="Hbich"
                  value={formData.nom}
                  onChange={handleChange}
                  aria-invalid={errors.nom ? 'true' : undefined}
                  aria-describedby={errors.nom ? 'reg-nom-err' : undefined}
                  />
                  {errors.nom && <div className="ec-error" id="reg-nom-err" role="alert">{errors.nom[0]}</div>}
                </div>
                </div>
                <div className="ec-field">
                  <label className="ec-label" htmlFor="reg-email">E-mail universitaire</label>
                  <input
                  id="reg-email"
                  className={`ec-input${errors.email ? ' is-error' : ''}`}
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="prenom.nom@univ.ma"
                  value={formData.email}
                  onChange={handleChange}
                  aria-invalid={errors.email ? 'true' : undefined}
                  aria-describedby={errors.email ? 'reg-email-err' : undefined}
                  />
                  {errors.email && <div className="ec-error" id="reg-email-err" role="alert">{errors.email[0]}</div>}
                </div>
                <div className="ec-field">
                  <label className="ec-label" htmlFor="reg-password">Mot de passe</label>
                  <input
                  id="reg-password"
                  className={`ec-input${errors.password ? ' is-error' : ''}`}
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  aria-invalid={errors.password ? 'true' : undefined}
                  aria-describedby={errors.password ? 'reg-password-err' : undefined}
                  />
                  {errors.password && <div className="ec-error" id="reg-password-err" role="alert">{errors.password[0]}</div>}
                </div>
                {errors.general && <div className="ec-alert ec-alert--error au__alert" role="alert">{errors.general[0]}</div>}
                {success && <div className="ec-alert ec-alert--success au__alert" role="status">{success}</div>}
                <button type="submit" className="ec-btn ec-btn--primary ec-btn--block au__submit" disabled={loading}>
                  {loading && <span className="au__spinner" aria-hidden="true" />}
                  {loading ? 'Création…' : 'Créer mon compte'}
                </button>
              </>
            )}

            {formData.role === 'organisateur' && orgStep === 'email' && (
              <>
                <div className="ec-field">
                  <label className="ec-label" htmlFor="org-email">E-mail universitaire</label>
                  <input
                  id="org-email"
                  className={`ec-input${errors.email ? ' is-error' : ''}`}
                  type="email"
                  autoComplete="email"
                  placeholder="prenom.nom@univ.ma"
                  value={orgEmail}
                  onChange={(e) => setOrgEmail(e.target.value)}
                  aria-invalid={errors.email ? 'true' : undefined}
                  aria-describedby={errors.email ? 'org-email-err' : undefined}
                  />
                  {errors.email && <div className="ec-error" id="org-email-err" role="alert">{errors.email[0]}</div>}
                </div>
                {errors.general && <div className="ec-alert ec-alert--error au__alert" role="alert">{errors.general[0]}</div>}
                <button type="button" className="ec-btn ec-btn--primary ec-btn--block au__submit" disabled={loading} onClick={handleCheckEmail}>
                  {loading && <span className="au__spinner" aria-hidden="true" />}
                  {loading ? 'Vérification…' : 'Vérifier'}
                </button>
              </>
            )}

            {formData.role === 'organisateur' && orgStep === 'exists' && (
              <>
                <div className="ec-alert ec-alert--info au__alert" role="status">
                  Un compte existe déjà avec cet e-mail, votre demande sera liée à ce compte.
                </div>
                <div className="ec-field">
                  <label className="ec-label" htmlFor="org-student-id">Numéro étudiant (optionnel)</label>
                  <input
                  id="org-student-id"
                  className={`ec-input${errors.student_id ? ' is-error' : ''}`}
                  name="student_id"
                  autoComplete="off"
                  placeholder="Ex: 12345678"
                  value={orgData.student_id}
                  onChange={handleOrgDataChange}
                  aria-invalid={errors.student_id ? 'true' : undefined}
                  aria-describedby={errors.student_id ? 'org-student-id-err' : undefined}
                  />
                  {errors.student_id && <div className="ec-error" id="org-student-id-err" role="alert">{errors.student_id[0]}</div>}
                </div>
                {errors.general && <div className="ec-alert ec-alert--error au__alert" role="alert">{errors.general[0]}</div>}
                <button type="button" className="ec-btn ec-btn--primary ec-btn--block au__submit" disabled={loading} onClick={handleSubmitRoleRequest}>
                  {loading && <span className="au__spinner" aria-hidden="true" />}
                  {loading ? 'Envoi…' : 'Soumettre ma demande'}
                </button>
              </>
            )}

            {formData.role === 'organisateur' && orgStep === 'not_exists' && (
              <>
                <div className="au__row">
                <div className="ec-field">
                  <label className="ec-label" htmlFor="org-prenom">Prénom</label>
                  <input
                  id="org-prenom"
                  className={`ec-input${errors.prenom ? ' is-error' : ''}`}
                  name="prenom"
                  autoComplete="given-name"
                  placeholder="Aymane"
                  value={orgData.prenom}
                  onChange={handleOrgDataChange}
                  aria-invalid={errors.prenom ? 'true' : undefined}
                  aria-describedby={errors.prenom ? 'org-prenom-err' : undefined}
                  />
                  {errors.prenom && <div className="ec-error" id="org-prenom-err" role="alert">{errors.prenom[0]}</div>}
                </div>
                <div className="ec-field">
                  <label className="ec-label" htmlFor="org-nom">Nom</label>
                  <input
                  id="org-nom"
                  className={`ec-input${errors.nom ? ' is-error' : ''}`}
                  name="nom"
                  autoComplete="family-name"
                  placeholder="Hbich"
                  value={orgData.nom}
                  onChange={handleOrgDataChange}
                  aria-invalid={errors.nom ? 'true' : undefined}
                  aria-describedby={errors.nom ? 'org-nom-err' : undefined}
                  />
                  {errors.nom && <div className="ec-error" id="org-nom-err" role="alert">{errors.nom[0]}</div>}
                </div>
                </div>
                <div className="ec-field">
                  <label className="ec-label" htmlFor="org-password">Mot de passe</label>
                  <input
                  id="org-password"
                  className={`ec-input${errors.password ? ' is-error' : ''}`}
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={orgData.password}
                  onChange={handleOrgDataChange}
                  aria-invalid={errors.password ? 'true' : undefined}
                  aria-describedby={errors.password ? 'org-password-err' : undefined}
                  />
                  {errors.password && <div className="ec-error" id="org-password-err" role="alert">{errors.password[0]}</div>}
                </div>
                <div className="ec-field">
                  <label className="ec-label" htmlFor="org-password-confirm">Confirmer le mot de passe</label>
                  <input
                  id="org-password-confirm"
                  className="ec-input"
                  name="password_confirmation"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={orgData.password_confirmation}
                  onChange={handleOrgDataChange}
                  />
                </div>
                <div className="ec-field">
                  <label className="ec-label" htmlFor="org-student-id2">Numéro étudiant (optionnel)</label>
                  <input
                  id="org-student-id2"
                  className={`ec-input${errors.student_id ? ' is-error' : ''}`}
                  name="student_id"
                  autoComplete="off"
                  placeholder="Ex: 12345678"
                  value={orgData.student_id}
                  onChange={handleOrgDataChange}
                  aria-invalid={errors.student_id ? 'true' : undefined}
                  aria-describedby={errors.student_id ? 'org-student-id2-err' : undefined}
                  />
                  {errors.student_id && <div className="ec-error" id="org-student-id2-err" role="alert">{errors.student_id[0]}</div>}
                </div>
                {errors.general && <div className="ec-alert ec-alert--error au__alert" role="alert">{errors.general[0]}</div>}
                <button type="button" className="ec-btn ec-btn--primary ec-btn--block au__submit" disabled={loading} onClick={handleSubmitRoleRequest}>
                  {loading && <span className="au__spinner" aria-hidden="true" />}
                  {loading ? 'Envoi…' : 'Créer mon compte et soumettre ma demande'}
                </button>
              </>
            )}

            {formData.role === 'organisateur' && orgStep === 'success' && (
              <div className="au__success" role="status">
                <svg className="au__success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m8 12 3 3 5-6" />
                </svg>
                <p>Votre demande a été soumise avec succès. L&apos;admin va valider votre demande.</p>
                <a href="/login" className="ec-btn ec-btn--primary">Se connecter</a>
              </div>
            )}
          </form>

          <p className="au__footer">Déjà un compte ? <a className="au__link" href="/login">Se connecter</a></p>
        </div>
      </main>
    </div>
  )
}

export default Register
