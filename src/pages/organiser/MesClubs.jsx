import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrganizerClubs } from '../../api/clubs'

const CATEGORY_COLORS = {
  Technologie: '#E6F0FF', Sport: '#E6FFE6', Culture: '#FFF0E6',
  Environnement: '#E6FFFA', Solidarité: '#F0E6FF', default: '#F4F4F6',
}

export default function MesClubs() {
  const navigate = useNavigate()
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getOrganizerClubs()
      .then(res => setClubs(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Impossible de charger les clubs.'))
      .finally(() => setLoading(false))
  }, [])

  const s = {
    layout: { display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" },
    sidebar: { background: '#1A1A2E', padding: '24px 0', position: 'relative' },
    logo: { fontFamily: "'Fraunces', serif", fontSize: '18px', color: 'white', padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' },
    navItem: { padding: '11px 20px', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.55)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' },
    navActive: { padding: '11px 20px', fontSize: '13px', fontWeight: 500, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(233,69,96,0.15)', borderRight: '3px solid #E94560' },
    main: { padding: '32px', background: '#F4F4F6', minHeight: '100vh' },
  }

  const StatutBadge = ({ statut }) => {
    const map = {
      actif:       { bg: '#E6FFE6', color: '#4CAF50', label: '✅ Actif' },
      en_attente:  { bg: '#FFF4E6', color: '#FF9500', label: '⏳ En attente' },
      suspendu:    { bg: '#FFE6E6', color: '#E94560', label: '❌ Suspendu' },
    }
    const st = map[statut] || { bg: '#F4F4F6', color: '#7A7A8C', label: statut || '—' }
    return (
      <span style={{ background: st.bg, color: st.color, padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
        {st.label}
      </span>
    )
  }

  return (
    <div style={s.layout}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Fraunces:wght@700;900&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.logo}>Event<span style={{ color: '#E94560' }}>Campus</span></div>
        <div style={s.navItem} onClick={() => navigate('/organiser/dashboard')}>📊 Dashboard</div>
        <div style={s.navActive}>🏛️ Mon club</div>
        <div style={s.navItem} onClick={() => navigate('/organiser/events')}>📅 Mes événements</div>
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

      {/* Main */}
      <div style={s.main}>
        {/* Header */}
        <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
          <div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '22px', color: '#1A1A2E', margin: 0 }}>Mes clubs</h2>
            <div style={{ fontSize: '13px', color: '#7A7A8C', marginTop: '4px' }}>
              {clubs.length} club{clubs.length !== 1 ? 's' : ''} créé{clubs.length !== 1 ? 's' : ''}
            </div>
          </div>
          <button
            onClick={() => navigate('/organiser/clubs/create')}
            style={{ background: '#E94560', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'opacity 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            ➕ Créer un club
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#7A7A8C', fontSize: '14px' }}>Chargement...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#E94560', fontSize: '14px' }}>{error}</div>
        ) : clubs.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '14px', border: '1.5px solid #E0E0E6', padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏛️</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A2E', marginBottom: '6px' }}>Aucun club créé</div>
            <div style={{ fontSize: '13px', color: '#7A7A8C', marginBottom: '20px' }}>Créez votre premier club pour commencer.</div>
            <button
              onClick={() => navigate('/organiser/clubs/create')}
              style={{ background: '#E94560', color: 'white', border: 'none', borderRadius: '10px', padding: '11px 22px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              ➕ Créer un club
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {clubs.map(club => {
              const catColor = CATEGORY_COLORS[club.categorie] || CATEGORY_COLORS.default
              return (
                <div
                  key={club.id}
                  style={{ background: 'white', borderRadius: '14px', border: '1.5px solid #E0E0E6', padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  {/* Club header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: catColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', flexShrink: 0 }}>
                      {club.emoji || '🏛️'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A2E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {club.nom}
                      </div>
                      <div style={{ fontSize: '12px', color: '#7A7A8C', marginTop: '2px' }}>{club.categorie}</div>
                    </div>
                    <StatutBadge statut={club.statut} />
                  </div>

                  {/* Description */}
                  {club.description && (
                    <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.6', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {club.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: '20px', padding: '12px 14px', background: '#F8F8FA', borderRadius: '10px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A2E' }}>{club.membres_count ?? 0}</div>
                      <div style={{ fontSize: '11px', color: '#7A7A8C' }}>Membres</div>
                    </div>
                    {club.created_at && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A2E' }}>{new Date(club.created_at).getFullYear()}</div>
                        <div style={{ fontSize: '11px', color: '#7A7A8C' }}>Fondé en</div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => navigate(`/organiser/adhesions?club=${club.id}`)}
                      style={{ flex: 1, background: '#EEF0FF', color: '#4A4AE8', border: 'none', borderRadius: '8px', padding: '8px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      👥 Membres
                    </button>
                    <button
                      onClick={() => navigate(`/organiser/clubs/${club.id}/edit`)}
                      style={{ flex: 1, background: '#FFF4E6', color: '#FF9500', border: 'none', borderRadius: '8px', padding: '8px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      ✏️ Modifier
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
