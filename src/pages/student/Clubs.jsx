import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { getClubs } from '../../api/clubs'

const CATEGORIES = ['Tous', 'Technologie', 'Culture', 'Sport', 'Environnement', 'Art']

const CATEGORY_COLORS = {
  Technologie: '#E6F0FF',
  Culture: '#FFE6F0',
  Environnement: '#E6FFE6',
  Art: '#F0E6FF',
  Sport: '#E6FFFA',
  default: '#F4F4F6',
}

const CATEGORY_EMOJIS = {
  Technologie: '💡',
  Culture: '🎭',
  Environnement: '🌱',
  Art: '🎵',
  Sport: '⚽',
  default: '🏛️',
}

export default function Clubs() {
  const navigate = useNavigate()
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeCategory, setActiveCategory] = useState('Tous')

  useEffect(() => {
    fetchClubs()
  }, [])

  const fetchClubs = async () => {
    try {
      setLoading(true)
      const res = await getClubs()
      // Support both { data: [...] } and direct array
      setClubs(Array.isArray(res.data) ? res.data : res.data.data || [])
    } catch (err) {
      console.error(err)
      setError('Impossible de charger les clubs.')
    } finally {
      setLoading(false)
    }
  }

  const filtered = activeCategory === 'Tous'
    ? clubs
    : clubs.filter(c => c.categorie === activeCategory || c.category === activeCategory)

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#EAEAEF', minHeight: '100vh' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Fraunces:wght@700;900&display=swap" rel="stylesheet" />

      <Navbar />

      {/* Header */}
      <div style={{ padding: '28px 36px 0', background: '#F4F4F6' }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '26px', color: '#1A1A2E', marginBottom: '18px' }}>
          Tous les clubs du campus
        </h1>
      </div>

      {/* Filtres */}
      <div style={{
        display: 'flex', gap: '10px', padding: '14px 36px',
        background: '#F4F4F6', borderBottom: '1px solid #E0E0E6', flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '13px', color: '#7A7A8C', fontWeight: 600, alignSelf: 'center' }}>
          Catégorie :
        </span>
        {CATEGORIES.map(cat => (
          <span
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', border: '1.5px solid',
              background: activeCategory === cat ? '#E94560' : 'white',
              color: activeCategory === cat ? 'white' : '#7A7A8C',
              borderColor: activeCategory === cat ? '#E94560' : '#E0E0E6',
              transition: 'all 0.15s',
            }}
          >
            {cat}
          </span>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '28px 36px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#7A7A8C', fontSize: '14px' }}>
            Chargement des clubs...
          </div>
        )}
        {error && (
          <div style={{
            textAlign: 'center', padding: '60px', color: '#E94560', fontSize: '14px',
          }}>
            {error}
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#7A7A8C', fontSize: '14px' }}>
            Aucun club trouvé.
          </div>
        )}
        {!loading && !error && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '22px',
          }}>
            {filtered.map(club => {
              const cat = club.categorie || club.category || 'default'
              const bgColor = CATEGORY_COLORS[cat] || CATEGORY_COLORS.default
              const emoji = CATEGORY_EMOJIS[cat] || CATEGORY_EMOJIS.default
              return (
                <div
                  key={club.id}
                  style={{
                    background: 'white', border: '1.5px solid #E0E0E6', borderRadius: '14px',
                    padding: '26px', textAlign: 'center',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.transform = 'none'
                  }}
                >
                  <div style={{
                    width: '68px', height: '68px', borderRadius: '50%', margin: '0 auto 14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '30px', background: bgColor,
                  }}>
                    {club.emoji || emoji}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A2E', marginBottom: '4px' }}>
                    {club.nom || club.name}
                  </div>
                  <div style={{
                    fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.5px', color: '#7A7A8C', marginBottom: '6px',
                  }}>
                    {cat}
                  </div>
                  <div style={{ fontSize: '12px', color: '#7A7A8C', marginBottom: '4px' }}>
                    {club.membres_count ?? club.members_count ?? 0} membres
                  </div>
                  <div style={{ fontSize: '12px', color: '#0F3460', fontWeight: 600, marginBottom: '12px' }}>
                    📅 {club.evenements_count ?? club.events_count ?? 0} événements organisés
                  </div>
                  <div style={{
                    fontSize: '13px', color: '#7A7A8C', lineHeight: '1.6', marginBottom: '16px',
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {club.description}
                  </div>
                  <button
                    onClick={() => navigate(`/student/clubs/${club.id}`)}
                    style={{
                      width: '100%', padding: '10px', borderRadius: '8px', fontSize: '13px',
                      fontWeight: 600, cursor: 'pointer', border: 'none',
                      fontFamily: "'DM Sans', sans-serif", background: '#E94560', color: 'white',
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    Voir le club
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}