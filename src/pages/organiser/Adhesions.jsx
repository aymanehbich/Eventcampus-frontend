import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPendingAdhesions, accepterAdhesion, refuserAdhesion } from '../../api/clubs'
import './Adhesions.css'

export default function Adhesions() {
  const navigate = useNavigate()
  const [demandes, setDemandes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(null)

  useEffect(() => {
    getPendingAdhesions()
      .then(res => setDemandes(Array.isArray(res.data.adhesions) ? res.data.adhesions : []))
      .catch(() => setError('Impossible de charger les demandes.'))
      .finally(() => setLoading(false))
  }, [])

  const handleAccepter = async (id) => {
    setProcessing(id)
    try {
      await accepterAdhesion(id)
      setDemandes(prev => prev.filter(d => d.id !== id))
    } catch {
      alert('Une erreur est survenue.')
    } finally {
      setProcessing(null)
    }
  }

  const handleRefuser = async (id) => {
    setProcessing(id)
    try {
      await refuserAdhesion(id)
      setDemandes(prev => prev.filter(d => d.id !== id))
    } catch {
      alert('Une erreur est survenue.')
    } finally {
      setProcessing(null)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="adhesions-layout">
      <div className="adhesions-sidebar">
        <div className="adhesions-logo">Event<span>Campus</span></div>
        <div className="adhesions-nav-item" onClick={() => navigate('/organiser/events')}>📅 Mes événements</div>
        <div className="adhesions-nav-item active">👥 Membres</div>
      </div>

      <div className="adhesions-main">
        <div className="adhesions-top">
          <h2>Gestion des membres</h2>
        </div>

        <div className="adhesions-section-title">
          Demandes d'adhésion en attente
          {!loading && <span className="adhesions-badge">{demandes.length}</span>}
        </div>

        {loading && <p className="adhesions-muted">Chargement...</p>}
        {error && <p className="adhesions-error">{error}</p>}

        {!loading && !error && demandes.length === 0 && (
          <p className="adhesions-muted">Aucune demande en attente.</p>
        )}

        {!loading && !error && demandes.map(d => (
          <div key={d.id} className="adhesions-queue-item">
            <div className="adhesions-info">
              <h4>{d.user?.prenom} {d.user?.nom}</h4>
              <p>{d.user?.email} · Demande envoyée le {formatDate(d.created_at)}</p>
            </div>
            <div className="adhesions-actions">
              <button
                className="adhesions-btn adhesions-btn-success"
                disabled={processing === d.id}
                onClick={() => handleAccepter(d.id)}
              >
                {processing === d.id ? '...' : '✓ Accepter'}
              </button>
              <button
                className="adhesions-btn adhesions-btn-danger"
                disabled={processing === d.id}
                onClick={() => handleRefuser(d.id)}
              >
                {processing === d.id ? '...' : '✕ Refuser'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
