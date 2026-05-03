import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { getEvents } from '../../api/events'

const EVENT_CATEGORIES = ['Tous', 'Conférence', 'Atelier', 'Soirée', 'Réunion de club']
const EVENT_DATES = ['Tous', 'Cette semaine', 'Ce mois']

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

export default function Events() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeCategory, setActiveCategory] = useState('Tous')
  const [activeDate, setActiveDate] = useState('Tous')
  const [searchQuery, setSearchQuery] = useState('')
  const [clubs, setClubs] = useState([])
  const [activeClub, setActiveClub] = useState('Tous les clubs')

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const res = await getEvents()
      // Support both { data: [...] } and direct array
      const eventsList = Array.isArray(res.data) ? res.data : res.data.data || []
      setEvents(eventsList)

      // Extract unique clubs from events
      const uniqueClubs = ['Tous les clubs', ...new Set(eventsList.map(e => e.club_name || e.club).filter(Boolean))]
      setClubs(uniqueClubs)
    } catch (err) {
      console.error(err)
      setError('Impossible de charger les événements.')
    } finally {
      setLoading(false)
    }
  }
  
  const filterEventsByDate = (event) => {
    if (activeDate === 'Tous') return true

    const eventDate = new Date(event.date)
    const today = new Date()
    const endOfWeek = new Date(today)
    endOfWeek.setDate(endOfWeek.getDate() + 7)
    const endOfMonth = new Date(today)
    endOfMonth.setMonth(endOfMonth.getMonth() + 1)

    if (activeDate === 'Cette semaine') {
      return eventDate <= endOfWeek && eventDate >= today
    }
    if (activeDate === 'Ce mois') {
      return eventDate <= endOfMonth && eventDate >= today
    }

    return true
  }

  const filtered = events
    .filter(e => {
      const cat = e.categorie || e.category || 'default'
      return activeCategory === 'Tous' || cat === activeCategory
    })
    .filter(e => {
      const club = e.club_name || e.club || ''
      return activeClub === 'Tous les clubs' || club === activeClub
    })
    .filter(filterEventsByDate)
    .filter(e => {
      const title = (e.titre || e.title || '').toLowerCase()
      const desc = (e.description || '').toLowerCase()
      return title.includes(searchQuery.toLowerCase()) || desc.includes(searchQuery.toLowerCase())
    })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const options = { weekday: 'long', day: 'numeric', month: 'short' }
    return date.toLocaleDateString('fr-FR', options).replace(/^\w/, (c) => c.toUpperCase())
  }

  const formatTime = (timeString) => {
    if (!timeString) return ''
    return timeString.substring(0, 5)
  }

  const handleResetFilters = () => {
  setActiveCategory('Tous');
  setActiveDate('Tous');
  setActiveClub('Tous les clubs');
  setSearchQuery('');
};

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#EAEAEF', minHeight: '100vh' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Fraunces:wght@700;900&display=swap" rel="stylesheet" />

      <Navbar />

      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #1A1A2E 60%, #16213e)',
        color: 'white',
        padding: '56px 36px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: '38px',
          marginBottom: '12px',
        }}>
          Tous les événements du campus
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: '15px',
          maxWidth: '460px',
          margin: '0 auto 24px',
        }}>
          Conférences, soirées, ateliers, réunions de clubs — tout au même endroit.
        </p>
        <div style={{
          display: 'flex',
          maxWidth: '480px',
          margin: '0 auto',
          background: 'white',
          borderRadius: '10px',
          overflow: 'hidden',
        }}>
          <input
            type="text"
            placeholder="Rechercher un événement…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              padding: '13px 18px',
              fontSize: '14px',
              fontFamily: "'DM Sans', sans-serif",
              color: '#1A1A2E',
              outline: 'none',
            }}
          />
          <button
            style={{
              background: '#E94560',
              color: 'white',
              border: 'none',
              padding: '13px 22px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Rechercher
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '10px',
        padding: '16px 36px',
        background: '#F4F4F6',
        borderBottom: '1px solid #E0E0E6',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: '13px', color: '#7A7A8C', fontWeight: 600 }}>
          Catégorie :
        </span>
        {EVENT_CATEGORIES.map(cat => (
          <span
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1.5px solid',
              background: activeCategory === cat ? '#E94560' : 'white',
              color: activeCategory === cat ? 'white' : '#7A7A8C',
              borderColor: activeCategory === cat ? '#E94560' : '#E0E0E6',
              transition: 'all 0.15s',
            }}
          >
            {cat}
          </span>
        ))}

        {/* Date filters */}
        <span style={{ fontSize: '13px', color: '#7A7A8C', fontWeight: 600, marginLeft: '24px' }}>
          Date :
        </span>
        {EVENT_DATES.map(date => (
          <span
            key={date}
            onClick={() => setActiveDate(date)}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1.5px solid',
              background: activeDate === date ? '#E94560' : 'white',
              color: activeDate === date ? 'white' : '#7A7A8C',
              borderColor: activeDate === date ? '#E94560' : '#E0E0E6',
              transition: 'all 0.15s',
            }}
          >
            {date}
          </span>
        ))}

        {/* Club filters */}
        <span style={{ fontSize: '13px', color: '#7A7A8C', fontWeight: 600, marginLeft: '24px' }}>
          Club :
        </span>
        {clubs.slice(0, 3).map(club => (
          <span
            key={club}
            onClick={() => setActiveClub(club)}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1.5px solid',
              background: activeClub === club ? '#E94560' : 'white',
              color: activeClub === club ? 'white' : '#7A7A8C',
              borderColor: activeClub === club ? '#E94560' : '#E0E0E6',
              transition: 'all 0.15s',
            }}
          >
            {club}
          </span>
        ))}

              {/* Bouton de réinitialisation */}
      {(activeCategory !== 'Tous' || activeDate !== 'Tous' || activeClub !== 'Tous les clubs' || searchQuery !== '') && (
        <button
          onClick={handleResetFilters}
          style={{
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            border: '1.5px solid #E94560',
            background: 'white',
            color: '#E94560',
            marginLeft: '10px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#fde8ed';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
          }}
        >
          ✕ Réinitialiser
        </button>
      )}
      </div>


      {/* Content */}
      <div style={{ padding: '28px 36px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#7A7A8C', fontSize: '14px' }}>
            Chargement des événements...
          </div>
        )}
        {error && (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            color: '#E94560',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#7A7A8C', fontSize: '14px' }}>
            Aucun événement trouvé.
          </div>
        )}
        {!loading && !error && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
          }}>
            {filtered.map(event => {
              const cat = event.categorie || event.category || 'default'
              const bgColor = CATEGORY_COLORS[cat] || CATEGORY_COLORS.default
              const emoji = CATEGORY_EMOJIS[cat] || CATEGORY_EMOJIS.default
              const tagStyle = CATEGORY_TAGS[cat] || CATEGORY_TAGS.default

          

              return (
                <div
                  key={event.id}
                  style={{
                    background: 'white',
                    border: '1.5px solid #E0E0E6',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.transform = 'none'
                  }}
                  onClick={() => navigate(`/student/events/${event.id}`)}
                >
                  {/* Image/Emoji Section */}
                  <div style={{
                    height: '130px',
                    background: bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '42px',
                  }}>
                    {emoji}
                  </div>

                  {/* Content */}
                  <div style={{ padding: '16px' }}>
                    <div style={{
                      fontSize: '11px',
                      color: '#7A7A8C',
                      marginBottom: '5px',
                    }}>
                      📅 {formatDate(event.date)} · {formatTime(event.heure)} &nbsp;|&nbsp; 📍 {event.lieu || 'Lieu TBA'}
                    </div>

                    <div style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#1A1A2E',
                      marginBottom: '6px',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {event.titre || event.title}
                    </div>

                    <div style={{
                      fontSize: '12px',
                      color: '#7A7A8C',
                      lineHeight: '1.6',
                      marginBottom: '12px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {event.description}
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <span style={{
                        background: tagStyle.bg,
                        color: tagStyle.color,
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '3px 9px',
                        borderRadius: '4px',
                      }}>
                        {cat}
                      </span>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}>
                        <span style={{
                          fontSize: '11px',
                          color: '#7A7A8C',
                        }}>
                          {event.places_disponibles ?? 'Ouvert à tous'} places
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/student/events/${event.id}`)
                          }}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            border: 'none',
                            fontFamily: "'DM Sans', sans-serif",
                            background: '#E94560',
                            color: 'white',
                            transition: 'opacity 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                          S'inscrire
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
