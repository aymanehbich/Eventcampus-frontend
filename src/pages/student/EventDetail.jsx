import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { getEvent, registerEvent } from '../../api/events'

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
  const [userState, setUserState] = useState(null) // 'registered' | 'waitlisted' | null

  useEffect(() => {
    fetchEvent()
  }, [id])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      const res = await getEvent(id)
      const eventData = res.data
      setEvent(eventData)

      // Determine user state
      if (eventData.is_registered) {
        setUserState('registered')
      } else if (eventData.is_waitlisted) {
        setUserState('waitlisted')
      } else {
        setUserState(null)
      }
    } catch (err) {
      console.error(err)
      setError('Événement introuvable.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!event) return
    setRegistering(true)
    try {
      await registerEvent(id)
      const isFull = event.places_disponibles <= 0
      setUserState(isFull ? 'waitlisted' : 'registered')
      setEvent(prev => ({
        ...prev,
        is_registered: !isFull,
        is_waitlisted: isFull,
        places_disponibles: Math.max(0, prev.places_disponibles - 1),
      }))
    } catch (err) {
      alert('Une erreur est survenue lors de l\'inscription.')
    } finally {
      setRegistering(false)
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

    // Check if event spans multiple days
    if (startDate && endDate && new Date(startDate).toDateString() !== new Date(endDate).toDateString()) {
      return `${formatDate(endDate)} ${endTime}`
    }
    return endTime
  }

  if (loading) {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#EAEAEF', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '80px', color: '#7A7A8C', fontSize: '14px' }}>
          Chargement...
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#EAEAEF', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '80px', color: '#E94560', fontSize: '14px' }}>
          {error || 'Événement introuvable.'}
        </div>
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
      <div style={{
        padding: '12px 36px',
        fontSize: '12px',
        color: '#7A7A8C',
        background: '#F4F4F6',
        borderBottom: '1px solid #E0E0E6',
      }}>
        <span
          onClick={() => navigate('/student/events')}
          style={{ color: '#E94560', textDecoration: 'none', fontWeight: 600, cursor: 'pointer' }}
        >
          Événements
        </span>
        {' › '}
        <span>{event.titre || event.title}</span>
      </div>

      {/* Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        background: 'white',
        minHeight: 'calc(100vh - 101px)',
      }}>
        {/* Main Content */}
        <div style={{
          padding: '40px 44px',
          borderRight: '1px solid #E0E0E6',
        }}>
          {/* Event Image */}
          <div style={{
            height: '240px',
            borderRadius: '14px',
            background: bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '72px',
            marginBottom: '24px',
          }}>
            {emoji}
          </div>

          {/* Category Tag & Full Badge */}
          <div style={{ marginBottom: '14px' }}>
            <span style={{
              background: tagStyle.bg,
              color: tagStyle.color,
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '5px',
              display: 'inline-block',
              marginRight: '8px',
            }}>
              {cat}
            </span>
            {isFull && (
              <span style={{
                display: 'inline-block',
                background: '#fde8ed',
                color: '#E94560',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '20px',
              }}>
                🔒 Complet
              </span>
            )}
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: '30px',
            color: '#1A1A2E',
            marginBottom: '18px',
          }}>
            {event.titre || event.title}
          </h1>

          {/* Meta Information */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            marginBottom: '28px',
            padding: '20px',
            background: '#F4F4F6',
            borderRadius: '12px',
          }}>
            <div>
              <div style={{
                fontSize: '11px',
                color: '#7A7A8C',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 600,
                marginBottom: '3px',
              }}>
                📅 Date
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#1A1A2E',
              }}>
                {formatDate(event.date)}
              </div>
            </div>

            <div>
              <div style={{
                fontSize: '11px',
                color: '#7A7A8C',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 600,
                marginBottom: '3px',
              }}>
                🕑 Heure
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#1A1A2E',
              }}>
                {formatTime(event.heure)} – {getEndTime(event.date_fin, event.heure_fin)}
              </div>
            </div>

            <div>
              <div style={{
                fontSize: '11px',
                color: '#7A7A8C',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 600,
                marginBottom: '3px',
              }}>
                📍 Lieu
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#1A1A2E',
              }}>
                {event.lieu || 'Lieu TBA'}
              </div>
            </div>

            <div>
              <div style={{
                fontSize: '11px',
                color: '#7A7A8C',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 600,
                marginBottom: '3px',
              }}>
                🏛️ Club organisateur
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#1A1A2E',
              }}>
                {event.club_name || event.club || 'Club'}
              </div>
            </div>
          </div>

          {/* Description */}
          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: '16px',
            color: '#1A1A2E',
            marginBottom: '10px',
          }}>
            Description
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#555',
            lineHeight: '1.8',
          }}>
            {event.description}
          </p>
        </div>

        {/* Sidebar */}
        <div style={{
          padding: '32px 24px',
          background: '#F4F4F6',
          overflowY: 'auto',
        }}>
          {/* Registration Box */}
          <div style={{
            background: 'white',
            borderRadius: '14px',
            border: isFull && userState !== 'registered' ? '1.5px solid #f5c97a' : '1.5px solid #E0E0E6',
            padding: '22px',
            marginBottom: '16px',
          }}>
            <h4 style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#1A1A2E',
              marginBottom: '14px',
            }}>
              Places disponibles
            </h4>

            {userState === 'waitlisted' ? (
              <>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '13px',
                  marginBottom: '8px',
                }}>
                  <span style={{ color: '#E94560', fontWeight: 700 }}>
                    {event.inscrits ?? 0} / {totalPlaces} — Complet
                  </span>
                </div>
                <div style={{
                  background: '#E0E0E6',
                  borderRadius: '4px',
                  height: '8px',
                  overflow: 'hidden',
                  marginBottom: '16px',
                }}>
                  <div style={{
                    height: '100%',
                    background: '#aaa',
                    borderRadius: '4px',
                    width: '100%',
                  }}></div>
                </div>
                <div style={{
                  background: '#fff8ed',
                  border: '1.5px solid #f5c97a',
                  borderRadius: '10px',
                  padding: '14px',
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontFamily: "'Fraunces', serif",
                    fontSize: '22px',
                    color: '#7a4f00',
                    marginBottom: '4px',
                  }}>
                    Vous êtes N°{event.waitlist_position ?? '?'}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#9a6800',
                    lineHeight: '1.5',
                  }}>
                    sur la liste d'attente<br />
                    Vous serez notifié par email dès qu'une place se libère.
                  </div>
                </div>
                <button
                  onClick=""
                  disabled={registering}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    color: '#7A7A8C',
                    border: '1.5px solid #E0E0E6',
                    borderRadius: '10px',
                    padding: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif",
                    cursor: registering ? 'wait' : 'pointer',
                    marginTop: '12px',
                    opacity: registering ? 0.7 : 1,
                  }}
                >
                  Quitter la liste d'attente
                </button>
              </>
            ) : (
              <>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '13px',
                  marginBottom: '8px',
                }}>
                  <span>{event.inscrits ?? 0} inscrits</span>
                  <span style={{
                    color: isFull ? '#E94560' : '#2ECC71',
                    fontWeight: 700,
                  }}>
                    {isFull ? `0 places` : `${event.places_disponibles ?? 0} places restantes`}
                  </span>
                </div>
                <div style={{
                  background: '#E0E0E6',
                  borderRadius: '4px',
                  height: '8px',
                  overflow: 'hidden',
                  marginBottom: '16px',
                }}>
                  <div style={{
                    height: '100%',
                    background: userState === 'registered' ? '#2ECC71' : '#E94560',
                    borderRadius: '4px',
                    width: `${inscriptionPercentage}%`,
                  }}></div>
                </div>

                {userState === 'registered' ? (
                  <button
                    onClick=""
                    disabled={registering}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #2ECC71, #27AE60)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '14px',
                      fontSize: '15px',
                      fontWeight: 700,
                      fontFamily: "'DM Sans', sans-serif",
                      cursor: registering ? 'wait' : 'pointer',
                      marginTop: '16px',
                      opacity: registering ? 0.7 : 1,
                      boxShadow: '0 4px 14px rgba(46, 204, 113, 0.35)',
                      letterSpacing: '0.3px',
                      transition: 'opacity 0.2s',
                    }}
                  >
                    ✓ Inscrit à cet événement
                  </button>
                ) : isFull ? (
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #F39C12, #D68910)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '14px',
                      fontSize: '15px',
                      fontWeight: 700,
                      fontFamily: "'DM Sans', sans-serif",
                      cursor: registering ? 'wait' : 'pointer',
                      marginTop: '16px',
                      opacity: registering ? 0.7 : 1,
                      boxShadow: '0 4px 14px rgba(243, 156, 18, 0.35)',
                      letterSpacing: '0.3px',
                      transition: 'opacity 0.2s',
                    }}
                  >
                    ⏳ Rejoindre la liste d'attente
                  </button>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #E94560, #C0392B)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '15px',
                      fontSize: '15px',
                      fontWeight: 700,
                      fontFamily: "'DM Sans', sans-serif",
                      cursor: registering ? 'wait' : 'pointer',
                      marginTop: '16px',
                      opacity: registering ? 0.7 : 1,
                      boxShadow: '0 4px 14px rgba(233, 69, 96, 0.4)',
                      letterSpacing: '0.3px',
                      transition: 'opacity 0.2s',
                    }}
                  >
                    S'inscrire à cet événement
                  </button>
                )}
              </>
            )}
          </div>

          {/* Organizing Club */}
          <div style={{
            background: 'white',
            borderRadius: '14px',
            border: '1.5px solid #E0E0E6',
            padding: '22px',
          }}>
            <h4 style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#1A1A2E',
              marginBottom: '14px',
            }}>
              Club organisateur
            </h4>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '14px',
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: CATEGORY_COLORS[cat] || '#E6F0FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
              }}>
                {emoji}
              </div>
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#1A1A2E',
                }}>
                  {event.club_name || event.club || 'Club'}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#7A7A8C',
                }}>
                  {event.club_members_count ?? 0} membres · {event.club_events_count ?? 0} événements organisés
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate(`/student/clubs/${event.club_id}`)}
              style={{
                display: 'block',
                width: '100%',
                marginTop: '14px',
                textAlign: 'center',
                background: '#EEF0FF',
                color: '#0F3460',
                border: 'none',
                borderRadius: '8px',
                padding: '9px',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
                fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer',
              }}
            >
              Voir la page du club →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
