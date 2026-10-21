import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrganizerClubs, getPendingAdhesions, getClubUser, accepterAdhesion, refuserAdhesion } from '../../api/clubs'
import { getOrganizerEvents } from '../../api/events'
import api from '../../api/axios'
import DashboardLayout from '../../components/DashboardLayout'
import './OrganizerDashboard.css'

const ICON_PATHS = {
  club: <><path d="M3 21h18M5 21V10l7-6 7 6v11" /><path d="M9 21v-6h6v6" /></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  users: <><circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0 1 14 0" /><path d="M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3" /></>,
  bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="m5 12 5 5 9-10" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  checkCircle: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
  xCircle: <><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6M15 9l-6 6" /></>,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
}

function Icon({ name, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICON_PATHS[name]}
    </svg>
  )
}

export default function OrganizerDashboard() {
  const navigate = useNavigate()


  const [notifications] = useState([])
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

  const upcomingEvents = events
    .filter(e => e.date >= today.toISOString().slice(0, 10))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4)

  const stats = [
    { icon: 'club', label: 'Clubs créés', value: clubs.length, tone: 'green' },
    { icon: 'calendar', label: 'Événements', value: events.length, tone: 'sand' },
    { icon: 'users', label: 'Membres', value: membres.length, tone: 'green' },
    { icon: 'bell', label: 'En attente', value: demandes.length, tone: demandes.length > 0 ? 'terra' : 'sand' },
  ]

  const statutBadge = (statut) => {
    if (statut === 'actif') return { cls: 'ec-badge--green', label: 'Actif' }
    if (statut === 'en_attente') return { cls: 'ec-badge--amber', label: 'En attente' }
    return { cls: 'ec-badge--red', label: statut || 'Inactif' }
  }

  const notifBell = (
    <div className="od__bell-wrap">
      <button
        type="button"
        className="od__bell"
        onClick={() => setShowNotifs(prev => !prev)}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} non lues` : 'Notifications'}
        aria-expanded={showNotifs}
      >
        <Icon name="bell" size={20} />
        {unreadCount > 0 && <span className="od__bell-count" aria-hidden="true">{unreadCount}</span>}
      </button>

      {showNotifs && (
        <div className="od__notifs">
          <div className="od__notifs-head">Notifications</div>
          {notifications.length === 0 ? (
            <div className="od__notifs-empty">Aucune notification</div>
          ) : (
            <div className="od__notifs-list">
              {notifications.map((notif) => {
                const data = notif.data || {}
                const isApproved = data.status === 'approved'
                const isUnread = !notif.read_at
                return (
                  <div key={notif.id} className={`od__notif${isUnread ? ' is-unread' : ''}`}>
                    <span className={`od__notif-icon ${isApproved ? 'is-ok' : 'is-ko'}`}>
                      <Icon name={isApproved ? 'checkCircle' : 'xCircle'} size={20} />
                    </span>
                    <div className="od__notif-body">
                      <div className="od__notif-msg">{data.message || 'Notification'}</div>
                      <div className="od__notif-date">
                        {notif.created_at ? new Date(notif.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </div>
                    {isUnread && <span className="od__notif-dot" aria-label="Non lue" />}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )

  const actions = (
    <>
      {notifBell}
      <button type="button" className="ec-btn ec-btn--outline" onClick={() => navigate('/organiser/clubs/create')}>
        <Icon name="club" size={16} /> Nouveau club
      </button>
      <button type="button" className="ec-btn ec-btn--accent" onClick={() => navigate('/organiser/events/create')}>
        <Icon name="plus" size={16} /> Nouvel événement
      </button>
    </>
  )

  return (
    <DashboardLayout
      active="dashboard"
      title={`Bonjour, ${prenom}`}
      subtitle={<span className="od__date">{dateLabel}</span>}
      actions={actions}
    >
      <div className="od">
        {/* ── Stats ── */}
        <div className="od__stats">
          {stats.map(stat => (
            <div key={stat.label} className="ec-card od__stat">
              <span className={`od__stat-icon od__stat-icon--${stat.tone}`}>
                <Icon name={stat.icon} size={22} />
              </span>
              <div>
                <div className="od__stat-value">{loading ? '—' : stat.value}</div>
                <div className="od__stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="od__grid">
          {/* Upcoming events */}
          <section aria-labelledby="od-events">
            <div className="od__section-head">
              <h2 id="od-events" className="od__section-title">Prochains événements</h2>
              <button type="button" className="od__link" onClick={() => navigate('/organiser/events')}>
                Voir tous <Icon name="arrow" size={14} />
              </button>
            </div>

            {loading ? (
              <div className="od__skeletons" aria-busy="true">
                <div className="ec-skeleton od__sk" /><div className="ec-skeleton od__sk" /><div className="ec-skeleton od__sk" />
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="ec-card ec-card--sand od__empty">
                <span className="od__empty-icon"><Icon name="calendar" size={26} /></span>
                <div className="od__empty-title">Aucun événement à venir</div>
                <div className="od__empty-text">Créez votre premier événement.</div>
                <button type="button" className="ec-btn ec-btn--accent" onClick={() => navigate('/organiser/events/create')}>
                  <Icon name="plus" size={16} /> Créer un événement
                </button>
              </div>
            ) : (
              <div className="od__list">
                {upcomingEvents.map(ev => (
                  <button
                    type="button"
                    key={ev.id}
                    className="od__event"
                    onClick={() => navigate(`/organiser/events/${ev.id}/edit`)}
                  >
                    <span className="od__date-tile" aria-hidden="true">
                      <span className="od__date-month">
                        {ev.date ? new Date(ev.date).toLocaleDateString('fr-FR', { month: 'short' }) : ''}
                      </span>
                      <span className="od__date-day">{ev.date ? new Date(ev.date).getDate() : ''}</span>
                    </span>
                    <span className="od__event-body">
                      <span className="od__event-title">{ev.titre}</span>
                      <span className="od__event-meta">
                        {ev.heure ? ev.heure.slice(0, 5) : ''}{ev.lieu ? ` · ${ev.lieu}` : ''}
                      </span>
                    </span>
                    <span className="ec-badge ec-badge--green od__event-cat">{ev.categorie || '—'}</span>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Right column */}
          <div className="od__side">
            {/* Pending adhesions */}
            <section aria-labelledby="od-pending">
              <div className="od__section-head">
                <h2 id="od-pending" className="od__section-title">
                  Demandes en attente
                  {!loading && demandes.length > 0 && <span className="ec-badge ec-badge--terra od__count">{demandes.length}</span>}
                </h2>
                <button type="button" className="od__link" onClick={() => navigate('/organiser/adhesions')}>
                  Voir toutes <Icon name="arrow" size={14} />
                </button>
              </div>

              {loading ? (
                <div className="ec-skeleton od__sk" aria-busy="true" />
              ) : demandes.length === 0 ? (
                <div className="ec-card od__empty od__empty--sm">
                  <span className="od__empty-icon"><Icon name="checkCircle" size={22} /></span>
                  <div className="od__empty-text">Aucune demande en attente</div>
                </div>
              ) : (
                <div className="ec-card od__panel">
                  {demandes.slice(0, 3).map((d) => (
                    <div key={d.id} className="od__row">
                      <span className="od__avatar" aria-hidden="true">
                        {(d.user?.prenom || d.user?.name || '?').charAt(0).toUpperCase()}
                      </span>
                      <div className="od__row-body">
                        <div className="od__row-title">{d.user?.prenom} {d.user?.nom}</div>
                        <div className="od__row-sub">{d.club?.nom || '—'}</div>
                      </div>
                      <div className="od__row-actions">
                        <button
                          type="button"
                          className="od__icon-btn od__icon-btn--ok"
                          disabled={processing === d.id}
                          onClick={() => handleAccepter(d.id)}
                          aria-label={`Accepter la demande de ${d.user?.prenom || ''} ${d.user?.nom || ''}`.trim()}
                        >
                          {processing === d.id ? '…' : <Icon name="check" size={18} />}
                        </button>
                        <button
                          type="button"
                          className="od__icon-btn od__icon-btn--ko"
                          disabled={processing === d.id}
                          onClick={() => handleRefuser(d.id)}
                          aria-label={`Refuser la demande de ${d.user?.prenom || ''} ${d.user?.nom || ''}`.trim()}
                        >
                          <Icon name="x" size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {demandes.length > 3 && (
                    <button type="button" className="od__more" onClick={() => navigate('/organiser/adhesions')}>
                      +{demandes.length - 3} autres demandes <Icon name="arrow" size={14} />
                    </button>
                  )}
                </div>
              )}
            </section>

            {/* Clubs summary */}
            <section aria-labelledby="od-clubs">
              <div className="od__section-head">
                <h2 id="od-clubs" className="od__section-title">Mes clubs</h2>
                <button type="button" className="od__link" onClick={() => navigate('/organiser/clubs')}>
                  Gérer <Icon name="arrow" size={14} />
                </button>
              </div>

              {loading ? (
                <div className="ec-skeleton od__sk" aria-busy="true" />
              ) : clubs.length === 0 ? (
                <div className="ec-card od__empty od__empty--sm">
                  <span className="od__empty-icon"><Icon name="club" size={22} /></span>
                  <div className="od__empty-text">Aucun club créé</div>
                  <button type="button" className="ec-btn ec-btn--accent ec-btn--sm" onClick={() => navigate('/organiser/clubs/create')}>
                    <Icon name="plus" size={14} /> Créer un club
                  </button>
                </div>
              ) : (
                <div className="ec-card od__panel">
                  {clubs.slice(0, 3).map((club) => {
                    const badge = statutBadge(club.statut)
                    return (
                      <button
                        type="button"
                        key={club.id}
                        className="od__row od__row--btn"
                        onClick={() => navigate(`/organiser/clubs/${club.id}/edit`)}
                      >
                        <span className="od__club-icon" aria-hidden="true">
                          {club.emoji || <Icon name="club" size={18} />}
                        </span>
                        <span className="od__row-body">
                          <span className="od__row-title">{club.nom}</span>
                          <span className="od__row-sub">{club.membres_count ?? 0} membres</span>
                        </span>
                        <span className={`ec-badge ${badge.cls}`}>{badge.label}</span>
                      </button>
                    )
                  })}
                  {clubs.length > 3 && (
                    <button type="button" className="od__more" onClick={() => navigate('/organiser/clubs')}>
                      +{clubs.length - 3} autres clubs <Icon name="arrow" size={14} />
                    </button>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
