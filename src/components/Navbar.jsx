import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLogout } from '../hooks/useLogout'
import logo from '../assets/logo-fssm.png'
import './Navbar.css'

const LINKS = [
  { to: '/student/events', label: 'Événements' },
  { to: '/student/clubs', label: 'Clubs' },
]

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
  </svg>
)
const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
)
const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)
const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
)
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
)
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" />
  </svg>
)
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" />
  </svg>
)

// Optional props: pass `searchQuery` + `onSearch` to enable the search field behind the magnifier.
export default function Navbar({ searchQuery, onSearch }) {
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useLogout()
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const initial = user?.prenom?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'A'
  const hasSearch = typeof onSearch === 'function'

  const [open, setOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(Boolean(searchQuery))
  const dropdownRef = useRef(null)
  const searchRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  const isActive = (to) => location.pathname.startsWith(to)

  return (
    <nav className="ec-nav" aria-label="Navigation principale">
      <Link to="/student/events" className="ec-nav__brand" aria-label="Faculté des Sciences Semlalia – Marrakech, accueil">
        <img className="ec-nav__logo" src={logo} alt="Faculté des Sciences Semlalia – Marrakech" />
      </Link>

      <div className={`ec-nav__links${mobileOpen ? ' is-open' : ''}`}>
        {LINKS.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`ec-nav__link${isActive(to) ? ' is-active' : ''}`}
            aria-current={isActive(to) ? 'page' : undefined}
            onClick={() => setMobileOpen(false)}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="ec-nav__actions">
        {hasSearch && (
          <div className={`ec-nav__search${searchOpen ? ' is-open' : ''}`}>
            <input
              ref={searchRef}
              type="search"
              value={searchQuery ?? ''}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Rechercher un événement…"
              aria-label="Rechercher un événement"
              tabIndex={searchOpen ? 0 : -1}
            />
          </div>
        )}
        <button
          type="button"
          className="ec-nav__icon-btn"
          aria-label={hasSearch ? 'Rechercher' : 'Voir les événements'}
          onClick={() => (hasSearch ? setSearchOpen((o) => !o) : navigate('/student/events'))}
        >
          <SearchIcon />
        </button>
        <button
          type="button"
          className="ec-nav__icon-btn"
          aria-label="Notifications et messages"
          onClick={() => navigate('/student/messages')}
        >
          <BellIcon />
        </button>

        <div ref={dropdownRef} className="ec-nav__user">
          <button
            type="button"
            className="ec-nav__user-btn"
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label="Menu du compte"
          >
            <span className="ec-nav__avatar">{initial}</span>
            <ChevronIcon />
          </button>

          {open && (
            <div className="ec-nav__menu" role="menu">
              <div className="ec-nav__menu-head">
                <div className="ec-nav__menu-name">{user?.name ?? user?.prenom ?? '—'}</div>
                <div className="ec-nav__menu-mail">{user?.email ?? ''}</div>
              </div>
              <button className="ec-nav__menu-item" role="menuitem" onClick={() => { setOpen(false); navigate('/student/profile') }}>
                <UserIcon /> Mon profil
              </button>
              <button className="ec-nav__menu-item" role="menuitem" onClick={() => { setOpen(false); navigate('/student/messages') }}>
                <MailIcon /> Messages
              </button>
              <button className="ec-nav__menu-item ec-nav__menu-item--danger" role="menuitem" onClick={() => { setOpen(false); logout() }}>
                <LogoutIcon /> Se déconnecter
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          className="ec-nav__icon-btn ec-nav__burger"
          aria-label="Ouvrir le menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((o) => !o)}
        >
          <MenuIcon />
        </button>
      </div>
    </nav>
  )
}
