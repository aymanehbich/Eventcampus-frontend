import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { getEvent, registerEvent, unregisterEvent } from '../../api/events'
import { addEventToCalendar } from '../../api/googleCalendar'

const CATEGORY_COLORS = {
  Conférence: '#FFF0E6',
  Atelier: '#E6F0FF',
  Soirée: '#FFE6F0',
  'Réunion de club': '#F0E6FF',
  Hackathon: '#E6FFE6',
  Environnement: '#E6FFFA',
  default: '#F4F4F6',
}

const CATEGORY_EMOJIS = {
  Conférence: '🎤',
  Atelier: '🎨',
  Soirée: '🎭',
  'Réunion de club': '👥',
  Hackathon: '👨‍💻',
  Environnement: '🌱',
  default: '📅',
}

const CATEGORY_TAGS = {
  Conférence: { bg: '#EEF0FF', color: '#4A4AE8' },
  Atelier: { bg: '#EEF0FF', color: '#4A4AE8' },
  Soirée: { bg: '#fff3e0', color: '#a05000' },
  'Réunion de club': { bg: '#EEF0FF', color: '#4A4AE8' },
  Hackathon: { bg: '#EEF0FF', color: '#4A4AE8' },
  Environnement: { bg: '#e8faf3', color: '#1a7a47' },
  default: { bg: '#EEF0FF', color: '#4A4AE8' },
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
    try {
      const res = await addEventToCalendar(id)
      if (res.data.calendar_added) {
        setCalendarAdded(true)
        setCalendarMsg({ type: 'success', text: '📅 Ajouté à votre Google Agenda !' })
      } else {
        setCalendarMsg({ type: 'info', text: '💡 Connectez votre Google Agenda dans votre profil pour l\'ajouter.' })
      }
    } catch {
      setCalendarMsg({ type: 'error', text: 'Impossible d\'ajouter à Google Agenda.' })
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
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#EAEAEF', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '80px', color: '#7A7A8C', fontSize: '14px' }}>Chargement...</div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#EAEAEF', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '80px', color: '#E94560', fontSize: '14px' }}>{error || 'Événement introuvable.'}</div>
      </div>
    )
  }

  const cat = event.categorie || event.category || 'default'
  const bgColor = CATEGORY_COLORS[cat] || CATEGORY_COLORS.default
  const emoji = CATEGORY_EMOJIS[cat] || CATEGORY_EMOJIS.default
  const tagStyle = CATEGORY_TAGS[cat] || CATEGORY_TAGS.default
  const isFull = event.places_disponibles <= 0
  const totalPlaces = (event.inscrits ?? 0) + (event.places_disponibles ?? 0)
  const inscriptionPercentage = totalPlaces > 0 ? ((event.inscrits ?? 0) / totalPlaces) * 100 : 0

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#EAEAEF', minHeight: '100vh' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Fraunces:wght@700;900&display=swap" rel="stylesheet" />
      <Navbar />

      {/* Breadcrumb */}
      <div style={{ padding: '12px 36px', fontSize: '12px', color: '#7A7A8C', background: '#F4F4F6', borderBottom: '1px solid #E0E0E6' }}>
        <span onClick={() => navigate('/student/events')} style={{ color: '#E94560', fontWeight: 600, cursor: 'pointer' }}>Événements</span>
        {' › '}
        <span>{event.titre || event.title}</span>
      </div>

      {/* Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', background: 'white', minHeight: 'calc(100vh - 101px)' }}>
        {/* Main Content */}
        <div style={{ padding: '40px 44px', borderRight: '1px solid #E0E0E6' }}>
          <div style={{ height: '240px', borderRadius: '14px', background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '72px', marginBottom: '24px' }}>{emoji}</div>
          <div style={{ marginBottom: '14px' }}>
            <span style={{ background: tagStyle.bg, color: tagStyle.color, fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '5px', display: 'inline-block', marginRight: '8px' }}>{cat}</span>
            {isFull && <span style={{ display: 'inline-block', background: '#fde8ed', color: '#E94560', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' }}>🔒 Complet</span>}
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '30px', color: '#1A1A2E', marginBottom: '18px' }}>{event.titre || event.title}</h1>
          
          {/* Meta Info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '28px', padding: '20px', background: '#F4F4F6', borderRadius: '12px' }}>
            <div><div style={{ fontSize: '11px', color: '#7A7A8C', fontWeight: 600 }}>📅 Date</div><div style={{ fontSize: '14px', fontWeight: 600 }}>{formatDate(event.date)}</div></div>
            <div><div style={{ fontSize: '11px', color: '#7A7A8C', fontWeight: 600 }}>🕑 Heure</div><div style={{ fontSize: '14px', fontWeight: 600 }}>{formatTime(event.heure)} – {getEndTime(event.date_fin, event.heure_fin)}</div></div>
            <div><div style={{ fontSize: '11px', color: '#7A7A8C', fontWeight: 600 }}>📍 Lieu</div><div style={{ fontSize: '14px', fontWeight: 600 }}>{event.lieu || 'Lieu TBA'}</div></div>
            <div><div style={{ fontSize: '11px', color: '#7A7A8C', fontWeight: 600 }}>🏛️ Club</div><div style={{ fontSize: '14px', fontWeight: 600 }}>{event.club_name || event.club || 'Club'}</div></div>
          </div>

          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', color: '#1A1A2E', marginBottom: '10px' }}>Description</h2>
          <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.8' }}>{event.description}</p>
        </div>

        {/* Sidebar */}
        <div style={{ padding: '32px 24px', background: '#F4F4F6', overflowY: 'auto' }}>
          <div style={{ background: 'white', borderRadius: '14px', border: isFull && userState !== 'registered' ? '1.5px solid #f5c97a' : '1.5px solid #E0E0E6', padding: '22px', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A2E', marginBottom: '14px' }}>Places disponibles</h4>

            {event.statut === 'En attente' ? (
              <div style={{ background: '#FFF4E6', border: '1.5px solid #FFB347', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏱️</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#FF9500', marginBottom: '6px' }}>
                  En attente d'approbation
                </div>
                <div style={{ fontSize: '12px', color: '#FF9500', lineHeight: '1.5' }}>
                  Cet événement est en attente d'approbation de l'administrateur.
                  <br />
                  Les inscriptions seront ouvertes dès qu'il sera approuvé.
                </div>
              </div>
            ) : userState === 'waitlisted' ? (
              // --- BLOC LISTE D'ATTENTE MIS À JOUR (Branche 3) ---
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                  <span style={{ color: '#E94560', fontWeight: 700 }}>
                    {event.inscrits ?? 0} / {totalPlaces} — Complet
                  </span>
                </div>
                <div style={{ background: '#E0E0E6', borderRadius: '4px', height: '8px', overflow: 'hidden', marginBottom: '16px' }}>
                  <div style={{ height: '100%', background: '#ccc', borderRadius: '4px', width: '100%' }} />
                </div>

                <div style={{ background: '#fff8ed', border: '1.5px solid #f5c97a', borderRadius: '10px', padding: '18px 14px', textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: '28px', color: '#7a4f00', fontWeight: 900, marginBottom: '2px' }}>
                    Vous êtes N°{waitlistPosition ?? '?'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9a6800', lineHeight: '1.5', marginBottom: '10px' }}>
                    sur la liste d'attente
                    {waitlistTotal && <span style={{ color: '#bfa050' }}> ({waitlistTotal} personnes)</span>}
                    <br />
                    Vous serez notifié dès qu'une place se libère.
                  </div>

                  {waitlistPosition && waitlistTotal && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9a6800', marginBottom: '4px' }}>
                        <span>Position</span>
                        <span>{waitlistPosition} / {waitlistTotal}</span>
                      </div>
                      <div style={{ background: '#f5e2b0', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          background: '#f5c97a',
                          width: `${100 - ((waitlistPosition - 1) / waitlistTotal) * 100}%`,
                          transition: 'width 0.4s ease',
                        }} />
                      </div>
                      <div style={{ fontSize: '11px', color: '#9a6800', marginTop: '4px', textAlign: 'right' }}>
                        {waitlistPosition === 1 ? '🎉 Prochain sur la liste !' : `${waitlistPosition - 1} personne(s) avant vous`}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleUnregister}
                  disabled={registering}
                  style={{ width: '100%', background: 'transparent', color: '#7A7A8C', border: '1.5px solid #E0E0E6', borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginTop: '12px' }}
                >
                  Quitter la liste d'attente
                </button>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                  <span>{event.inscrits ?? 0} inscrits</span>
                  <span style={{ color: isFull ? '#E94560' : '#2ECC71', fontWeight: 700 }}>
                    {isFull ? `0 places` : `${event.places_disponibles ?? 0} restantes`}
                  </span>
                </div>
                <div style={{ background: '#E0E0E6', borderRadius: '4px', height: '8px', overflow: 'hidden', marginBottom: '16px' }}>
                  <div style={{ height: '100%', background: userState === 'registered' ? '#2ECC71' : '#E94560', width: `${inscriptionPercentage}%` }} />
                </div>

                {userState === 'registered' ? (
                  <>
                    <button onClick={handleUnregister} disabled={registering} style={{ width: '100%', background: 'linear-gradient(135deg, #2ECC71, #27AE60)', color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', marginTop: '16px' }}>
                      ✓ Inscrit (Annuler ?)
                    </button>
                    <button
                      onClick={handleAddToCalendar}
                      disabled={addingToCalendar || calendarAdded}
                      style={{
                        width: '100%',
                        background: calendarAdded ? '#E8F8F0' : 'white',
                        color: calendarAdded ? '#1a7a47' : '#4A4AE8',
                        border: `1.5px solid ${calendarAdded ? '#b2dfcd' : '#c5caf5'}`,
                        borderRadius: '10px',
                        padding: '10px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: calendarAdded ? 'default' : 'pointer',
                        marginTop: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      {calendarAdded ? '✓ Ajouté au Google Agenda' : addingToCalendar ? 'Ajout en cours...' : '📅 Ajouter à Google Agenda'}
                    </button>
                    {calendarMsg && (
                      <div style={{
                        marginTop: '10px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 500,
                        background: calendarMsg.type === 'success' ? '#E8F8F0' : '#EEF0FF',
                        color: calendarMsg.type === 'success' ? '#1a7a47' : '#4A4AE8',
                        border: `1px solid ${calendarMsg.type === 'success' ? '#b2dfcd' : '#c5caf5'}`,
                      }}>
                        {calendarMsg.text}
                      </div>
                    )}
                  </>
                ) : isFull ? (
                  <button onClick={handleRegister} disabled={registering} style={{ width: '100%', background: 'linear-gradient(135deg, #F39C12, #D68910)', color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', marginTop: '16px' }}>
                    ⏳ Rejoindre la liste d'attente
                  </button>
                ) : (
                  <button onClick={handleRegister} disabled={registering} style={{ width: '100%', background: 'linear-gradient(135deg, #E94560, #C0392B)', color: 'white', border: 'none', borderRadius: '12px', padding: '15px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', marginTop: '16px' }}>
                    S'inscrire à cet événement
                  </button>
                )}
              </>
            )}
          </div>

          {/* Organizing Club Box */}
          <div style={{ background: 'white', borderRadius: '14px', border: '1.5px solid #E0E0E6', padding: '22px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '14px' }}>Club organisateur</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>{emoji}</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{event.club_name || 'Club'}</div>
                <div style={{ fontSize: '12px', color: '#7A7A8C' }}>{event.club_members_count ?? 0} membres</div>
              </div>
            </div>
            <button onClick={() => navigate(`/student/clubs/${event.club_id}`)} style={{ display: 'block', width: '100%', marginTop: '14px', background: '#EEF0FF', color: '#0F3460', border: 'none', borderRadius: '8px', padding: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              Voir la page du club →
              
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}