import { useEffect, useState } from 'react'
import { useLogout } from '../../hooks/useLogout'
import './Dashboard.css'

function Dashboard() {
  const [user, setUser] = useState(null)
  const logout = useLogout()

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
  }, [])

  return (
    <div className="dashboard-body">
      <header className="dashboard-header">
        <div className="brand">
          <span className="brand-icon">🎓</span>
          <span className="brand-name">EventCampus</span>
        </div>
        <button className="btn-logout" onClick={logout}>Se déconnecter</button>
      </header>
      <main className="dashboard-main">
        <div className="welcome-card">
          <div className="label-tag">Espace étudiant</div>
          <h1>Bonjour {user?.name} 👋</h1>
          <p>Bienvenue sur votre espace EventCampus. Découvrez les événements et clubs de votre université.</p>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
