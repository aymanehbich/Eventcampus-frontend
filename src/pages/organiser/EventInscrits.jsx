import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEvent, getEventInscrits } from '../../api/events'
import DashboardLayout from '../../components/DashboardLayout'
import { ArrowLeftIcon } from './OrganiserIcons'
import './Organiser.css'

export default function EventInscrits() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [inscrits, setInscrits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([getEvent(id), getEventInscrits(id)])
      .then(([evtRes, insRes]) => {
        setEvent(evtRes.data)
        setInscrits(insRes.data)
      })
      .catch(() => setError('Impossible de charger les données.'))
      .finally(() => setLoading(false))
  }, [id])

  const formatDate = (str) => {
    if (!str) return ''
    return new Date(str).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'short', year: 'numeric',
    }).replace(/^\w/, c => c.toUpperCase())
  }

  const formatInscriptionDate = (str) => {
    if (!str) return ''
    return new Date(str).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  }

  const totalPlaces = event
    ? (event.inscrits ?? 0) + (event.places_disponibles ?? 0)
    : 0
  const fillPct = totalPlaces > 0
    ? Math.round(((event?.inscrits ?? 0) / totalPlaces) * 100)
    : 0

  const backButton = (
    <button type="button" className="ec-btn ec-btn--ghost" onClick={() => navigate('/organiser/events')}>
      <ArrowLeftIcon size={16} /> Retour aux événements
    </button>
  )

  if (loading) return (
    <DashboardLayout active="events" title="Inscrits" actions={backButton}>
      <div className="ec-state" role="status" aria-live="polite">Chargement...</div>
    </DashboardLayout>
  )

  if (error || !event) return (
    <DashboardLayout active="events" title="Inscrits" actions={backButton}>
      <div className="ec-state ec-state--error" role="alert">{error || 'Événement introuvable.'}</div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout
      active="events"
      title={`Inscrits — ${event.titre}`}
      subtitle={`${formatDate(event.date)} · ${event.heure?.substring(0, 5)} · ${event.lieu}`}
      actions={backButton}
    >
      {/* Résumé */}
      <section className="ec-card ec-card--sand og__summary" aria-label="Résumé des inscriptions">
        <div>
          <div className="og__summary-num">{event.inscrits ?? 0}</div>
          <div className="og__summary-label">inscrits</div>
        </div>
        <div className="og__summary-bar">
          <div
            className="og__bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={totalPlaces}
            aria-valuenow={event.inscrits ?? 0}
            aria-label="Taux de remplissage"
          >
            <div className="og__bar-fill" style={{ width: `${fillPct}%` }} />
          </div>
        </div>
        <div>
          <div className="og__summary-num og__summary-num--terra">{event.places_disponibles ?? 0}</div>
          <div className="og__summary-label">places restantes</div>
        </div>
        <div>
          <div className="og__summary-num">{totalPlaces}</div>
          <div className="og__summary-label">places au total</div>
        </div>
      </section>

      {/* Table */}
      <div className="ec-table-wrap">
        <table className="ec-table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Nom</th>
              <th scope="col">E-mail</th>
              <th scope="col">Date d'inscription</th>
            </tr>
          </thead>
          <tbody>
            {inscrits.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <div className="ec-state">Aucun inscrit pour le moment.</div>
                </td>
              </tr>
            ) : (
              inscrits.map((p, i) => (
                <tr key={p.id}>
                  <td className="og__num-cell">{i + 1}</td>
                  <td>{p.name}</td>
                  <td>{p.email}</td>
                  <td>{formatInscriptionDate(p.inscrit_le)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}
