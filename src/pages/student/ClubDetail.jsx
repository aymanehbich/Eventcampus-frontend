import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { getClub, joinClub, leaveClub } from '../../api/clubs'

const MEMBER_COLORS = ['#E94560', '#1A1A2E', '#4CAF50', '#FF9800', '#2196F3', '#9C27B0']

export default function ClubDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [club, setClub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    fetchClub()
  }, [id])

  const fetchClub = async () => {
    try {
      setLoading(true)
      const res = await getClub(id)
      setClub(res.data)
    } catch (err) {
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
        setClub(prev => ({
          ...prev,
          is_member: true,
          membres_count: (prev.membres_count ?? 0) + 1,
        }))
      }
    } catch (err) {
      alert('Une erreur est survenue.')
    } finally {
      setJoining(false)
    }
  }

  if (loading) return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#EAEAEF', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '80px', color: '#7A7A8C', fontSize: '14px' }}>
        Chargement...
      </div>
    </div>
  )

  if (error || !club) return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#EAEAEF', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '80px', color: '#E94560', fontSize: '14px' }}>
        {error || 'Club introuvable.'}
      </div>
    </div>
  )

  const membres = club.membres || []
  const membresPublics = membres.slice(0, 4)
  const totalMembres = club.membres_count ?? membres.length
  const resteMembres = totalMembres - membresPublics.length
  const anneeCreation = club.created_at
    ? new Date(club.created_at).getFullYear()
    : null

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#EAEAEF', minHeight: '100vh' }}>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Fraunces:wght@700;900&display=swap"
        rel="stylesheet"
      />

      <Navbar />

      {/* ── Hero Banner ── */}
      <div style={{
        background: '#1A1A2E', padding: '40px 48px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          {/* Icône */}
          <div style={{
            width: '90px', height: '90px', borderRadius: '16px', background: '#2A2A4E',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '42px', flexShrink: 0,
          }}>
            {club.emoji || '🏛️'}
          </div>

          <div>
            <h1 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '28px', color: 'white', marginBottom: '6px',
            }}>
              {club.nom}
            </h1>
            <div style={{ fontSize: '13px', color: '#7A7A8C', marginBottom: '20px' }}>
              {club.categorie}
              {anneeCreation ? ` · Fondé en ${anneeCreation}` : ''}
            </div>
            <div style={{ display: 'flex', gap: '36px' }}>
              <div>
                <div style={{ fontSize: '26px', fontWeight: 700, color: 'white' }}>
                  {totalMembres}
                </div>
                <div style={{ fontSize: '12px', color: '#7A7A8C' }}>Membres</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton rejoindre */}
        <button
          onClick={handleJoinLeave}
          disabled={joining}
          style={{
            padding: '14px 32px', borderRadius: '12px', fontSize: '14px',
            fontWeight: 700, cursor: joining ? 'wait' : 'pointer',
            fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
            background: club.is_member ? 'transparent' : 'linear-gradient(135deg, #E94560, #C0392B)',
            color: club.is_member ? '#E94560' : 'white',
            border: club.is_member ? '2px solid #E94560' : '2px solid transparent',
            boxShadow: club.is_member ? 'none' : '0 4px 14px rgba(233, 69, 96, 0.4)',
            letterSpacing: '0.3px', transition: 'all 0.2s', opacity: joining ? 0.7 : 1,
          }}
        >
          {joining ? '...' : club.is_member ? '✓ Membre' : 'Rejoindre ce club'}
        </button>
      </div>

      {/* ── Body ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 300px',
        gap: '24px', padding: '28px 48px', alignItems: 'start',
      }}>

        {/* Colonne gauche */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Description */}
          <div style={{
            background: 'white', borderRadius: '14px',
            padding: '28px', border: '1.5px solid #E0E0E6',
          }}>
            <h2 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '20px', color: '#1A1A2E', marginBottom: '14px',
            }}>
              Description du club
            </h2>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.75' }}>
              {club.description || 'Aucune description disponible.'}
            </p>
          </div>

          {/* Retour */}
          <button
            onClick={() => navigate('/student/clubs')}
            style={{
              alignSelf: 'flex-start', padding: '10px 20px',
              borderRadius: '8px', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', border: '1.5px solid #E0E0E6',
              background: 'white', color: '#7A7A8C',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            ← Retour aux clubs
          </button>
        </div>

        {/* Sidebar membres */}
        <div style={{
          background: 'white', borderRadius: '14px',
          padding: '24px', border: '1.5px solid #E0E0E6',
        }}>
          <h3 style={{
            fontSize: '15px', fontWeight: 700,
            color: '#1A1A2E', marginBottom: '18px',
          }}>
            Membres publics
          </h3>

          {membresPublics.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#7A7A8C' }}>Aucun membre public.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {membresPublics.map((m, i) => {
                const fullName = `${m.prenom || ''} ${m.nom || ''}`.trim() || 'Membre'
                const initial = fullName[0]?.toUpperCase() || '?'
                const role = m.pivot?.role === 'responsable' ? 'Responsable' : 'Membre'

                return (
                  <div key={m.id || i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                      background: MEMBER_COLORS[i % MEMBER_COLORS.length],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: '15px', fontWeight: 700,
                    }}>
                      {initial}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A2E' }}>
                        {fullName}
                      </div>
                      <div style={{ fontSize: '11px', color: '#7A7A8C' }}>{role}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {resteMembres > 0 && (
            <div style={{ fontSize: '12px', color: '#7A7A8C', marginTop: '16px' }}>
              + {resteMembres} autres membres…
            </div>
          )}
        </div>
      </div>
    </div>
  )
}