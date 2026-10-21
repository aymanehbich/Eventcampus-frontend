import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getPendingAdhesions, accepterAdhesion, refuserAdhesion, getClubUser } from '../../api/clubs'
import DashboardLayout from '../../components/DashboardLayout'
import './Adhesions.css'

function Icon({ children, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

export default function Adhesions() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const clubId = searchParams.get('club')

  const [demandes, setDemandes] = useState([])
  const [membres, setMembres] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([getPendingAdhesions(clubId), getClubUser(clubId)])
      .then(([pendingRes, membresRes]) => {
        setDemandes(Array.isArray(pendingRes.data.adhesions) ? pendingRes.data.adhesions : [])
        setMembres(Array.isArray(membresRes.data) ? membresRes.data : [])
      })
      .catch(() => setError('Impossible de charger les données.'))
      .finally(() => setLoading(false))
  }, [clubId])

  const handleAccepter = async (id) => {
    setProcessing(id)
    try {
      await accepterAdhesion(id)
      setDemandes(prev => prev.filter(d => d.id !== id))
      const res = await getClubUser(clubId)
      setMembres(Array.isArray(res.data) ? res.data : [])
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

  const clubName = clubId && membres.length > 0 ? membres[0]?.club_nom : null

  return (
    <DashboardLayout
      active="members"
      title="Gestion des membres"
      subtitle={clubName ? `Club : ${clubName}` : 'Demandes d’adhésion et membres inscrits'}
      actions={clubId ? (
        <button type="button" className="ec-btn ec-btn--ghost" onClick={() => navigate('/organiser/adhesions')}>
          <Icon><path d="M19 12H5m6-6-6 6 6 6" /></Icon>
          Tous les clubs
        </button>
      ) : null}
    >
      <div className="ad">
        <section aria-labelledby="ad-pending">
          <h2 id="ad-pending" className="ad__title">
            Demandes d'adhésion en attente
            {!loading && <span className="ec-badge ec-badge--terra">{demandes.length}</span>}
          </h2>

          {loading && (
            <div className="ad__skeletons" aria-busy="true">
              <div className="ec-skeleton ad__sk" /><div className="ec-skeleton ad__sk" />
            </div>
          )}
          {error && <div className="ec-alert ec-alert--error" role="alert">{error}</div>}

          {!loading && !error && demandes.length === 0 && (
            <div className="ec-card ec-card--sand ad__empty">Aucune demande en attente.</div>
          )}

          {!loading && !error && demandes.map(d => (
            <div key={d.id} className="ad__queue">
              <span className="ad__avatar" aria-hidden="true">
                {(d.user?.prenom || d.user?.name || '?').charAt(0).toUpperCase()}
              </span>
              <div className="ad__info">
                <h3 className="ad__name">{d.user?.prenom} {d.user?.nom}</h3>
                <p className="ad__meta">{d.user?.email} · Demande envoyée le {formatDate(d.created_at)}</p>
              </div>
              <div className="ad__actions">
                <button
                  type="button"
                  className="ec-btn ec-btn--primary"
                  disabled={processing === d.id}
                  onClick={() => handleAccepter(d.id)}
                >
                  {processing === d.id ? '...' : <><Icon><path d="m5 12 5 5 9-10" /></Icon> Accepter</>}
                </button>
                <button
                  type="button"
                  className="ec-btn ec-btn--danger"
                  disabled={processing === d.id}
                  onClick={() => handleRefuser(d.id)}
                >
                  {processing === d.id ? '...' : <><Icon><path d="M6 6l12 12M18 6 6 18" /></Icon> Refuser</>}
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* ── Membres inscrits ── */}
        <section aria-labelledby="ad-members" className="ad__members">
          <h2 id="ad-members" className="ad__title">
            Membres inscrits
            {!loading && <span className="ec-badge ec-badge--green">{membres.length}</span>}
          </h2>

          {loading && (
            <div className="ad__skeletons" aria-busy="true">
              <div className="ec-skeleton ad__sk" />
            </div>
          )}

          {!loading && membres.length === 0 && (
            <div className="ec-card ec-card--sand ad__empty">Aucun membre inscrit pour le moment.</div>
          )}

          {!loading && membres.length > 0 && (
            <div className="ec-table-wrap">
              <table className="ec-table ad__table">
                <thead>
                  <tr>
                    <th scope="col">Membre</th>
                    <th scope="col">Email</th>
                    <th scope="col">Club</th>
                    <th scope="col">Inscrit le</th>
                  </tr>
                </thead>
                <tbody>
                  {membres.map((m) => {
                    const name = m.prenom && m.nom
                      ? `${m.prenom} ${m.nom}`
                      : (m.name || '—')
                    const initial = name.charAt(0).toUpperCase()
                    return (
                      <tr key={`${m.user_id}-${m.club_id}`}>
                        <td>
                          <div className="ad__member">
                            <span className="ad__avatar ad__avatar--sm" aria-hidden="true">{initial}</span>
                            <span className="ad__member-name">{name}</span>
                          </div>
                        </td>
                        <td className="ad__muted">{m.email || '—'}</td>
                        <td><span className="ec-badge ec-badge--green">{m.club_nom || '—'}</span></td>
                        <td className="ad__muted ad__nowrap">{formatDate(m.joined_at)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}
