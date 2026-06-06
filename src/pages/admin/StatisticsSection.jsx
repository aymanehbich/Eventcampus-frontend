import { useState, useEffect } from 'react'
import { getStats } from '../../api/admin'

function StatCard({ icon, value, label, highlight }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: highlight ? 'rgba(233,69,96,0.06)' : 'white',
        border: `1.5px solid ${highlight ? '#E94560' : '#E0E0E6'}`,
        borderRadius: '12px',
        padding: '28px 24px',
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        transition: 'transform 0.2s',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      <div style={{ fontSize: '36px' }}>{icon}</div>
      <div>
        <div style={{
          fontFamily: "'Fraunces', serif",
          fontSize: '28px',
          fontWeight: 700,
          color: highlight ? '#E94560' : '#1A1A2E',
          lineHeight: 1,
          marginBottom: '6px',
        }}>
          {value ?? '—'}
        </div>
        <div style={{ fontSize: '13px', color: highlight ? '#E94560' : '#7A7A8C', fontWeight: 500 }}>
          {label}
        </div>
      </div>
    </div>
  )
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
    return <div style={{ textAlign: 'center', padding: '60px', color: '#7A7A8C' }}>Chargement...</div>
  }

  return (
    <div>
      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <StatCard icon="📅" value={stats?.total_events}   label="Événements publiés" />
        <StatCard icon="🏛️" value={stats?.total_clubs}    label="Clubs actifs" />
        <StatCard icon="🎓" value={stats?.total_students?.toLocaleString('fr-FR')} label="Étudiants inscrits" />
        <StatCard icon="✅" value={`${stats?.avg_inscription_rate ?? 0}%`} label="Taux d'inscription moyen" highlight />
      </div>

      {/* Tableau événements récents */}
      <h3 style={{
        fontFamily: "'Fraunces', serif", fontSize: '16px',
        color: '#1A1A2E', marginBottom: '16px',
      }}>
        Événements récemment validés
      </h3>

      <div style={{ background: 'white', borderRadius: '12px', border: '1.5px solid #E0E0E6', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr>
              {['Événement', 'Club', 'Date', 'Inscrits / Places', 'Taux', 'Statut'].map(h => (
                <th key={h} style={{
                  background: '#F4F4F6', padding: '10px 16px', textAlign: 'left',
                  fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px',
                  color: '#7A7A8C', fontWeight: 600,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(stats?.recent_events ?? []).map((ev, i, arr) => {
              const isLast = i === arr.length - 1
              const td = {
                padding: '13px 16px',
                borderBottom: isLast ? 'none' : '1px solid #E0E0E6',
                color: '#1A1A2E',
                verticalAlign: 'middle',
              }
              return (
                <tr key={ev.id}>
                  <td style={{ ...td, fontWeight: 600 }}>{ev.title}</td>
                  <td style={td}>{ev.club}</td>
                  <td style={td}>
                    {ev.date
                      ? new Date(ev.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>
                  <td style={td}>{ev.registrations} / {ev.capacity}</td>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A2E', minWidth: '36px' }}>
                        {ev.rate}%
                      </span>
                      <div style={{ flex: 1, height: '6px', background: '#E0E0E6', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${ev.rate}%`, height: '100%',
                          background: ev.rate >= 80 ? '#4CAF50' : ev.rate >= 50 ? '#FF9500' : '#E94560',
                          borderRadius: '3px', transition: 'width 0.4s ease',
                        }} />
                      </div>
                    </div>
                  </td>
                  <td style={td}>
                    <span style={{
                      background: '#E6FFE6', color: '#4CAF50',
                      padding: '3px 10px', borderRadius: '6px',
                      fontSize: '12px', fontWeight: 600,
                    }}>
                      Validé
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StatisticsSection