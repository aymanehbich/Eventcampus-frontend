import { useEffect, useState } from 'react'
import { me as meApi } from '../../api/auth'
import { useLogout } from '../../hooks/useLogout'
import logo from '../../assets/logo-fssm.png'
import './Dashboard.css'

function Dashboard() {
  const [user, setUser] = useState(null)
  const logout = useLogout()

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      setUser(JSON.parse(stored))
    }

    meApi().catch(() => {
      // L'intercepteur axios gère le 401 (token expiré) automatiquement.
    })
  }, [])

  return (
    <div className="db">
      <header className="db__header">
        <div className="db__brand">
          <img className="db__logo" src={logo} alt="Faculté des Sciences Semlalia – Marrakech" />
          <span className="db__brand-name">EventCampus</span>
        </div>
        <button className="db__logout" onClick={logout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="m16 17 5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          Se déconnecter
        </button>
      </header>
      <main className="db__wrap">
        <section className="db__welcome">
          <span className="db__tag">Espace étudiant</span>
          <h1 className="db__title">
            Bonjour {user?.name}
            <svg className="db__wave" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 11V6a2 2 0 0 0-4 0v1" />
              <path d="M14 10V4a2 2 0 0 0-4 0v2" />
              <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
              <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
            </svg>
          </h1>
          <p className="db__text">
            Bienvenue sur votre espace EventCampus. Découvrez les événements et clubs de votre université.
          </p>
        </section>
      </main>
    </div>
  )
}

export default Dashboard
