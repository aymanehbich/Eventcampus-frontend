import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { getEvents } from '../../api/events'
import './Events.css'

const CHIP_TONES = ['sand', 'sand', 'mint', 'sand', 'gray']
const DOW = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

const Icon = ({ children, ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    {children}
  </svg>
)
const PinIcon = () => (
  <Icon><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></Icon>
)
const ClockIcon = () => (
  <Icon><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>
)

const pad = (n) => String(n).padStart(2, '0')
const monthKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
const dayKey = (d) => `${monthKey(d)}-${pad(d.getDate())}`

// Backend dates come as "YYYY-MM-DD" (or ISO); time as "HH:MM(:SS)".
const startOf = (e) => new Date(`${String(e.date).slice(0, 10)}T${(e.heure || '00:00').slice(0, 5)}:00`)
const titleOf = (e) => e.titre || e.title || ''
const clubOf = (e) => e.club_name || e.club || ''
const catOf = (e) => e.categorie || e.category || ''

// "Club Tech & Innovation" -> "TI" (skip the generic "Club" prefix so avatars stay distinguishable)
const clubInitials = (name) =>
  name
    .replace(/^club\s+/i, '')
    .split(/\s+/)
    .filter((w) => /^\p{L}/u.test(w))
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('') || name.trim().charAt(0).toUpperCase()

const monthLabel = (key) => {
  const [y, m] = key.split('-').map(Number)
  const label = new Date(y, m - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export default function Events() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [now, setNow] = useState(() => new Date())

  const [category, setCategory] = useState('all')
  const [month, setMonth] = useState('all')
  const [club, setClub] = useState('all')
  const [day, setDay] = useState(null)
  const [search, setSearch] = useState('')
  const [room, setRoom] = useState('')

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await getEvents()
      setEvents(Array.isArray(res.data) ? res.data : res.data.data || [])
    } catch (err) {
      console.error(err)
      setError('Impossible de charger les événements.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  const withStart = useMemo(
    () =>
      events
        .map((e) => ({ ...e, _start: startOf(e) }))
        .filter((e) => !Number.isNaN(e._start.getTime()))
        .sort((a, b) => a._start - b._start),
    [events]
  )

  const nextEvent = withStart.find((e) => e._start >= now) || null

  const categories = useMemo(() => [...new Set(events.map(catOf).filter(Boolean))], [events])
  const months = useMemo(() => [...new Set(withStart.map((e) => monthKey(e._start)))], [withStart])

  const topClubs = useMemo(() => {
    const map = new Map()
    events.forEach((e) => {
      const name = clubOf(e)
      if (!name) return
      const entry = map.get(name) || { name, id: e.club_id, count: 0 }
      entry.count += 1
      map.set(name, entry)
    })
    return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 3)
  }, [events])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const r = room.trim().toLowerCase()
    const list = withStart.filter((e) => {
      if (category !== 'all' && catOf(e) !== category) return false
      if (club !== 'all' && clubOf(e) !== club) return false
      if (month !== 'all' && monthKey(e._start) !== month) return false
      if (day && dayKey(e._start) !== day) return false
      if (q && !`${titleOf(e)} ${e.description || ''}`.toLowerCase().includes(q)) return false
      if (r && !(e.lieu || '').toLowerCase().includes(r)) return false
      return true
    })
    // Upcoming first (soonest to latest), finished events last.
    return [...list.filter((e) => e._start >= now), ...list.filter((e) => e._start < now).reverse()]
  }, [withStart, category, club, month, day, search, room, now])

  const hasFilters = category !== 'all' || month !== 'all' || club !== 'all' || day || search || room

  const resetFilters = () => {
    setCategory('all')
    setMonth('all')
    setClub('all')
    setDay(null)
    setSearch('')
    setRoom('')
  }

  // ── Countdown ──
  const diff = nextEvent ? Math.max(0, nextEvent._start - now) : 0
  const cd = {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
  }

  // ── Calendar (month follows the selector, else the next event, else today) ──
  const calBase = month !== 'all' ? month : monthKey(nextEvent ? nextEvent._start : now)
  const [calY, calM] = calBase.split('-').map(Number)
  const firstOffset = (new Date(calY, calM - 1, 1).getDay() + 6) % 7
  const daysInMonth = new Date(calY, calM, 0).getDate()
  const eventDays = useMemo(() => new Set(withStart.map((e) => dayKey(e._start))), [withStart])
  const todayKey = dayKey(now)

  const fmtDayMonth = (d) => d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')

  return (
    <div className="ev">
      <Navbar searchQuery={search} onSearch={setSearch} />

      <main className="ev__wrap">
        {/* ───── Hero ───── */}
        <section className="ev__hero">
          <h1 className="ev__title">Explorez la vie étudiante &amp; scientifique à Semlalia</h1>

          {nextEvent ? (
            <aside className="ev__countdown" aria-label="Prochain événement">
              <div className="ev__timer" role="timer" aria-live="off">
                <div className="ev__timer-unit">
                  <span className="ev__timer-num">{pad(cd.days)}</span>
                  <span className="ev__timer-label">Jours</span>
                </div>
                <span className="ev__timer-sep" aria-hidden="true">:</span>
                <div className="ev__timer-unit">
                  <span className="ev__timer-num">{pad(cd.hours)}</span>
                  <span className="ev__timer-label">Heures</span>
                </div>
                <span className="ev__timer-sep" aria-hidden="true">:</span>
                <div className="ev__timer-unit">
                  <span className="ev__timer-num">{pad(cd.minutes)}</span>
                  <span className="ev__timer-label">Minutes</span>
                </div>
              </div>
              <h2 className="ev__countdown-title">{titleOf(nextEvent)}</h2>
              <p className="ev__countdown-desc">
                {nextEvent.description ? `${nextEvent.description} ` : ''}
                {nextEvent.lieu ? `${nextEvent.lieu}, ` : ''}
                {nextEvent._start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}.
              </p>
              <button type="button" className="ev__countdown-btn" onClick={() => navigate(`/student/events/${nextEvent.id}`)}>
                S'inscrire maintenant
              </button>
            </aside>
          ) : (
            <aside className="ev__countdown ev__countdown--empty">
              <p>{loading ? 'Chargement du prochain événement…' : 'Aucun événement à venir pour le moment. Revenez bientôt !'}</p>
            </aside>
          )}
        </section>

        {/* ───── Filters ───── */}
        <section className="ev__filters" aria-label="Filtres">
          <div className="ev__chips">
            <button
              type="button"
              className={`ev__chip ev__chip--mint${category === 'all' ? ' is-active' : ''}`}
              aria-pressed={category === 'all'}
              onClick={() => setCategory('all')}
            >
              Tous les événements
            </button>
            {categories.map((cat, i) => (
              <button
                key={cat}
                type="button"
                className={`ev__chip ev__chip--${CHIP_TONES[(i + 1) % CHIP_TONES.length]}${category === cat ? ' is-active' : ''}`}
                aria-pressed={category === cat}
                onClick={() => setCategory(category === cat ? 'all' : cat)}
              >
                {cat}
              </button>
            ))}
            {hasFilters && (
              <button type="button" className="ev__chip ev__chip--reset" onClick={resetFilters}>
                ✕ Réinitialiser
              </button>
            )}
          </div>

          <label className="ev__month">
            <span className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
              Filtrer par mois
            </span>
            <Icon className="ev__month-cal">
              <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
            </Icon>
            <select value={month} onChange={(e) => { setMonth(e.target.value); setDay(null) }}>
              <option value="all">Tous les mois</option>
              {months.map((m) => (
                <option key={m} value={m}>{monthLabel(m)}</option>
              ))}
            </select>
            <Icon className="ev__month-chev"><path d="m6 9 6 6 6-6" /></Icon>
          </label>
        </section>

        {/* ───── Grid + sidebar ───── */}
        <div className="ev__layout">
          <section className="ev__grid" aria-live="polite">
            {loading && [0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="ev__skeleton" />)}

            {!loading && error && (
              <div className="ev__state ev__state--error">
                {error}
                <div><button type="button" onClick={fetchEvents}>Réessayer</button></div>
              </div>
            )}

            {!loading && !error && filtered.length === 0 && (
              <div className="ev__state">
                Aucun événement ne correspond à votre recherche.
                {hasFilters && <div><button type="button" onClick={resetFilters}>Réinitialiser les filtres</button></div>}
              </div>
            )}

            {!loading && !error && filtered.map((event) => {
              const cat = catOf(event)
              const clubName = clubOf(event)
              const past = event._start < now
              const full = event.est_complet
              const max = Number(event.capacite_max) || 0
              const left = event.places_disponibles
              const ratio = max && left != null ? Math.max(0, Math.min(1, left / max)) : null
              const low = ratio !== null && ratio <= 0.2

              return (
                <article key={event.id} className="ev__card" onClick={() => navigate(`/student/events/${event.id}`)}>
                  <h3 className="ev__card-title">{titleOf(event)}</h3>

                  <div className="ev__tags">
                    {past && <span className="ev__tag ev__tag--done">Terminé</span>}
                    {cat && <span className="ev__tag">{cat}</span>}
                    {clubName && (
                      event.club_id ? (
                        <button
                          type="button"
                          className="ev__tag"
                          onClick={(e) => { e.stopPropagation(); navigate(`/student/clubs/${event.club_id}`) }}
                        >
                          {clubName}
                        </button>
                      ) : (
                        <span className="ev__tag">{clubName}</span>
                      )
                    )}
                  </div>

                  {event.description && <p className="ev__desc">{event.description}</p>}

                  <div className="ev__meta">
                    <div className="ev__badge">
                      <span className="ev__badge-day">{event._start.getDate()}</span>
                      <span className="ev__badge-mon">{fmtDayMonth(event._start)}</span>
                    </div>
                    <div className="ev__meta-lines">
                      <div className="ev__meta-line" title={event.lieu || ''}>
                        <PinIcon /><span>{event.lieu || 'Lieu à confirmer'}</span>
                      </div>
                      {event.heure && (
                        <div className="ev__meta-line ev__meta-line--muted">
                          <ClockIcon /><span>{event.heure.substring(0, 5)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {ratio !== null && (
                    <div>
                      <div className={`ev__cap-text${low ? ' ev__cap-text--low' : ''}`}>
                        {left}/{max} places restantes
                      </div>
                      <div
                        className="ev__cap-bar"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={max}
                        aria-valuenow={left}
                        aria-label="Places restantes"
                      >
                        <div className={`ev__cap-fill${low ? ' ev__cap-fill--low' : ''}`} style={{ width: `${ratio * 100}%` }} />
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    className={`ev__cta ${full && !past ? 'ev__cta--terra' : 'ev__cta--green'}`}
                    onClick={(e) => { e.stopPropagation(); navigate(`/student/events/${event.id}`) }}
                  >
                    {past ? 'Voir les détails' : full ? "Liste d'attente" : "S'inscrire"}
                  </button>
                </article>
              )
            })}
          </section>

          <aside className="ev__side" aria-label="Outils du campus">
            {/* Calendar */}
            <section className="ev__widget">
              <h2 className="ev__widget-title">Mon Calendrier Étudiant</h2>
              <p className="ev__cal-label">{monthLabel(calBase).toLowerCase()}</p>
              <div className="ev__cal">
                {DOW.map((d, i) => <div key={i} className="ev__cal-dow" aria-hidden="true">{d}</div>)}
                {Array.from({ length: firstOffset }, (_, i) => <div key={`b${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const n = i + 1
                  const key = `${calBase}-${pad(n)}`
                  const has = eventDays.has(key)
                  const cls = [
                    'ev__cal-day',
                    has && 'ev__cal-day--event',
                    key === todayKey && 'ev__cal-day--today',
                    day === key && 'ev__cal-day--selected',
                  ].filter(Boolean).join(' ')
                  return has ? (
                    <button
                      key={key}
                      type="button"
                      className={cls}
                      aria-pressed={day === key}
                      aria-label={`${n} ${monthLabel(calBase)} : événement`}
                      onClick={() => setDay(day === key ? null : key)}
                    >
                      {n}
                    </button>
                  ) : (
                    <span key={key} className={cls}>{n}</span>
                  )
                })}
              </div>
            </section>

            {/* Active clubs */}
            <section className="ev__widget">
              <h2 className="ev__widget-title">Clubs Actifs du Mois</h2>
              {topClubs.length === 0 ? (
                <p className="ev__cal-label" style={{ textTransform: 'none' }}>Aucun club actif pour le moment.</p>
              ) : (
                <div className="ev__clubs">
                  {topClubs.map((c) => (
                    <div key={c.name} className="ev__club">
                      <button
                        type="button"
                        className={`ev__club-avatar${club === c.name ? ' is-active' : ''}`}
                        aria-pressed={club === c.name}
                        aria-label={`Filtrer les événements de ${c.name}`}
                        onClick={() => setClub(club === c.name ? 'all' : c.name)}
                      >
                        {clubInitials(c.name)}
                      </button>
                      <span className="ev__club-name">{c.name}</span>
                      {c.id && (
                        <button type="button" className="ev__club-link" onClick={() => navigate(`/student/clubs/${c.id}`)}>
                          Rejoindre
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <button type="button" className="ev__side-btn" onClick={() => navigate('/student/clubs')}>
                Tous les clubs
              </button>
            </section>

            {/* Room locator */}
            <section className="ev__widget">
              <h2 className="ev__widget-title">Quick room locator</h2>
              <div className="ev__room-input">
                <Icon><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Icon>
                <input
                  type="search"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="Recherche campus..."
                  aria-label="Rechercher un lieu sur le campus"
                />
              </div>
              <svg className="ev__map" viewBox="0 0 200 130" role="img" aria-label="Plan du campus">
                <rect width="200" height="130" fill="#eef1ee" />
                <path d="M0 96c30-10 50-30 90-26s70 14 110-8v68H0Z" fill="#cfe4d3" />
                <rect x="126" y="12" width="52" height="34" rx="4" fill="#dde6df" />
                <rect x="20" y="16" width="40" height="28" rx="4" fill="#dde6df" />
                <path d="M0 58h200M84 0v130M150 0l-30 130M0 24l100 30" stroke="#fff" strokeWidth="6" fill="none" />
                <path d="M100 88c0-9 12-18 12-30a12 12 0 1 0-24 0c0 12 12 21 12 30Z" fill="#a85a28" transform="translate(-4 -6)" />
                <circle cx="96" cy="46" r="4.5" fill="#fff" />
              </svg>
            </section>
          </aside>
        </div>
      </main>
    </div>
  )
}
