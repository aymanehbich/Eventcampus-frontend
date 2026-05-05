import { useEffect, useState } from 'react'
import { updatePreferences } from '../../api/auth'
import { getClubs } from '../../api/clubs'
import Navbar from '../../components/Navbar'
import './Profile.css'

const TABS = ['Mes inscriptions', 'Mes clubs', 'Messages', 'Préférences']

function Profile() {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('Préférences')
  const [emailReminders, setEmailReminders] = useState(true)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      const parsed = JSON.parse(stored)
      setUser(parsed)
      if (parsed.email_reminders !== undefined) {
        setEmailReminders(parsed.email_reminders)
      }
    }
  }, [])

  const handleToggle = async () => {
    const newValue = !emailReminders
    setLoading(true)
    setMessage(null)
    setError(null)
    try {
      await updatePreferences({ email_reminders: newValue })
      setEmailReminders(newValue)
      const stored = localStorage.getItem('user')
      if (stored) {
        const parsed = JSON.parse(stored)
        localStorage.setItem('user', JSON.stringify({ ...parsed, email_reminders: newValue }))
      }
      setMessage(newValue ? 'Rappels email activés.' : 'Rappels email désactivés.')
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="profile-body">
      <Navbar />

      <div className="profile-hero">
        <div className="avatar-big">🎓</div>
        <div>
          <h2>{user?.name ?? '—'}</h2>
          <p>Étudiant · {user?.email ?? '—'}</p>
        </div>
      </div>

      <div className="profile-tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`profile-tab${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tab === 'Messages' && <span className="msg-badge">2</span>}
          </button>
        ))}
      </div>

      <div className="profile-content">
        {activeTab === 'Mes inscriptions' && <InscriptionsTab />}
        {activeTab === 'Mes clubs' && <ClubsTab />}
        {activeTab === 'Messages' && <MessagesTab />}
        {activeTab === 'Préférences' && (
          <PreferencesTab
            emailReminders={emailReminders}
            loading={loading}
            message={message}
            error={error}
            onToggle={handleToggle}
          />
        )}
      </div>
    </div>
  )
}

function InscriptionsTab() {
  return (
    <>
      <div className="section-header"><h3>Événements à venir</h3></div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Événement</th><th>Date</th><th>Lieu</th><th>Statut</th><th>Action</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Conférence Intelligence Artificielle</strong></td>
              <td>4 avr. 2025</td><td>Amphi A</td>
              <td><span className="badge badge-approved">Inscrit</span></td>
              <td><button className="btn-danger">Annuler</button></td>
            </tr>
            <tr>
              <td><strong>Atelier Design Thinking</strong></td>
              <td>7 avr. 2025</td><td>Salle B12</td>
              <td><span className="badge badge-approved">Inscrit</span></td>
              <td><button className="btn-danger">Annuler</button></td>
            </tr>
            <tr>
              <td><strong>Hackathon 48h</strong></td>
              <td>19 avr. 2025</td><td>Salle Projet</td>
              <td><span className="badge badge-waiting">Liste d'attente · Position 3</span></td>
              <td><button className="btn-ghost">Voir</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="waiting-banner">
        <div className="wb-icon">⏳</div>
        <div className="wb-text">
          <strong>Vous êtes N°3 sur la liste d'attente — Hackathon 48h</strong>
          <span>Vous serez notifié par email dès qu'une place se libère. La place devra être confirmée dans les 24h.</span>
        </div>
      </div>

      <div className="section-header"><h3>Historique (événements passés)</h3></div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Événement</th><th>Date</th><th>Club organisateur</th></tr></thead>
          <tbody>
            <tr><td>Hackathon 48h</td><td>15 mar. 2025</td><td>Club Tech & Innovation</td></tr>
            <tr><td>Soirée intégration</td><td>10 jan. 2025</td><td>BDE</td></tr>
            <tr><td>Atelier prise de parole</td><td>5 déc. 2024</td><td>Club Théâtre</td></tr>
          </tbody>
        </table>
      </div>
    </>
  )
}

function ClubsTab() {
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getClubs()
      .then(res => setClubs(res.data.filter(c => c.is_member)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <div className="section-header"><h3>Mes clubs</h3></div>
      {loading ? (
        <p style={{ fontSize: '13px', color: '#7A7A8C' }}>Chargement...</p>
      ) : clubs.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#7A7A8C' }}>Vous n'êtes membre d'aucun club.</p>
      ) : (
        clubs.map(club => (
          <div className="club-row" key={club.id}>
            <div className="club-em">{club.emoji || '🏛️'}</div>
            <div>
              <div className="club-name">{club.nom}</div>
              <div className="club-meta">{club.membres_count ?? 0} membres</div>
            </div>
          </div>
        ))
      )}
    </>
  )
}

