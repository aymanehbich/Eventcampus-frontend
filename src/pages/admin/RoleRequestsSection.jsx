import { useState, useEffect } from 'react'
import { getRoleRequests, approveRoleRequest, refuseRoleRequest } from '../../api/admin'
import AdminIcon from './AdminIcon'
import './AdminDashboard.css'

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
          ? `${name} a été approuvé comme organisateur.`
          : `La demande de ${name} a été refusée.`,
        action === 'approve' ? 'success' : 'error'
      )
    } catch (err) {
      showToast('Une erreur est survenue. Réessayez.', 'error')
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="adm">
      {/* Toast */}
      {toast && (
        <div
          role="status"
          className={`ec-alert adm__toast ${toast.type === 'success' ? 'ec-alert--success' : 'ec-alert--error'}`}
        >
          <AdminIcon name={toast.type === 'success' ? 'check' : 'x'} size={18} />
          <span>{toast.message}</span>
        </div>
      )}

      {loading && <div className="ec-state" role="status">Chargement...</div>}

      {!loading && requests.length === 0 && (
        <div className="ec-state">Aucune demande de rôle en attente</div>
      )}

      {!loading && requests.length > 0 && (
        <div className="ec-table-wrap">
          <table className="ec-table adm__table">
            <thead>
              <tr>
                {['Demandeur', 'Demande', 'N° étudiant', 'Date', 'Actions'].map(h => (
                  <th key={h} scope="col">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => {
                const name = req.name || req.user?.name
                return (
                  <tr key={req.id}>
                    <td>
                      <div className="adm__cell-title">{name}</div>
                      <div className="adm__cell-sub">{req.email || req.user?.email}</div>
                    </td>
                    <td>
                      <span className="ec-badge ec-badge--amber">
                        <AdminIcon name="club" size={12} />
                        Demande organisateur
                      </span>
                    </td>
                    <td className="adm__nowrap">{req.student_id || '—'}</td>
                    <td className="adm__nowrap">
                      {req.created_at ? new Date(req.created_at).toLocaleDateString('fr-FR') : ''}
                    </td>
                    <td>
                      <div className="adm__actions">
                        <button
                          type="button"
                          className="ec-btn ec-btn--primary ec-btn--sm"
                          disabled={actionId === req.id}
                          onClick={() => handle(req.id, 'approve', name)}
                        >
                          <AdminIcon name="check" />
                          Approuver
                        </button>
                        <button
                          type="button"
                          className="ec-btn ec-btn--danger ec-btn--sm"
                          disabled={actionId === req.id}
                          onClick={() => handle(req.id, 'refuse', name)}
                        >
                          <AdminIcon name="x" />
                          Refuser
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default RoleRequestsSection
