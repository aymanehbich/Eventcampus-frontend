import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getPendingAdhesions, accepterAdhesion, refuserAdhesion, getClubUser } from '../../api/clubs'
import './Adhesions.css'

export default function Adhesions() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const clubId = searchParams.get('club')

  const [demandes, setDemandes] = useState([])
  const [membres, setMembres] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([getPendingAdhesions(clubId), getClubUser(clubId)])
      .then(([pendingRes, membresRes]) => {
        setDemandes(Array.isArray(pendingRes.data.adhesions) ? pendingRes.data.adhesions : [])
        setMembres(Array.isArray(membresRes.data) ? membresRes.data : [])
      })
      .catch(() => setError('Impossible de charger les données.'))
      .finally(() => setLoading(false))
  }, [clubId])

  const handleAccepter = async (id) => {
    setProcessing(id)
    try {
      await accepterAdhesion(id)
      setDemandes(prev => prev.filter(d => d.id !== id))
      const res = await getClubUser(clubId)
      setMembres(Array.isArray(res.data) ? res.data : [])
    } catch {
      alert('Une erreur est survenue.')
    } finally {
      setProcessing(null)
    }
  }

  const handleRefuser = async (id) => {
    setProcessing(id)
    try {
      await refuserAdhesion(id)
      setDemandes(prev => prev.filter(d => d.id !== id))
    } catch {
      alert('Une erreur est survenue.')
    } finally {
      setProcessing(null)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  
  const s = {
    layout: { display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" },
    sidebar: { background: '#1A1A2E', padding: '24px 0' },
    logo: { fontFamily: "'Fraunces', serif", fontSize: '18px', color: 'white', padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' },
    navItem: { padding: '11px 20px', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.55)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' },
    navActive: { padding: '11px 20px', fontSize: '13px', fontWeight: 500, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(233,69,96,0.15)', borderRight: '3px solid #E94560' },
    main: { padding: '32px', background: '#F4F4F6', minHeight: '100vh' },
    tableWrap: { background: 'white', borderRadius: '12px', border: '1.5px solid #E0E0E6', overflow: 'hidden' },
  }

  return (
    <div className="adhesions-layout">
      <div className="adhesions-sidebar">
        <div style={s.logo}>Event<span style={{ color: '#E94560' }}>Campus</span></div>
        <div style={s.navItem} onClick={() => navigate('/organiser/dashboard')}>📊 Dashboard</div>
        <div style={s.navItem} onClick={() => navigate('/organiser/clubs')}>🏛️ Mon club</div>        
        <div className="adhesions-nav-item" onClick={() => navigate('/organiser/events')}>📅 Mes événements</div>
        <div className="adhesions-nav-item active">👥 Membres</div>
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

      <div className="adhesions-main">
        <div className="adhesions-top">
          <h2>
            Gestion des membres
            {clubId && membres.length > 0 && (
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#7A7A8C', marginLeft: '10px', fontFamily: "'DM Sans', sans-serif" }}>
                — {membres[0]?.club_nom}
              </span>
            )}
          </h2>
          {clubId && (
            <button
              onClick={() => navigate('/organiser/adhesions')}
              style={{ marginTop: '6px', background: 'none', border: 'none', color: '#7A7A8C', fontSize: '12px', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              ← Tous les clubs
            </button>
          )}
        </div>

        <div className="adhesions-section-title">
          Demandes d'adhésion en attente
          {!loading && <span className="adhesions-badge">{demandes.length}</span>}
        </div>

        {loading && <p className="adhesions-muted">Chargement...</p>}
        {error && <p className="adhesions-error">{error}</p>}

        {!loading && !error && demandes.length === 0 && (
          <p className="adhesions-muted">Aucune demande en attente.</p>
        )}

        {!loading && !error && demandes.map(d => (
          <div key={d.id} className="adhesions-queue-item">
            <div className="adhesions-info">
              <h4>{d.user?.prenom} {d.user?.nom}</h4>
              <p>{d.user?.email} · Demande envoyée le {formatDate(d.created_at)}</p>
            </div>
            <div className="adhesions-actions">
              <button
                className="adhesions-btn adhesions-btn-success"
                disabled={processing === d.id}
                onClick={() => handleAccepter(d.id)}
              >
                {processing === d.id ? '...' : '✓ Accepter'}
              </button>
              <button
                className="adhesions-btn adhesions-btn-danger"
                disabled={processing === d.id}
                onClick={() => handleRefuser(d.id)}
              >
                {processing === d.id ? '...' : '✕ Refuser'}
              </button>
            </div>
          </div>
        ))}

        {/* ── Membres inscrits ── */}
        <div style={{ marginTop: '36px' }}>
          <div className="adhesions-section-title">
            Membres inscrits
            {!loading && (
              <span style={{ background: 'rgba(46,204,113,0.12)', color: '#2ECC71', fontSize: '12px', fontWeight: 700, padding: '2px 9px', borderRadius: '20px' }}>
                {membres.length}
              </span>
            )}
          </div>

          {loading && <p className="adhesions-muted">Chargement...</p>}

          {!loading && membres.length === 0 && (
            <p className="adhesions-muted">Aucun membre inscrit pour le moment.</p>
          )}

          {!loading && membres.length > 0 && (
            <div style={{ background: 'white', borderRadius: '12px', border: '1.5px solid #E0E0E6', overflow: 'hidden' }}>
              {/* En-tête tableau */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr', padding: '10px 20px', background: '#F8F8FA', borderBottom: '1px solid #E0E0E6', fontSize: '11px', fontWeight: 700, color: '#7A7A8C', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                <div>Membre</div>
                <div>Email</div>
                <div>Club</div>
                <div>Inscrit le</div>
              </div>

              {membres.map((m, i) => {
                const name = m.prenom && m.nom
                  ? `${m.prenom} ${m.nom}`
                  : (m.name || '—')
                const initial = name.charAt(0).toUpperCase()
                return (
                  <div
                    key={`${m.user_id}-${m.club_id}`}
                    style={{
                      display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr',
                      padding: '13px 20px', alignItems: 'center',
                      borderBottom: i < membres.length - 1 ? '1px solid #F0F0F4' : 'none',
                      fontSize: '13px', color: '#1A1A2E',
                    }}
                  >
                    {/* Nom avec avatar initial */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #E94560, #C0392B)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '13px', fontWeight: 700, color: 'white', flexShrink: 0,
                      }}>
                        {initial}
                      </div>
                      <span style={{ fontWeight: 600 }}>{name}</span>
                    </div>

                    {/* Email */}
                    <div style={{ color: '#7A7A8C', fontSize: '12px' }}>{m.email || '—'}</div>

                    {/* Club */}
                    <div>
                      <span style={{ fontSize: '11px', background: '#F0F0F8', color: '#4A4AE8', borderRadius: '6px', padding: '3px 8px', fontWeight: 600 }}>
                        🏛️ {m.club_nom || '—'}
                      </span>
                    </div>

                    {/* Date */}
                    <div style={{ fontSize: '12px', color: '#7A7A8C' }}>{formatDate(m.joined_at)}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
