import { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { logout } from '../../api/auth'
import { getUsers, getPendingUsers, activateUser, deactivateUser, activateRole, getPendingClubs, getValidatedClubs, getSuspendedClubs, approveClub, rejectClub, suspendClub, reactivateClub, deleteClub, getPendingEvents, getAllEvents, validateEvent, rejectEvent } from '../../api/admin'
import StatisticsSection from './StatisticsSection'


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
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    if (activeSection === 'users') {
      fetchUsers()
    } else if (activeSection === 'validation') {
      fetchPendingUsers()
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
      alert('Utilisateur activé avec succès')
      fetchUsers()
    } catch (err) {
      alert('Erreur lors de l\'activation')
    }
  }

  const handleDeactivateUser = async (userId) => {
    try {
      await deactivateUser(userId)
      alert('Utilisateur désactivé avec succès')
      fetchUsers()
    } catch (err) {
      alert('Erreur lors de la désactivation')
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

  const s = {
    layout: { display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" },
    sidebar: { background: '#1A1A2E', padding: '24px 0' },
    logo: { fontFamily: "'Fraunces', serif", fontSize: '18px', color: 'white', padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' },
    navItem: { padding: '11px 20px', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.55)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' },
    navActive: { padding: '11px 20px', fontSize: '13px', fontWeight: 500, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(233,69,96,0.15)', borderRight: '3px solid #E94560' },
    main: { padding: '32px', background: '#F4F4F6', minHeight: '100vh' },
  }

  return (
    <div style={s.layout}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Fraunces:wght@700;900&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.logo}>Event<span style={{ color: '#E94560' }}>Campus</span></div>
        <div
          style={activeSection === 'statistics' ? s.navActive : s.navItem}
          onClick={() => setActiveSection('statistics')}
        >
          📊 Statistiques
        </div>
        <div
          style={activeSection === 'users' ? s.navActive : s.navItem}
          onClick={() => setActiveSection('users')}
        >
          👥 Utilisateurs
        </div>
        <div
          style={activeSection === 'validation' ? s.navActive : s.navItem}
          onClick={() => setActiveSection('validation')}
        >
          ✅ Validations
        </div>
        <div
          style={activeSection === 'clubs' ? s.navActive : s.navItem}
          onClick={() => setActiveSection('clubs')}
        >
          🏛️ Clubs
        </div>
        <div
          style={activeSection === 'events' ? s.navActive : s.navItem}
          onClick={() => setActiveSection('events')}
        >
          📅 Événements
        </div>
        <div
          style={activeSection === 'activity' ? s.navActive : s.navItem}
          onClick={() => setActiveSection('activity')}
        >
          📋 Activité
        </div>
      </div>

      {/* Main */}
      <div style={s.main}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '22px', color: '#1A1A2E' }}>
              {activeSection === 'statistics' && '📊 Statistiques'}
              {activeSection === 'users' && '👥 Utilisateurs'}
              {activeSection === 'validation' && '✅ Validation des utilisateurs'}
              {activeSection === 'clubs' && '🏛️ Validation des clubs'}
              {activeSection === 'events' && '📅 Validation des événements'}
              {activeSection === 'activity' && '📋 Activité récente'}
            </h2>
          </div>
          <button
            onClick={handleLogout}
            style={{ background: '#E94560', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s' }}
            onMouseEnter={(e) => e.target.style.opacity = '0.85'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            Déconnexion
          </button>
        </div>

        {/* Statistics Section */}
        {activeSection === 'statistics' && <StatisticsSection />}


        {/* Users Section */}
        {activeSection === 'users' && (
          <div>
            {/* Filters and Search */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#7A7A8C', marginBottom: '6px', textTransform: 'uppercase' }}>Rechercher</label>
                <input
                  type="text"
                  placeholder="Nom ou email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', border: '1.5px solid #E0E0E6', borderRadius: '10px', padding: '10px 12px', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", outline: 'none' }}
                  onFocus={(e) => e.target.style.borderColor = '#E94560'}
                  onBlur={(e) => e.target.style.borderColor = '#E0E0E6'}
                />
              </div>
              <div style={{ minWidth: '150px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#7A7A8C', marginBottom: '6px', textTransform: 'uppercase' }}>Rôle</label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  style={{ width: '100%', border: '1.5px solid #E0E0E6', borderRadius: '10px', padding: '10px 12px', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", outline: 'none', cursor: 'pointer' }}
                  onFocus={(e) => e.target.style.borderColor = '#E94560'}
                  onBlur={(e) => e.target.style.borderColor = '#E0E0E6'}
                >
                  <option value="">Tous les rôles</option>
                  <option value="etudiant">Étudiant</option>
                  <option value="organisateur">Organisateur</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ minWidth: '150px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#7A7A8C', marginBottom: '6px', textTransform: 'uppercase' }}>Statut</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{ width: '100%', border: '1.5px solid #E0E0E6', borderRadius: '10px', padding: '10px 12px', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", outline: 'none', cursor: 'pointer' }}
                  onFocus={(e) => e.target.style.borderColor = '#E94560'}
                  onBlur={(e) => e.target.style.borderColor = '#E0E0E6'}
                >
                  <option value="">Tous les statuts</option>
                  <option value="actif">Actif</option>
                  <option value="banni">Inactif / Banni</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#7A7A8C', fontSize: '14px' }}>Chargement...</div>
            ) : users.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#7A7A8C', fontSize: '14px' }}>Aucun utilisateur trouvé</div>
            ) : (
              <div style={{ background: 'white', borderRadius: '12px', border: '1.5px solid #E0E0E6', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr>
                      {['Utilisateur', 'Email', 'Rôle', 'Statut', 'Actions'].map(h => (
                        <th key={h} style={{ background: '#F4F4F6', padding: '10px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#7A7A8C', fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(usr => usr.id !== user.id).map((usr, i, arr) => {
                      const isLast = i === arr.length - 1
                      const tdStyle = { padding: '13px 16px', borderBottom: isLast ? 'none' : '1px solid #E0E0E6', color: '#1A1A2E', verticalAlign: 'middle' }
                      const isBanned = usr.role === 'banni'
                      const roleColor = usr.role === 'etudiant' ? { bg: '#EEF0FF', color: '#4A4AE8' } : usr.role === 'organisateur' ? { bg: '#FFF4E6', color: '#FF9500' } : usr.role === 'banni' ? { bg: '#FFE6E6', color: '#E94560' } : { bg: '#E6FFE6', color: '#4CAF50' }
                      const statusColor = isBanned ? { bg: '#FFE6E6', color: '#E94560' } : { bg: '#E6FFE6', color: '#4CAF50' }
                      return (
                        <tr key={usr.id}>
                          <td style={tdStyle}>
                            <div style={{ fontWeight: 600 }}>{usr.name}</div>
                          </td>
                          <td style={tdStyle}>{usr.email}</td>
                          <td style={tdStyle}>
                            <span style={{ background: roleColor.bg, color: roleColor.color, padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, display: 'inline-block' }}>
                              {usr.role === 'etudiant' ? '🎓 Étudiant' : usr.role === 'organisateur' ? '🏛️ Organisateur' : usr.role === 'banni' ? '🚫 Banni' : '⚙️ Admin'}
                            </span>
                          </td>
                          <td style={tdStyle}>
                            <span style={{ background: statusColor.bg, color: statusColor.color, padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, display: 'inline-block' }}>
                              {isBanned ? '❌ Inactif' : '✅ Actif'}
                            </span>
                          </td>
                          <td style={tdStyle}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <div>
                                {usr.role !== 'admin' && (isBanned ? (
                                  <button
                                    onClick={() => handleActivateUser(usr.id)}
                                    style={{ background: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s' }}
                                    onMouseEnter={(e) => e.target.style.opacity = '0.85'}
                                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                                  >
                                    ✓ Activer
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleDeactivateUser(usr.id)}
                                    style={{ background: '#f44336', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s' }}
                                    onMouseEnter={(e) => e.target.style.opacity = '0.85'}
                                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                                  >
                                    ✕ Désactiver
                                  </button>
                                ))}
                              </div>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                {usr.role !== 'etudiant' && (
                                  <button
                                    onClick={() => handleActivateRole(usr.id, 'etudiant')}
                                    style={{ background: '#4A4AE8', color: 'white', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s' }}
                                    onMouseEnter={(e) => e.target.style.opacity = '0.85'}
                                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                                  >
                                    🎓 Étudiant
                                  </button>
                                )}
                                {usr.role !== 'organisateur' && (
                                  <button
                                    onClick={() => handleActivateRole(usr.id, 'organisateur')}
                                    style={{ background: '#FF9500', color: 'white', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s' }}
                                    onMouseEnter={(e) => e.target.style.opacity = '0.85'}
                                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                                  >
                                    🏛️ Organisateur
                                  </button>
                                )}
                              </div>
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

        {/* User Validation Section */}
        {activeSection === 'validation' && (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#7A7A8C', fontSize: '14px' }}>Chargement...</div>
            ) : pendingUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#7A7A8C', fontSize: '14px' }}>Aucun utilisateur en attente de validation</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pendingUsers.map((pendingUser) => {
                  const isLast = pendingUsers[pendingUsers.length - 1].id === pendingUser.id
                  return (
                    <div key={pendingUser.id} style={{ background: 'white', border: '1.5px solid #E0E0E6', borderRadius: '10px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#1A1A2E', fontSize: '14px', marginBottom: '4px' }}>{pendingUser.name}</div>
                        <div style={{ color: '#555', fontSize: '12px', marginBottom: '8px' }}>{pendingUser.email}</div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <span style={{ background: 'rgba(233,69,96,0.1)', color: '#E94560', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>{pendingUser.role === 'etudiant' ? '🎓 Étudiant' : pendingUser.role === 'organisateur' ? '🏛️ Organisateur' : '⚙️ Admin'}</span>
                          <span style={{ fontSize: '11px', color: '#7A7A8C' }}>{pendingUser.date}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => alert(`Utilisateur ${pendingUser.id} validé`)}
                          style={{ background: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s' }}
                          onMouseEnter={(e) => e.target.style.opacity = '0.85'}
                          onMouseLeave={(e) => e.target.style.opacity = '1'}
                        >
                          ✓ Accepter
                        </button>
                        <button
                          onClick={() => alert(`Utilisateur ${pendingUser.id} rejeté`)}
                          style={{ background: '#f44336', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s' }}
                          onMouseEnter={(e) => e.target.style.opacity = '0.85'}
                          onMouseLeave={(e) => e.target.style.opacity = '1'}
                        >
                          ✕ Refuser
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Clubs Validation Section */}
        {activeSection === 'clubs' && (
          <div>
            {clubMsg && (
              <div style={{
                marginBottom: '16px',
                padding: '10px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 500,
                background: clubMsg.type === 'success' ? 'rgba(46,204,113,0.12)' : clubMsg.type === 'warning' ? 'rgba(255,149,0,0.12)' : 'rgba(233,69,96,0.10)',
                color: clubMsg.type === 'success' ? '#1a7a47' : clubMsg.type === 'warning' ? '#b36a00' : '#E94560',
              }}>
                {clubMsg.text}
              </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'white', border: '1.5px solid #E0E0E6', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
              <button
                onClick={() => setClubsTab('pending')}
                style={{ background: clubsTab === 'pending' ? '#1A1A2E' : 'transparent', color: clubsTab === 'pending' ? 'white' : '#7A7A8C', border: 'none', borderRadius: '7px', padding: '8px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
              >
                ⏳ En attente {pendingClubs.length > 0 && `(${pendingClubs.length})`}
              </button>
              <button
                onClick={() => setClubsTab('validated')}
                style={{ background: clubsTab === 'validated' ? '#1A1A2E' : 'transparent', color: clubsTab === 'validated' ? 'white' : '#7A7A8C', border: 'none', borderRadius: '7px', padding: '8px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
              >
                ✅ Validés {validatedClubs.length > 0 && `(${validatedClubs.length})`}
              </button>
              <button
                onClick={() => setClubsTab('suspended')}
                style={{ background: clubsTab === 'suspended' ? '#1A1A2E' : 'transparent', color: clubsTab === 'suspended' ? 'white' : '#7A7A8C', border: 'none', borderRadius: '7px', padding: '8px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
              >
                ⏸ Suspendus {suspendedClubs.length > 0 && `(${suspendedClubs.length})`}
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#7A7A8C', fontSize: '14px' }}>Chargement...</div>
            ) : clubsTab === 'pending' ? (
              pendingClubs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#7A7A8C', fontSize: '14px' }}>Aucun club en attente de validation</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pendingClubs.map((club) => (
                    <div key={club.id} style={{ background: 'white', border: '1.5px solid #E0E0E6', borderRadius: '10px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '32px', flexShrink: 0 }}>{club.emoji || '🏛️'}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, color: '#1A1A2E', fontSize: '15px', marginBottom: '2px' }}>{club.nom}</div>
                          <div style={{ fontSize: '12px', color: '#7A7A8C', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{club.description}</div>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ background: '#EEF0FF', color: '#4A4AE8', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>{club.categorie}</span>
                            {club.createur && (
                              <span style={{ fontSize: '11px', color: '#7A7A8C' }}>par {club.createur.name} ({club.createur.email})</span>
                            )}
                            <span style={{ fontSize: '11px', color: '#7A7A8C' }}>{new Date(club.created_at).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                        <button
                          onClick={() => handleApproveClub(club.id)}
                          style={{ background: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s' }}
                          onMouseEnter={(e) => e.target.style.opacity = '0.85'}
                          onMouseLeave={(e) => e.target.style.opacity = '1'}
                        >
                          ✓ Approuver
                        </button>
                        <button
                          onClick={() => handleRejectClub(club.id)}
                          style={{ background: '#f44336', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s' }}
                          onMouseEnter={(e) => e.target.style.opacity = '0.85'}
                          onMouseLeave={(e) => e.target.style.opacity = '1'}
                        >
                          ✕ Rejeter
                        </button>
                        <button
                          onClick={() => handleDeleteClub(club.id, club.nom)}
                          style={{ background: '#1A1A2E', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s' }}
                          onMouseEnter={(e) => e.target.style.opacity = '0.75'}
                          onMouseLeave={(e) => e.target.style.opacity = '1'}
                        >
                          🗑 Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : clubsTab === 'validated' ? (
              validatedClubs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#7A7A8C', fontSize: '14px' }}>Aucun club validé</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {validatedClubs.map((club) => (
                    <div key={club.id} style={{ background: 'white', border: '1.5px solid #E0E0E6', borderRadius: '10px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '32px', flexShrink: 0 }}>{club.emoji || '🏛️'}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, color: '#1A1A2E', fontSize: '15px', marginBottom: '2px' }}>{club.nom}</div>
                          <div style={{ fontSize: '12px', color: '#7A7A8C', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{club.description}</div>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ background: '#EEF0FF', color: '#4A4AE8', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>{club.categorie}</span>
                            <span style={{ background: 'rgba(46,204,113,0.12)', color: '#1a7a47', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>✅ Validé</span>
                            {club.createur && (
                              <span style={{ fontSize: '11px', color: '#7A7A8C' }}>par {club.createur.name} ({club.createur.email})</span>
                            )}
                            <span style={{ fontSize: '11px', color: '#7A7A8C' }}>{new Date(club.created_at).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                        <button
                          onClick={() => handleSuspendClub(club.id)}
                          style={{ background: '#FF9500', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s' }}
                          onMouseEnter={(e) => e.target.style.opacity = '0.85'}
                          onMouseLeave={(e) => e.target.style.opacity = '1'}
                        >
                          ⏸ Suspendre
                        </button>
                        <button
                          onClick={() => handleDeleteClub(club.id, club.nom)}
                          style={{ background: '#1A1A2E', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s' }}
                          onMouseEnter={(e) => e.target.style.opacity = '0.75'}
                          onMouseLeave={(e) => e.target.style.opacity = '1'}
                        >
                          🗑 Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              suspendedClubs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#7A7A8C', fontSize: '14px' }}>Aucun club suspendu</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {suspendedClubs.map((club) => (
                    <div key={club.id} style={{ background: 'white', border: '1.5px solid #FFE0B2', borderRadius: '10px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '32px', flexShrink: 0, opacity: 0.6 }}>{club.emoji || '🏛️'}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, color: '#1A1A2E', fontSize: '15px', marginBottom: '2px' }}>{club.nom}</div>
                          <div style={{ fontSize: '12px', color: '#7A7A8C', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{club.description}</div>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ background: '#EEF0FF', color: '#4A4AE8', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>{club.categorie}</span>
                            <span style={{ background: 'rgba(255,149,0,0.12)', color: '#b36a00', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>⏸ Suspendu</span>
                            {club.createur && (
                              <span style={{ fontSize: '11px', color: '#7A7A8C' }}>par {club.createur.name} ({club.createur.email})</span>
                            )}
                            <span style={{ fontSize: '11px', color: '#7A7A8C' }}>{new Date(club.created_at).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                        <button
                          onClick={() => handleReactivateClub(club.id)}
                          style={{ background: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s' }}
                          onMouseEnter={(e) => e.target.style.opacity = '0.85'}
                          onMouseLeave={(e) => e.target.style.opacity = '1'}
                        >
                          ▶ Réactiver
                        </button>
                        <button
                          onClick={() => handleDeleteClub(club.id, club.nom)}
                          style={{ background: '#1A1A2E', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s' }}
                          onMouseEnter={(e) => e.target.style.opacity = '0.75'}
                          onMouseLeave={(e) => e.target.style.opacity = '1'}
                        >
                          🗑 Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}

        {/* Events Validation Section */}
        {activeSection === 'events' && (
          <div>
            {eventMsg && (
              <div style={{
                marginBottom: '16px',
                padding: '10px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 500,
                background: eventMsg.type === 'success' ? 'rgba(46,204,113,0.12)' : eventMsg.type === 'warning' ? 'rgba(255,149,0,0.12)' : 'rgba(233,69,96,0.10)',
                color: eventMsg.type === 'success' ? '#1a7a47' : eventMsg.type === 'warning' ? '#b36a00' : '#E94560',
              }}>
                {eventMsg.text}
              </div>
            )}

            <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'white', border: '1.5px solid #E0E0E6', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
              <button
                onClick={() => setEventsTab('pending')}
                style={{ background: eventsTab === 'pending' ? '#1A1A2E' : 'transparent', color: eventsTab === 'pending' ? 'white' : '#7A7A8C', border: 'none', borderRadius: '7px', padding: '8px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
              >
                ⏳ En attente {(pendingEvents.length > 0 ? pendingEvents : allEvents.filter(isPendingStatus)).length > 0 && `(${(pendingEvents.length > 0 ? pendingEvents : allEvents.filter(isPendingStatus)).length})`}
              </button>
              <button
                onClick={() => setEventsTab('all')}
                style={{ background: eventsTab === 'all' ? '#1A1A2E' : 'transparent', color: eventsTab === 'all' ? 'white' : '#7A7A8C', border: 'none', borderRadius: '7px', padding: '8px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
              >
                📋 Tous {allEvents.length > 0 && `(${allEvents.length})`}
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#7A7A8C', fontSize: '14px' }}>Chargement...</div>
            ) : eventsTab === 'pending' ? (
              (() => {
                const pendingList = pendingEvents.length > 0 ? pendingEvents : allEvents.filter(isPendingStatus)
                if (pendingList.length === 0) {
                  return <div style={{ textAlign: 'center', padding: '60px', color: '#7A7A8C', fontSize: '14px' }}>Aucun événement en attente de validation</div>
                }
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {pendingList.map((event) => (
                      <div key={event.id} style={{ background: 'white', border: '1.5px solid #E0E0E6', borderRadius: '10px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '32px', flexShrink: 0 }}>{event.club?.emoji || '📅'}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, color: '#1A1A2E', fontSize: '15px', marginBottom: '2px' }}>{event.titre}</div>
                            <div style={{ fontSize: '12px', color: '#7A7A8C', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.description}</div>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <span style={{ background: '#EEF0FF', color: '#4A4AE8', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>{event.categorie}</span>
                              <span style={{ background: 'rgba(255,149,0,0.12)', color: '#b36a00', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>⏳ En attente</span>
                              <span style={{ fontSize: '11px', color: '#7A7A8C' }}>📅 {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}{event.heure ? ` · ${event.heure.substring(0, 5)}` : ''}</span>
                              <span style={{ fontSize: '11px', color: '#7A7A8C' }}>📍 {event.lieu || '—'}</span>
                              <span style={{ fontSize: '11px', color: '#7A7A8C' }}>👥 {event.capacite_max} places</span>
                              {event.club && <span style={{ fontSize: '11px', color: '#7A7A8C' }}>🏛️ {event.club.nom}</span>}
                              {event.club?.createur && <span style={{ fontSize: '11px', color: '#7A7A8C' }}>par {event.club.createur.name}</span>}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                          <button onClick={() => handleValidateEvent(event.id)} style={{ background: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>✓ Valider</button>
                          <button onClick={() => handleRejectEvent(event.id)} style={{ background: '#f44336', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>✕ Refuser</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()
            ) : allEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#7A7A8C', fontSize: '14px' }}>Aucun événement</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {allEvents.map((event) => {
                  const isPending = isPendingStatus(event.statut)
                  const sl = event.statut?.toString().toLowerCase().trim()
                  const sc = {
                    'validé': { bg: 'rgba(46,204,113,0.12)', color: '#1a7a47', label: '✅ Validé' },
                    'valide': { bg: 'rgba(46,204,113,0.12)', color: '#1a7a47', label: '✅ Validé' },
                    'accepté': { bg: 'rgba(46,204,113,0.12)', color: '#1a7a47', label: '✅ Accepté' },
                    'accepte': { bg: 'rgba(46,204,113,0.12)', color: '#1a7a47', label: '✅ Accepté' },
                    'en attente': { bg: 'rgba(255,149,0,0.12)', color: '#b36a00', label: '⏳ En attente' },
                    'pending': { bg: 'rgba(255,149,0,0.12)', color: '#b36a00', label: '⏳ En attente' },
                    'rejeté': { bg: 'rgba(233,69,96,0.10)', color: '#E94560', label: '❌ Rejeté' },
                    'rejete': { bg: 'rgba(233,69,96,0.10)', color: '#E94560', label: '❌ Rejeté' },
                  }[sl] || { bg: 'rgba(255,149,0,0.12)', color: '#b36a00', label: '⏳ En attente' }
                  return (
                    <div key={event.id} style={{ background: 'white', border: '1.5px solid #E0E0E6', borderRadius: '10px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '32px', flexShrink: 0 }}>{event.club?.emoji || '📅'}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, color: '#1A1A2E', fontSize: '15px', marginBottom: '2px' }}>{event.titre}</div>
                          <div style={{ fontSize: '12px', color: '#7A7A8C', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.description}</div>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ background: '#EEF0FF', color: '#4A4AE8', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>{event.categorie}</span>
                            <span style={{ background: sc.bg, color: sc.color, padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>{sc.label}</span>
                            <span style={{ fontSize: '11px', color: '#7A7A8C' }}>📅 {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}{event.heure ? ` · ${event.heure.substring(0, 5)}` : ''}</span>
                            <span style={{ fontSize: '11px', color: '#7A7A8C' }}>📍 {event.lieu || '—'}</span>
                            <span style={{ fontSize: '11px', color: '#7A7A8C' }}>👥 {event.capacite_max} places</span>
                            {event.club && <span style={{ fontSize: '11px', color: '#7A7A8C' }}>🏛️ {event.club.nom}</span>}
                            {event.club?.createur && <span style={{ fontSize: '11px', color: '#7A7A8C' }}>par {event.club.createur.name}</span>}
                          </div>
                        </div>
                      </div>
                      {isPending && (
                        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                          <button onClick={() => handleValidateEvent(event.id)} style={{ background: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>✓ Valider</button>
                          <button onClick={() => handleRejectEvent(event.id)} style={{ background: '#f44336', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>✕ Refuser</button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Activity Section */}
        {activeSection === 'activity' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'white', border: '1.5px solid #E0E0E6', borderRadius: '10px', padding: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '24px', flexShrink: 0 }}>📝</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#1A1A2E', fontSize: '14px', marginBottom: '4px' }}>Nouvel événement créé</div>
                <div style={{ color: '#7A7A8C', fontSize: '12px' }}>Hackathon 2026 - créé par TechClub</div>
              </div>
              <div style={{ fontSize: '11px', color: '#7A7A8C', flexShrink: 0 }}>Il y a 2h</div>
            </div>
            <div style={{ background: 'white', border: '1.5px solid #E0E0E6', borderRadius: '10px', padding: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '24px', flexShrink: 0 }}>👤</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#1A1A2E', fontSize: '14px', marginBottom: '4px' }}>Nouvel utilisateur inscrit</div>
                <div style={{ color: '#7A7A8C', fontSize: '12px' }}>Sophie Leclerc - Organisateur</div>
              </div>
              <div style={{ fontSize: '11px', color: '#7A7A8C', flexShrink: 0 }}>Il y a 4h</div>
            </div>
            <div style={{ background: 'white', border: '1.5px solid #E0E0E6', borderRadius: '10px', padding: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '24px', flexShrink: 0 }}>🏫</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#1A1A2E', fontSize: '14px', marginBottom: '4px' }}>Nouveau club créé</div>
                <div style={{ color: '#7A7A8C', fontSize: '12px' }}>PhotoClub - 25 membres</div>
              </div>
              <div style={{ fontSize: '11px', color: '#7A7A8C', flexShrink: 0 }}>Il y a 1j</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
