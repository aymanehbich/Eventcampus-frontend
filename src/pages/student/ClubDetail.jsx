import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { getClub, joinClub, leaveClub } from '../../api/clubs'
import { startConversation } from '../../api/messages'
import { Icon } from './StudentIcons'
import './ClubDetail.css'

const MEMBER_TONES = 4

const CATEGORY_ICONS = {
  Conférence: 'mic',
  Atelier: 'palette',
  Soirée: 'sparkles',
  'Réunion de club': 'users',
  Hackathon: 'code',
  Environnement: 'leaf',
  default: 'calendar',
}

const formatEventDate = (date, heure) => {
  const d = new Date(date)
  const day = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })
    .replace(/^\w/, c => c.toUpperCase())
  const time = heure ? heure.substring(0, 5) : ''
  return `${day} · ${time}`
}

export default function ClubDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [club, setClub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [joining, setJoining] = useState(false)
  const [messaging, setMessaging] = useState(false)

  useEffect(() => { fetchClub() }, [id])

  const fetchClub = async () => {
    try {
      setLoading(true)
      const res = await getClub(id)
      setClub(res.data)
    } catch {
      setError('Club introuvable.')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinLeave = async () => {
    if (!club) return
    setJoining(true)
    try {
      if (club.is_member) {
        await leaveClub(id)
        setClub(prev => ({
          ...prev,
          is_member: false,
          membres_count: (prev.membres_count ?? 1) - 1,
          membres: prev.membres?.filter(
            m => m.id !== JSON.parse(localStorage.getItem('user'))?.id
          ),
        }))
      } else {
        await joinClub(id)
        setClub(prev => ({ ...prev, is_pending: true }))
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setClub(prev => ({ ...prev, is_pending: true }))
      } else {
        alert('Une erreur est survenue.')
      }
    } finally {
      setJoining(false)
    }
  }

  const handleMessageOrganizer = async () => {
    const organizerId = club?.organizer?.id
    if (!organizerId) {
      alert('L\'identifiant de l\'organisateur n\'est pas disponible. Veuillez réessayer plus tard.')
      return
    }
    setMessaging(true)
    try {
      await startConversation(organizerId)
      navigate('/student/messages', {
        state: {
          organizerId,
          organizerName: club.organizer.name,
        },
      })
    } catch (err) {
      console.error('Erreur lors du démarrage de la conversation', err)
      alert('Impossible de démarrer la conversation avec l\'organisateur.')
    } finally {
      setMessaging(false)
    }
  }

  if (loading) return (
    <div className="cd">
      <Navbar />
      <div className="cd__state" role="status">Chargement...</div>
    </div>
  )

  if (error || !club) return (
    <div className="cd">
      <Navbar />
      <div className="cd__state cd__state--error" role="alert">{error || 'Club introuvable.'}</div>
    </div>
  )

  const membres = club.membres || []
  const membresPublics = membres.slice(0, 4)
  const totalMembres = club.membres_count ?? membres.length
  const resteMembres = totalMembres - membresPublics.length
  const anneeCreation = club.created_at ? new Date(club.created_at).getFullYear() : null
  const evenements = club.evenements || []

  const joinLabel = joining
    ? '...'
    : club.is_member
      ? (<><Icon name="check" size={16} />Membre</>)
      : club.is_pending
        ? (<><Icon name="hourglass" size={16} />Demande en attente</>)
        : 'Rejoindre ce club'
  const joinTone = club.is_member ? 'member' : club.is_pending ? 'pending' : 'join'

  return (
    <div className="cd">
      <Navbar />

      <main className="cd__wrap">
        <button type="button" className="cd__back" onClick={() => navigate('/student/clubs')}>
          <Icon name="arrowLeft" size={16} />
          Retour aux clubs
        </button>

        {/* ── Hero ── */}
        <section className="cd__hero">
          <div className="cd__hero-main">
            <div className="cd__logo">
              {club.emoji || <Icon name="landmark" size={40} />}
            </div>
            <div className="cd__hero-text">
              <h1 className="cd__title">{club.nom}</h1>
              <p className="cd__sub">
                {club.categorie}{anneeCreation ? ` · Fondé en ${anneeCreation}` : ''}
              </p>
              {/* ── Stats : Membres + Événements organisés ── */}
              <div className="cd__stats">
                <div>
                  <div className="cd__stat-num">{totalMembres}</div>
                  <div className="cd__stat-label">Membres</div>
                </div>
                <div>
                  <div className="cd__stat-num">{club.evenements_count ?? 0}</div>
                  <div className="cd__stat-label">Événements organisés</div>
                </div>
              </div>
            </div>
          </div>

          <div className="cd__actions">
            <button
              type="button"
              className="cd__btn cd__btn--ghost"
              onClick={handleMessageOrganizer}
              disabled={messaging}
            >
              {messaging ? '...' : (<><Icon name="mail" size={16} />Contacter</>)}
            </button>
            <button
              type="button"
              className={`cd__btn cd__btn--${joinTone}`}
              onClick={club.is_member ? handleJoinLeave : club.is_pending ? undefined : handleJoinLeave}
              disabled={joining || club.is_pending}
            >
              {joinLabel}
            </button>
          </div>
        </section>

        {/* ── Body ── */}
        <div className="cd__layout">
          {/* Colonne gauche */}
          <div className="cd__col">
            {/* Description */}
            <section className="cd__panel">
              <h2 className="cd__h2">Description du club</h2>
              <p className="cd__text">{club.description || 'Aucune description disponible.'}</p>
            </section>

            {/* ── Prochains événements */}
            <section className="cd__panel">
              <h2 className="cd__h2">Prochains événements du club</h2>

              {evenements.length === 0 ? (
                <p className="cd__muted">Aucun événement à venir pour ce club.</p>
              ) : (
                <ul className="cd__events">
                  {evenements.map(event => {
                    const cat = event.categorie || 'default'
                    const icon = CATEGORY_ICONS[cat] || CATEGORY_ICONS.default
                    return (
                      <li key={event.id} className="cd__event">
                        <div className="cd__event-main">
                          <div className="cd__event-ico"><Icon name={icon} size={18} /></div>
                          <div className="cd__event-info">
                            <div className="cd__event-title">{event.titre}</div>
                            <div className="cd__event-meta">
                              {formatEventDate(event.date, event.heure)}
                              {event.lieu ? ` · ${event.lieu}` : ''}
                            </div>
                          </div>
                        </div>

                        {/* Bouton Voir → navigate vers EventDetail */}
                        <button
                          type="button"
                          className="cd__btn cd__btn--outline cd__btn--sm"
                          onClick={() => navigate(`/student/events/${event.id}`)}
                          aria-label={`Voir l'événement ${event.titre}`}
                        >
                          Voir
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          </div>

          {/* Sidebar membres */}
          <aside className="cd__side">
            <h3 className="cd__side-title">Membres publics</h3>
            {membresPublics.length === 0 ? (
              <p className="cd__muted">Aucun membre public.</p>
            ) : (
              <ul className="cd__members">
                {membresPublics.map((m, i) => {
                  const fullName = `${m.prenom || ''} ${m.nom || ''}`.trim() || 'Membre'
                  const initial = fullName[0]?.toUpperCase() || '?'
                  const role = m.pivot?.role === 'responsable' ? 'Responsable' : 'Membre'
                  return (
                    <li key={m.id || i} className="cd__member">
                      <div className={`cd__mav cd__mav--${i % MEMBER_TONES}`}>{initial}</div>
                      <div>
                        <div className="cd__member-name">{fullName}</div>
                        <div className="cd__member-role">{role}</div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
            {resteMembres > 0 && (
              <div className="cd__more">+ {resteMembres} autres membres…</div>
            )}
          </aside>
        </div>
      </main>
    </div>
  )
}
