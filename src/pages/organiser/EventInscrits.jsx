import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEvent, getEventInscrits } from '../../api/events'

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

  const s = {
    layout: { display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" },
    sidebar: { background: '#1A1A2E', padding: '24px 0' },
    logo: { fontFamily: "'Fraunces', serif", fontSize: '18px', color: 'white', padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' },
    navItem: { padding: '11px 20px', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.55)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' },
    navActive: { padding: '11px 20px', fontSize: '13px', fontWeight: 500, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(233,69,96,0.15)', borderRight: '3px solid #E94560' },
    main: { padding: '32px', background: '#F4F4F6', minHeight: '100vh' },
    progressBox: { background: 'white', borderRadius: '12px', border: '1.5px solid #E0E0E6', padding: '18px 22px', marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '24px' },
    bar: { background: '#E0E0E6', borderRadius: '4px', height: '10px', overflow: 'hidden', flex: 1 },
    tableWrap: { background: 'white', borderRadius: '12px', border: '1.5px solid #E0E0E6', overflow: 'hidden' },
  }

  if (loading) return (
    <div style={s.layout}>
      <Sidebar navigate={navigate} s={s} />
      <div style={{ ...s.main, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7A7A8C', fontSize: '14px' }}>Chargement...</div>
    </div>
  )

  if (error || !event) return (
    <div style={s.layout}>
      <Sidebar navigate={navigate} s={s} />
      <div style={{ ...s.main, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E94560', fontSize: '14px' }}>{error || 'Événement introuvable.'}</div>
    </div>
  )

  return (
    <div style={s.layout}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Fraunces:wght@700;900&display=swap" rel="stylesheet" />
      <Sidebar navigate={navigate} s={s} />

      <div style={s.main}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '22px', color: '#1A1A2E' }}>
            Inscrits — {event.titre}
          </h2>
          <div style={{ fontSize: '13px', color: '#7A7A8C', marginTop: '4px' }}>
            {formatDate(event.date)} · {event.heure?.substring(0, 5)} · {event.lieu}
          </div>
        </div>

        {/* Progress box */}
        <div style={s.progressBox}>
          <div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: '28px', color: '#1A1A2E' }}>{event.inscrits ?? 0}</div>
            <div style={{ fontSize: '12px', color: '#7A7A8C' }}>inscrits</div>
          </div>
          <div style={s.bar}>
            <div style={{ height: '100%', background: '#E94560', borderRadius: '4px', width: `${fillPct}%` }} />
          </div>
          <div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: '28px', color: '#E94560' }}>{event.places_disponibles ?? 0}</div>
            <div style={{ fontSize: '12px', color: '#E94560', fontWeight: 700 }}>places restantes</div>
          </div>
          <div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: '28px', color: '#1A1A2E' }}>{totalPlaces}</div>
            <div style={{ fontSize: '12px', color: '#7A7A8C' }}>places au total</div>
          </div>
        </div>

        {/* Table */}
        <div style={s.tableWrap}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr>
                {['#', 'Nom', 'E-mail', "Date d'inscription"].map(h => (
                  <th key={h} style={{ background: '#F4F4F6', padding: '10px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#7A7A8C', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inscrits.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: '#7A7A8C', fontSize: '13px', padding: '32px' }}>
                    Aucun inscrit pour le moment.
                  </td>
                </tr>
              ) : (
                inscrits.map((p, i) => (
                  <tr key={p.id}>
                    <td style={{ padding: '13px 16px', borderBottom: i < inscrits.length - 1 ? '1px solid #E0E0E6' : 'none', color: '#7A7A8C', fontSize: '12px' }}>{i + 1}</td>
                    <td style={{ padding: '13px 16px', borderBottom: i < inscrits.length - 1 ? '1px solid #E0E0E6' : 'none', color: '#1A1A2E' }}>{p.name}</td>
                    <td style={{ padding: '13px 16px', borderBottom: i < inscrits.length - 1 ? '1px solid #E0E0E6' : 'none', color: '#1A1A2E' }}>{p.email}</td>
                    <td style={{ padding: '13px 16px', borderBottom: i < inscrits.length - 1 ? '1px solid #E0E0E6' : 'none', color: '#1A1A2E' }}>{formatInscriptionDate(p.inscrit_le)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Sidebar({ navigate, s }) {
  return (
    <div style={s.sidebar}>
      <div style={s.logo}>Event<span style={{ color: '#E94560' }}>Campus</span></div>
      <div style={s.navItem} onClick={() => navigate('/organiser/dashboard')}>📊 Dashboard</div>
      <div style={s.navItem} onClick={() => navigate('/organiser/club')}>🏛️ Mon club</div>
      <div style={s.navActive}>📅 Mes événements</div>
      <div style={s.navItem} onClick={() => navigate('/organiser/membres')}>👥 Membres</div>
    </div>
  )
}
