import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { getClubs } from '../../api/clubs'
import { Icon } from './StudentIcons'
import './Clubs.css'

const CATEGORIES = ['Tous', 'Technologie', 'Culture', 'Sport', 'Environnement', 'Art']

const CATEGORY_TONES = {
  Technologie: 'mint',
  Culture: 'sand',
  Environnement: 'mint',
  Art: 'terra',
  Sport: 'sand',
  default: 'sand',
}

const CATEGORY_ICONS = {
  Technologie: 'lightbulb',
  Culture: 'book',
  Environnement: 'leaf',
  Art: 'music',
  Sport: 'trophy',
  default: 'landmark',
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
    <div className="cl">
      <Navbar />

      <main className="cl__wrap">
        <header className="cl__head">
          <h1 className="cl__title">Tous les clubs du campus</h1>
        </header>

        {/* Filtres */}
        <div className="cl__filters" role="group" aria-label="Filtrer par catégorie">
          <span className="cl__filters-label">Catégorie :</span>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              className={`cl__chip${activeCategory === cat ? ' is-active' : ''}`}
              aria-pressed={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading && <div className="cl__state" role="status">Chargement des clubs...</div>}
        {error && <div className="cl__state cl__state--error" role="alert">{error}</div>}
        {!loading && !error && filtered.length === 0 && (
          <div className="cl__state">Aucun club trouvé.</div>
        )}
        {!loading && !error && (
          <div className="cl__grid">
            {filtered.map(club => {
              const cat = club.categorie || club.category || 'default'
              const tone = CATEGORY_TONES[cat] || CATEGORY_TONES.default
              const icon = CATEGORY_ICONS[cat] || CATEGORY_ICONS.default
              return (
                <article key={club.id} className="cl__card">
                  <div className={`cl__avatar cl__avatar--${tone}`}>
                    {club.emoji || <Icon name={icon} size={30} />}
                  </div>
                  <h2 className="cl__name">{club.nom || club.name}</h2>
                  <span className="cl__cat">{cat}</span>
                  <div className="cl__stats">
                    <span className="cl__stat">
                      <Icon name="users" size={15} />
                      {club.membres_count ?? club.members_count ?? 0} membres
                    </span>
                    <span className="cl__stat cl__stat--strong">
                      <Icon name="calendar" size={15} />
                      {club.evenements_count ?? club.events_count ?? 0} événements organisés
                    </span>
                  </div>
                  <p className="cl__desc">{club.description}</p>
                  <button
                    type="button"
                    className="cl__cta"
                    onClick={() => navigate(`/student/clubs/${club.id}`)}
                  >
                    Voir le club
                  </button>
                </article>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