function MessagesTab() {
  return (
    <>
      <div className="section-header"><h3>Mes messages reçus</h3></div>
      <div className="table-wrap">
        <div className="msg-row msg-unread">
          <div className="msg-club-icon" style={{ background: '#E6F0FF' }}>💡</div>
          <div className="msg-body">
            <div className="msg-club">Club Tech & Innovation</div>
            <div className="msg-subject">Rappel — Réunion préparatoire Hackathon</div>
            <div className="msg-preview">Bonjour à tous, un rappel pour la réunion de préparation du Hackathon 48h…</div>
          </div>
          <div className="msg-meta"><div className="msg-date">2 avr. 2025</div><div className="unread-dot" /></div>
        </div>
        <div className="msg-row msg-unread">
          <div className="msg-club-icon" style={{ background: '#E6FFE6' }}>🌱</div>
          <div className="msg-body">
            <div className="msg-club">Club Environnement</div>
            <div className="msg-subject">Journée nettoyage — Informations pratiques</div>
            <div className="msg-preview">Voici les informations pratiques pour participer à la journée nettoyage…</div>
          </div>
          <div className="msg-meta"><div className="msg-date">1 avr. 2025</div><div className="unread-dot" /></div>
        </div>
        <div className="msg-row">
          <div className="msg-club-icon" style={{ background: '#E6F0FF' }}>💡</div>
          <div className="msg-body">
            <div className="msg-club">Club Tech & Innovation</div>
            <div className="msg-subject">Résumé de la Conférence IA</div>
            <div className="msg-preview">Merci à tous d'avoir participé à la conférence. Voici un résumé des points…</div>
          </div>
          <div className="msg-meta"><div className="msg-date">20 mar. 2025</div></div>
        </div>
      </div>
    </>
  )
}

function PreferencesTab({ emailReminders, loading, message, error, onToggle }) {
  return (
    <>
      <div className="section-header"><h3>Préférences de notifications</h3></div>
      <div className="notif-card">
        <div className="notif-card-title">🔔 Notifications par email</div>

        {/* Live toggle — EP-178 */}
        <div className="toggle-row">
          <div>
            <div className="toggle-label">Recevoir les rappels d'événements par email</div>
            <div className="toggle-sub">Un email de rappel est envoyé la veille (J-1) de chaque événement auquel vous êtes inscrit</div>
          </div>
          <button
            className={`toggle${emailReminders ? '' : ' off'}`}
            onClick={onToggle}
            disabled={loading}
            aria-pressed={emailReminders}
            aria-label="Activer ou désactiver les rappels email"
          />
        </div>

        {/* Static rows */}
        <div className="toggle-row">
          <div>
            <div className="toggle-label">Être notifié quand une place se libère</div>
            <div className="toggle-sub">Email automatique si vous êtes en liste d'attente et qu'une place devient disponible (valable 24h)</div>
          </div>
          <div className="toggle" />
        </div>
        <div className="toggle-row">
          <div>
            <div className="toggle-label">Recevoir les messages des clubs</div>
            <div className="toggle-sub">Notifications email pour les messages envoyés par vos clubs</div>
          </div>
          <div className="toggle off" />
        </div>
      </div>

      {message && <div className="profile-msg profile-msg--success">{message}</div>}
      {error && <div className="profile-msg profile-msg--error">{error}</div>}

      <div className="email-preview-label">Aperçu de l'email de rappel</div>
      <div className="email-preview">
        <div className="email-preview-header">📧 Objet : Rappel — Conférence Intelligence Artificielle est demain !</div>
        <div className="email-preview-subject">Rappel — Conférence Intelligence Artificielle est demain !</div>
        <div className="email-preview-body">
          <div className="email-preview-logo">Event<span>Campus</span></div>
          <div className="email-preview-event">Conférence Intelligence Artificielle</div>
          <div className="email-preview-meta">
            📅 Vendredi 4 avril 2025<br />
            🕐 14h00 – 17h00<br />
            📍 Amphi A, Bâtiment Principal
          </div>
          <button className="email-cta">Voir l'événement</button>
          <div className="email-unsub">Se désinscrire des rappels</div>
        </div>
      </div>
    </>
  )
}

export default Profile
