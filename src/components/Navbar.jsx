import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLogout } from '../hooks/useLogout'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useLogout()
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const initial = user?.prenom?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'A'

  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
        <Link
          to="/student/messages"
          style={{
            textDecoration: 'none', fontSize: '14px', fontWeight: 500,
            color: location.pathname.includes('/messages') ? '#1A1A2E' : '#7A7A8C',
            borderBottom: location.pathname.includes('/messages') ? '2px solid #E94560' : 'none',
            paddingBottom: '2px',
          }}
        >
          Messages
        </Link>
      </div>

      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <div
          onClick={() => setOpen(o => !o)}
          style={{
            width: '36px', height: '36px', borderRadius: '50%', background: '#E94560',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          {initial}
        </div>

        {open && (
          <div style={{
            position: 'absolute', right: 0, top: '46px',
            background: 'white', border: '1.5px solid #E0E0E6',
            borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
            minWidth: '180px', overflow: 'hidden', zIndex: 200,
          }}>
            <div style={{
              padding: '12px 16px', borderBottom: '1px solid #E0E0E6',
            }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A2E' }}>
                {user?.name ?? user?.prenom ?? '—'}
              </div>
              <div style={{ fontSize: '12px', color: '#7A7A8C', marginTop: '2px' }}>
                {user?.email ?? ''}
              </div>
            </div>

            <button
              onClick={() => { setOpen(false); navigate('/student/profile') }}
              style={menuItemStyle}
            >
              👤 Mon profil
            </button>

            <button
              onClick={() => { setOpen(false); navigate('/student/messages') }}
              style={menuItemStyle}
            >
              ✉️ Messages
            </button>

            <button
              onClick={() => { setOpen(false); logout() }}
              style={{ ...menuItemStyle, color: '#E94560' }}
            >
              🚪 Se déconnecter
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

const menuItemStyle = {
  display: 'block', width: '100%', padding: '11px 16px',
  background: 'transparent', border: 'none', textAlign: 'left',
  fontSize: '13px', fontWeight: 500, color: '#1A1A2E',
  fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
}
