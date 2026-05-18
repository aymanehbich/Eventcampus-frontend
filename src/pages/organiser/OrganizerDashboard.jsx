import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrganizerClubs, getPendingAdhesions, getClubUser, accepterAdhesion, refuserAdhesion } from '../../api/clubs'
import { getOrganizerEvents } from '../../api/events'
import api from '../../api/axios'


export default function OrganizerDashboard() {
  const navigate = useNavigate()


  const [notifications, setNotifications] = useState([])
  const [showNotifs, setShowNotifs]       = useState(false)
  const unreadCount = notifications.filter(n => !n.read_at).length


  const [clubs, setClubs] = useState([])
  const [events, setEvents] = useState([])
  const [demandes, setDemandes] = useState([])
  const [membres, setMembres] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(null)

  const user = (() => { try { return JSON.parse(localStorage.getItem('user')) } catch { return null } })()
  const prenom = user?.prenom || user?.name || 'Organisateur'

  const today = new Date()
  const dateLabel = today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })


  useEffect(() => {
    Promise.all([
      getOrganizerClubs(),
      getOrganizerEvents(),
      getPendingAdhesions(),
      getClubUser(),
      api.get('/notifications'),
    ]).then(([clubsRes, eventsRes, demandesRes, membresRes]) => {
      setClubs(Array.isArray(clubsRes.data) ? clubsRes.data : [])
      setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : [])
      setDemandes(Array.isArray(demandesRes.data?.adhesions) ? demandesRes.data.adhesions : [])
      setMembres(Array.isArray(membresRes.data) ? membresRes.data : [])
    }).finally(() => setLoading(false))
  }, [])

  const handleAccepter = async (id) => {
    setProcessing(id)
    try {
      await accepterAdhesion(id)
      setDemandes(prev => prev.filter(d => d.id !== id))
      const res = await getClubUser()
      setMembres(Array.isArray(res.data) ? res.data : [])
    } catch { /* silent */ }
    finally { setProcessing(null) }
  }

  const handleRefuser = async (id) => {
    setProcessing(id)
    try {
      await refuserAdhesion(id)
      setDemandes(prev => prev.filter(d => d.id !== id))
    } catch { /* silent */ }
    finally { setProcessing(null) }
  }

  const formatDate = (str) => {
    if (!str) return ''
    return new Date(str).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  const upcomingEvents = events
    .filter(e => e.date >= today.toISOString().slice(0, 10))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4)

  const CATEGORY_EMOJIS = {
    Conférence: '🎤', Atelier: '🎨', Soirée: '🎭',
    'Réunion de club': '👥', Hackathon: '👨‍💻', Environnement: '🌱', default: '📅',
  }

  const s = {
    layout:    { display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" },
    sidebar:   { background: '#1A1A2E', padding: '24px 0', position: 'relative' },
    logo:      { fontFamily: "'Fraunces', serif", fontSize: '18px', color: 'white', padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' },
    navItem:   { padding: '11px 20px', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.55)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' },
    navActive: { padding: '11px 20px', fontSize: '13px', fontWeight: 500, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(233,69,96,0.15)', borderRight: '3px solid #E94560' },
    main:      { padding: '32px', background: '#F4F4F6', minHeight: '100vh' },
    card:      { background: 'white', borderRadius: '14px', border: '1.5px solid #E0E0E6' },
    sectionTitle: { fontFamily: "'Fraunces', serif", fontSize: '15px', color: '#1A1A2E', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  }

  return (
    <div style={s.layout}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Fraunces:wght@700;900&display=swap" rel="stylesheet" />

      {/* ── Sidebar ── */}
      <div style={s.sidebar}>
        <div style={s.logo}>Event<span style={{ color: '#E94560' }}>Campus</span></div>
        <div style={s.navActive}>📊 Dashboard</div>
        <div style={s.navItem} onClick={() => navigate('/organiser/clubs')}>🏛️ Mon club</div>
        <div style={s.navItem} onClick={() => navigate('/organiser/events')}>📅 Mes événements</div>
        <div style={s.navItem} onClick={() => navigate('/organiser/adhesions')}>👥 Membres</div>
        <div style={s.navItem} onClick={() => navigate('/organiser/messages')}>✉️ Messages</div>
        <div style={{ position: 'absolute', bottom: '24px', left: 0, width: '220px', boxSizing: 'border-box', padding: '0 16px' }}>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
            <button
              onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login') }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '10px', border: '1px solid rgba(233,69,96,0.35)', background: 'rgba(233,69,96,0.1)', color: '#E94560', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#E94560'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#E94560' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(233,69,96,0.1)'; e.currentTarget.style.color = '#E94560'; e.currentTarget.style.borderColor = 'rgba(233,69,96,0.35)' }}
            >
              <span style={{ fontSize: '16px' }}>🚪</span> Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* ── Main ── */}
      <div style={s.main}>

        {/* Header */}
        <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '24px', color: '#1A1A2E', margin: 0 }}>
              Bonjour, {prenom} 👋
            </h2>
            <div style={{ fontSize: '13px', color: '#7A7A8C', marginTop: '4px', textTransform: 'capitalize' }}>{dateLabel}</div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>

            {/* 🔔 Cloche notifications */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifs(prev => !prev)}
                style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  border: '1.5px solid #E0E0E6', background: 'white',
                  cursor: 'pointer', fontSize: '18px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', position: 'relative',
                }}
              >
                🔔
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-6px', right: '-6px',
                    background: '#E94560', color: 'white', fontSize: '10px',
                    fontWeight: 700, width: '18px', height: '18px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown notifications */}
              {showNotifs && (
                <div style={{
                  position: 'absolute', top: '48px', right: 0, width: '320px',
                  background: 'white', borderRadius: '12px', border: '1.5px solid #E0E0E6',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '14px 16px', borderBottom: '1px solid #F0F0F4',
                    fontSize: '13px', fontWeight: 700, color: '#1A1A2E',
                  }}>
                    🔔 Notifications
                  </div>

                  {notifications.length === 0 ? (
                    <div style={{ padding: '28px', textAlign: 'center', color: '#7A7A8C', fontSize: '13px' }}>
                      Aucune notification
                    </div>
                  ) : (
                    <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                      {notifications.map((notif, i) => {
                        const data = notif.data || {}
                        const isApproved = data.status === 'approved'
                        const isUnread = !notif.read_at
                        return (
                          <div key={notif.id} style={{
                            padding: '14px 16px',
                            borderBottom: i < notifications.length - 1 ? '1px solid #F0F0F4' : 'none',
                            background: isUnread ? 'rgba(233,69,96,0.04)' : 'white',
                            display: 'flex', gap: '12px', alignItems: 'flex-start',
                          }}>
                            <div style={{ fontSize: '20px', flexShrink: 0 }}>
                              {isApproved ? '✅' : '❌'}
                            </div>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: isUnread ? 600 : 400, color: '#1A1A2E', marginBottom: '3px' }}>
                                {data.message || 'Notification'}
                              </div>
                              <div style={{ fontSize: '11px', color: '#7A7A8C' }}>
                                {notif.created_at ? new Date(notif.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                              </div>
                            </div>
                            {isUnread && (
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E94560', flexShrink: 0, marginTop: '4px' }} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/organiser/clubs/create')}
              style={{ background: 'white', border: '1.5px solid #E0E0E6', color: '#1A1A2E', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              🏛️ Nouveau club
            </button>
            <button
              onClick={() => navigate('/organiser/events/create')}
              style={{ background: '#E94560', border: 'none', color: 'white', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(233,69,96,0.3)' }}
            >
              ➕ Nouvel événement
            </button>
          </div>
        </div>

        {/* ── Stats cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { icon: '🏛️', label: 'Clubs créés',    value: clubs.length,   color: '#4A4AE8', bg: '#EEF0FF' },
            { icon: '📅', label: 'Événements',      value: events.length,  color: '#E94560', bg: '#FFE8EC' },
            { icon: '👥', label: 'Membres',          value: membres.length, color: '#2ECC71', bg: '#E6FFF2' },
            { icon: '🔔', label: 'En attente',       value: demandes.length, color: demandes.length > 0 ? '#FF9500' : '#7A7A8C', bg: demandes.length > 0 ? '#FFF4E6' : '#F4F4F6' },
          ].map(stat => (
            <div key={stat.label} style={{ ...s.card, padding: '22px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: '26px', fontWeight: 700, color: stat.color, lineHeight: 1 }}>
                  {loading ? '—' : stat.value}
                </div>
                <div style={{ fontSize: '12px', color: '#7A7A8C', marginTop: '3px' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Two-column section ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', alignItems: 'start' }}>

          {/* Upcoming events */}
          <div>
            <div style={s.sectionTitle}>
              <span>Prochains événements</span>
              <span
                onClick={() => navigate('/organiser/events')}
                style={{ fontSize: '12px', color: '#E94560', cursor: 'pointer', fontWeight: 600 }}
              >
                Voir tous →
              </span>
            </div>

            {loading ? (
              <div style={{ ...s.card, padding: '32px', textAlign: 'center', color: '#7A7A8C', fontSize: '13px' }}>Chargement...</div>
            ) : upcomingEvents.length === 0 ? (
              <div style={{ ...s.card, padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📅</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A2E' }}>Aucun événement à venir</div>
                <div style={{ fontSize: '12px', color: '#7A7A8C', marginTop: '4px', marginBottom: '16px' }}>Créez votre premier événement.</div>
                <button
                  onClick={() => navigate('/organiser/events/create')}
                  style={{ background: '#E94560', color: 'white', border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  ➕ Créer un événement
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {upcomingEvents.map(ev => (
                  <div
                    key={ev.id}
                    style={{ ...s.card, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                    onClick={() => navigate(`/organiser/events/${ev.id}/edit`)}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.07)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#FFE8EC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#E94560', textTransform: 'uppercase', lineHeight: 1 }}>
                        {ev.date ? new Date(ev.date).toLocaleDateString('fr-FR', { month: 'short' }) : ''}
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A2E', lineHeight: 1 }}>
                        {ev.date ? new Date(ev.date).getDate() : ''}
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A2E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {CATEGORY_EMOJIS[ev.categorie] || CATEGORY_EMOJIS.default} {ev.titre}
                      </div>
                      <div style={{ fontSize: '12px', color: '#7A7A8C', marginTop: '3px' }}>
                        {ev.heure ? ev.heure.slice(0, 5) : ''}{ev.lieu ? ` · ${ev.lieu}` : ''}
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', background: '#F0F0F8', color: '#4A4AE8', borderRadius: '6px', padding: '3px 8px', fontWeight: 600, flexShrink: 0 }}>
                      {ev.categorie || '—'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Pending adhesions */}
            <div>
              <div style={s.sectionTitle}>
                <span>
                  Demandes en attente
                  {!loading && demandes.length > 0 && (
                    <span style={{ background: 'rgba(233,69,96,0.12)', color: '#E94560', fontSize: '11px', fontWeight: 700, padding: '2px 7px', borderRadius: '20px', marginLeft: '8px' }}>
                      {demandes.length}
                    </span>
                  )}
                </span>
                <span
                  onClick={() => navigate('/organiser/adhesions')}
                  style={{ fontSize: '12px', color: '#E94560', cursor: 'pointer', fontWeight: 600 }}
                >
                  Voir toutes →
                </span>
              </div>

              {loading ? (
                <div style={{ ...s.card, padding: '24px', textAlign: 'center', color: '#7A7A8C', fontSize: '13px' }}>Chargement...</div>
              ) : demandes.length === 0 ? (
                <div style={{ ...s.card, padding: '28px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>✅</div>
                  <div style={{ fontSize: '13px', color: '#7A7A8C' }}>Aucune demande en attente</div>
                </div>
              ) : (
                <div style={{ ...s.card, overflow: 'hidden' }}>
                  {demandes.slice(0, 3).map((d, i) => (
                    <div
                      key={d.id}
                      style={{ padding: '14px 16px', borderBottom: i < Math.min(demandes.length, 3) - 1 ? '1px solid #F0F0F4' : 'none', display: 'flex', alignItems: 'center', gap: '12px' }}
                    >
                      <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #E94560, #C0392B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                        {(d.user?.prenom || d.user?.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A2E' }}>
                          {d.user?.prenom} {d.user?.nom}
                        </div>
                        <div style={{ fontSize: '11px', color: '#7A7A8C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {d.club?.nom || '—'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <button
                          disabled={processing === d.id}
                          onClick={() => handleAccepter(d.id)}
                          style={{ width: '28px', height: '28px', borderRadius: '7px', border: 'none', background: '#2ECC71', color: 'white', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          {processing === d.id ? '…' : '✓'}
                        </button>
                        <button
                          disabled={processing === d.id}
                          onClick={() => handleRefuser(d.id)}
                          style={{ width: '28px', height: '28px', borderRadius: '7px', border: '1.5px solid #E94560', background: 'transparent', color: '#E94560', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  {demandes.length > 3 && (
                    <div
                      onClick={() => navigate('/organiser/adhesions')}
                      style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', color: '#E94560', fontWeight: 600, cursor: 'pointer', borderTop: '1px solid #F0F0F4' }}
                    >
                      +{demandes.length - 3} autres demandes →
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Clubs summary */}
            <div>
              <div style={s.sectionTitle}>
                <span>Mes clubs</span>
                <span
                  onClick={() => navigate('/organiser/clubs')}
                  style={{ fontSize: '12px', color: '#E94560', cursor: 'pointer', fontWeight: 600 }}
                >
                  Gérer →
                </span>
              </div>

              {loading ? (
                <div style={{ ...s.card, padding: '24px', textAlign: 'center', color: '#7A7A8C', fontSize: '13px' }}>Chargement...</div>
              ) : clubs.length === 0 ? (
                <div style={{ ...s.card, padding: '28px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>🏛️</div>
                  <div style={{ fontSize: '13px', color: '#7A7A8C', marginBottom: '12px' }}>Aucun club créé</div>
                  <button
                    onClick={() => navigate('/organiser/clubs/create')}
                    style={{ background: '#E94560', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    ➕ Créer un club
                  </button>
                </div>
              ) : (
                <div style={{ ...s.card, overflow: 'hidden' }}>
                  {clubs.slice(0, 3).map((club, i) => {
                    const statutColor = club.statut === 'actif' ? '#2ECC71' : club.statut === 'en_attente' ? '#FF9500' : '#E94560'
                    return (
                      <div
                        key={club.id}
                        style={{ padding: '13px 16px', borderBottom: i < Math.min(clubs.length, 3) - 1 ? '1px solid #F0F0F4' : 'none', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                        onClick={() => navigate(`/organiser/clubs/${club.id}/edit`)}
                      >
                        <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#F4F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                          {club.emoji || '🏛️'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A2E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{club.nom}</div>
                          <div style={{ fontSize: '11px', color: '#7A7A8C', marginTop: '1px' }}>{club.membres_count ?? 0} membres</div>
                        </div>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statutColor, flexShrink: 0 }} />
                      </div>
                    )
                  })}
                  {clubs.length > 3 && (
                    <div
                      onClick={() => navigate('/organiser/clubs')}
                      style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', color: '#E94560', fontWeight: 600, cursor: 'pointer', borderTop: '1px solid #F0F0F4' }}
                    >
                      +{clubs.length - 3} autres clubs →
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
