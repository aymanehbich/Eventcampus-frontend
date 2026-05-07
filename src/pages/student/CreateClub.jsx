import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { createClub } from '../../api/clubs'
import './CreateClub.css'

const CATEGORIES = ['Technologie', 'Culture', 'Sport', 'Environnement', 'Art']

export default function CreateClub() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    nom: '',
    emoji: '🎓',
    categorie: 'Technologie',
    description: '',
  })
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

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
      setTimeout(() => navigate('/student/clubs'), 2000)
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

  return (
    <div className="create-club-body">
      <Navbar />
      <div className="create-club-main">
        <div className="create-club-top">
          <h2>Créer un club</h2>
        </div>

        <div className="form-card">
          {/* Live preview */}
          <div className="preview">
            <div className="preview-logo">
              {logoPreview
                ? <img src={logoPreview} alt="logo" />
                : <span>{form.emoji || '🎓'}</span>
              }
            </div>
            <div>
              <div className="preview-name">{form.nom || 'Nom du club'}</div>
              <div className="preview-cat">{form.categorie}</div>
            </div>
            <div className="preview-hint">Aperçu de votre page club</div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nom du club</label>
              <input
                name="nom"
                value={form.nom}
                onChange={handleChange}
                placeholder="Ex : Club Tech & Innovation"
                maxLength={255}
              />
              {errors.nom && <div className="field-error">{errors.nom[0]}</div>}
            </div>

            <div className="form-group">
              <label>Logo (emoji)</label>
              <input
                name="emoji"
                value={form.emoji}
                onChange={handleChange}
                placeholder="Ex : 💡 🎭 🌱"
                maxLength={10}
              />
              {errors.emoji && <div className="field-error">{errors.emoji[0]}</div>}
            </div>

            <div className="form-group">
              <label>Logo image (optionnel)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <div
                className={`logo-upload-zone${logoFile ? ' has-file' : ''}`}
                onClick={() => fileInputRef.current.click()}
              >
                {logoPreview
                  ? <>
                      <img src={logoPreview} alt="aperçu" className="logo-upload-preview" />
                      <div className="logo-upload-name">{logoFile.name}</div>
                      <div className="logo-upload-hint">Cliquer pour changer</div>
                    </>
                  : <>
                      <div style={{ fontSize: '28px' }}>🖼️</div>
                      <div className="logo-upload-label">Cliquer pour uploader un logo</div>
                      <div className="logo-upload-hint">JPEG, PNG, WebP · max 2 MB</div>
                    </>
                }
              </div>
              {errors.logo && <div className="field-error">{errors.logo[0]}</div>}
            </div>

            <div className="form-group">
              <label>Catégorie</label>
              <select name="categorie" value={form.categorie} onChange={handleChange}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              {errors.categorie && <div className="field-error">{errors.categorie[0]}</div>}
            </div>

            <div className="form-group">
              <label>Description du club</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Décrivez votre club en quelques phrases…"
              />
              {errors.description && <div className="field-error">{errors.description[0]}</div>}
            </div>

            {errors.general && <div className="form-error">{errors.general[0]}</div>}
            {success && <div className="form-success">{success}</div>}

            <div className="form-footer">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate('/student/clubs')}
              >
                Annuler
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Création…' : 'Créer le club'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
