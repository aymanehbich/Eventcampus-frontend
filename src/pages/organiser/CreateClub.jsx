import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { createClub } from '../../api/clubs'

const CATEGORIES = ['Technologie', 'Culture', 'Sport', 'Environnement', 'Art', 'Solidarité']

export default function CreateClub() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({ nom: '', emoji: '🎓', categorie: 'Technologie', description: '' })
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    const data = new FormData()
    data.append('nom', form.nom)
    data.append('description', form.description)
    data.append('categorie', form.categorie)
    data.append('emoji', form.emoji)
    if (logoFile) data.append('logo', logoFile)
    try {
      await createClub(data)
      setSuccess('Club créé avec succès. Il est en attente de validation.')
      setTimeout(() => navigate('/organiser/clubs'), 2000)
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {})
      } else {
        setErrors({ general: ['Une erreur est survenue. Veuillez réessayer.'] })
      }
    } finally {
      setLoading(false)
    }
  }

  const s = {
    layout: { display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" },
    sidebar: { background: '#1A1A2E', padding: '24px 0', position: 'relative' },
    logo: { fontFamily: "'Fraunces', serif", fontSize: '18px', color: 'white', padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' },
    navItem: { padding: '11px 20px', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.55)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' },
    navActive: { padding: '11px 20px', fontSize: '13px', fontWeight: 500, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(233,69,96,0.15)', borderRight: '3px solid #E94560' },
    main: { padding: '32px', background: '#F4F4F6', minHeight: '100vh' },
    label: { display: 'block', fontSize: '13px', fontWeight: 600, color: '#1A1A2E', marginBottom: '6px' },
    input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #E0E0E6', fontSize: '14px', color: '#1A1A2E', background: 'white', outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" },
    fieldError: { fontSize: '12px', color: '#E94560', marginTop: '4px' },
  }

  return (
    <div style={s.layout}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Fraunces:wght@700;900&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.logo}>Event<span style={{ color: '#E94560' }}>Campus</span></div>
        <div style={s.navItem} onClick={() => navigate('/organiser/dashboard')}>📊 Dashboard</div>
        <div style={s.navActive}>🏛️ Mon club</div>
        <div style={s.navItem} onClick={() => navigate('/organiser/events')}>📅 Mes événements</div>
        <div style={s.navItem} onClick={() => navigate('/organiser/adhesions')}>👥 Membres</div>
        <div style={s.navItem} onClick={() => navigate('/organiser/messages')}>✉️ Messages</div>
        <div style={{ position: 'absolute', bottom: '24px', left: 0, width: '220px', boxSizing: 'border-box', padding: '0 16px' }}>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
            <button
              onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login') }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                padding: '11px 14px', borderRadius: '10px', border: '1px solid rgba(233,69,96,0.35)',
                background: 'rgba(233,69,96,0.1)', color: '#E94560',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#E94560'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#E94560' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(233,69,96,0.1)'; e.currentTarget.style.color = '#E94560'; e.currentTarget.style.borderColor = 'rgba(233,69,96,0.35)' }}
            >
              <span style={{ fontSize: '16px' }}>🚪</span> Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={s.main}>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '22px', color: '#1A1A2E', margin: 0 }}>Créer un club</h2>
          <div style={{ fontSize: '13px', color: '#7A7A8C', marginTop: '4px' }}>Remplissez le formulaire ci-dessous. Votre club sera soumis à validation.</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', alignItems: 'start' }}>

          {/* Formulaire */}
          <div style={{ background: 'white', borderRadius: '14px', border: '1.5px solid #E0E0E6', padding: '28px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Nom */}
              <div>
                <label style={s.label}>Nom du club</label>
                <input name="nom" value={form.nom} onChange={handleChange}
                  placeholder="Ex : Club Tech & Innovation" maxLength={255} style={s.input}
                  onFocus={e => e.target.style.borderColor = '#E94560'}
                  onBlur={e => e.target.style.borderColor = '#E0E0E6'}
                />
                {errors.nom && <div style={s.fieldError}>{errors.nom[0]}</div>}
              </div>

              {/* Emoji + Catégorie côte à côte */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={s.label}>Emoji du club</label>
                  <input name="emoji" value={form.emoji} onChange={handleChange}
                    placeholder="🎓" maxLength={10} style={s.input}
                    onFocus={e => e.target.style.borderColor = '#E94560'}
                    onBlur={e => e.target.style.borderColor = '#E0E0E6'}
                  />
                  {errors.emoji && <div style={s.fieldError}>{errors.emoji[0]}</div>}
                </div>
                <div>
                  <label style={s.label}>Catégorie</label>
                  <select name="categorie" value={form.categorie} onChange={handleChange}
                    style={{ ...s.input, cursor: 'pointer' }}
                    onFocus={e => e.target.style.borderColor = '#E94560'}
                    onBlur={e => e.target.style.borderColor = '#E0E0E6'}
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  {errors.categorie && <div style={s.fieldError}>{errors.categorie[0]}</div>}
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={s.label}>Description du club</label>
                <textarea name="description" value={form.description} onChange={handleChange}
                  placeholder="Décrivez votre club en quelques phrases…" rows={4}
                  style={{ ...s.input, resize: 'vertical', lineHeight: '1.6' }}
                  onFocus={e => e.target.style.borderColor = '#E94560'}
                  onBlur={e => e.target.style.borderColor = '#E0E0E6'}
                />
                {errors.description && <div style={s.fieldError}>{errors.description[0]}</div>}
              </div>

              {/* Logo image */}
              <div>
                <label style={s.label}>Logo image <span style={{ color: '#7A7A8C', fontWeight: 400 }}>(optionnel)</span></label>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/jpg,image/webp"
                  style={{ display: 'none' }} onChange={handleFileChange} />
                <div
                  onClick={() => fileInputRef.current.click()}
                  style={{
                    border: '2px dashed #E0E0E6', borderRadius: '10px', padding: '20px',
                    textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s',
                    background: '#FAFAFA',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#E94560'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#E0E0E6'}
                >
                  {logoPreview ? (
                    <>
                      <img src={logoPreview} alt="aperçu" style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover', marginBottom: '8px' }} />
                      <div style={{ fontSize: '13px', color: '#1A1A2E', fontWeight: 600 }}>{logoFile.name}</div>
                      <div style={{ fontSize: '11px', color: '#7A7A8C', marginTop: '2px' }}>Cliquer pour changer</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '28px', marginBottom: '6px' }}>🖼️</div>
                      <div style={{ fontSize: '13px', color: '#1A1A2E', fontWeight: 600 }}>Cliquer pour uploader un logo</div>
                      <div style={{ fontSize: '11px', color: '#7A7A8C', marginTop: '2px' }}>JPEG, PNG, WebP · max 2 MB</div>
                    </>
                  )}
                </div>
                {errors.logo && <div style={s.fieldError}>{errors.logo[0]}</div>}
              </div>

              {errors.general && (
                <div style={{ background: '#FFE6E6', color: '#E94560', borderRadius: '8px', padding: '10px 14px', fontSize: '13px' }}>
                  {errors.general[0]}
                </div>
              )}
              {success && (
                <div style={{ background: '#E6FFE6', color: '#4CAF50', borderRadius: '8px', padding: '10px 14px', fontSize: '13px' }}>
                  {success}
                </div>
              )}

              {/* Footer boutons */}
              <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
                <button type="button" onClick={() => navigate('/organiser/clubs')}
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1.5px solid #E0E0E6', background: 'white', color: '#7A7A8C', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                >
                  Annuler
                </button>
                <button type="submit" disabled={loading}
                  style={{ flex: 2, padding: '12px', borderRadius: '10px', border: 'none', background: loading ? '#ccc' : 'linear-gradient(135deg, #E94560, #C0392B)', color: 'white', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: loading ? 'none' : '0 4px 12px rgba(233,69,96,0.35)', transition: 'opacity 0.15s' }}
                >
                  {loading ? 'Création en cours…' : '✅ Créer le club'}
                </button>
              </div>
            </form>
          </div>

          {/* Aperçu live */}
          <div style={{ background: 'white', borderRadius: '14px', border: '1.5px solid #E0E0E6', padding: '22px', position: 'sticky', top: '32px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#7A7A8C', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>Aperçu</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#F4F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', overflow: 'hidden', flexShrink: 0 }}>
                {logoPreview
                  ? <img src={logoPreview} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : form.emoji || '🎓'
                }
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: form.nom ? '#1A1A2E' : '#C0C0C8' }}>
                  {form.nom || 'Nom du club'}
                </div>
                <div style={{ fontSize: '12px', color: '#7A7A8C', marginTop: '2px' }}>{form.categorie}</div>
              </div>
            </div>
            {form.description && (
              <p style={{ fontSize: '12px', color: '#555', lineHeight: '1.6', margin: '0 0 14px' }}>
                {form.description.length > 120 ? form.description.slice(0, 120) + '…' : form.description}
              </p>
            )}
            <div style={{ background: '#FFF4E6', color: '#FF9500', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', fontWeight: 600, display: 'inline-block' }}>
              ⏳ En attente de validation
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
