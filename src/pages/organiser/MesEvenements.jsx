import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrganizerEvents, deleteEvent } from '../../api/events'

const CATEGORY_COLORS = {
  Conférence: '#FFF0E6', Atelier: '#E6F0FF', Soirée: '#FFE6F0',
  'Réunion de club': '#F0E6FF', Hackathon: '#E6FFE6', Environnement: '#E6FFFA', default: '#F4F4F6',
}
const CATEGORY_EMOJIS = {
  Conférence: '🎤', Atelier: '🎨', Soirée: '🎭',
  'Réunion de club': '👥', Hackathon: '👨‍💻', Environnement: '🌱', default: '📅',
}

export default function MesEvenements() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    getOrganizerEvents()
      .then(res => setEvents(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Impossible de charger les événements.'))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async () => {
    if (!confirmId) return
    setDeleting(true)
    try {
      await deleteEvent(confirmId)
      setEvents(prev => prev.filter(e => e.id !== confirmId))
      setConfirmId(null)
    } catch {
      alert('Une erreur est survenue lors de la suppression.')
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (str) => {
    if (!str) return ''
    return new Date(str).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const s = {
    layout: { display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" },
    sidebar: { background: '#1A1A2E', padding: '24px 0', position: 'relative' },
    logo: { fontFamily: "'Fraunces', serif", fontSize: '18px', color: 'white', padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' },
    navItem: { padding: '11px 20px', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.55)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' },
    navActive: { padding: '11px 20px', fontSize: '13px', fontWeight: 500, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(233,69,96,0.15)', borderRight: '3px solid #E94560' },
    main: { padding: '32px', background: '#F4F4F6', minHeight: '100vh' },
    tableWrap: { background: 'white', borderRadius: '12px', border: '1.5px solid #E0E0E6', overflow: 'hidden' },
  }

  const confirmEvent = events.find(e => e.id === confirmId)

  return (
    <div style={s.layout}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Fraunces:wght@700;900&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.logo}>Event<span style={{ color: '#E94560' }}>Campus</span></div>
        <div style={s.navItem} onClick={() => navigate('/organiser/dashboard')}>📊 Dashboard</div>
        <div style={s.navItem} onClick={() => navigate('/organiser/clubs')}>🏛️ Mon club</div>
        <div style={s.navActive}>📅 Mes événements</div>
        <div style={s.navItem} onClick={() => navigate('/organiser/adhesions')}>👥 Membres</div>
        <div className="messaging-nav-item" onClick={() => navigate('/organiser/messages')}>✉️ Messages</div>
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

      {/* Main */}
      <div style={s.main}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
          <div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '22px', color: '#1A1A2E' }}>Mes événements</h2>
            <div style={{ fontSize: '13px', color: '#7A7A8C', marginTop: '4px' }}>
              {events.length} événement{events.length !== 1 ? 's' : ''} créé{events.length !== 1 ? 's' : ''}
            </div>
          </div>
          <button
            onClick={() => navigate('/organiser/events/create')}
            style={{ background: '#E94560', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', marginTop: '2px', transition: 'opacity 0.15s' }}
            onMouseEnter={(e) => e.target.style.opacity = '0.85'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            ➕ Créer un événement
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#7A7A8C', fontSize: '14px' }}>Chargement...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#E94560', fontSize: '14px' }}>{error}</div>
        ) : (
          <div style={s.tableWrap}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr>
                  {['Événement', 'Date', 'Lieu', 'Inscrits', 'Statut', 'Actions'].map(h => (
                    <th key={h} style={{ background: '#F4F4F6', padding: '10px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#7A7A8C', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#7A7A8C', fontSize: '13px' }}>
                      Vous n'avez créé aucun événement.
                    </td>
                  </tr>
                ) : (
                  events.map((evt, i) => {
                    const cat = evt.categorie || 'default'
                    const bg = CATEGORY_COLORS[cat] || CATEGORY_COLORS.default
                    const emoji = CATEGORY_EMOJIS[cat] || CATEGORY_EMOJIS.default
                    const totalPlaces = (evt.inscrits ?? 0) + (evt.places_disponibles ?? 0)
                    const isLast = i === events.length - 1
                    const tdStyle = { padding: '13px 16px', borderBottom: isLast ? 'none' : '1px solid #E0E0E6', color: '#1A1A2E', verticalAlign: 'middle' }

                    return (
                      <tr key={evt.id}>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{emoji}</div>
                            <div>
                              <div style={{ fontWeight: 600 }}>{evt.titre}</div>
                              <div style={{ fontSize: '11px', color: '#7A7A8C', marginTop: '2px' }}>{cat}</div>
                            </div>
                          </div>
                        </td>
                        <td style={tdStyle}>{formatDate(evt.date)}</td>
                        <td style={tdStyle}>{evt.lieu || '—'}</td>
                        <td style={tdStyle}>
                          <span style={{ fontWeight: 600 }}>{evt.inscrits ?? 0}</span>
                          <span style={{ color: '#7A7A8C' }}> / {totalPlaces}</span>
                        </td>
                        <td style={tdStyle}>
                          {evt.statut === 'En attente' ? (
                            <span style={{ background: '#FFF4E6', color: '#FF9500', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, display: 'inline-block' }}>
                              ⏱️ En attente
                            </span>
                          ) : evt.statut === 'Accepté' ? (
                            <span style={{ background: '#E6FFE6', color: '#4CAF50', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, display: 'inline-block' }}>
                              ✅ Publié
                            </span>
                          ) : (
                            <span style={{ background: '#FFE6E6', color: '#E94560', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, display: 'inline-block' }}>
                              ❌ Rejeté
                            </span>
                          )}
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => navigate(`/organiser/events/${evt.id}/inscrits`)}
                              style={{ background: '#EEF0FF', color: '#4A4AE8', border: 'none', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                            >
                              👥 Voir inscrits
                            </button>
                            <button
                              onClick={() => navigate(`/organiser/events/${evt.id}/edit`)}
                              style={{ background: '#FFF4E6', color: '#FF9500', border: 'none', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                            >
                              ✏️ Modifier
                            </button>
                            <button
                              onClick={() => setConfirmId(evt.id)}
                              style={{ background: '#fde8ed', color: '#E94560', border: 'none', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                            >
                              🗑️ Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de confirmation */}
      {confirmId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px 28px', width: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <div style={{ fontSize: '32px', textAlign: 'center', marginBottom: '12px' }}>🗑️</div>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '18px', color: '#1A1A2E', textAlign: 'center', marginBottom: '8px' }}>
              Supprimer l'événement ?
            </h3>
            <p style={{ fontSize: '13px', color: '#7A7A8C', textAlign: 'center', lineHeight: '1.6', marginBottom: '24px' }}>
              Vous êtes sur le point de supprimer <strong style={{ color: '#1A1A2E' }}>{confirmEvent?.titre}</strong>.<br />
              Cette action est irréversible.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setConfirmId(null)}
                disabled={deleting}
                style={{ flex: 1, background: '#F4F4F6', color: '#1A1A2E', border: '1.5px solid #E0E0E6', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ flex: 1, background: 'linear-gradient(135deg, #E94560, #C0392B)', color: 'white', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(233,69,96,0.35)' }}
              >
                {deleting ? 'Suppression...' : 'Oui, supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
