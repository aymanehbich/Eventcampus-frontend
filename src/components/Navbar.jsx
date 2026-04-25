import { Link, useLocation } from 'react-router-dom'
import { useLogout } from '../hooks/useLogout'

export default function Navbar() {
  const location = useLocation()
  const logout = useLogout()
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const initial = user?.prenom?.[0]?.toUpperCase() || 'A'

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 36px', height: '64px', background: 'white',
      borderBottom: '1px solid #E0E0E6', position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: '22px', color: '#1A1A2E' }}>
        Event<span style={{ color: '#E94560' }}>Campus</span>
      </div>
      <div style={{ display: 'flex', gap: '28px' }}>
        <Link
          to="/student/events"
          style={{
            textDecoration: 'none', fontSize: '14px', fontWeight: 500,
            color: location.pathname.includes('/events') ? '#1A1A2E' : '#7A7A8C',
            borderBottom: location.pathname.includes('/events') ? '2px solid #E94560' : 'none',
            paddingBottom: '2px',
          }}
        >
          Événements
        </Link>
        <Link
          to="/student/clubs"
          style={{
            textDecoration: 'none', fontSize: '14px', fontWeight: 500,
            color: location.pathname.includes('/clubs') ? '#1A1A2E' : '#7A7A8C',
            borderBottom: location.pathname.includes('/clubs') ? '2px solid #E94560' : 'none',
            paddingBottom: '2px',
          }}
        >
          Clubs
        </Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          onClick={logout}
          style={{
            width: '36px', height: '36px', borderRadius: '50%', background: '#E94560',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
          }}
          title="Se déconnecter"
        >
          {initial}
        </div>
      </div>
    </nav>
  )
}