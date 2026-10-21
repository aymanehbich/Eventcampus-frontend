import { useNavigate } from 'react-router-dom'
import { useLogout } from '../hooks/useLogout'
import logo from '../assets/logo-fssm.png'
import './DashboardLayout.css'

const ICONS = {
  dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>,
  club: <><path d="M3 21h18M5 21V10l7-6 7 6v11" /><path d="M9 21v-6h6v6" /></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  users: <><circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0 1 14 0" /><path d="M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  key: <><circle cx="8" cy="15" r="4" /><path d="m11 12 9-9M16 7l3 3" /></>,
  list: <><path d="M9 6h12M9 12h12M9 18h12" /><circle cx="4.5" cy="6" r="1" /><circle cx="4.5" cy="12" r="1" /><circle cx="4.5" cy="18" r="1" /></>,
  chart: <><path d="M3 3v18h18" /><path d="M7 15l4-5 3 3 5-7" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
}

export const ORGANISER_ITEMS = [
  { key: 'dashboard', label: 'Tableau de bord', icon: 'dashboard', to: '/organiser/dashboard' },
  { key: 'clubs', label: 'Mon club', icon: 'club', to: '/organiser/clubs' },
  { key: 'events', label: 'Mes événements', icon: 'calendar', to: '/organiser/events' },
  { key: 'members', label: 'Membres', icon: 'users', to: '/organiser/adhesions' },
  { key: 'messages', label: 'Messages', icon: 'mail', to: '/organiser/messages' },
]

export const ADMIN_ITEMS = [
  { key: 'statistics', label: 'Statistiques', icon: 'chart' },
  { key: 'users', label: 'Utilisateurs', icon: 'users' },
  { key: 'clubs', label: 'Clubs', icon: 'club' },
  { key: 'events', label: 'Événements', icon: 'calendar' },
  { key: 'role-requests', label: 'Demandes de rôle', icon: 'key' },
  { key: 'activity', label: 'Activité', icon: 'list' },
]

/**
 * Shared shell for organiser + admin pages (sidebar + header + content).
 *
 * Props:
 *  - items:     [{ key, label, icon, to?, badge? }]  (use ORGANISER_ITEMS / ADMIN_ITEMS)
 *  - active:    key of the active item
 *  - onSelect:  (key) => void   — for items without `to` (in-page tabs, e.g. admin)
 *  - roleLabel: small caption above the nav (e.g. "Espace organisateur")
 *  - title / subtitle / actions: page header
 *  - onLogout:  optional override (admin uses its own login path)
 */
export default function DashboardLayout({
  items = ORGANISER_ITEMS, active, onSelect, roleLabel = 'Espace organisateur',
  title, subtitle, actions, onLogout, children,
}) {
  const navigate = useNavigate()
  const logout = useLogout()
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const name = user?.name ?? user?.prenom ?? 'Utilisateur'
  const initial = (user?.prenom?.[0] || user?.name?.[0] || 'U').toUpperCase()

  return (
    <div className="dl">
      <aside className="dl__side">
        <div className="dl__brand">
          <img src={logo} alt="Faculté des Sciences Semlalia – Marrakech" />
        </div>
        <div className="dl__role">{roleLabel}</div>

        <nav className="dl__nav" aria-label="Navigation">
          {items.map((it) => (
            <button
              key={it.key}
              type="button"
              className={`dl__item${active === it.key ? ' is-active' : ''}`}
              aria-current={active === it.key ? 'page' : undefined}
              onClick={() => (it.to ? navigate(it.to) : onSelect?.(it.key))}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {ICONS[it.icon] || ICONS.list}
              </svg>
              {it.label}
              {it.badge ? <span className="dl__badge">{it.badge}</span> : null}
            </button>
          ))}
        </nav>

        <div className="dl__foot">
          <div className="dl__user">
            <span className="dl__avatar">{initial}</span>
            <div style={{ minWidth: 0 }}>
              <div className="dl__user-name">{name}</div>
              <div className="dl__user-mail">{user?.email ?? ''}</div>
            </div>
          </div>
          <button type="button" className="dl__logout" onClick={onLogout || logout} aria-label="Se déconnecter">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" />
            </svg>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className="dl__main">
        {(title || actions) && (
          <header className="dl__head">
            <div>
              {title && <h1 className="dl__title">{title}</h1>}
              {subtitle && <p className="dl__subtitle">{subtitle}</p>}
            </div>
            {actions && <div className="dl__actions">{actions}</div>}
          </header>
        )}
        <div className="dl__content">{children}</div>
      </main>
    </div>
  )
}
