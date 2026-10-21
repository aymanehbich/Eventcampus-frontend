import { useState, useEffect } from 'react'
import { getStats } from '../../api/admin'
import AdminIcon from './AdminIcon'
import './AdminDashboard.css'

function StatCard({ icon, value, label, highlight }) {
  return (
    <div className={`ec-card adm__stat${highlight ? ' ec-card--sand adm__stat--accent' : ''}`}>
      <span className={`adm__stat-ico${highlight ? ' adm__stat-ico--sand' : ''}`}>
        <AdminIcon name={icon} size={22} />
      </span>
      <div>
        <div className="adm__stat-val">{value ?? '—'}</div>
        <div className="adm__stat-label">{label}</div>
      </div>
    </div>
  )
}

function barClass(rate) {
  if (rate >= 80) return 'adm__bar-fill'
  if (rate >= 50) return 'adm__bar-fill adm__bar-fill--mid'
  return 'adm__bar-fill adm__bar-fill--low'
}

function StatisticsSection() {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStats()
      .then(res => setStats(res.data.data))
      .catch(err => console.error('Erreur stats:', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="adm" role="status">
        <span className="ec-sr-only">Chargement...</span>
        <div className="adm__stat-grid" aria-hidden="true">
          {[0, 1, 2, 3].map(i => <div key={i} className="ec-skeleton adm__skeleton" />)}
        </div>
      </div>
    )
  }

  const recent = stats?.recent_events ?? []

  return (
    <div className="adm">
      <div className="adm__stat-grid">
        <StatCard icon="calendar" value={stats?.total_events} label="Événements publiés" />
        <StatCard icon="club" value={stats?.total_clubs} label="Clubs actifs" />
        <StatCard icon="student" value={stats?.total_students?.toLocaleString('fr-FR')} label="Étudiants inscrits" />
        <StatCard icon="percent" value={`${stats?.avg_inscription_rate ?? 0}%`} label="Taux d'inscription moyen" highlight />
      </div>

      <h2 className="adm__section-title">Événements récemment validés</h2>

      <div className="ec-table-wrap">
        <table className="ec-table adm__table">
          <thead>
            <tr>
              {['Événement', 'Club', 'Date', 'Inscrits / Places', 'Taux', 'Statut'].map(h => (
                <th key={h} scope="col">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map((ev) => (
              <tr key={ev.id}>
                <td className="adm__cell-title">{ev.title}</td>
                <td>{ev.club}</td>
                <td className="adm__nowrap">
                  {ev.date
                    ? new Date(ev.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—'}
                </td>
                <td className="adm__nowrap">{ev.registrations} / {ev.capacity}</td>
                <td>
                  <div className="adm__rate">
                    <span className="adm__rate-val">{ev.rate}%</span>
                    <div className="adm__bar" aria-hidden="true">
                      <div className={barClass(ev.rate)} style={{ width: `${ev.rate}%` }} />
                    </div>
                  </div>
                </td>
                <td>
                  <span className="ec-badge ec-badge--green">
                    <AdminIcon name="check" size={12} />
                    Validé
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {recent.length === 0 && <div className="ec-state">Aucun événement récent</div>}
      </div>
    </div>
  )
}

export default StatisticsSection
