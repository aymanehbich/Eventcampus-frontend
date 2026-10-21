import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { getEvent, registerEvent, unregisterEvent } from '../../api/events'
import { addEventToCalendar } from '../../api/googleCalendar'
import { Icon } from './StudentIcons'
import './EventDetail.css'

const CATEGORY_TONES = {
  Conférence: 'terra',
  Atelier: 'mint',
  Soirée: 'sand',
  'Réunion de club': 'mint',
  Hackathon: 'mint',
  Environnement: 'mint',
  default: 'sand',
}

const CATEGORY_ICONS = {
  Conférence: 'mic',
  Atelier: 'palette',
  Soirée: 'sparkles',
  'Réunion de club': 'users',
  Hackathon: 'code',
  Environnement: 'leaf',
  default: 'calendar',
}

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [registering, setRegistering] = useState(false)

  // États mis à jour (Branche 3)
  const [userState, setUserState] = useState(null) // 'registered' | 'waitlisted' | null
  const [waitlistPosition, setWaitlistPosition] = useState(null)
  const [waitlistTotal, setWaitlistTotal] = useState(null)
  const [calendarMsg, setCalendarMsg] = useState(null) // { type: 'success'|'info', text: string }
  const [addingToCalendar, setAddingToCalendar] = useState(false)
  const [calendarAdded, setCalendarAdded] = useState(false)
  const [calendarNotConnected, setCalendarNotConnected] = useState(false)

  useEffect(() => {
    fetchEvent()
  }, [id])

  // fetchEvent mis à jour (Branche 3)
  const fetchEvent = async () => {
    try {
      setLoading(true)
      const res = await getEvent(id)
      const eventData = res.data
      setEvent(eventData)

      if (eventData.is_registered) {
        setUserState('registered')
        setCalendarAdded(eventData.calendar_added ?? false)
      } else if (eventData.is_waitlisted) {
        setUserState('waitlisted')
        setWaitlistPosition(eventData.waitlist_position ?? null)
        setWaitlistTotal(eventData.waitlist_total ?? null)
      } else {
        setUserState(null)
      }
      return eventData
    } catch (err) {
      console.error(err)
      setError('Événement introuvable.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!event) return

    if (event.statut === 'En attente') {
      alert('Cet événement est en attente d\'approbation de l\'admin. Vous ne pouvez pas vous inscrire pour le moment.')
      return
    }

    setRegistering(true)
    try {
      await registerEvent(id)
      // On rafraîchit les données pour avoir les positions exactes de la liste d'attente
      await fetchEvent()
    } catch (err) {
      alert('Une erreur est survenue lors de l\'inscription.')
    } finally {
      setRegistering(false)
    }
  }

  // Ajout de handleUnregister (Branche 3)
  const handleUnregister = async () => {
    if (!event) return
    setRegistering(true)
    try {
      await unregisterEvent(id)
      setUserState(null)
      setWaitlistPosition(null)
      setWaitlistTotal(null)
      // Rafraîchir pour mettre à jour le nombre de places dispo
      fetchEvent()
    } catch (err) {
      alert('Une erreur est survenue.')
    } finally {
      setRegistering(false)
    }
  }

  const handleAddToCalendar = async () => {
    setAddingToCalendar(true)
    setCalendarNotConnected(false)
    try {
      const res = await addEventToCalendar(id)
      if (res.data.calendar_added) {
        setCalendarAdded(true)
        setCalendarMsg({ type: 'success', text: 'Ajouté à votre Google Agenda !' })
      } else if (res.data.not_connected) {
        setCalendarNotConnected(true)
      } else {
        setCalendarMsg({ type: 'error', text: "Impossible d'ajouter l'événement au calendrier." })
      }
    } catch {
      setCalendarMsg({ type: 'error', text: "Impossible d'ajouter l'événement au calendrier." })
    } finally {
      setAddingToCalendar(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
    return date.toLocaleDateString('fr-FR', options).replace(/^\w/, (c) => c.toUpperCase())
  }

  const formatTime = (timeString) => {
    if (!timeString) return ''
    return timeString.substring(0, 5)
  }

  const getEndTime = (endDateString, endTimeString) => {
    const startDate = event?.date
    const endDate = endDateString
    const endTime = formatTime(endTimeString)
    if (startDate && endDate && new Date(startDate).toDateString() !== new Date(endDate).toDateString()) {
      return `${formatDate(endDate)} ${endTime}`
    }
    return endTime
  }

  if (loading) {
    return (
      <div className="ed">
        <Navbar />
        <div className="ed__state" role="status">Chargement...</div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="ed">
        <Navbar />
        <div className="ed__state ed__state--error" role="alert">{error || 'Événement introuvable.'}</div>
      </div>
    )
  }

  const cat = event.categorie || event.category || 'default'
  const tone = CATEGORY_TONES[cat] || CATEGORY_TONES.default
  const icon = CATEGORY_ICONS[cat] || CATEGORY_ICONS.default
  const isFull = event.places_disponibles <= 0
  const totalPlaces = (event.inscrits ?? 0) + (event.places_disponibles ?? 0)
  const inscriptionPercentage = totalPlaces > 0 ? ((event.inscrits ?? 0) / totalPlaces) * 100 : 0

  return (
    <div className="ed">
      <Navbar />

      <main className="ed__wrap">
        {/* Breadcrumb */}
        <nav className="ed__crumbs" aria-label="Fil d'Ariane">
          <button type="button" className="ed__crumb-link" onClick={() => navigate('/student/events')}>
            Événements
          </button>
          <Icon name="chevronRight" size={14} />
          <span className="ed__crumb-current" aria-current="page">{event.titre || event.title}</span>
        </nav>

        <div className="ed__layout">
          {/* Main Content */}
          <article className="ed__main">
            <div className={`ed__cover ed__cover--${tone}`}>
              <Icon name={icon} size={72} />
            </div>
            <div className="ed__badges">
              <span className={`ed__cat ed__cat--${tone}`}>{cat}</span>
              {isFull && (
                <span className="ed__cat ed__cat--red">
                  <Icon name="lock" size={12} />
                  Complet
                </span>
              )}
            </div>
            <h1 className="ed__title">{event.titre || event.title}</h1>

            {/* Meta Info */}
            <dl className="ed__meta">
              <div className="ed__meta-item">
                <dt><Icon name="calendar" size={15} />Date</dt>
                <dd>{formatDate(event.date)}</dd>
              </div>
              <div className="ed__meta-item">
                <dt><Icon name="clock" size={15} />Heure</dt>
                <dd>{formatTime(event.heure)} – {getEndTime(event.date_fin, event.heure_fin)}</dd>
              </div>
              <div className="ed__meta-item">
                <dt><Icon name="pin" size={15} />Lieu</dt>
                <dd>{event.lieu || 'Lieu TBA'}</dd>
              </div>
              <div className="ed__meta-item">
                <dt><Icon name="landmark" size={15} />Club</dt>
                <dd>{event.club_name || event.club || 'Club'}</dd>
              </div>
            </dl>

            <h2 className="ed__h2">Description</h2>
            <p className="ed__desc">{event.description}</p>
          </article>

          {/* Sidebar */}
          <aside className="ed__side">
            <section className={`ed__widget${isFull && userState !== 'registered' ? ' ed__widget--warn' : ''}`}>
              <h2 className="ed__widget-title">Places disponibles</h2>

              {event.statut === 'En attente' ? (
                <div className="ed__pending">
                  <Icon name="hourglass" size={26} />
                  <div className="ed__pending-title">En attente d'approbation</div>
                  <div className="ed__pending-text">
                    Cet événement est en attente d'approbation de l'administrateur.
                    <br />
                    Les inscriptions seront ouvertes dès qu'il sera approuvé.
                  </div>
                </div>
              ) : userState === 'waitlisted' ? (
                // --- BLOC LISTE D'ATTENTE MIS À JOUR (Branche 3) ---
                <>
                  <div className="ed__row">
                    <span className="ed__full">
                      {event.inscrits ?? 0} / {totalPlaces} — Complet
                    </span>
                  </div>
                  <div className="ed__bar">
                    <div className="ed__bar-fill ed__bar-fill--gray" style={{ width: '100%' }} />
                  </div>

                  <div className="ed__wait">
                    <div className="ed__wait-rank">
                      Vous êtes N°{waitlistPosition ?? '?'}
                    </div>
                    <div className="ed__wait-text">
                      sur la liste d'attente
                      {waitlistTotal && <span> ({waitlistTotal} personnes)</span>}
                      <br />
                      Vous serez notifié dès qu'une place se libère.
                    </div>

                    {waitlistPosition && waitlistTotal && (
                      <div className="ed__wait-progress">
                        <div className="ed__wait-line">
                          <span>Position</span>
                          <span>{waitlistPosition} / {waitlistTotal}</span>
                        </div>
                        <div className="ed__bar ed__bar--thin">
                          <div
                            className="ed__bar-fill ed__bar-fill--amber"
                            style={{ width: `${100 - ((waitlistPosition - 1) / waitlistTotal) * 100}%` }}
                          />
                        </div>
                        <div className="ed__wait-next">
                          {waitlistPosition === 1
                            ? (<><Icon name="gift" size={14} />Prochain sur la liste !</>)
                            : `${waitlistPosition - 1} personne(s) avant vous`}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="ed__btn ed__btn--ghost ed__btn--block"
                    onClick={handleUnregister}
                    disabled={registering}
                  >
                    Quitter la liste d'attente
                  </button>
                </>
              ) : (
                <>
                  <div className="ed__row">
                    <span>{event.inscrits ?? 0} inscrits</span>
                    <span className={isFull ? 'ed__left ed__left--none' : 'ed__left'}>
                      {isFull ? `0 places` : `${event.places_disponibles ?? 0} restantes`}
                    </span>
                  </div>
                  <div className="ed__bar">
                    <div
                      className={`ed__bar-fill${userState === 'registered' ? '' : ' ed__bar-fill--terra'}`}
                      style={{ width: `${inscriptionPercentage}%` }}
                    />
                  </div>

                  {userState === 'registered' ? (
                    <>
                      <button
                        type="button"
                        className="ed__btn ed__btn--primary ed__btn--block ed__btn--lg"
                        onClick={handleUnregister}
                        disabled={registering}
                      >
                        <Icon name="check" size={18} />
                        Inscrit (Annuler ?)
                      </button>
                      <button
                        type="button"
                        className={`ed__btn ed__btn--block ${calendarAdded ? 'ed__btn--done' : 'ed__btn--outline'}`}
                        onClick={handleAddToCalendar}
                        disabled={addingToCalendar || calendarAdded}
                      >
                        {calendarAdded
                          ? (<><Icon name="check" size={16} />Ajouté au Google Agenda</>)
                          : addingToCalendar
                            ? 'Ajout en cours...'
                            : (<><Icon name="calendar" size={16} />Ajouter à Google Agenda</>)}
                      </button>
                      {calendarNotConnected && (
                        <div className="ed__notice">
                          <div className="ed__notice-title">
                            <Icon name="calendar" size={15} />
                            Google Agenda non connecté
                          </div>
                          <div className="ed__notice-text">
                            Connectez votre compte pour ajouter vos événements automatiquement.
                          </div>
                          <button
                            type="button"
                            className="ed__btn ed__btn--amber ed__btn--block ed__btn--sm"
                            onClick={() => navigate('/student/profile?tab=Préférences')}
                          >
                            Connecter Google Agenda
                            <Icon name="arrowRight" size={14} />
                          </button>
                        </div>
                      )}
                      {calendarMsg && (
                        <div
                          className={`ed__alert ${calendarMsg.type === 'success' ? 'ed__alert--success' : 'ed__alert--error'}`}
                          role="status"
                        >
                          {calendarMsg.text}
                        </div>
                      )}
                    </>
                  ) : isFull ? (
                    <button
                      type="button"
                      className="ed__btn ed__btn--amber ed__btn--block ed__btn--lg"
                      onClick={handleRegister}
                      disabled={registering}
                    >
                      <Icon name="hourglass" size={18} />
                      Rejoindre la liste d'attente
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="ed__btn ed__btn--terra ed__btn--block ed__btn--lg"
                      onClick={handleRegister}
                      disabled={registering}
                    >
                      S'inscrire à cet événement
                    </button>
                  )}
                </>
              )}
            </section>

            {/* Organizing Club Box */}
            <section className="ed__widget">
              <h2 className="ed__widget-title">Club organisateur</h2>
              <div className="ed__club">
                <div className={`ed__club-ico ed__cover--${tone}`}><Icon name={icon} size={22} /></div>
                <div>
                  <div className="ed__club-name">{event.club_name || 'Club'}</div>
                  <div className="ed__club-count">{event.club_members_count ?? 0} membres</div>
                </div>
              </div>
              <button
                type="button"
                className="ed__btn ed__btn--soft ed__btn--block"
                onClick={() => navigate(`/student/clubs/${event.club_id}`)}
              >
                Voir la page du club
                <Icon name="arrowRight" size={14} />
              </button>
            </section>
          </aside>
        </div>
      </main>
    </div>
  )
}
