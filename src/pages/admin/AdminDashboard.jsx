import { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { logout } from '../../api/auth'
import { getUsers, getPendingUsers, activateUser, deactivateUser, activateRole } from '../../api/admin'

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
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    if (activeSection === 'users') {
      fetchUsers()
    } else if (activeSection === 'validation') {
      fetchPendingUsers()
    }
  }, [activeSection, searchQuery, filterRole, filterStatus])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = {}
      if (searchQuery) params.search = searchQuery
      if (filterRole) params.role = filterRole
      if (filterStatus) params.status = filterStatus
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
        {activeSection === 'statistics' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div style={{ background: 'white', border: '1.5px solid #E0E0E6', borderRadius: '10px', padding: '24px', textAlign: 'center', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: '32px', fontWeight: 700, color: '#1A1A2E', marginBottom: '8px' }}>{stats.totalUsers}</div>
              <div style={{ fontSize: '13px', color: '#7A7A8C', fontWeight: 500 }}>Utilisateurs totaux</div>
            </div>
            <div style={{ background: 'white', border: '1.5px solid #E0E0E6', borderRadius: '10px', padding: '24px', textAlign: 'center', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: '32px', fontWeight: 700, color: '#1A1A2E', marginBottom: '8px' }}>{stats.totalEvents}</div>
              <div style={{ fontSize: '13px', color: '#7A7A8C', fontWeight: 500 }}>Événements</div>
            </div>
            <div style={{ background: 'white', border: '1.5px solid #E0E0E6', borderRadius: '10px', padding: '24px', textAlign: 'center', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: '32px', fontWeight: 700, color: '#1A1A2E', marginBottom: '8px' }}>{stats.totalClubs}</div>
              <div style={{ fontSize: '13px', color: '#7A7A8C', fontWeight: 500 }}>Clubs</div>
            </div>
            <div style={{ background: 'white', border: '1.5px solid #E94560', borderRadius: '10px', padding: '24px', textAlign: 'center', backgroundColor: 'rgba(233,69,96,0.08)', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: '32px', fontWeight: 700, color: '#E94560', marginBottom: '8px' }}>{stats.pendingValidations}</div>
              <div style={{ fontSize: '13px', color: '#E94560', fontWeight: 500 }}>Validations en attente</div>
            </div>
          </div>
        )}

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
                  <option value="inactif">Inactif</option>
                  <option value="suspendu">Suspendu</option>
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
                    {users.map((usr, i) => {
                      const isLast = i === users.length - 1
                      const tdStyle = { padding: '13px 16px', borderBottom: isLast ? 'none' : '1px solid #E0E0E6', color: '#1A1A2E', verticalAlign: 'middle' }
                      const roleColor = usr.role === 'etudiant' ? { bg: '#EEF0FF', color: '#4A4AE8' } : usr.role === 'organisateur' ? { bg: '#FFF4E6', color: '#FF9500' } : { bg: '#E6FFE6', color: '#4CAF50' }
                      const statusColor = usr.status === 'actif' || usr.status === 'active' ? { bg: '#E6FFE6', color: '#4CAF50' } : usr.status === 'inactif' || usr.status === 'inactive' ? { bg: '#FFE6E6', color: '#E94560' } : { bg: '#FFF4E6', color: '#FF9500' }
                      return (
                        <tr key={usr.id}>
                          <td style={tdStyle}>
                            <div style={{ fontWeight: 600 }}>{usr.name}</div>
                          </td>
                          <td style={tdStyle}>{usr.email}</td>
                          <td style={tdStyle}>
                            <span style={{ background: roleColor.bg, color: roleColor.color, padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, display: 'inline-block' }}>
                              {usr.role === 'etudiant' ? '🎓 Étudiant' : usr.role === 'organisateur' ? '🏛️ Organisateur' : '⚙️ Admin'}
                            </span>
                          </td>
                          <td style={tdStyle}>
                            <span style={{ background: statusColor.bg, color: statusColor.color, padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, display: 'inline-block' }}>
                              {usr.status === 'active' || usr.status === 'actif' ? '✅ Actif' : usr.status === 'inactive' || usr.status === 'inactif' ? '❌ Inactif' : '⏸️ Suspendu'}
                            </span>
                          </td>
                          <td style={tdStyle}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <div>
                                {(usr.status === 'inactive' || usr.status === 'inactif') ? (
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
                                )}
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
