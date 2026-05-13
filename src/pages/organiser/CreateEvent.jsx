import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createEvent } from '../../api/events'
import { getOrganizerClubs } from '../../api/clubs'

const CATEGORIES = ['Conférence', 'Atelier', 'Soirée', 'Réunion de club', 'Hackathon', 'Environnement']

export default function CreateEvent() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [clubsLoading, setClubsLoading] = useState(true)
  const [clubs, setClubs] = useState([])
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    date: '',
    heure: '',
    date_fin: '',
    heure_fin: '',
    lieu: '',
    categorie: '',
    club_id: '',
    capacite_max: '',
  })

  useEffect(() => {
    fetchClubs()
  }, [])

  const fetchClubs = async () => {
    try {
      const res = await getOrganizerClubs()
      setClubs(Array.isArray(res.data) ? res.data : res.data.data || [])
      if (res.data.length > 0) {
        setFormData(prev => ({ ...prev, club_id: res.data[0].id }))
      }
    } catch (err) {
      setError('Impossible de charger vos clubs.')
    } finally {
      setClubsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!formData.titre.trim()) {
      setError('Le titre est requis.')
      return
    }
    if (!formData.date) {
      setError('La date de début est requise.')
      return
    }
    if (!formData.heure) {
      setError('L\'heure de début est requise.')
      return
    }
    if (!formData.date_fin) {
      setError('La date de fin est requise.')
      return
    }
    if (!formData.heure_fin) {
      setError('L\'heure de fin est requise.')
      return
    }
    if (!formData.lieu.trim()) {
      setError('Le lieu est requis.')
      return
    }
    if (!formData.description.trim()) {
      setError('La description est requise.')
      return
    }
    if (!formData.categorie) {
      setError('La catégorie est requise.')
      return
    }
    if (!formData.capacite_max || formData.capacite_max <= 0) {
      setError('La capacité doit être supérieure à 0.')
      return
    }
    if (!formData.club_id) {
      setError('Veuillez sélectionner un club.')
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...formData,
        capacite_max: parseInt(formData.capacite_max, 10),
        club_id: parseInt(formData.club_id, 10),
      }
      await createEvent(payload)
      navigate('/organiser/events')
    } catch (err) {
      const msg = err.response?.data?.message || 'Une erreur est survenue.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const s = {
    layout: { display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" },
    sidebar: { background: '#1A1A2E', padding: '24px 0' },
    logo: { fontFamily: "'Fraunces', serif", fontSize: '18px', color: 'white', padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' },
    navItem: { padding: '11px 20px', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.55)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' },
    navActive: { padding: '11px 20px', fontSize: '13px', fontWeight: 500, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(233,69,96,0.15)', borderRight: '3px solid #E94560' },
    main: { padding: '32px', background: '#F4F4F6', minHeight: '100vh' },
    formContainer: { background: 'white', borderRadius: '12px', border: '1.5px solid #E0E0E6', padding: '32px', maxWidth: '600px' },
    formGroup: { marginBottom: '20px' },
    formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
    label: { display: 'block', fontSize: '13px', fontWeight: 600, color: '#1A1A2E', marginBottom: '8px' },
    input: { width: '100%', padding: '11px 14px', fontSize: '13px', border: '1.5px solid #E0E0E6', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box', transition: 'border-color 0.15s' },
    select: { width: '100%', padding: '11px 14px', fontSize: '13px', border: '1.5px solid #E0E0E6', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box', backgroundColor: 'white', cursor: 'pointer', transition: 'border-color 0.15s' },
    textarea: { width: '100%', padding: '11px 14px', fontSize: '13px', border: '1.5px solid #E0E0E6', borderRadius: '8px', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box', minHeight: '100px', resize: 'vertical', transition: 'border-color 0.15s' },
    buttonGroup: { display: 'flex', gap: '12px', marginTop: '28px' },
    submitBtn: { flex: 1, background: '#E94560', color: 'white', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s' },
    cancelBtn: { flex: 1, background: '#F4F4F6', color: '#1A1A2E', border: '1.5px solid #E0E0E6', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s' },
    errorMsg: { background: '#FFE6E6', border: '1px solid #FFB3B3', color: '#E94560', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px' },
  }

  if (clubsLoading) {
    return (
      <div style={s.layout}>
        <div style={s.sidebar} />
        <div style={s.main}>
          <div style={{ textAlign: 'center', padding: '60px', color: '#7A7A8C', fontSize: '14px' }}>
            Chargement de vos clubs...
          </div>
        </div>
      </div>
    )
  }

  if (clubs.length === 0) {
    return (
      <div style={s.layout}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Fraunces:wght@700;900&display=swap" rel="stylesheet" />
        <div style={s.sidebar}>
          <div style={s.logo}>Event<span style={{ color: '#E94560' }}>Campus</span></div>
          <div style={s.navItem} onClick={() => navigate('/organiser/dashboard')}>📊 Dashboard</div>
          <div style={s.navItem} onClick={() => navigate('/organiser/club')}>🏛️ Mon club</div>
          <div style={s.navActive}>📅 Mes événements</div>
          <div style={s.navItem} onClick={() => navigate('/organiser/membres')}>👥 Membres</div>
        </div>
        <div style={s.main}>
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏛️</div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '22px', color: '#1A1A2E', marginBottom: '8px' }}>
              Aucun club disponible
            </h2>
            <p style={{ fontSize: '13px', color: '#7A7A8C', marginBottom: '24px' }}>
              Vous devez être organisateur d'un club pour créer un événement.
            </p>
            <button
              onClick={() => navigate('/organiser/club')}
              style={{ background: '#E94560', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 28px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
            >
              Gérer mes clubs
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={s.layout}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Fraunces:wght@700;900&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.logo}>Event<span style={{ color: '#E94560' }}>Campus</span></div>
        <div style={s.navItem} onClick={() => navigate('/organiser/dashboard')}>📊 Dashboard</div>
        <div style={s.navItem} onClick={() => navigate('/organiser/club')}>🏛️ Mon club</div>
        <div style={s.navActive}>📅 Mes événements</div>
        <div style={s.navItem} onClick={() => navigate('/organiser/membres')}>👥 Membres</div>
      </div>

      {/* Main */}
      <div style={s.main}>
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '22px', color: '#1A1A2E' }}>Créer un événement</h2>
          <p style={{ fontSize: '13px', color: '#7A7A8C', marginTop: '4px' }}>Remplissez les informations de votre événement</p>
        </div>

        <div style={s.formContainer}>
          {error && <div style={s.errorMsg}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={s.formGroup}>
              <label style={s.label}>Club associé *</label>
              <select
                name="club_id"
                value={formData.club_id}
                onChange={handleChange}
                style={s.select}
              >
                <option value="">Sélectionner un club</option>
                {clubs.map(club => (
                  <option key={club.id} value={club.id}>
                    {club.nom || club.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>Titre de l'événement *</label>
              <input
                type="text"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                placeholder="Ex: Conférence sur l'IA"
                style={s.input}
              />
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>Catégorie *</label>
              <select
                name="categorie"
                value={formData.categorie}
                onChange={handleChange}
                style={s.select}
              >
                <option value="">Sélectionner une catégorie</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Décrivez votre événement..."
                style={s.textarea}
              />
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>Lieu *</label>
              <input
                type="text"
                name="lieu"
                value={formData.lieu}
                onChange={handleChange}
                placeholder="Ex: Amphithéâtre A"
                style={s.input}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={s.label}>Date et heure de début *</label>
              <div style={s.formRow}>
                <div>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    style={s.input}
                  />
                </div>
                <div>
                  <input
                    type="time"
                    name="heure"
                    value={formData.heure}
                    onChange={handleChange}
                    style={s.input}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={s.label}>Date et heure de fin *</label>
              <div style={s.formRow}>
                <div>
                  <input
                    type="date"
                    name="date_fin"
                    value={formData.date_fin}
                    onChange={handleChange}
                    style={s.input}
                  />
                </div>
                <div>
                  <input
                    type="time"
                    name="heure_fin"
                    value={formData.heure_fin}
                    onChange={handleChange}
                    style={s.input}
                  />
                </div>
              </div>
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>Capacité maximale (places) *</label>
              <input
                type="number"
                name="capacite_max"
                value={formData.capacite_max}
                onChange={handleChange}
                placeholder="Ex: 50"
                min="1"
                style={s.input}
              />
            </div>

            <div style={s.buttonGroup}>
              <button
                type="button"
                onClick={() => navigate('/organiser/events')}
                style={s.cancelBtn}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Création en cours...' : 'Créer l\'événement'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
