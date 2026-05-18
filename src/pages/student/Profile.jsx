import { useEffect, useState } from 'react'
import { updatePreferences, updatePhone } from '../../api/auth'
import { getClubs } from '../../api/clubs'
import Navbar from '../../components/Navbar'
import './Profile.css'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getMyInscriptions } from '../../api/profil'
import { unregisterEvent } from '../../api/events'
import { getNotifications } from '../../api/notifications'
import { getCalendarAuthUrl, getCalendarStatus, disconnectCalendar } from '../../api/googleCalendar'

const TABS = ['Mes inscriptions', 'Mes clubs', 'Messages', 'Notifications', 'Préférences']

function Profile() {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('Préférences')
  const [emailReminders, setEmailReminders] = useState(true)
  const [whatsappReminders, setWhatsappReminders] = useState(false)
  const [whatsappLoading, setWhatsappLoading] = useState(false)
  const [whatsappMessage, setWhatsappMessage] = useState(null)
  const [whatsappError, setWhatsappError] = useState(null)
  const [phone, setPhone] = useState('')
  const [phoneMessage, setPhoneMessage] = useState(null)
  const [phoneError, setPhoneError] = useState(null)
  const [phoneLoading, setPhoneLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [unreadNotifCount, setUnreadNotifCount] = useState(0)
  const [searchParams, setSearchParams] = useSearchParams()
  const [calendarConnected, setCalendarConnected] = useState(false)
  const [calendarMsg, setCalendarMsg] = useState(null)

  useEffect(() => {
    getNotifications()
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.data ?? [])
        setUnreadNotifCount(list.filter(n => !n.read_at).length)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    // Charger le statut de connexion Google Calendar
    getCalendarStatus()
      .then(res => setCalendarConnected(res.data.connected))
      .catch(() => {})

    // Gérer le retour OAuth2 Google Calendar
    const calendarParam = searchParams.get('calendar')
    if (calendarParam === 'success') {
      setCalendarConnected(true)
      setCalendarMsg({ type: 'success', text: '✅ Google Agenda connecté avec succès !' })
      setSearchParams({})
    } else if (calendarParam === 'denied') {
      setCalendarMsg({ type: 'warning', text: "⚠️ Vous avez refusé l'accès à Google Agenda." })
      setSearchParams({})
    } else if (calendarParam === 'error') {
      setCalendarMsg({ type: 'error', text: '❌ Erreur lors de la connexion à Google Agenda.' })
      setSearchParams({})
    }
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      const parsed = JSON.parse(stored)
      setUser(parsed)
      if (parsed.email_reminders !== undefined) {
        setEmailReminders(parsed.email_reminders)
      }
      if (parsed.phone) setPhone(parsed.phone)
      if (parsed.whatsapp_reminders !== undefined) setWhatsappReminders(!!parsed.whatsapp_reminders)
    }
  }, [])

  const handleToggleWhatsapp = async () => {
    const newValue = !whatsappReminders
    setWhatsappLoading(true)
    setWhatsappMessage(null)
    setWhatsappError(null)
    try {
      await updatePhone({ phone, whatsapp_reminders: newValue })
      setWhatsappReminders(newValue)
      const stored = localStorage.getItem('user')
      if (stored) {
        const parsed = JSON.parse(stored)
        localStorage.setItem('user', JSON.stringify({ ...parsed, whatsapp_reminders: newValue }))
      }
      setWhatsappMessage(newValue ? 'Rappels WhatsApp activés.' : 'Rappels WhatsApp désactivés.')
    } catch {
      setWhatsappError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setWhatsappLoading(false)
    }
  }

  const handleSavePhone = async () => {
    setPhoneLoading(true)
    setPhoneMessage(null)
    setPhoneError(null)
    try {
      const res = await updatePhone({ phone })
      const stored = localStorage.getItem('user')
      if (stored) {
        const parsed = JSON.parse(stored)
        localStorage.setItem('user', JSON.stringify({ ...parsed, phone: res.data.phone }))
      }
      setPhoneMessage('Numéro de téléphone enregistré.')
    } catch {
      setPhoneError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setPhoneLoading(false)
    }
  }

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
            {tab === 'Notifications' && unreadNotifCount > 0 && (
              <span className="msg-badge">{unreadNotifCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="profile-content">
        {activeTab === 'Mes inscriptions' && <InscriptionsTab />}
        {activeTab === 'Mes clubs' && <ClubsTab />}
        {activeTab === 'Messages' && <MessagesTab />}
        {activeTab === 'Notifications' && <NotificationsTab />}
        {activeTab === 'Préférences' && (
          <PreferencesTab
            emailReminders={emailReminders}
            loading={loading}
            message={message}
            error={error}
            onToggle={handleToggle}
            phone={phone}
            onPhoneChange={setPhone}
            onSavePhone={handleSavePhone}
            phoneLoading={phoneLoading}
            phoneMessage={phoneMessage}
            phoneError={phoneError}
            whatsappReminders={whatsappReminders}
            whatsappLoading={whatsappLoading}
            whatsappMessage={whatsappMessage}
            whatsappError={whatsappError}
            onToggleWhatsapp={handleToggleWhatsapp}
            calendarConnected={calendarConnected}
            calendarMsg={calendarMsg}
            onCalendarConnect={async () => {
              try {
                const res = await getCalendarAuthUrl()
                window.location.href = res.data.url
              } catch {
                setCalendarMsg({ type: 'error', text: 'Impossible d\'obtenir le lien de connexion.' })
              }
            }}
            onCalendarDisconnect={async () => {
              try {
                await disconnectCalendar()
                setCalendarConnected(false)
                setCalendarMsg({ type: 'success', text: 'Google Agenda déconnecté.' })
              } catch {
                setCalendarMsg({ type: 'error', text: 'Une erreur est survenue.' })
              }
            }}
          />
        )}
      </div>
    </div>
  )
}

function InscriptionsTab() {
  const navigate = useNavigate()
  const [upcoming, setUpcoming] = useState([])
  const [past, setPast]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const fetchInscriptions = () => {
    setLoading(true)
    getMyInscriptions()
      .then(res => {
        setUpcoming(res.data.upcoming ?? [])
        setPast(res.data.past ?? [])
      })
      .catch(() => setError('Impossible de charger vos inscriptions.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchInscriptions() }, [])

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric',
    })

  const handleCancel = async (eventId) => {
    if (!window.confirm('Annuler votre inscription ?')) return
    try {
      await unregisterEvent(eventId)
      fetchInscriptions()
    } catch {
      alert('Une erreur est survenue.')
    }
  }

  if (loading) return (
    <p style={{ fontSize: '13px', color: '#7A7A8C', padding: '20px 0' }}>
      Chargement...
    </p>
  )

  if (error) return (
    <p style={{ fontSize: '13px', color: '#E94560', padding: '20px 0' }}>
      {error}
    </p>
  )

  return (
    <>
      {/* ── Événements à venir ── */}
      <div className="section-header"><h3>Événements à venir</h3></div>

      {upcoming.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#7A7A8C' }}>
          Aucune inscription à venir.
        </p>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Événement</th>
                  <th>Date</th>
                  <th>Lieu</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map(event => (
                  <tr key={`${event.statut}-${event.id}`}>

                    {/* Événement — bold comme l'UI */}
                    <td><strong>{event.titre}</strong></td>

                    {/* Date — format "4 avr. 2025" */}
                    <td>{formatDate(event.date)}</td>

                    {/* Lieu */}
                    <td>{event.lieu || '—'}</td>

                    {/* Statut — badge vert ou orange */}
                    <td>
                      {event.statut === 'waitlisted' ? (
                        <span className="badge badge-waiting">
                          Liste d'attente · Position {event.position}
                        </span>
                      ) : (
                        <span className="badge badge-approved">Inscrit</span>
                      )}
                    </td>

                    {/* Action — "Annuler" pour inscrits, "Voir" pour attente */}
                    <td>
                      {event.statut === 'registered' ? (
                        <button
                          className="btn-danger"
                          onClick={() => handleCancel(event.id)}
                        >
                          Annuler
                        </button>
                      ) : (
                        <button
                          className="btn-ghost"
                          onClick={() => navigate(`/student/events/${event.id}`)}
                        >
                          Voir
                        </button>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Banner liste d'attente — une par événement en attente */}
          {upcoming
            .filter(e => e.statut === 'waitlisted')
            .map(e => (
              <div className="waiting-banner" key={e.id}>
                <div className="wb-icon">⏳</div>
                <div className="wb-text">
                  <strong>
                    Vous êtes N°{e.position} sur la liste d'attente — {e.titre}
                  </strong>
                  <span>
                    Vous serez notifié par email dès qu'une place se libère.
                    La place devra être confirmée dans les 24h.
                  </span>
                </div>
              </div>
            ))
          }
        </>
      )}

      {/* ── Historique ── */}
      <div className="section-header" style={{ marginTop: '32px' }}>
        <h3>Historique (événements passés)</h3>
      </div>

      {past.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#7A7A8C' }}>
          Aucun événement passé.
        </p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Événement</th>
                <th>Date</th>
                <th>Club organisateur</th>
              </tr>
            </thead>
            <tbody>
              {past.map(event => (
                <tr
                  key={event.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/student/events/${event.id}`)}
                >
                  <td>{event.titre}</td>
                  <td>{formatDate(event.date)}</td>
                  <td>{event.club_name || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
  const [receivedMessages, setReceivedMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  const fetchMessages = async () => {
    try {
      const { getReceivedMessages } = await import('../../api/messages')

      const res = await getReceivedMessages()

      // Backend returns { message, data }
      const rawMessages = Array.isArray(res.data)
        ? res.data
        : (res.data?.data || [])

      // Normalize frontend structure
      const formattedMessages = rawMessages.map(msg => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        read_at: msg.is_read ? msg.created_at : null,

        sender_name:
          msg.sender?.name ||
          `${msg.sender?.prenom || ''} ${msg.sender?.nom || ''}`.trim(),

        conversation_name:
          msg.conversation?.name || 'Conversation'
      }))

      setReceivedMessages(formattedMessages)

    } catch (err) {
      console.error('Erreur lors du chargement des messages', err)
    } finally {
      setLoading(false)
    }
  }

  fetchMessages()
}, [])

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

  const getCategoryColor = (category) => {
    const colors = {
      'Technologie': '#E6F0FF',
      'Culture': '#FFE6F0',
      'Environnement': '#E6FFE6',
      'Art': '#F0E6FF',
      'Sport': '#E6FFFA',
    }
    return colors[category] || '#F4F4F6'
  }

  const getCategoryEmoji = (category) => {
    const emojis = {
      'Technologie': '💡',
      'Culture': '🎭',
      'Environnement': '🌱',
      'Art': '🎵',
      'Sport': '⚽',
    }
    return emojis[category] || '🏛️'
  }

  return (
    <>
      <div className="section-header"><h3>Mes messages reçus</h3></div>
      {loading ? (
        <p style={{ fontSize: '13px', color: '#7A7A8C' }}>Chargement des messages...</p>
      ) : receivedMessages.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#7A7A8C' }}>Aucun message reçu.</p>
      ) : (
        <div className="table-wrap">
          {receivedMessages.map((msg, idx) => (
            <div key={idx} className={`msg-row${!msg.read_at ? ' msg-unread' : ''}`}>
              <div className="msg-club-icon" style={{ background: getCategoryColor(msg.club_category) }}>
                {getCategoryEmoji(msg.club_category)}
              </div>
              <div className="msg-body">
<div className="msg-club">
  {msg.sender_name || 'Organisateur'}
</div>                <div className="msg-subject">{msg.subject || msg.content?.substring(0, 50)}</div>
                <div className="msg-preview">{msg.content?.substring(0, 100) || 'Aucun contenu'}…</div>
              </div>
              <div className="msg-meta">
                <div className="msg-date">{formatDate(msg.sent_at || msg.created_at)}</div>
                {!msg.read_at && <div className="unread-dot" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function NotificationsTab() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getNotifications()
      .then(res => setNotifications(Array.isArray(res.data) ? res.data : (res.data?.data ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <>
      <div className="section-header"><h3>Mes notifications</h3></div>
      {loading ? (
        <p style={{ fontSize: '13px', color: '#7A7A8C' }}>Chargement...</p>
      ) : notifications.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#7A7A8C' }}>Aucune notification.</p>
      ) : (
        <div className="table-wrap">
          {notifications.map(n => (
            <div key={n.id} className={`msg-row${!n.read_at ? ' msg-unread' : ''}`}>
              <div className="msg-club-icon" style={{ background: n.type?.includes('Refusee') ? '#FFE6E6' : '#E6FAF0' }}>
                {n.type?.includes('Refusee') ? '❌' : '✅'}
              </div>
              <div className="msg-body">
                <div className="msg-subject">{n.data?.message}</div>
                {n.data?.club_nom && (
                  <div className="msg-club">{n.data.club_nom}</div>
                )}
              </div>
              <div className="msg-meta">
                <div className="msg-date">{n.created_at ? formatDate(n.created_at) : ''}</div>
                {!n.read_at && <div className="unread-dot" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function PreferencesTab({ emailReminders, loading, message, error, onToggle, phone, onPhoneChange, onSavePhone, phoneLoading, phoneMessage, phoneError, whatsappReminders, whatsappLoading, whatsappMessage, whatsappError, onToggleWhatsapp, calendarConnected, calendarMsg, onCalendarConnect, onCalendarDisconnect }) {
  return (
    <>
      <div className="section-header"><h3>Coordonnées</h3></div>
      <div className="notif-card">
        <div className="notif-card-title">📱 Numéro de téléphone</div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '12px' }}>
          <input
            type="tel"
            placeholder="+212620080504"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            style={{ flex: 1, border: '1.5px solid #E0E0E6', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", outline: 'none' }}
            onFocus={(e) => e.target.style.borderColor = '#E94560'}
            onBlur={(e) => e.target.style.borderColor = '#E0E0E6'}
          />
          <button
            onClick={onSavePhone}
            disabled={phoneLoading}
            style={{ background: '#E94560', color: 'white', border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif" }}
          >
            {phoneLoading ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
        {phoneMessage && <div className="profile-msg profile-msg--success" style={{ marginTop: '8px' }}>{phoneMessage}</div>}
        {phoneError && <div className="profile-msg profile-msg--error" style={{ marginTop: '8px' }}>{phoneError}</div>}
      </div>

      <div className="section-header" style={{ marginTop: '28px' }}><h3>Préférences de notifications</h3></div>
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

      <div className="notif-card" style={{ marginTop: '12px' }}>
        <div className="notif-card-title">💬 Rappels WhatsApp</div>
        <div className="toggle-row">
          <div>
            <div className="toggle-label">Recevoir les rappels d'événements par WhatsApp</div>
            <div className="toggle-sub">Un message WhatsApp est envoyé la veille (J-1) de chaque événement auquel vous êtes inscrit</div>
          </div>
          <button
            className={`toggle${whatsappReminders ? '' : ' off'}`}
            onClick={onToggleWhatsapp}
            disabled={whatsappLoading}
            aria-pressed={whatsappReminders}
            aria-label="Activer ou désactiver les rappels WhatsApp"
          />
        </div>
        {whatsappMessage && <div className="profile-msg profile-msg--success" style={{ marginTop: '8px' }}>{whatsappMessage}</div>}
        {whatsappError && <div className="profile-msg profile-msg--error" style={{ marginTop: '8px' }}>{whatsappError}</div>}
      </div>

      {/* ── Google Agenda ── */}
      <div className="section-header" style={{ marginTop: '28px' }}><h3>Intégrations</h3></div>
      <div className="notif-card">
        <div className="notif-card-title">📅 Google Agenda</div>
        <div className="toggle-row" style={{ alignItems: 'center' }}>
          <div>
            <div className="toggle-label">Synchroniser avec Google Agenda</div>
            <div className="toggle-sub">
              {calendarConnected
                ? 'Votre Google Agenda est connecté.'
                : 'Connectez votre Google Agenda pour ajouter automatiquement les événements auxquels vous vous inscrivez.'}
            </div>
          </div>
          <button
            onClick={calendarConnected ? onCalendarDisconnect : onCalendarConnect}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              border: calendarConnected ? '1.5px solid #E0E0E6' : 'none',
              background: calendarConnected ? 'white' : 'linear-gradient(135deg, #4285F4, #1a73e8)',
              color: calendarConnected ? '#7A7A8C' : 'white',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {calendarConnected ? 'Déconnecter' : '🔗 Connecter'}
          </button>
        </div>
        {calendarConnected && (
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#2ECC71', fontWeight: 600 }}>
            ✅ Connecté
          </div>
        )}
      </div>

      {calendarMsg && (
        <div className={`profile-msg ${
          calendarMsg.type === 'success' ? 'profile-msg--success'
          : calendarMsg.type === 'warning' ? 'profile-msg--warning'
          : 'profile-msg--error'
        }`}>
          {calendarMsg.text}
        </div>
      )}

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
