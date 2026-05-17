import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createEvent, getEventCategories } from '../../api/events'
import { getOrganizerClubs } from '../../api/clubs'

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

  const inputStyle = (name) => ({
    width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '14px',
    border: fieldErrors[name] ? '1.5px solid #E94560' : '1.5px solid #E0E0E6',
    color: '#1A1A2E', background: 'white', outline: 'none',
    boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.15s',
  })

  const s = {
    layout: { display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" },
    sidebar: { background: '#1A1A2E', padding: '24px 0', position: 'relative' },
    logo: { fontFamily: "'Fraunces', serif", fontSize: '18px', color: 'white', padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' },
    navItem: { padding: '11px 20px', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.55)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' },
    navActive: { padding: '11px 20px', fontSize: '13px', fontWeight: 500, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(233,69,96,0.15)', borderRight: '3px solid #E94560' },
    main: { padding: '32px', background: '#F4F4F6', minHeight: '100vh' },
    label: { display: 'block', fontSize: '13px', fontWeight: 600, color: '#1A1A2E', marginBottom: '6px' },
    fieldError: { fontSize: '12px', color: '#E94560', marginTop: '4px' },
  }

  const Sidebar = () => (
    <div style={s.sidebar}>
      <div style={s.logo}>Event<span style={{ color: '#E94560' }}>Campus</span></div>
      <div style={s.navItem} onClick={() => navigate('/organiser/dashboard')}>📊 Dashboard</div>
      <div style={s.navItem} onClick={() => navigate('/organiser/clubs')}>🏛️ Mon club</div>
      <div style={s.navActive}>📅 Mes événements</div>
      <div style={s.navItem} onClick={() => navigate('/organiser/adhesions')}>👥 Membres</div>
      <div style={s.navItem} onClick={() => navigate('/organiser/messages')}>✉️ Messages</div>
      <div style={{ position: 'absolute', bottom: '24px', left: 0, width: '220px', boxSizing: 'border-box', padding: '0 16px' }}>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
          <button
            onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login') }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
              padding: '11px 14px', borderRadius: '10px', border: '1px solid rgba(233,69,96,0.35)',
              background: 'rgba(233,69,96,0.1)', color: '#E94560',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#E94560'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#E94560' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(233,69,96,0.1)'; e.currentTarget.style.color = '#E94560'; e.currentTarget.style.borderColor = 'rgba(233,69,96,0.35)' }}
          >
            <span style={{ fontSize: '16px' }}>🚪</span> Déconnexion
          </button>
        </div>
      </div>
    </div>
  )

  if (clubsLoading) return (
    <div style={s.layout}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Fraunces:wght@700;900&display=swap" rel="stylesheet" />
      <Sidebar />
      <div style={s.main}>
        <div style={{ textAlign: 'center', padding: '60px', color: '#7A7A8C', fontSize: '14px' }}>Chargement de vos clubs...</div>
      </div>
    </div>
  )

  if (clubs.length === 0) return (
    <div style={s.layout}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Fraunces:wght@700;900&display=swap" rel="stylesheet" />
      <Sidebar />
      <div style={s.main}>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏛️</div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '22px', color: '#1A1A2E', marginBottom: '8px' }}>Aucun club disponible</h2>
          <p style={{ fontSize: '13px', color: '#7A7A8C', marginBottom: '24px' }}>Vous devez être organisateur d'un club pour créer un événement.</p>
          <button
            onClick={() => navigate('/organiser/clubs')}
            style={{ background: '#E94560', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 28px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
          >
            Gérer mes clubs
          </button>
        </div>
      </div>
    </div>
  )

  const selectedClub = clubs.find(c => String(c.id) === String(formData.club_id))
  const selectedCat = categories.find(c => c.nom === formData.categorie)
  const eventEmoji = isCustomCat ? customEmoji : (selectedCat?.emoji || '📅')

  const formatPreviewDate = (date, heure) => {
    if (!date) return null
    const d = new Date(date)
    const day = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })
      .replace(/^\w/, c => c.toUpperCase())
    return heure ? `${day} · ${heure.substring(0, 5)}` : day
  }

  return (
    <div style={s.layout}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Fraunces:wght@700;900&display=swap" rel="stylesheet" />
      <Sidebar />

      {/* Main */}
      <div style={s.main}>
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '22px', color: '#1A1A2E', margin: 0 }}>Créer un événement</h2>
          <div style={{ fontSize: '13px', color: '#7A7A8C', marginTop: '4px' }}>Remplissez les informations. L'événement sera soumis à validation.</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', alignItems: 'start' }}>

          {/* Formulaire */}
          <div style={{ background: 'white', borderRadius: '14px', border: '1.5px solid #E0E0E6', padding: '28px' }}>
            {error && (
              <div style={{ background: '#FFE6E6', color: '#E94560', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '20px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

              {/* Club + Catégorie */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={s.label}>Club associé *</label>
                  <select name="club_id" value={formData.club_id} onChange={handleChange} style={{ ...inputStyle('club_id'), cursor: 'pointer' }}>
                    <option value="">Sélectionner un club</option>
                    {clubs.map(c => <option key={c.id} value={c.id}>{c.nom || c.name}</option>)}
                  </select>
                  {fe('club_id') && <div style={s.fieldError}>{fe('club_id')}</div>}
                </div>
                <div>
                  <label style={s.label}>Catégorie *</label>
                  {!isCustomCat ? (
                    <select
                      name="categorie"
                      value={formData.categorie}
                      onChange={handleChange}
                      style={{ ...inputStyle('categorie'), cursor: 'pointer' }}
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map(c => (
                        <option key={c.nom} value={c.nom}>{c.emoji ? `${c.emoji} ` : ''}{c.nom}</option>
                      ))}
                      <option value={NEW_CAT_SENTINEL}>➕ Créer une nouvelle catégorie</option>
                    </select>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {/* Ligne emoji + nom */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        {/* Emoji */}
                        <input
                          type="text"
                          value={customEmoji}
                          onChange={e => setCustomEmoji(e.target.value)}
                          maxLength={8}
                          placeholder="📅"
                          style={{ ...inputStyle(null), width: '62px', flexShrink: 0, textAlign: 'center', fontSize: '20px', padding: '8px 6px' }}
                        />
                        {/* Nom */}
                        <div style={{ flex: 1, position: 'relative' }}>
                          <input
                            type="text"
                            value={customCat}
                            onChange={handleCustomCatChange}
                            placeholder="Nom de la nouvelle catégorie…"
                            maxLength={100}
                            autoFocus
                            style={{
                              ...inputStyle('categorie'),
                              borderColor: customCatError ? '#E94560' : customCat && !customCatError ? '#4CAF50' : '#E0E0E6',
                              paddingRight: '36px',
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => { setIsCustomCat(false); setCustomCat(''); setCustomEmoji('📅'); setCustomCatError(null); setFormData(prev => ({ ...prev, categorie: '' })) }}
                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#7A7A8C', lineHeight: 1 }}
                            title="Annuler"
                          >✕</button>
                        </div>
                      </div>
                      {customCatError
                        ? <div style={{ fontSize: '12px', color: '#E94560' }}>{customCatError}</div>
                        : customCat && !customCatError
                          ? <div style={{ fontSize: '12px', color: '#4CAF50' }}>✓ Nouvelle catégorie : <strong>{customEmoji} {customCat.trim()}</strong></div>
                          : <div style={{ fontSize: '11px', color: '#7A7A8C' }}>Saisissez l'emoji puis le nom de la catégorie</div>
                      }
                    </div>
                  )}
                  {fe('categorie') && <div style={s.fieldError}>{fe('categorie')}</div>}
                </div>
              </div>

              {/* Titre */}
              <div>
                <label style={s.label}>Titre de l'événement *</label>
                <input type="text" name="titre" value={formData.titre} onChange={handleChange}
                  placeholder="Ex : Conférence sur l'IA" style={inputStyle('titre')}
                  onFocus={e => !fieldErrors.titre && (e.target.style.borderColor = '#E94560')}
                  onBlur={e => !fieldErrors.titre && (e.target.style.borderColor = '#E0E0E6')}
                />
                {fe('titre') && <div style={s.fieldError}>{fe('titre')}</div>}
              </div>

              {/* Description */}
              <div>
                <label style={s.label}>Description *</label>
                <textarea name="description" value={formData.description} onChange={handleChange}
                  placeholder="Décrivez votre événement…" rows={3}
                  style={{ ...inputStyle('description'), resize: 'vertical', lineHeight: '1.6' }}
                  onFocus={e => !fieldErrors.description && (e.target.style.borderColor = '#E94560')}
                  onBlur={e => !fieldErrors.description && (e.target.style.borderColor = '#E0E0E6')}
                />
                {fe('description') && <div style={s.fieldError}>{fe('description')}</div>}
              </div>

              {/* Lieu + Capacité */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={s.label}>Lieu *</label>
                  <input type="text" name="lieu" value={formData.lieu} onChange={handleChange}
                    placeholder="Ex : Amphithéâtre A" style={inputStyle('lieu')}
                    onFocus={e => !fieldErrors.lieu && (e.target.style.borderColor = '#E94560')}
                    onBlur={e => !fieldErrors.lieu && (e.target.style.borderColor = '#E0E0E6')}
                  />
                  {fe('lieu') && <div style={s.fieldError}>{fe('lieu')}</div>}
                </div>
                <div>
                  <label style={s.label}>Capacité maximale *</label>
                  <input type="number" name="capacite_max" value={formData.capacite_max} onChange={handleChange}
                    placeholder="Ex : 50" min="1" style={inputStyle('capacite_max')}
                    onFocus={e => !fieldErrors.capacite_max && (e.target.style.borderColor = '#E94560')}
                    onBlur={e => !fieldErrors.capacite_max && (e.target.style.borderColor = '#E0E0E6')}
                  />
                  {fe('capacite_max') && <div style={s.fieldError}>{fe('capacite_max')}</div>}
                </div>
              </div>

              {/* Date début */}
              <div>
                <label style={s.label}>Date et heure de début *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} style={inputStyle('date')} />
                    {fe('date') && <div style={s.fieldError}>{fe('date')}</div>}
                  </div>
                  <div>
                    <input type="time" name="heure" value={formData.heure} onChange={handleChange} style={inputStyle('heure')} />
                    {fe('heure') && <div style={s.fieldError}>{fe('heure')}</div>}
                  </div>
                </div>
              </div>

              {/* Date fin */}
              <div>
                <label style={s.label}>Date et heure de fin *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <input type="date" name="date_fin" value={formData.date_fin} onChange={handleChange} style={inputStyle('date_fin')} />
                    {fe('date_fin') && <div style={s.fieldError}>{fe('date_fin')}</div>}
                  </div>
                  <div>
                    <input type="time" name="heure_fin" value={formData.heure_fin} onChange={handleChange} style={inputStyle('heure_fin')} />
                    {fe('heure_fin') && <div style={s.fieldError}>{fe('heure_fin')}</div>}
                  </div>
                </div>
              </div>

              {/* Boutons */}
              <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
                <button type="button" onClick={() => navigate('/organiser/events')}
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1.5px solid #E0E0E6', background: 'white', color: '#7A7A8C', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                >
                  Annuler
                </button>
                <button type="submit" disabled={loading}
                  style={{ flex: 2, padding: '12px', borderRadius: '10px', border: 'none', background: loading ? '#ccc' : 'linear-gradient(135deg, #E94560, #C0392B)', color: 'white', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: loading ? 'none' : '0 4px 12px rgba(233,69,96,0.35)', transition: 'opacity 0.15s' }}
                >
                  {loading ? 'Création en cours…' : '✅ Créer l\'événement'}
                </button>
              </div>
            </form>
          </div>

          {/* Aperçu live */}
          <div style={{ background: 'white', borderRadius: '14px', border: '1.5px solid #E0E0E6', padding: '22px', position: 'sticky', top: '32px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#7A7A8C', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>Aperçu</div>

            {/* Icône catégorie */}
            <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#F4F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', marginBottom: '12px' }}>
              {eventEmoji}
            </div>

            <div style={{ fontSize: '15px', fontWeight: 700, color: formData.titre ? '#1A1A2E' : '#C0C0C8', marginBottom: '4px' }}>
              {formData.titre || 'Titre de l\'événement'}
            </div>

            {formData.categorie && (
              <div style={{ fontSize: '12px', color: '#7A7A8C', marginBottom: '10px' }}>{formData.categorie}</div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
              {formatPreviewDate(formData.date, formData.heure) && (
                <div style={{ fontSize: '12px', color: '#555', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📅 {formatPreviewDate(formData.date, formData.heure)}
                </div>
              )}
              {formData.lieu && (
                <div style={{ fontSize: '12px', color: '#555', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📍 {formData.lieu}
                </div>
              )}
              {formData.capacite_max && (
                <div style={{ fontSize: '12px', color: '#555', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  👥 {formData.capacite_max} places
                </div>
              )}
              {selectedClub && (
                <div style={{ fontSize: '12px', color: '#555', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🏛️ {selectedClub.nom}
                </div>
              )}
            </div>

            <div style={{ background: '#FFF4E6', color: '#FF9500', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', fontWeight: 600, display: 'inline-block' }}>
              ⏳ En attente de validation
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
