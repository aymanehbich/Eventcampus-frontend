import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrganizerEvents, deleteEvent } from '../../api/events'
import DashboardLayout from '../../components/DashboardLayout'
import { PlusIcon, UsersIcon, EditIcon, TrashIcon, CheckIcon, ClockIcon, XIcon, CalendarIcon, PinIcon } from './OrganiserIcons'
import './Organiser.css'

const StatutBadge = ({ statut }) => {
  const st = statut?.toString().toLowerCase().trim()
  if (st === 'en attente' || st === 'pending') {
    return <span className="ec-badge ec-badge--amber"><ClockIcon size={12} /> En attente</span>
  }
  if (st === 'accepté' || st === 'accepte' || st === 'validé' || st === 'valide') {
    return <span className="ec-badge ec-badge--green"><CheckIcon size={12} /> Publié</span>
  }
  return <span className="ec-badge ec-badge--red"><XIcon size={12} /> Rejeté</span>
}

export default function MesEvenements() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    getOrganizerEvents()
      .then(res => setEvents(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Impossible de charger les événements.'))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async () => {
    if (!confirmId) return
    setDeleting(true)
    try {
      await deleteEvent(confirmId)
      setEvents(prev => prev.filter(e => e.id !== confirmId))
      setConfirmId(null)
    } catch {
      alert('Une erreur est survenue lors de la suppression.')
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (str) => {
    if (!str) return ''
    return new Date(str).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const confirmEvent = events.find(e => e.id === confirmId)

  const createButton = (
    <button type="button" className="ec-btn ec-btn--primary" onClick={() => navigate('/organiser/events/create')}>
      <PlusIcon /> Créer un événement
    </button>
  )

  return (
    <DashboardLayout
      active="events"
      title="Mes événements"
      subtitle={`${events.length} événement${events.length !== 1 ? 's' : ''} créé${events.length !== 1 ? 's' : ''}`}
      actions={createButton}
    >
      {loading ? (
        <div className="og__cards" aria-busy="true" aria-live="polite">
          {[0, 1, 2].map(i => <div key={i} className="ec-skeleton og__skeleton" />)}
          <span className="ec-sr-only">Chargement...</span>
        </div>
      ) : error ? (
        <div className="ec-state ec-state--error" role="alert">{error}</div>
      ) : events.length === 0 ? (
        <div className="ec-card ec-card--sand og__empty">
          <div className="og__empty-icon"><CalendarIcon size={26} /></div>
          <h2 className="og__empty-title">Aucun événement</h2>
          <p className="og__empty-text">Vous n'avez créé aucun événement.</p>
          {createButton}
        </div>
      ) : (
        <div className="og__cards">
          {events.map(evt => {
            const inscrits = evt.inscrits ?? 0
            const totalPlaces = inscrits + (evt.places_disponibles ?? 0)
            const pct = totalPlaces > 0 ? Math.min(100, Math.round((inscrits / totalPlaces) * 100)) : 0

            return (
              <article key={evt.id} className="ec-card ec-card--sand og__card">
                <div className="og__card-head">
                  <div className="og__card-head-text">
                    <h2 className="og__card-title og__card-title--wrap">{evt.titre}</h2>
                    {evt.categorie && <p className="og__card-sub">{evt.categorie}</p>}
                  </div>
                  <StatutBadge statut={evt.statut} />
                </div>

                <div className="og__meta">
                  <div className="og__meta-line">
                    <CalendarIcon size={16} /><span>{formatDate(evt.date) || '—'}</span>
                  </div>
                  <div className="og__meta-line" title={evt.lieu || ''}>
                    <PinIcon size={16} /><span>{evt.lieu || '—'}</span>
                  </div>
                </div>

                <div>
                  <div className="og__cap-text">
                    <strong>{inscrits}</strong> / {totalPlaces} inscrits
                  </div>
                  <div
                    className="og__bar"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={totalPlaces}
                    aria-valuenow={inscrits}
                    aria-label="Taux d'inscription"
                  >
                    <div className="og__bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="og__actions">
                  <button type="button" className="ec-btn ec-btn--outline" onClick={() => navigate(`/organiser/events/${evt.id}/inscrits`)}>
                    <UsersIcon size={16} /> Voir inscrits
                  </button>
                  <button type="button" className="ec-btn ec-btn--accent" onClick={() => navigate(`/organiser/events/${evt.id}/edit`)}>
                    <EditIcon size={16} /> Modifier
                  </button>
                  <button type="button" className="ec-btn ec-btn--danger" onClick={() => setConfirmId(evt.id)}>
                    <TrashIcon size={16} /> Supprimer
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Modal de confirmation */}
      {confirmId && (
        <div className="og__overlay">
          <div className="og__modal" role="alertdialog" aria-modal="true" aria-labelledby="og-del-title" aria-describedby="og-del-text">
            <div className="og__modal-icon"><TrashIcon size={24} /></div>
            <h3 id="og-del-title" className="og__modal-title">Supprimer l'événement ?</h3>
            <p id="og-del-text" className="og__modal-text">
              Vous êtes sur le point de supprimer <strong>{confirmEvent?.titre}</strong>.<br />
              Cette action est irréversible.
            </p>
            <div className="og__modal-actions">
              <button type="button" className="ec-btn ec-btn--ghost" onClick={() => setConfirmId(null)} disabled={deleting} autoFocus>
                Annuler
              </button>
              <button type="button" className="ec-btn og__btn-solid-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Suppression...' : 'Oui, supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
