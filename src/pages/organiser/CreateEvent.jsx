import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createEvent, getEventCategories } from '../../api/events'
import { getOrganizerClubs } from '../../api/clubs'
import DashboardLayout from '../../components/DashboardLayout'
import { ArrowLeftIcon, CheckIcon, ClockIcon, XIcon, CalendarIcon, PinIcon, UsersIcon, ClubIcon } from './OrganiserIcons'
import './Organiser.css'

const NEW_CAT_SENTINEL = '__nouvelle__'

export default function CreateEvent() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])       // [{nom, emoji}]
  const [isCustomCat, setIsCustomCat] = useState(false)
  const [customCat, setCustomCat] = useState('')
  const [customEmoji, setCustomEmoji] = useState('📅')
  const [customCatError, setCustomCatError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [clubsLoading, setClubsLoading] = useState(true)
  const [clubs, setClubs] = useState([])
  const [formData, setFormData] = useState({
    titre: '', description: '', date: '', heure: '',
    date_fin: '', heure_fin: '', lieu: '', categorie: '',
    club_id: '', capacite_max: '',
  })

  useEffect(() => {
    Promise.all([getOrganizerClubs(), getEventCategories()])
      .then(([clubsRes, catsRes]) => {
        const list = Array.isArray(clubsRes.data) ? clubsRes.data : clubsRes.data.data || []
        setClubs(list)
        if (list.length > 0) setFormData(prev => ({ ...prev, club_id: list[0].id }))
        setCategories(Array.isArray(catsRes.data) ? catsRes.data : [])
      })
      .catch(() => setError('Impossible de charger les données.'))
      .finally(() => setClubsLoading(false))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'categorie') {
      if (value === NEW_CAT_SENTINEL) {
        setIsCustomCat(true)
        setCustomCat('')
        setCustomEmoji('📅')
        setCustomCatError(null)
        setFormData(prev => ({ ...prev, categorie: '' }))
      } else {
        setIsCustomCat(false)
        setCustomCat('')
        setCustomEmoji('📅')
        setCustomCatError(null)
        setFormData(prev => ({ ...prev, categorie: value }))
      }
      return
    }
    setFormData(prev => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: undefined }))
  }

  const handleCustomCatChange = (e) => {
    const val = e.target.value
    setCustomCat(val)
    const exists = categories.some(c => c.nom.toLowerCase() === val.trim().toLowerCase())
    if (exists) {
      setCustomCatError('Cette catégorie existe déjà. Veuillez la sélectionner dans la liste.')
    } else {
      setCustomCatError(null)
      setFormData(prev => ({ ...prev, categorie: val.trim() }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setLoading(true)
    try {
      await createEvent({
        ...formData,
        capacite_max: formData.capacite_max ? parseInt(formData.capacite_max, 10) : '',
        club_id: formData.club_id ? parseInt(formData.club_id, 10) : '',
        ...(isCustomCat && { categorie_emoji: customEmoji }),
      })
      navigate('/organiser/events')
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors)
        setError('Veuillez corriger les erreurs ci-dessous.')
      } else {
        setError(err.response?.data?.message || 'Une erreur est survenue.')
      }
    } finally {
      setLoading(false)
    }
  }

  const fe = (name) => {
    const e = fieldErrors[name]
    return Array.isArray(e) ? e[0] : e
  }
  const errId = (name) => `ev-${name}-err`
  const aria = (name) => ({
    'aria-invalid': fe(name) ? 'true' : undefined,
    'aria-describedby': fe(name) ? errId(name) : undefined,
  })
  const cls = (base, name) => `${base}${fe(name) ? ' is-error' : ''}`
  const fieldErr = (name) => (fe(name) ? <span id={errId(name)} className="ec-error" role="alert">{fe(name)}</span> : null)

  const backButton = (
    <button type="button" className="ec-btn ec-btn--ghost" onClick={() => navigate('/organiser/events')}>
      <ArrowLeftIcon size={16} /> Retour aux événements
    </button>
  )

  if (clubsLoading) return (
    <DashboardLayout active="events" title="Créer un événement">
      <div className="ec-state" role="status" aria-live="polite">Chargement de vos clubs...</div>
    </DashboardLayout>
  )

  if (clubs.length === 0) return (
    <DashboardLayout active="events" title="Créer un événement">
      <div className="ec-card ec-card--sand og__empty">
        <div className="og__empty-icon"><ClubIcon size={26} /></div>
        <h2 className="og__empty-title">Aucun club disponible</h2>
        <p className="og__empty-text">Vous devez être organisateur d'un club pour créer un événement.</p>
        <button type="button" className="ec-btn ec-btn--primary" onClick={() => navigate('/organiser/clubs')}>
          Gérer mes clubs
        </button>
      </div>
    </DashboardLayout>
  )

  const selectedClub = clubs.find(c => String(c.id) === String(formData.club_id))
  const selectedCat = categories.find(c => c.nom === formData.categorie)
  const eventEmoji = isCustomCat ? customEmoji : selectedCat?.emoji

  const formatPreviewDate = (date, heure) => {
    if (!date) return null
    const d = new Date(date)
    const day = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })
      .replace(/^\w/, c => c.toUpperCase())
    return heure ? `${day} · ${heure.substring(0, 5)}` : day
  }

  const customOk = customCat && !customCatError

  return (
    <DashboardLayout
      active="events"
      title="Créer un événement"
      subtitle="Remplissez les informations. L'événement sera soumis à validation."
      actions={backButton}
    >
      <div className="og__form-layout">
        {/* Formulaire */}
        <div className="ec-card">
          {error && <div className="ec-alert ec-alert--error og__alert" role="alert">{error}</div>}

          <form className="og__form" onSubmit={handleSubmit}>
            <div className="og__grid2">
              {/* Club */}
              <div className="ec-field">
                <label className="ec-label" htmlFor="ev-club_id">Club associé <span className="og__req" aria-hidden="true">*</span></label>
                <select id="ev-club_id" name="club_id" value={formData.club_id} onChange={handleChange} className={cls('ec-select', 'club_id')} {...aria('club_id')}>
                  <option value="">Sélectionner un club</option>
                  {clubs.map(c => <option key={c.id} value={c.id}>{c.nom || c.name}</option>)}
                </select>
                {fieldErr('club_id')}
              </div>

              {/* Catégorie */}
              <div className="ec-field">
                {!isCustomCat ? (
                  <>
                    <label className="ec-label" htmlFor="ev-categorie">Catégorie <span className="og__req" aria-hidden="true">*</span></label>
                    <select id="ev-categorie" name="categorie" value={formData.categorie} onChange={handleChange} className={cls('ec-select', 'categorie')} {...aria('categorie')}>
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map(c => (
                        <option key={c.nom} value={c.nom}>{c.emoji ? `${c.emoji} ` : ''}{c.nom}</option>
                      ))}
                      <option value={NEW_CAT_SENTINEL}>+ Créer une nouvelle catégorie</option>
                    </select>
                  </>
                ) : (
                  <>
                    <label className="ec-label" htmlFor="ev-categorie-new">Nouvelle catégorie <span className="og__req" aria-hidden="true">*</span></label>
                    <div className="og__catrow">
                      <input
                        type="text"
                        value={customEmoji}
                        onChange={e => setCustomEmoji(e.target.value)}
                        maxLength={8}
                        placeholder="📅"
                        aria-label="Emoji de la catégorie"
                        className="ec-input og__emoji"
                      />
                      <input
                        id="ev-categorie-new"
                        type="text"
                        value={customCat}
                        onChange={handleCustomCatChange}
                        placeholder="Nom de la nouvelle catégorie…"
                        maxLength={100}
                        autoFocus
                        className={`ec-input og__catname${customCatError || fe('categorie') ? ' is-error' : customOk ? ' og__input-ok' : ''}`}
                        aria-invalid={customCatError || fe('categorie') ? 'true' : undefined}
                        aria-describedby="ev-categorie-hint"
                      />
                      <button
                        type="button"
                        className="og__icon-btn"
                        aria-label="Annuler la nouvelle catégorie"
                        title="Annuler"
                        onClick={() => { setIsCustomCat(false); setCustomCat(''); setCustomEmoji('📅'); setCustomCatError(null); setFormData(prev => ({ ...prev, categorie: '' })) }}
                      >
                        <XIcon size={18} />
                      </button>
                    </div>
                    <div id="ev-categorie-hint" aria-live="polite">
                      {customCatError
                        ? <span className="ec-error">{customCatError}</span>
                        : customOk
                          ? <span className="og__success"><CheckIcon size={14} /> Nouvelle catégorie : <strong>{customEmoji} {customCat.trim()}</strong></span>
                          : <span className="ec-help">Saisissez l'emoji puis le nom de la catégorie</span>}
                    </div>
                  </>
                )}
                {fieldErr('categorie')}
              </div>

              {/* Titre */}
              <div className="ec-field og__span2">
                <label className="ec-label" htmlFor="ev-titre">Titre de l'événement <span className="og__req" aria-hidden="true">*</span></label>
                <input id="ev-titre" type="text" name="titre" value={formData.titre} onChange={handleChange}
                  placeholder="Ex : Conférence sur l'IA" className={cls('ec-input', 'titre')} {...aria('titre')} />
                {fieldErr('titre')}
              </div>

              {/* Description */}
              <div className="ec-field og__span2">
                <label className="ec-label" htmlFor="ev-description">Description <span className="og__req" aria-hidden="true">*</span></label>
                <textarea id="ev-description" name="description" value={formData.description} onChange={handleChange}
                  placeholder="Décrivez votre événement…" rows={3} className={cls('ec-textarea', 'description')} {...aria('description')} />
                {fieldErr('description')}
              </div>

              {/* Lieu + Capacité */}
              <div className="ec-field">
                <label className="ec-label" htmlFor="ev-lieu">Lieu <span className="og__req" aria-hidden="true">*</span></label>
                <input id="ev-lieu" type="text" name="lieu" value={formData.lieu} onChange={handleChange}
                  placeholder="Ex : Amphithéâtre A" className={cls('ec-input', 'lieu')} {...aria('lieu')} />
                {fieldErr('lieu')}
              </div>
              <div className="ec-field">
                <label className="ec-label" htmlFor="ev-capacite_max">Capacité maximale <span className="og__req" aria-hidden="true">*</span></label>
                <input id="ev-capacite_max" type="number" name="capacite_max" value={formData.capacite_max} onChange={handleChange}
                  placeholder="Ex : 50" min="1" className={cls('ec-input', 'capacite_max')} {...aria('capacite_max')} />
                {fieldErr('capacite_max')}
              </div>

              {/* Début */}
              <div className="ec-field">
                <label className="ec-label" htmlFor="ev-date">Date de début <span className="og__req" aria-hidden="true">*</span></label>
                <input id="ev-date" type="date" name="date" value={formData.date} onChange={handleChange} className={cls('ec-input', 'date')} {...aria('date')} />
                {fieldErr('date')}
              </div>
              <div className="ec-field">
                <label className="ec-label" htmlFor="ev-heure">Heure de début <span className="og__req" aria-hidden="true">*</span></label>
                <input id="ev-heure" type="time" name="heure" value={formData.heure} onChange={handleChange} className={cls('ec-input', 'heure')} {...aria('heure')} />
                {fieldErr('heure')}
              </div>

              {/* Fin */}
              <div className="ec-field">
                <label className="ec-label" htmlFor="ev-date_fin">Date de fin <span className="og__req" aria-hidden="true">*</span></label>
                <input id="ev-date_fin" type="date" name="date_fin" value={formData.date_fin} onChange={handleChange} className={cls('ec-input', 'date_fin')} {...aria('date_fin')} />
                {fieldErr('date_fin')}
              </div>
              <div className="ec-field">
                <label className="ec-label" htmlFor="ev-heure_fin">Heure de fin <span className="og__req" aria-hidden="true">*</span></label>
                <input id="ev-heure_fin" type="time" name="heure_fin" value={formData.heure_fin} onChange={handleChange} className={cls('ec-input', 'heure_fin')} {...aria('heure_fin')} />
                {fieldErr('heure_fin')}
              </div>
            </div>

            <div className="og__footer">
              <button type="button" className="ec-btn ec-btn--ghost" onClick={() => navigate('/organiser/events')}>
                Annuler
              </button>
              <button type="submit" className="ec-btn ec-btn--primary" disabled={loading}>
                {loading ? 'Création en cours…' : <><CheckIcon size={16} /> Créer l'événement</>}
              </button>
            </div>
          </form>
        </div>

        {/* Aperçu live */}
        <aside className="ec-card ec-card--sand og__preview" aria-label="Aperçu de l'événement">
          <p className="og__preview-label">Aperçu</p>

          <div className="og__preview-head">
            <div className="og__avatar" aria-hidden="true">
              {eventEmoji || <CalendarIcon size={26} />}
            </div>
            <div>
              <p className={`og__preview-title${formData.titre ? '' : ' is-empty'}`}>{formData.titre || "Titre de l'événement"}</p>
              {formData.categorie && <p className="og__card-sub">{formData.categorie}</p>}
            </div>
          </div>

          <div className="og__meta">
            {formatPreviewDate(formData.date, formData.heure) && (
              <div className="og__meta-line"><CalendarIcon size={16} /><span>{formatPreviewDate(formData.date, formData.heure)}</span></div>
            )}
            {formData.lieu && (
              <div className="og__meta-line"><PinIcon size={16} /><span>{formData.lieu}</span></div>
            )}
            {formData.capacite_max && (
              <div className="og__meta-line"><UsersIcon size={16} /><span>{formData.capacite_max} places</span></div>
            )}
            {selectedClub && (
              <div className="og__meta-line"><ClubIcon size={16} /><span>{selectedClub.nom}</span></div>
            )}
          </div>

          <span className="ec-badge ec-badge--amber"><ClockIcon size={12} /> En attente de validation</span>
        </aside>
      </div>
    </DashboardLayout>
  )
}
