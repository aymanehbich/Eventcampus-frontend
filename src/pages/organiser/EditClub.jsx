import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getClub, updateClub } from '../../api/clubs'
import DashboardLayout from '../../components/DashboardLayout'
import { ArrowLeftIcon, SaveIcon, ImageIcon, ClubIcon } from './OrganiserIcons'
import './Organiser.css'

const CATEGORIES = ['Technologie', 'Culture', 'Sport', 'Environnement', 'Art', 'Solidarité']

export default function EditClub() {
  const navigate = useNavigate()
  const { id } = useParams()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({ nom: '', emoji: '🎓', categorie: 'Technologie', description: '' })
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    getClub(id)
      .then(res => {
        const club = res.data
        setForm({
          nom:         club.nom         || '',
          emoji:       club.emoji       || '🎓',
          categorie:   club.categorie   || 'Technologie',
          description: club.description || '',
        })
        if (club.logo_url) setLogoPreview(club.logo_url)
      })
      .catch(() => setErrors({ general: ['Impossible de charger les données du club.'] }))
      .finally(() => setFetching(false))
  }, [id])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    const data = new FormData()
    data.append('nom',         form.nom)
    data.append('description', form.description)
    data.append('categorie',   form.categorie)
    data.append('emoji',       form.emoji)
    if (logoFile) data.append('logo', logoFile)
    try {
      await updateClub(id, data)
      setSuccess('Club mis à jour avec succès.')
      setTimeout(() => navigate('/organiser/clubs'), 2000)
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

  if (fetching) {
    return (
      <DashboardLayout active="clubs" title="Modifier le club">
        <div className="ec-state" role="status" aria-live="polite">Chargement...</div>
      </DashboardLayout>
    )
  }

  const backButton = (
    <button type="button" className="ec-btn ec-btn--ghost" onClick={() => navigate('/organiser/clubs')}>
      <ArrowLeftIcon size={16} /> Retour aux clubs
    </button>
  )

  return (
    <DashboardLayout
      active="clubs"
      title="Modifier le club"
      subtitle="Mettez à jour les informations de votre club."
      actions={backButton}
    >
      <div className="og__form-layout">
        {/* Formulaire */}
        <div className="ec-card">
          <form className="og__form" onSubmit={handleSubmit}>
            <div className="og__grid2">
              <div className="ec-field og__span2">
                <label className="ec-label" htmlFor="club-nom">Nom du club</label>
                <input
                  id="club-nom" name="nom" value={form.nom} onChange={handleChange}
                  placeholder="Ex : Club Tech & Innovation" maxLength={255}
                  className={`ec-input${errors.nom ? ' is-error' : ''}`}
                  aria-invalid={errors.nom ? 'true' : undefined}
                  aria-describedby={errors.nom ? 'club-nom-err' : undefined}
                />
                {errors.nom && <span id="club-nom-err" className="ec-error">{errors.nom[0]}</span>}
              </div>

              <div className="ec-field">
                <label className="ec-label" htmlFor="club-emoji">Emoji du club</label>
                <input
                  id="club-emoji" name="emoji" value={form.emoji} onChange={handleChange}
                  placeholder="🎓" maxLength={10}
                  className={`ec-input${errors.emoji ? ' is-error' : ''}`}
                  aria-invalid={errors.emoji ? 'true' : undefined}
                  aria-describedby={errors.emoji ? 'club-emoji-err' : undefined}
                />
                {errors.emoji && <span id="club-emoji-err" className="ec-error">{errors.emoji[0]}</span>}
              </div>

              <div className="ec-field">
                <label className="ec-label" htmlFor="club-categorie">Catégorie</label>
                <select
                  id="club-categorie" name="categorie" value={form.categorie} onChange={handleChange}
                  className={`ec-select${errors.categorie ? ' is-error' : ''}`}
                  aria-invalid={errors.categorie ? 'true' : undefined}
                  aria-describedby={errors.categorie ? 'club-categorie-err' : undefined}
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                {errors.categorie && <span id="club-categorie-err" className="ec-error">{errors.categorie[0]}</span>}
              </div>

              <div className="ec-field og__span2">
                <label className="ec-label" htmlFor="club-description">Description du club</label>
                <textarea
                  id="club-description" name="description" value={form.description} onChange={handleChange}
                  placeholder="Décrivez votre club en quelques phrases…" rows={4}
                  className={`ec-textarea${errors.description ? ' is-error' : ''}`}
                  aria-invalid={errors.description ? 'true' : undefined}
                  aria-describedby={errors.description ? 'club-description-err' : undefined}
                />
                {errors.description && <span id="club-description-err" className="ec-error">{errors.description[0]}</span>}
              </div>

              <div className="ec-field og__span2">
                <span className="ec-label" id="club-logo-label">Logo image <span className="og__opt">(optionnel)</span></span>
                <input
                  ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/jpg,image/webp"
                  className="og__hidden" onChange={handleFileChange} tabIndex={-1} aria-hidden="true"
                />
                <button
                  type="button" className="og__upload" aria-labelledby="club-logo-label"
                  onClick={() => fileInputRef.current.click()}
                >
                  {logoPreview ? (
                    <>
                      <img src={logoPreview} alt="Aperçu du logo" />
                      <span className="og__upload-title">{logoFile ? logoFile.name : 'Logo actuel'}</span>
                      <span className="og__upload-hint">Cliquer pour changer</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={28} className="og__upload-icon" />
                      <span className="og__upload-title">Cliquer pour uploader un logo</span>
                      <span className="og__upload-hint">JPEG, PNG, WebP · max 2 MB</span>
                    </>
                  )}
                </button>
                {errors.logo && <span className="ec-error">{errors.logo[0]}</span>}
              </div>
            </div>

            {errors.general && (
              <div className="ec-alert ec-alert--error og__alert" role="alert">{errors.general[0]}</div>
            )}
            {success && (
              <div className="ec-alert ec-alert--success og__alert" role="status">{success}</div>
            )}

            <div className="og__footer">
              <button type="button" className="ec-btn ec-btn--ghost" onClick={() => navigate('/organiser/clubs')}>
                Annuler
              </button>
              <button type="submit" className="ec-btn ec-btn--primary" disabled={loading}>
                {loading ? 'Enregistrement…' : <><SaveIcon size={16} /> Enregistrer les modifications</>}
              </button>
            </div>
          </form>
        </div>

        {/* Aperçu live */}
        <aside className="ec-card ec-card--sand og__preview" aria-label="Aperçu du club">
          <p className="og__preview-label">Aperçu</p>
          <div className="og__preview-head">
            <div className="og__avatar" aria-hidden="true">
              {logoPreview
                ? <img src={logoPreview} alt="" />
                : form.emoji || <ClubIcon size={26} />}
            </div>
            <div>
              <p className={`og__preview-title${form.nom ? '' : ' is-empty'}`}>{form.nom || 'Nom du club'}</p>
              <p className="og__card-sub">{form.categorie}</p>
            </div>
          </div>
          {form.description && (
            <p className="og__preview-desc">
              {form.description.length > 120 ? form.description.slice(0, 120) + '…' : form.description}
            </p>
          )}
        </aside>
      </div>
    </DashboardLayout>
  )
}
