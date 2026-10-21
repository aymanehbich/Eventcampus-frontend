import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrganizerClubs } from '../../api/clubs'
import DashboardLayout from '../../components/DashboardLayout'
import { PlusIcon, UsersIcon, EditIcon, CheckIcon, ClockIcon, XIcon, ClubIcon } from './OrganiserIcons'
import './Organiser.css'

const StatutBadge = ({ statut }) => {
  const map = {
    actif: { cls: 'ec-badge--green', icon: <CheckIcon size={12} />, label: 'Actif' },
    en_attente: { cls: 'ec-badge--amber', icon: <ClockIcon size={12} />, label: 'En attente' },
    suspendu: { cls: 'ec-badge--red', icon: <XIcon size={12} />, label: 'Suspendu' },
  }
  const st = map[statut] || { cls: 'ec-badge--gray', icon: null, label: statut || '—' }
  return (
    <span className={`ec-badge ${st.cls}`}>
      {st.icon}
      {st.label}
    </span>
  )
}

export default function MesClubs() {
  const navigate = useNavigate()
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getOrganizerClubs()
      .then(res => setClubs(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Impossible de charger les clubs.'))
      .finally(() => setLoading(false))
  }, [])

  const createButton = (
    <button type="button" className="ec-btn ec-btn--primary" onClick={() => navigate('/organiser/clubs/create')}>
      <PlusIcon /> Créer un club
    </button>
  )

  return (
    <DashboardLayout
      active="clubs"
      title="Mes clubs"
      subtitle={`${clubs.length} club${clubs.length !== 1 ? 's' : ''} créé${clubs.length !== 1 ? 's' : ''}`}
      actions={createButton}
    >
      {loading ? (
        <div className="og__cards" aria-busy="true" aria-live="polite">
          {[0, 1, 2].map(i => <div key={i} className="ec-skeleton og__skeleton" />)}
          <span className="ec-sr-only">Chargement...</span>
        </div>
      ) : error ? (
        <div className="ec-state ec-state--error" role="alert">{error}</div>
      ) : clubs.length === 0 ? (
        <div className="ec-card ec-card--sand og__empty">
          <div className="og__empty-icon"><ClubIcon size={26} /></div>
          <h2 className="og__empty-title">Aucun club créé</h2>
          <p className="og__empty-text">Créez votre premier club pour commencer.</p>
          {createButton}
        </div>
      ) : (
        <div className="og__cards">
          {clubs.map(club => (
            <article key={club.id} className="ec-card ec-card--sand og__card">
              <div className="og__card-head">
                <div className="og__avatar" aria-hidden="true">
                  {club.emoji || <ClubIcon size={26} />}
                </div>
                <div className="og__card-head-text">
                  <h2 className="og__card-title" title={club.nom}>{club.nom}</h2>
                  <p className="og__card-sub">{club.categorie}</p>
                </div>
                <StatutBadge statut={club.statut} />
              </div>

              {club.description && <p className="og__desc">{club.description}</p>}

              <div className="og__stats">
                <div className="og__stat">
                  <span className="og__stat-num">{club.membres_count ?? 0}</span>
                  <span className="og__stat-label">Membres</span>
                </div>
                {club.created_at && (
                  <div className="og__stat">
                    <span className="og__stat-num">{new Date(club.created_at).getFullYear()}</span>
                    <span className="og__stat-label">Fondé en</span>
                  </div>
                )}
              </div>

              <div className="og__actions">
                <button type="button" className="ec-btn ec-btn--outline" onClick={() => navigate(`/organiser/adhesions?club=${club.id}`)}>
                  <UsersIcon size={16} /> Membres
                </button>
                <button type="button" className="ec-btn ec-btn--accent" onClick={() => navigate(`/organiser/clubs/${club.id}/edit`)}>
                  <EditIcon size={16} /> Modifier
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
