import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout as logoutApi } from '../../api/auth'
import './Dashboard.css'

function Dashboard() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
  }, [])

  const handleLogout = async () => {
    try {
      await logoutApi()
    } catch (err) {
      // Ignore error, still clear the session locally
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="dashboard-body">
      <header className="dashboard-header">
        <div className="brand">
          <span className="brand-icon">🎓</span>
          <span className="brand-name">EventCampus</span>
        </div>
        <button className="btn-logout" onClick={handleLogout}>Se déconnecter</button>
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
