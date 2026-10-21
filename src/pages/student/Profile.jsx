import { useEffect, useState } from 'react'
import { updatePreferences, updatePhone } from '../../api/auth'
import { submitRoleRequest } from '../../api/roleRequests'
import { getClubs } from '../../api/clubs'
import Navbar from '../../components/Navbar'
import './Profile.css'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getMyInscriptions } from '../../api/profil'
import { unregisterEvent } from '../../api/events'
import { getNotifications } from '../../api/notifications'
import { getCalendarAuthUrl, getCalendarStatus, disconnectCalendar } from '../../api/googleCalendar'
import { Icon } from './StudentIcons'

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
  const [roleRequestMsg, setRoleRequestMsg] = useState(null)
  const [roleRequestLoading, setRoleRequestLoading] = useState(false)

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
      setCalendarMsg({ type: 'success', text: 'Google Agenda connecté avec succès !' })
      setSearchParams({})
    } else if (calendarParam === 'denied') {
      setCalendarMsg({ type: 'warning', text: "Vous avez refusé l'accès à Google Agenda." })
      setSearchParams({})
    } else if (calendarParam === 'error') {
      setCalendarMsg({ type: 'error', text: 'Erreur lors de la connexion à Google Agenda.' })
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

  const handleRoleRequest = async () => {
    setRoleRequestLoading(true)
    setRoleRequestMsg(null)
    try {
      const stored = JSON.parse(localStorage.getItem('user') || 'null')
      await submitRoleRequest({
        name: stored?.name ?? '',
        email: stored?.email ?? '',
        student_id: stored?.student_id ?? '',
        is_existing_student: true,
      })
      setRoleRequestMsg({ type: 'success', text: 'Votre demande a été envoyée.' })
    } catch (err) {
      if (err.response?.status === 409) {
        setRoleRequestMsg({ type: 'warning', text: 'Vous avez déjà une demande en attente.' })
      } else {
        setRoleRequestMsg({ type: 'error', text: 'Une erreur est survenue. Réessayez.' })
      }
    } finally {
      setRoleRequestLoading(false)
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
    <div className="pf">
      <Navbar />

      <main className="pf__wrap">
        <section className="pf__hero">
          <div className="pf__avatar"><Icon name="graduation" size={34} /></div>
          <div className="pf__hero-text">
            <h1 className="pf__name">{user?.name ?? '—'}</h1>
            <p className="pf__email">Étudiant · {user?.email ?? '—'}</p>
          </div>
        </section>

        <div className="pf__tabs" role="tablist" aria-label="Sections du profil">
          {TABS.map(tab => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              className={`pf__tab${activeTab === tab ? ' is-active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {tab === 'Notifications' && unreadNotifCount > 0 && (
                <span className="pf__count">{unreadNotifCount}</span>
              )}
            </button>
          ))}
        </div>

        <div className="pf__content" role="tabpanel">
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
              roleRequestMsg={roleRequestMsg}
              roleRequestLoading={roleRequestLoading}
              onRoleRequest={handleRoleRequest}
              userRole={JSON.parse(localStorage.getItem('user') || 'null')?.role}
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
      </main>
    </div>
  )
}

function Msg({ type, children, className = '' }) {
  const variant = type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'error'
  return (
    <div className={`pf__msg pf__msg--${variant} ${className}`.trim()} role="status">
      {children}
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

  if (loading) return <p className="pf__muted" role="status">Chargement...</p>

  if (error) return <p className="pf__muted pf__muted--error" role="alert">{error}</p>

  return (
    <>
      {/* ── Événements à venir ── */}
      <div className="pf__section"><h2>Événements à venir</h2></div>

      {upcoming.length === 0 ? (
        <p className="pf__muted">Aucune inscription à venir.</p>
      ) : (
        <>
          <div className="pf__table-wrap">
            <table className="pf__table">
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
                        <span className="pf__badge pf__badge--waiting">
                          Liste d'attente · Position {event.position}
                        </span>
                      ) : (
                        <span className="pf__badge pf__badge--ok">Inscrit</span>
                      )}
                    </td>

                    {/* Action — "Annuler" pour inscrits, "Voir" pour attente */}
                    <td>
                      {event.statut === 'registered' ? (
                        <button
                          type="button"
                          className="pf__btn pf__btn--danger"
                          onClick={() => handleCancel(event.id)}
                        >
                          Annuler
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="pf__btn pf__btn--ghost"
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
              <div className="pf__waiting" key={e.id}>
                <div className="pf__waiting-icon"><Icon name="hourglass" size={22} /></div>
                <div className="pf__waiting-text">
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
      <div className="pf__section pf__section--spaced">
        <h2>Historique (événements passés)</h2>
      </div>

      {past.length === 0 ? (
        <p className="pf__muted">Aucun événement passé.</p>
      ) : (
        <div className="pf__table-wrap">
          <table className="pf__table">
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
                  className="pf__row-link"
                  tabIndex={0}
                  onClick={() => navigate(`/student/events/${event.id}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/student/events/${event.id}`) }}
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
      <div className="pf__section"><h2>Mes clubs</h2></div>
      {loading ? (
        <p className="pf__muted" role="status">Chargement...</p>
      ) : clubs.length === 0 ? (
        <p className="pf__muted">Vous n'êtes membre d'aucun club.</p>
      ) : (
        <div className="pf__clubs">
          {clubs.map(club => (
            <div className="pf__club" key={club.id}>
              <div className="pf__club-ico">{club.emoji || <Icon name="landmark" size={24} />}</div>
              <div>
                <div className="pf__club-name">{club.nom}</div>
                <div className="pf__club-meta">{club.membres_count ?? 0} membres</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function MessagesTab() {
  const navigate = useNavigate()
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
        sender_id: msg.sender?.id,

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

  const handleReply = async (msg) => {
    if (!msg.sender_id) {
      alert('Impossible de répondre à ce message.')
      return
    }
    try {
      const { startConversation } = await import('../../api/messages')
      await startConversation(msg.sender_id)
      navigate('/student/messages', {
        state: {
          organizerId: msg.sender_id,
          organizerName: msg.sender_name,
        },
      })
    } catch (err) {
      console.error('Erreur lors du démarrage de la conversation', err)
      alert('Impossible de démarrer la conversation.')
    }
  }

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <>
      <div className="pf__section"><h2>Mes messages reçus</h2></div>
      {loading ? (
        <p className="pf__muted" role="status">Chargement des messages...</p>
      ) : receivedMessages.length === 0 ? (
        <p className="pf__muted">Aucun message reçu.</p>
      ) : (
        <div className="pf__list">
          {receivedMessages.map((msg, idx) => (
            <div key={idx} className={`pf__item${!msg.read_at ? ' is-unread' : ''}`}>
              <div className="pf__item-ico"><Icon name="mail" size={18} /></div>
              <div className="pf__item-body">
                <button
                  type="button"
                  className="pf__item-open"
                  onClick={() => handleReply(msg)}
                >
                  <span className="pf__item-from">{msg.sender_name || 'Organisateur'}</span>
                  <span className="pf__item-subject">{msg.subject || msg.content?.substring(0, 50)}</span>
                  <span className="pf__item-preview">{msg.content?.substring(0, 100) || 'Aucun contenu'}…</span>
                </button>
              </div>
              <div className="pf__item-meta">
                <div className="pf__item-date">{formatDate(msg.sent_at || msg.created_at)}</div>
                {!msg.read_at && <div className="pf__dot" role="img" aria-label="Non lu" />}
                <button
                  type="button"
                  className="pf__btn pf__btn--ghost"
                  onClick={() => handleReply(msg)}
                >
                  Répondre
                </button>
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
      <div className="pf__section"><h2>Mes notifications</h2></div>
      {loading ? (
        <p className="pf__muted" role="status">Chargement...</p>
      ) : notifications.length === 0 ? (
        <p className="pf__muted">Aucune notification.</p>
      ) : (
        <div className="pf__list">
          {notifications.map(n => {
            const refused = n.type?.includes('Refusee')
            return (
              <div key={n.id} className={`pf__item${!n.read_at ? ' is-unread' : ''}`}>
                <div className={`pf__item-ico ${refused ? 'pf__item-ico--red' : 'pf__item-ico--green'}`}>
                  <Icon name={refused ? 'xCircle' : 'checkCircle'} size={18} />
                </div>
                <div className="pf__item-body">
                  <div className="pf__item-subject">{n.data?.message}</div>
                  {n.data?.club_nom && (
                    <div className="pf__item-from">{n.data.club_nom}</div>
                  )}
                </div>
                <div className="pf__item-meta">
                  <div className="pf__item-date">{n.created_at ? formatDate(n.created_at) : ''}</div>
                  {!n.read_at && <div className="pf__dot" role="img" aria-label="Non lu" />}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

function PreferencesTab({ emailReminders, loading, message, error, onToggle, phone, onPhoneChange, onSavePhone, phoneLoading, phoneMessage, phoneError, whatsappReminders, whatsappLoading, whatsappMessage, whatsappError, onToggleWhatsapp, calendarConnected, calendarMsg, onCalendarConnect, onCalendarDisconnect, roleRequestMsg, roleRequestLoading, onRoleRequest, userRole }) {
  return (
    <>
      {userRole === 'etudiant' && (
        <>
          <div className="pf__section"><h2>Rôle</h2></div>
          <div className="pf__card">
            <div className="pf__card-title"><Icon name="landmark" size={18} />Devenir organisateur</div>
            <p className="pf__card-text">
              Vous souhaitez créer et gérer des événements ? Envoyez une demande à l'administrateur pour obtenir le rôle organisateur.
            </p>
            <button
              type="button"
              className="pf__btn pf__btn--primary"
              onClick={onRoleRequest}
              disabled={roleRequestLoading}
            >
              {roleRequestLoading ? 'Envoi en cours…' : 'Devenir organisateur'}
            </button>
            {roleRequestMsg && (
              <Msg type={roleRequestMsg.type} className="pf__msg--in">{roleRequestMsg.text}</Msg>
            )}
          </div>
        </>
      )}

      <div className="pf__section"><h2>Coordonnées</h2></div>
      <div className="pf__card">
        <div className="pf__card-title"><Icon name="phone" size={18} />Numéro de téléphone</div>
        <div className="pf__phone">
          <input
            type="tel"
            className="pf__input"
            aria-label="Numéro de téléphone"
            placeholder="+212620080504"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
          />
          <button
            type="button"
            className="pf__btn pf__btn--primary"
            onClick={onSavePhone}
            disabled={phoneLoading}
          >
            {phoneLoading ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
        {phoneMessage && <Msg type="success" className="pf__msg--in">{phoneMessage}</Msg>}
        {phoneError && <Msg type="error" className="pf__msg--in">{phoneError}</Msg>}
      </div>

      <div className="pf__section pf__section--spaced"><h2>Préférences de notifications</h2></div>
      <div className="pf__card">
        <div className="pf__card-title"><Icon name="bell" size={18} />Notifications par email</div>

        {/* Live toggle — EP-178 */}
        <div className="pf__toggle-row">
          <div>
            <div className="pf__toggle-label">Recevoir les rappels d'événements par email</div>
            <div className="pf__toggle-sub">Un email de rappel est envoyé la veille (J-1) de chaque événement auquel vous êtes inscrit</div>
          </div>
          <button
            type="button"
            className={`pf__toggle${emailReminders ? '' : ' is-off'}`}
            onClick={onToggle}
            disabled={loading}
            aria-pressed={emailReminders}
            aria-label="Activer ou désactiver les rappels email"
          />
        </div>

        {/* Static rows */}
        <div className="pf__toggle-row">
          <div>
            <div className="pf__toggle-label">Être notifié quand une place se libère</div>
            <div className="pf__toggle-sub">Email automatique si vous êtes en liste d'attente et qu'une place devient disponible (valable 24h)</div>
          </div>
          <div className="pf__toggle pf__toggle--static" aria-hidden="true" />
        </div>
        <div className="pf__toggle-row">
          <div>
            <div className="pf__toggle-label">Recevoir les messages des clubs</div>
            <div className="pf__toggle-sub">Notifications email pour les messages envoyés par vos clubs</div>
          </div>
          <div className="pf__toggle pf__toggle--static is-off" aria-hidden="true" />
        </div>
      </div>

      {message && <Msg type="success">{message}</Msg>}
      {error && <Msg type="error">{error}</Msg>}

      <div className="pf__card pf__card--next">
        <div className="pf__card-title"><Icon name="message" size={18} />Rappels WhatsApp</div>
        <div className="pf__toggle-row">
          <div>
            <div className="pf__toggle-label">Recevoir les rappels d'événements par WhatsApp</div>
            <div className="pf__toggle-sub">Un message WhatsApp est envoyé la veille (J-1) de chaque événement auquel vous êtes inscrit</div>
          </div>
          <button
            type="button"
            className={`pf__toggle${whatsappReminders ? '' : ' is-off'}`}
            onClick={onToggleWhatsapp}
            disabled={whatsappLoading}
            aria-pressed={whatsappReminders}
            aria-label="Activer ou désactiver les rappels WhatsApp"
          />
        </div>
        {whatsappMessage && <Msg type="success" className="pf__msg--in">{whatsappMessage}</Msg>}
        {whatsappError && <Msg type="error" className="pf__msg--in">{whatsappError}</Msg>}
      </div>

      {/* ── Google Agenda ── */}
      <div className="pf__section pf__section--spaced"><h2>Intégrations</h2></div>
      <div className="pf__card">
        <div className="pf__card-title"><Icon name="calendar" size={18} />Google Agenda</div>
        <div className="pf__toggle-row">
          <div>
            <div className="pf__toggle-label">Synchroniser avec Google Agenda</div>
            <div className="pf__toggle-sub">
              {calendarConnected
                ? 'Votre Google Agenda est connecté.'
                : 'Connectez votre Google Agenda pour ajouter automatiquement les événements auxquels vous vous inscrivez.'}
            </div>
          </div>
          <button
            type="button"
            className={`pf__btn ${calendarConnected ? 'pf__btn--ghost' : 'pf__btn--primary'} pf__btn--nowrap`}
            onClick={calendarConnected ? onCalendarDisconnect : onCalendarConnect}
          >
            {calendarConnected ? 'Déconnecter' : (<><Icon name="link" size={16} />Connecter</>)}
          </button>
        </div>
        {calendarConnected && (
          <div className="pf__connected">
            <Icon name="checkCircle" size={16} />
            Connecté
          </div>
        )}
      </div>

      {calendarMsg && <Msg type={calendarMsg.type}>{calendarMsg.text}</Msg>}

      <div className="pf__preview-label">Aperçu de l'email de rappel</div>
      <div className="pf__preview">
        <div className="pf__preview-head">
          <Icon name="mail" size={14} />
          Objet : Rappel — Conférence Intelligence Artificielle est demain !
        </div>
        <div className="pf__preview-subject">Rappel — Conférence Intelligence Artificielle est demain !</div>
        <div className="pf__preview-body">
          <div className="pf__preview-logo">Event<span>Campus</span></div>
          <div className="pf__preview-event">Conférence Intelligence Artificielle</div>
          <div className="pf__preview-meta">
            <span><Icon name="calendar" size={14} />Vendredi 4 avril 2025</span>
            <span><Icon name="clock" size={14} />14h00 – 17h00</span>
            <span><Icon name="pin" size={14} />Amphi A, Bâtiment Principal</span>
          </div>
          <button type="button" className="pf__btn pf__btn--primary pf__preview-cta">Voir l'événement</button>
          <div className="pf__preview-unsub">Se désinscrire des rappels</div>
        </div>
      </div>
    </>
  )
}

export default Profile
