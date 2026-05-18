import { useState, useEffect } from 'react'
import { getRoleRequests, approveRoleRequest, refuseRoleRequest } from '../../api/admin'

function RoleRequestsSection() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(false)
  const [actionId, setActionId] = useState(null)
  const [toast, setToast]       = useState(null) // { message, type: 'success' | 'error' }

  useEffect(() => { fetchRequests() }, [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const res = await getRoleRequests()
      setRequests(Array.isArray(res.data.data) ? res.data.data : [])
    } catch (err) {
      console.error('Erreur chargement demandes:', err)
    } finally {
      setLoading(false)
    }
  }

  const handle = async (id, action, name) => {
    setActionId(id)
    try {
      if (action === 'approve') await approveRoleRequest(id)
      else                      await refuseRoleRequest(id)
      setRequests(prev => prev.filter(r => r.id !== id))
      showToast(
        action === 'approve'
          ? `✅ ${name} a été approuvé comme organisateur.`
          : `❌ La demande de ${name} a été refusée.`,
        action === 'approve' ? 'success' : 'error'
      )
    } catch (err) {
      showToast('Une erreur est survenue. Réessayez.', 'error')
    } finally {
      setActionId(null)
    }
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 1000,
          background: toast.type === 'success' ? '#4CAF50' : '#f44336',
          color: 'white', padding: '14px 20px', borderRadius: '10px',
          fontSize: '13px', fontWeight: 600, boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          animation: 'fadeIn 0.2s ease',
        }}>
          {toast.message}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#7A7A8C', fontSize: '14px' }}>
          Chargement...
        </div>
      )}

      {!loading && requests.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#7A7A8C', fontSize: '14px' }}>
          Aucune demande de rôle en attente
        </div>
      )}

      {!loading && requests.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {requests.map((req) => (
            <div key={req.id} style={{
              background: 'white', border: '1.5px solid #E0E0E6',
              borderRadius: '10px', padding: '16px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontWeight: 600, color: '#1A1A2E', fontSize: '14px', marginBottom: '4px' }}>
                  {req.name || req.user?.name}
                </div>
                <div style={{ color: '#555', fontSize: '12px', marginBottom: '8px' }}>
                  {req.email || req.user?.email}
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{
                    background: 'rgba(255,149,0,0.12)', color: '#FF9500',
                    padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                  }}>
                    🏛️ Demande organisateur
                  </span>
                  {req.student_id && (
                    <span style={{ fontSize: '11px', color: '#7A7A8C' }}>
                      N° étudiant : {req.student_id}
                    </span>
                  )}
                  <span style={{ fontSize: '11px', color: '#7A7A8C' }}>
                    {req.created_at ? new Date(req.created_at).toLocaleDateString('fr-FR') : ''}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  disabled={actionId === req.id}
                  onClick={() => handle(req.id, 'approve', req.name || req.user?.name)}
                  style={{
                    background: '#4CAF50', color: 'white', border: 'none',
                    borderRadius: '6px', padding: '8px 16px', fontSize: '12px',
                    fontWeight: 600, cursor: actionId === req.id ? 'not-allowed' : 'pointer',
                    opacity: actionId === req.id ? 0.6 : 1, transition: 'opacity 0.15s',
                  }}
                >
                  ✓ Approuver
                </button>
                <button
                  disabled={actionId === req.id}
                  onClick={() => handle(req.id, 'refuse', req.name || req.user?.name)}
                  style={{
                    background: '#f44336', color: 'white', border: 'none',
                    borderRadius: '6px', padding: '8px 16px', fontSize: '12px',
                    fontWeight: 600, cursor: actionId === req.id ? 'not-allowed' : 'pointer',
                    opacity: actionId === req.id ? 0.6 : 1, transition: 'opacity 0.15s',
                  }}
                >
                  ✕ Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RoleRequestsSection