import { getCurrentUserId } from '../../utils/currentUser'
import { useState, useEffect, useRef } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { getConversations, createConversation, getMessages, sendMessage, sendBroadcastMessage, searchMembers } from '../../api/messages'
import './Messaging.css'

function Icon({ children, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

const EMOJIS = ['😀','😂','😊','😍','🥰','😎','🤩','🥳','🙂','😉','🤔','😅','😢','😭','😡','👍','👎','👏','🙏','💪','🎉','🔥','⭐','❤️','💡','✅','❌','📅','📍','📎','📢','🎓','📚','🏆','⚽','🎭','💻','🌱','☕','👋']

const isImage = (name = '') => /\.(jpe?g|png|gif|webp)$/i.test(name)

const MegaphoneIcon = ({ size }) => <Icon size={size}><path d="M3 11v2a1 1 0 0 0 1 1h3l8 5V5L7 10H4a1 1 0 0 0-1 1z" /><path d="M19 9a4 4 0 0 1 0 6" /></Icon>

export default function Messaging() {
  const [activeTab, setActiveTab] = useState('individuel')
  const [conversations, setConversations] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [selectedConv, setSelectedConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isBroadcastMode, setIsBroadcastMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searching, setSearching] = useState(false)
  const [file, setFile] = useState(null)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [fileError, setFileError] = useState('')
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const inputRef = useRef(null)
  const emojiRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    fetchConversations()
  }, [activeTab])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!emojiOpen) return
    const onDown = (e) => { if (emojiRef.current && !emojiRef.current.contains(e.target)) setEmojiOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setEmojiOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [emojiOpen])

  useEffect(() => {
    setInfoOpen(false)
    setFile(null)
    setFileError('')
  }, [selectedConv?.id])

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv.id)
    }
  }, [selectedConv])

  // Handle search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const debounce = setTimeout(() => {
      handleSearch()
    }, 300)

    return () => clearTimeout(debounce)
  }, [searchQuery])



 const fetchConversations = async () => {
  try {
    setLoading(true)

    const res = await getConversations(activeTab)

    const rawConversations = Array.isArray(res.data)
      ? res.data
      : (res.data.data || [])

    const formattedConversations = rawConversations.map(conv => ({
      id: conv.id,
      type: conv.type,
      creator_id: conv.creator_id,
      member_id: conv.member_id,

      // Conversation name
      name:
        conv.name ||
        conv.participants?.find(p => p.id !== getCurrentUserId())?.name ||
        'Utilisateur',

      // Last message text
      lastMessage:
        conv.last_message?.content || 'Aucun message',

      // Last message date
      lastMessageAt:
        conv.last_message?.created_at || conv.updated_at,

      unread: false
    }))

    setConversations(formattedConversations)

    if (formattedConversations.length > 0 && !selectedConv) {
      setSelectedConv(formattedConversations[0])
    }

  } catch (err) {
    console.error('Erreur lors du chargement des conversations', err)
  } finally {
    setLoading(false)
  }
}

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    try {
      setSearching(true)
      const res = await searchMembers(searchQuery)
      const results = Array.isArray(res.data) ? res.data : (res.data.data || [])
      setSearchResults(results)
    } catch (err) {
      console.error('Erreur lors de la recherche', err)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const handleStartConversation = async (member) => {
    try {
      setLoading(true)
      const res = await getConversations(activeTab)
      const convs = Array.isArray(res.data) ? res.data : (res.data.conversations || res.data.data || [])

      // Check if conversation already exists
      let conv = convs.find(c => c.member_id === member.id)

      if (!conv) {
        // Create new conversation on backend
        const createRes = await createConversation(member.id)
        conv = createRes.data.data || createRes.data
        // Preserve member info
        conv.name = member.name
        conv.member_id = member.id
      }

      setSelectedConv(conv)
      setSearchQuery('')
      setSearchResults([])
    } catch (err) {
      console.error('Erreur', err)
      alert('Impossible de démarrer la conversation')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (convId) => {
  try {
    const res = await getMessages(convId)

    // Backend response array
    const rawMessages = Array.isArray(res.data)
      ? res.data
      : (res.data.data || res.data.messages || [])

    // Current connected user id
    const currentUserId = getCurrentUserId()

    // Format messages for frontend
    const formattedMessages = rawMessages.map(msg => {
      const senderId = msg.sender?.id || msg.user_id
      return {
        id: msg.id,
        content: msg.content,
        attachmentUrl: msg.attachment_url || null,
        attachmentName: msg.attachment_name || null,
        sentAt: msg.created_at,
        isOwn: Number(senderId) === Number(currentUserId),
        senderName: msg.sender?.name || 'Utilisateur'
      }
    })

    setMessages(formattedMessages)
  } catch (err) {
    console.error('Erreur lors du chargement des messages', err)
  }
}

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !file) || !selectedConv) return

    setSending(true)
    try {
      if (isBroadcastMode) {
        await sendBroadcastMessage(inputValue.trim())
      } else {
        await sendMessage(selectedConv.id, inputValue.trim(), false, file)
      }
      setInputValue('')
      setFile(null)
      setFileError('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (inputRef.current) inputRef.current.style.height = 'auto'
      await fetchMessages(selectedConv.id)
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message', err)
      alert('Impossible d\'envoyer le message.')
    } finally {
      setSending(false)
    }
  }

  const handlePickFile = (e) => {
    const picked = e.target.files?.[0]
    if (!picked) return
    if (picked.size > 5 * 1024 * 1024) {
      setFile(null)
      setFileError('Le fichier dépasse 5 Mo.')
      e.target.value = ''
      return
    }
    setFileError('')
    setFile(picked)
  }

  const insertEmoji = (emoji) => {
    const el = inputRef.current
    const start = el?.selectionStart ?? inputValue.length
    const end = el?.selectionEnd ?? inputValue.length
    const next = inputValue.slice(0, start) + emoji + inputValue.slice(end)
    setInputValue(next)
    setEmojiOpen(false)
    requestAnimationFrame(() => {
      if (!el) return
      el.focus()
      const pos = start + emoji.length
      el.setSelectionRange(pos, pos)
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getAvatarColor = (id) => {
    const colors = ['#0f5132', '#a85a28', '#0b3d26', '#8f4a1f', '#3b6b52', '#6b4a2b']
    return colors[id % colors.length]
  }

  const formatTime = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const now = new Date()
    const diffMs = now - d
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    if (diffDays < 7) return d.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
    return d.toLocaleDateString('fr-FR')
  }

  const displayList = searchQuery.trim() ? searchResults : conversations

  return (
    <DashboardLayout
      active="messages"
      title="Messages"
      subtitle="Échangez avec les membres de votre club"
    >
      <div className="ms">
        {/* Conversation List */}
        <div className="ms__list">
          <div className="ms__list-head">
            <div className="ms__search">
              <Icon size={16}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Icon>
              <input
                type="search"
                placeholder="Rechercher un membre…"
                aria-label="Rechercher un membre"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="ms__tabs" role="tablist" aria-label="Type de conversation">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'individuel'}
              className={`ms__tab${activeTab === 'individuel' ? ' is-active' : ''}`}
              onClick={() => setActiveTab('individuel')}
            >
              Individuel
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'broadcast'}
              className={`ms__tab${activeTab === 'broadcast' ? ' is-active' : ''}`}
              onClick={() => setActiveTab('broadcast')}
            >
              Broadcast
            </button>
          </div>

          <div className="ms__items">
            {loading || searching ? (
              <p className="ms__muted">Chargement...</p>
            ) : displayList.length === 0 ? (
              <p className="ms__muted">{searchQuery.trim() ? 'Aucun membre trouvé.' : 'Aucune conversation.'}</p>
            ) : (
              displayList.map(item => {
                const isSearchResult = searchQuery.trim() && searchResults.includes(item)
                const conv = item
                const isActive = selectedConv?.id === conv.id || selectedConv?.member_id === conv.id
                return (
                  <button
                    type="button"
                    key={conv.id || conv.member_id}
                    className={`ms__conv${isActive ? ' is-active' : ''}${conv.unread ? ' is-unread' : ''}${activeTab === 'broadcast' ? ' is-broadcast' : ''}`}
                    aria-current={isActive ? 'true' : undefined}
                    onClick={() => isSearchResult ? handleStartConversation(conv) : setSelectedConv(conv)}
                  >
                    <span
                      className="ms__avatar"
                      style={{ background: activeTab === 'broadcast' ? 'var(--ec-terra)' : getAvatarColor(conv.id || conv.member_id) }}
                      aria-hidden="true"
                    >
                      {activeTab === 'broadcast' ? <MegaphoneIcon size={18} /> : getInitials(conv.name)}
                    </span>
                    <span className="ms__conv-info">
                      <span className="ms__conv-name">{conv.name}</span>
                      <span className="ms__conv-preview">{isSearchResult ? 'Nouveau membre' : (conv.lastMessage?.substring(0, 50) || 'Aucun message')}</span>
                    </span>
                    <span className="ms__conv-meta">
                      <span className="ms__conv-time">{!isSearchResult && formatTime(conv.lastMessageAt)}</span>
                      {conv.unread && <span className="ms__unread" aria-label="Non lu"></span>}
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Chat Zone */}
        {selectedConv ? (
          <div className="ms__chat">
            {/* Header */}
            <div className="ms__chat-head">
              <span
                className="ms__avatar ms__avatar--lg"
                style={{ background: activeTab === 'broadcast' ? 'var(--ec-terra)' : getAvatarColor(selectedConv.id) }}
                aria-hidden="true"
              >
                {activeTab === 'broadcast' ? <MegaphoneIcon size={20} /> : getInitials(selectedConv.name)}
              </span>
              <div className="ms__chat-title">
                <div className="ms__chat-name">{selectedConv.name}</div>
                <div className="ms__chat-sub">
                  {activeTab === 'broadcast' ? 'Tous les membres' : (selectedConv.memberSince ? `Membre depuis ${selectedConv.memberSince}` : 'Conversation individuelle')}
                </div>
              </div>
              <div className="ms__chat-actions">
                <button
                  type="button"
                  className={`ms__icon-btn${infoOpen ? ' is-active' : ''}`}
                  title="Informations"
                  aria-label="Informations sur la conversation"
                  aria-expanded={infoOpen}
                  onClick={() => setInfoOpen((o) => !o)}
                >
                  <Icon><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></Icon>
                </button>
              </div>
            </div>

            {infoOpen && (
              <div className="ms__info" role="region" aria-label="Informations sur la conversation">
                <div className="ms__info-row"><span>Nom</span><strong>{selectedConv.name}</strong></div>
                <div className="ms__info-row"><span>Type</span><strong>{activeTab === 'broadcast' ? 'Diffusion (tous les membres)' : 'Conversation individuelle'}</strong></div>
                <div className="ms__info-row"><span>Messages</span><strong>{messages.length}</strong></div>
                {messages.length > 0 && (
                  <div className="ms__info-row"><span>Dernier message</span><strong>{new Date(messages[messages.length - 1].sentAt).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}</strong></div>
                )}
              </div>
            )}

            {/* Messages */}
            <div className="ms__messages" role="log" aria-live="polite" aria-label="Messages">
              {messages.length === 0 ? (
                <div className="ms__empty-chat">
                  <span className="ms__empty-icon">
                    <Icon size={26}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></Icon>
                  </span>
                  <p>Aucun message pour le moment</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`ms__msg${msg.isOwn ? ' is-me' : ''}`}
                  >
                    <span
                      className="ms__avatar ms__avatar--sm"
                      style={{
                        background: msg.isOwn
                          ? 'var(--ec-green-dark)'
                          : getAvatarColor(selectedConv.id)
                      }}
                      aria-hidden="true"
                    >
                      {msg.isOwn ? 'M' : getInitials(msg.senderName)}
                    </span>

                    <div className="ms__msg-content">
                      {!msg.isOwn && (
                        <div className="ms__msg-sender">{msg.senderName}</div>
                      )}

                      <div className="ms__bubble">
                        {msg.content}
                        {msg.attachmentUrl && (
                          isImage(msg.attachmentName) ? (
                            <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="ms__attach-img">
                              <img src={msg.attachmentUrl} alt={msg.attachmentName || 'Image jointe'} />
                            </a>
                          ) : (
                            <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" download className="ms__attach">
                              <Icon size={16}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></Icon>
                              <span>{msg.attachmentName || 'Fichier joint'}</span>
                            </a>
                          )
                        )}
                      </div>

                      <div className="ms__msg-time">{formatTime(msg.sentAt)}</div>
                    </div>
                  </div>
                ))
              )}

              <div ref={messagesEndRef}></div>
            </div>

            {/* Input Zone */}
            <div className="ms__input-zone">
              {isBroadcastMode && (
                <div className="ms__broadcast">
                  <div className="ms__bp-head">
                    <span className="ms__bp-title"><MegaphoneIcon size={16} /> Envoyer à tous les membres</span>
                    <button
                      type="button"
                      className="ms__bp-close"
                      onClick={() => setIsBroadcastMode(false)}
                      aria-label="Fermer le mode broadcast"
                    >
                      <Icon size={16}><path d="M6 6l12 12M18 6 6 18" /></Icon>
                    </button>
                  </div>
                  <select className="ec-select" aria-label="Destinataires">
                    <option>Tous les membres du club (142)</option>
                    <option>Sélectionner des membres spécifiques…</option>
                  </select>
                </div>
              )}
              <div className="ms__tools">
                <button
                  type="button"
                  className={`ms__tool${isBroadcastMode ? ' is-active' : ''}`}
                  aria-pressed={isBroadcastMode}
                  onClick={() => setIsBroadcastMode(!isBroadcastMode)}
                >
                  <MegaphoneIcon size={16} /> Broadcast
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="ec-sr-only"
                  tabIndex={-1}
                  aria-hidden="true"
                  accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
                  onChange={handlePickFile}
                />
                <button
                  type="button"
                  className="ms__tool"
                  disabled={isBroadcastMode}
                  title={isBroadcastMode ? 'Pièces jointes indisponibles en mode broadcast' : 'Joindre un fichier (5 Mo max)'}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Icon size={16}><path d="m21 12-8.5 8.5a5 5 0 0 1-7-7L14 5a3.5 3.5 0 0 1 5 5l-8.6 8.6a2 2 0 0 1-2.8-2.8L15 8.5" /></Icon> Fichier
                </button>
                <div className="ms__emoji-wrap" ref={emojiRef}>
                  <button
                    type="button"
                    className={`ms__tool${emojiOpen ? ' is-active' : ''}`}
                    aria-haspopup="true"
                    aria-expanded={emojiOpen}
                    onClick={() => setEmojiOpen((o) => !o)}
                  >
                    <Icon size={16}><circle cx="12" cy="12" r="9" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" /></Icon> Emoji
                  </button>
                  {emojiOpen && (
                    <div className="ms__emoji-pop" role="dialog" aria-label="Choisir un emoji">
                      {EMOJIS.map((em) => (
                        <button key={em} type="button" className="ms__emoji" onClick={() => insertEmoji(em)} aria-label={`Insérer ${em}`}>
                          {em}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {(file || fileError) && (
                <div className={`ms__file${fileError ? ' is-error' : ''}`} role={fileError ? 'alert' : undefined}>
                  {fileError ? fileError : (
                    <>
                      <Icon size={16}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></Icon>
                      <span className="ms__file-name">{file.name}</span>
                      <button
                        type="button"
                        className="ms__file-x"
                        aria-label="Retirer le fichier"
                        onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                      >
                        <Icon size={14}><path d="M6 6l12 12M18 6 6 18" /></Icon>
                      </button>
                    </>
                  )}
                </div>
              )}
              <div className="ms__input-row">
                <textarea
                  ref={inputRef}
                  className="ec-textarea ms__input"
                  placeholder="Écrire un message…"
                  aria-label="Écrire un message"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value)
                    e.target.style.height = 'auto'
                    e.target.style.height = e.target.scrollHeight + 'px'
                  }}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  disabled={sending}
                />
                <button
                  type="button"
                  className="ec-btn ec-btn--primary ms__send"
                  onClick={handleSendMessage}
                  disabled={sending || (!inputValue.trim() && !file)}
                >
                  {sending ? 'Envoi…' : <>Envoyer <Icon size={16}><path d="M12 19V5m-6 6 6-6 6 6" /></Icon></>}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="ms__empty-state">
            <p>Sélectionnez une conversation pour démarrer.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
