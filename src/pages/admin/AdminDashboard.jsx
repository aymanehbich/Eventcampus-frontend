import { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { logout } from '../../api/auth'
import { getUsers, getPendingUsers, activateUser, deactivateUser, rejectUser, activateRole, getPendingClubs, getValidatedClubs, getSuspendedClubs, approveClub, rejectClub, suspendClub, reactivateClub, deleteClub, getPendingEvents, getAllEvents, validateEvent, rejectEvent } from '../../api/admin'
import StatisticsSection from './StatisticsSection'
import RoleRequestsSection from './RoleRequestsSection'
import DashboardLayout, { ADMIN_ITEMS } from '../../components/DashboardLayout'
import AdminIcon from './AdminIcon'
import './AdminDashboard.css'


function AdminDashboard() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const [activeSection, setActiveSection] = useState('statistics')

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    pendingValidations: 0,
    totalClubs: 0,
  })

  const [users, setUsers] = useState([])
  const [pendingUsers, setPendingUsers] = useState([])
  const [pendingClubs, setPendingClubs] = useState([])
  const [validatedClubs, setValidatedClubs] = useState([])
  const [suspendedClubs, setSuspendedClubs] = useState([])
  const [clubsTab, setClubsTab] = useState('pending')
  const [clubMsg, setClubMsg] = useState(null)
  const [pendingEvents, setPendingEvents] = useState([])
  const [allEvents, setAllEvents] = useState([])
  const [eventsTab, setEventsTab] = useState('pending')
  const [eventMsg, setEventMsg] = useState(null)
  // Several lists can load at once (users / clubs / events): count in-flight requests so a slow
  // request that finishes late can't flip `loading` to false while another list is still loading
  // (that briefly showed "Aucun club en attente" although clubs were pending).
  const [inflight, setInflight] = useState(0)
  const loading = inflight > 0
  const setLoading = (on) => setInflight((n) => Math.max(0, n + (on ? 1 : -1)))
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    if (activeSection === 'users') {
      fetchUsers()
    } else if (activeSection === 'clubs') {
      fetchPendingClubs()
      fetchValidatedClubs()
      fetchSuspendedClubs()
    } else if (activeSection === 'events') {
      fetchPendingEvents()
      fetchAllEvents()
    }
  }, [activeSection, searchQuery, filterRole, filterStatus])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = {}
      if (searchQuery) params.search = searchQuery
      if (filterRole) params.role = filterRole
      if (filterStatus) params.role = filterStatus
      const res = await getUsers(params)
      setUsers(Array.isArray(res.data.data) ? res.data.data : res.data.data || [])
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingUsers = async () => {
    setLoading(true)
    try {
      const res = await getPendingUsers()
      setPendingUsers(Array.isArray(res.data.data) ? res.data.data : res.data.data || [])
    } catch (err) {
      console.error('Error fetching pending users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleActivateUser = async (userId) => {
  try {
    await activateUser(userId)
    setPendingUsers(prev => prev.filter(u => u.id !== userId))
    fetchUsers()
  } catch (err) {
    alert("Erreur lors de l'activation")
  }
}

const handleDeactivateUser = async (userId) => {
  try {
    await deactivateUser(userId)
    alert('Utilisateur désactivé avec succès')
    fetchUsers()
    fetchPendingUsers()
  } catch (err) {
    alert("Erreur lors de la désactivation")
  }
}

const handleRejectUser = async (userId) => {
  try {
    await rejectUser(userId)
    setPendingUsers(prev => prev.filter(u => u.id !== userId))
  } catch (err) {
    alert("Erreur lors du refus")
  }
}

  const fetchPendingClubs = async () => {
    setLoading(true)
    try {
      const res = await getPendingClubs()
      setPendingClubs(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error('Error fetching pending clubs:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveClub = async (clubId) => {
    try {
      await approveClub(clubId)
      setClubMsg({ type: 'success', text: 'Club approuvé avec succès.' })
      fetchPendingClubs()
      fetchValidatedClubs()
    } catch {
      setClubMsg({ type: 'error', text: "Erreur lors de l'approbation." })
    }
  }

  const handleRejectClub = async (clubId) => {
    try {
      await rejectClub(clubId)
      setClubMsg({ type: 'error', text: 'Club rejeté.' })
      fetchPendingClubs()
    } catch {
      setClubMsg({ type: 'error', text: 'Erreur lors du refus.' })
    }
  }

  const fetchValidatedClubs = async () => {
    try {
      const res = await getValidatedClubs()
      setValidatedClubs(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error('Error fetching validated clubs:', err)
    }
  }

  const handleSuspendClub = async (clubId) => {
    try {
      await suspendClub(clubId)
      setClubMsg({ type: 'warning', text: 'Club suspendu avec succès.' })
      fetchValidatedClubs()
      fetchSuspendedClubs()
    } catch {
      setClubMsg({ type: 'error', text: 'Erreur lors de la suspension.' })
    }
  }

  const fetchSuspendedClubs = async () => {
    try {
      const res = await getSuspendedClubs()
      setSuspendedClubs(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error('Error fetching suspended clubs:', err)
    }
  }

  const handleReactivateClub = async (clubId) => {
    try {
      await reactivateClub(clubId)
      setClubMsg({ type: 'success', text: 'Club réactivé avec succès.' })
      fetchSuspendedClubs()
      fetchValidatedClubs()
    } catch {
      setClubMsg({ type: 'error', text: 'Erreur lors de la réactivation.' })
    }
  }

  const handleDeleteClub = async (clubId, clubNom) => {
    if (!window.confirm(`Supprimer définitivement le club "${clubNom}" ?`)) return
    try {
      await deleteClub(clubId)
      setClubMsg({ type: 'success', text: 'Club supprimé avec succès.' })
      fetchPendingClubs()
      fetchValidatedClubs()
      fetchSuspendedClubs()
    } catch {
      setClubMsg({ type: 'error', text: 'Erreur lors de la suppression.' })
    }
  }

  const isPendingStatus = (statut) => {
    if (!statut) return false
    const s = statut.toString().toLowerCase().trim()
    return s === 'en attente' || s === 'pending' || s === 'attente'
  }

  const fetchPendingEvents = async () => {
    setLoading(true)
    try {
      const res = await getPendingEvents()
      const data = res.data
      const events = Array.isArray(data) ? data : (data.data || data.events || [])
      setPendingEvents(events)
    } catch (err) {
      console.error('Error fetching pending events:', err)
      setPendingEvents([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAllEvents = async () => {
    try {
      const res = await getAllEvents()
      const data = res.data
      const events = Array.isArray(data) ? data : (data.data || data.events || [])
      setAllEvents(events)
    } catch (err) {
      console.error('Error fetching all events:', err)
    }
  }

  const handleValidateEvent = async (eventId) => {
    try {
      await validateEvent(eventId)
      setEventMsg({ type: 'success', text: 'Événement validé avec succès.' })
      fetchPendingEvents()
      fetchAllEvents()
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors de la validation.'
      setEventMsg({ type: 'error', text: msg })
    }
  }

  const handleRejectEvent = async (eventId) => {
    try {
      await rejectEvent(eventId)
      setEventMsg({ type: 'warning', text: 'Événement rejeté.' })
      fetchPendingEvents()
      fetchAllEvents()
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors du refus.'
      setEventMsg({ type: 'error', text: msg })
    }
  }

  const handleActivateRole = async (userId, role) => {
    try {
      await activateRole(userId, role)
      alert(`Rôle mis à jour avec succès`)
      fetchUsers()
    } catch (err) {
      alert('Erreur lors du changement de rôle')
    }
  }

  if (!token || !user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/admin/login')
    }
  }

  const SECTION_META = {
    statistics: { title: 'Statistiques', subtitle: "Vue d'ensemble de la plateforme" },
    users: { title: 'Utilisateurs', subtitle: 'Gérez les comptes et les rôles des utilisateurs' },
    clubs: { title: 'Validation des clubs', subtitle: 'Approuvez, suspendez ou supprimez les clubs' },
    events: { title: 'Validation des événements', subtitle: 'Validez ou refusez les événements proposés' },
    'role-requests': { title: 'Demandes de rôle organisateur', subtitle: 'Examinez les demandes en attente' },
    activity: { title: 'Activité récente', subtitle: 'Derniers mouvements sur la plateforme' },
  }
  const meta = SECTION_META[activeSection] || SECTION_META.statistics

  const pendingEventList = pendingEvents.length > 0 ? pendingEvents : allEvents.filter(isPendingStatus)

  return (
    <DashboardLayout
      items={ADMIN_ITEMS}
      active={activeSection}
      onSelect={setActiveSection}
      roleLabel="Espace administrateur"
      title={meta.title}
      subtitle={meta.subtitle}
      onLogout={handleLogout}
    >
      <div className="adm">
        {/* Statistics Section */}
        {activeSection === 'statistics' && <StatisticsSection />}

        {/* Role Requests Section */}
        {activeSection === 'role-requests' && <RoleRequestsSection />}

        {/* Users Section */}
        {activeSection === 'users' && (
          <div>
            {/* Filters and Search */}
            <div className="adm__toolbar">
              <div className="ec-field adm__search">
                <label className="ec-label" htmlFor="adm-search">Rechercher</label>
                <input
                  id="adm-search"
                  type="text"
                  className="ec-input"
                  placeholder="Nom ou email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="ec-field adm__filter">
                <label className="ec-label" htmlFor="adm-role">Rôle</label>
                <select
                  id="adm-role"
                  className="ec-select"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="">Tous les rôles</option>
                  <option value="etudiant">Étudiant</option>
                  <option value="organisateur">Organisateur</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="ec-field adm__filter">
                <label className="ec-label" htmlFor="adm-status">Statut</label>
                <select
                  id="adm-status"
                  className="ec-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">Tous les statuts</option>
                  <option value="actif">Actif</option>
                  <option value="banni">Inactif / Banni</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            {loading ? (
              <div className="ec-state" role="status">Chargement...</div>
            ) : users.length === 0 ? (
              <div className="ec-state">Aucun utilisateur trouvé</div>
            ) : (
              <div className="ec-table-wrap">
                <table className="ec-table adm__table">
                  <thead>
                    <tr>
                      {['Utilisateur', 'Email', 'Rôle', 'Statut', 'Actions'].map(h => (
                        <th key={h} scope="col">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(usr => usr.id !== user.id).map((usr) => {
                      const isBanned = usr.role === 'banni'
                      const role = ROLE_BADGES[usr.role] || ROLE_BADGES.admin
                      return (
                        <tr key={usr.id}>
                          <td className="adm__cell-title">{usr.name}</td>
                          <td>{usr.email}</td>
                          <td>
                            <span className={`ec-badge ${role.cls}`}>
                              <AdminIcon name={role.icon} size={12} />
                              {role.label}
                            </span>
                          </td>
                          <td>
                            {isBanned ? (
                              <span className="ec-badge ec-badge--red"><AdminIcon name="x" size={12} />Inactif</span>
                            ) : (
                              <span className="ec-badge ec-badge--green"><AdminIcon name="check" size={12} />Actif</span>
                            )}
                          </td>
                          <td>
                            <div className="adm__actions">
                              {usr.role !== 'admin' && (isBanned ? (
                                <button type="button" className="ec-btn ec-btn--primary ec-btn--sm" onClick={() => handleActivateUser(usr.id)}>
                                  <AdminIcon name="check" />
                                  Activer
                                </button>
                              ) : (
                                <button type="button" className="ec-btn ec-btn--danger ec-btn--sm" onClick={() => handleDeactivateUser(usr.id)}>
                                  <AdminIcon name="x" />
                                  Désactiver
                                </button>
                              ))}
                              {usr.role !== 'etudiant' && (
                                <button
                                  type="button"
                                  className="ec-btn ec-btn--ghost ec-btn--sm"
                                  aria-label={`Passer ${usr.name} au rôle Étudiant`}
                                  onClick={() => handleActivateRole(usr.id, 'etudiant')}
                                >
                                  <AdminIcon name="student" />
                                  Étudiant
                                </button>
                              )}
                              {usr.role !== 'organisateur' && (
                                <button
                                  type="button"
                                  className="ec-btn ec-btn--ghost ec-btn--sm"
                                  aria-label={`Passer ${usr.name} au rôle Organisateur`}
                                  onClick={() => handleActivateRole(usr.id, 'organisateur')}
                                >
                                  <AdminIcon name="club" />
                                  Organisateur
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Clubs Validation Section */}
        {activeSection === 'clubs' && (
          <div>
            <Notice msg={clubMsg} />

            <Tabs
              label="Filtrer les clubs"
              value={clubsTab}
              onChange={setClubsTab}
              tabs={[
                { key: 'pending', icon: 'clock', label: 'En attente', count: pendingClubs.length },
                { key: 'validated', icon: 'check', label: 'Validés', count: validatedClubs.length },
                { key: 'suspended', icon: 'pause', label: 'Suspendus', count: suspendedClubs.length },
              ]}
            />

            {loading ? (
              <div className="ec-state" role="status">Chargement...</div>
            ) : clubsTab === 'pending' ? (
              pendingClubs.length === 0 ? (
                <div className="ec-state">Aucun club en attente de validation</div>
              ) : (
                <ClubsTable
                  clubs={pendingClubs}
                  variant="pending"
                  onApprove={handleApproveClub}
                  onReject={handleRejectClub}
                  onDelete={handleDeleteClub}
                />
              )
            ) : clubsTab === 'validated' ? (
              validatedClubs.length === 0 ? (
                <div className="ec-state">Aucun club validé</div>
              ) : (
                <ClubsTable
                  clubs={validatedClubs}
                  variant="validated"
                  onSuspend={handleSuspendClub}
                  onDelete={handleDeleteClub}
                />
              )
            ) : (
              suspendedClubs.length === 0 ? (
                <div className="ec-state">Aucun club suspendu</div>
              ) : (
                <ClubsTable
                  clubs={suspendedClubs}
                  variant="suspended"
                  onReactivate={handleReactivateClub}
                  onDelete={handleDeleteClub}
                />
              )
            )}
          </div>
        )}

        {/* Events Validation Section */}
        {activeSection === 'events' && (
          <div>
            <Notice msg={eventMsg} />

            <Tabs
              label="Filtrer les événements"
              value={eventsTab}
              onChange={setEventsTab}
              tabs={[
                { key: 'pending', icon: 'clock', label: 'En attente', count: pendingEventList.length },
                { key: 'all', icon: 'list', label: 'Tous', count: allEvents.length },
              ]}
            />

            {loading ? (
              <div className="ec-state" role="status">Chargement...</div>
            ) : eventsTab === 'pending' ? (
              pendingEventList.length === 0 ? (
                <div className="ec-state">Aucun événement en attente de validation</div>
              ) : (
                <EventsTable
                  events={pendingEventList}
                  alwaysPending
                  isPendingStatus={isPendingStatus}
                  onValidate={handleValidateEvent}
                  onReject={handleRejectEvent}
                />
              )
            ) : allEvents.length === 0 ? (
              <div className="ec-state">Aucun événement</div>
            ) : (
              <EventsTable
                events={allEvents}
                isPendingStatus={isPendingStatus}
                onValidate={handleValidateEvent}
                onReject={handleRejectEvent}
              />
            )}
          </div>
        )}

        {/* Activity Section */}
        {activeSection === 'activity' && (
          <ul className="adm__activity">
            {ACTIVITY.map((a) => (
              <li key={a.title} className="ec-card adm__activity-item">
                <span className="adm__activity-ico"><AdminIcon name={a.icon} size={20} /></span>
                <div className="adm__activity-body">
                  <div className="adm__activity-title">{a.title}</div>
                  <div className="adm__activity-sub">{a.sub}</div>
                </div>
                <div className="adm__activity-time">{a.time}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  )
}

const ROLE_BADGES = {
  etudiant: { cls: 'ec-badge--green', icon: 'student', label: 'Étudiant' },
  organisateur: { cls: 'ec-badge--sand', icon: 'club', label: 'Organisateur' },
  banni: { cls: 'ec-badge--red', icon: 'ban', label: 'Banni' },
  admin: { cls: 'ec-badge--gray', icon: 'shield', label: 'Admin' },
}

const EVENT_STATUS = {
  green: { cls: 'ec-badge--green', icon: 'check' },
  amber: { cls: 'ec-badge--amber', icon: 'clock' },
  red: { cls: 'ec-badge--red', icon: 'x' },
}

const EVENT_STATUS_MAP = {
  'validé': { tone: 'green', label: 'Validé' },
  'valide': { tone: 'green', label: 'Validé' },
  'accepté': { tone: 'green', label: 'Accepté' },
  'accepte': { tone: 'green', label: 'Accepté' },
  'en attente': { tone: 'amber', label: 'En attente' },
  'pending': { tone: 'amber', label: 'En attente' },
  'rejeté': { tone: 'red', label: 'Rejeté' },
  'rejete': { tone: 'red', label: 'Rejeté' },
}

const ACTIVITY = [
  { icon: 'edit', title: 'Nouvel événement créé', sub: 'Hackathon 2026 - créé par TechClub', time: 'Il y a 2h' },
  { icon: 'user', title: 'Nouvel utilisateur inscrit', sub: 'Sophie Leclerc - Organisateur', time: 'Il y a 4h' },
  { icon: 'club', title: 'Nouveau club créé', sub: 'PhotoClub - 25 membres', time: 'Il y a 1j' },
]

function Notice({ msg }) {
  if (!msg) return null
  const cls = msg.type === 'success' ? 'ec-alert--success' : msg.type === 'warning' ? 'adm__alert--warning' : 'ec-alert--error'
  const icon = msg.type === 'success' ? 'check' : msg.type === 'warning' ? 'pause' : 'x'
  return (
    <div role="status" className={`ec-alert adm__alert ${cls}`}>
      <AdminIcon name={icon} />
      <span>{msg.text}</span>
    </div>
  )
}

function Tabs({ label, tabs, value, onChange }) {
  return (
    <div className="adm__tabs" role="group" aria-label={label}>
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          className={`ec-chip adm__tab${value === t.key ? ' is-active' : ''}`}
          aria-pressed={value === t.key}
          onClick={() => onChange(t.key)}
        >
          <AdminIcon name={t.icon} size={14} />
          {t.label}{t.count > 0 && ` (${t.count})`}
        </button>
      ))}
    </div>
  )
}

function ClubsTable({ clubs, variant, onApprove, onReject, onSuspend, onReactivate, onDelete }) {
  const status = {
    pending: { cls: 'ec-badge--amber', icon: 'clock', label: 'En attente' },
    validated: { cls: 'ec-badge--green', icon: 'check', label: 'Validé' },
    suspended: { cls: 'ec-badge--amber', icon: 'pause', label: 'Suspendu' },
  }[variant]
  return (
    <div className="ec-table-wrap">
      <table className="ec-table adm__table adm__table--wide">
        <thead>
          <tr>
            {['Club', 'Catégorie', 'Créé par', 'Date', 'Statut', 'Actions'].map(h => (
              <th key={h} scope="col">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {clubs.map((club) => (
            <tr key={club.id}>
              <td>
                <div className="adm__ent">
                  <span className={`adm__ent-ico${variant === 'suspended' ? ' is-dim' : ''}`} aria-hidden="true">
                    {club.emoji || <AdminIcon name="club" size={20} />}
                  </span>
                  <div className="adm__ent-body">
                    <div className="adm__cell-title">{club.nom}</div>
                    <div className="adm__cell-sub adm__clamp">{club.description}</div>
                  </div>
                </div>
              </td>
              <td><span className="ec-badge ec-badge--sand">{club.categorie}</span></td>
              <td>
                {club.createur ? (
                  <>
                    <div>{club.createur.name}</div>
                    <div className="adm__cell-sub">{club.createur.email}</div>
                  </>
                ) : '—'}
              </td>
              <td className="adm__nowrap">{new Date(club.created_at).toLocaleDateString('fr-FR')}</td>
              <td>
                <span className={`ec-badge ${status.cls}`}>
                  <AdminIcon name={status.icon} size={12} />
                  {status.label}
                </span>
              </td>
              <td>
                <div className="adm__actions">
                  {variant === 'pending' && (
                    <>
                      <button type="button" className="ec-btn ec-btn--primary ec-btn--sm" onClick={() => onApprove(club.id)}>
                        <AdminIcon name="check" />
                        Approuver
                      </button>
                      <button type="button" className="ec-btn ec-btn--danger ec-btn--sm" onClick={() => onReject(club.id)}>
                        <AdminIcon name="x" />
                        Rejeter
                      </button>
                    </>
                  )}
                  {variant === 'validated' && (
                    <button type="button" className="ec-btn ec-btn--danger ec-btn--sm" onClick={() => onSuspend(club.id)}>
                      <AdminIcon name="pause" />
                      Suspendre
                    </button>
                  )}
                  {variant === 'suspended' && (
                    <button type="button" className="ec-btn ec-btn--primary ec-btn--sm" onClick={() => onReactivate(club.id)}>
                      <AdminIcon name="play" />
                      Réactiver
                    </button>
                  )}
                  <button
                    type="button"
                    className="ec-btn ec-btn--danger ec-btn--sm"
                    aria-label={`Supprimer le club ${club.nom}`}
                    onClick={() => onDelete(club.id, club.nom)}
                  >
                    <AdminIcon name="trash" />
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EventsTable({ events, alwaysPending, isPendingStatus, onValidate, onReject }) {
  return (
    <div className="ec-table-wrap">
      <table className="ec-table adm__table adm__table--wide">
        <thead>
          <tr>
            {['Événement', 'Club', 'Date', 'Lieu', 'Places', 'Statut', 'Actions'].map(h => (
              <th key={h} scope="col">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {events.map((event) => {
            const isPending = alwaysPending || isPendingStatus(event.statut)
            const sl = event.statut?.toString().toLowerCase().trim()
            const st = alwaysPending
              ? EVENT_STATUS_MAP['en attente']
              : (EVENT_STATUS_MAP[sl] || EVENT_STATUS_MAP['en attente'])
            const tone = EVENT_STATUS[st.tone]
            return (
              <tr key={event.id}>
                <td>
                  <div className="adm__ent">
                    <span className="adm__ent-ico" aria-hidden="true">
                      {event.club?.emoji || <AdminIcon name="calendar" size={20} />}
                    </span>
                    <div className="adm__ent-body">
                      <div className="adm__cell-title">{event.titre}</div>
                      <div className="adm__cell-sub adm__clamp">{event.description}</div>
                      {event.categorie && (
                        <div className="adm__badges"><span className="ec-badge ec-badge--sand">{event.categorie}</span></div>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  {event.club ? <div>{event.club.nom}</div> : '—'}
                  {event.club?.createur && <div className="adm__cell-sub">par {event.club.createur.name}</div>}
                </td>
                <td className="adm__nowrap">
                  <div>{new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  {event.heure && <div className="adm__cell-sub">{event.heure.substring(0, 5)}</div>}
                </td>
                <td>{event.lieu || '—'}</td>
                <td className="adm__nowrap">{event.capacite_max} places</td>
                <td>
                  <span className={`ec-badge ${tone.cls}`}>
                    <AdminIcon name={tone.icon} size={12} />
                    {st.label}
                  </span>
                </td>
                <td>
                  {isPending && (
                    <div className="adm__actions">
                      <button type="button" className="ec-btn ec-btn--primary ec-btn--sm" onClick={() => onValidate(event.id)}>
                        <AdminIcon name="check" />
                        Valider
                      </button>
                      <button type="button" className="ec-btn ec-btn--danger ec-btn--sm" onClick={() => onReject(event.id)}>
                        <AdminIcon name="x" />
                        Refuser
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default AdminDashboard
