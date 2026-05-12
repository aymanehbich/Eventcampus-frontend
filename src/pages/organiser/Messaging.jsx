import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getConversations, createConversation, getMessages, sendMessage, sendBroadcastMessage, searchMembers } from '../../api/messages'
import './Messaging.css'

export default function Messaging() {
  const navigate = useNavigate()
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
  const messagesEndRef = useRef(null)

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
        conv.participants?.find(p => p.id !== Number(localStorage.getItem('user_id')))?.name ||
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
    const currentUserId = Number(localStorage.getItem('user_id'))

    // Format messages for frontend
    const formattedMessages = rawMessages.map(msg => ({
      id: msg.id,
      content: msg.content,
      sentAt: msg.created_at,
      isOwn: msg.user_id === currentUserId,
      senderName: msg.sender?.name || 'Utilisateur'
    }))

    setMessages(formattedMessages)
  } catch (err) {
    console.error('Erreur lors du chargement des messages', err)
  }
}

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedConv) return

    setSending(true)
    try {
      if (isBroadcastMode) {
        await sendBroadcastMessage(inputValue.trim())
      } else {
        await sendMessage(selectedConv.id, inputValue.trim(), false)
      }
      setInputValue('')
      await fetchMessages(selectedConv.id)
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message', err)
      alert('Impossible d\'envoyer le message.')
    } finally {
      setSending(false)
    }
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
    const colors = ['#E94560', '#0F3460', '#2ECC71', '#F39C12', '#9B59B6', '#E74C3C']
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
    <div className="messaging-layout">
      {/* Sidebar Navigation */}
      <div className="messaging-sidebar">
        <div className="messaging-logo">Event<span>Campus</span></div>
        <div className="messaging-nav-item" onClick={() => navigate('/organiser/events')}>
          📊 Dashboard
        </div>
        <div className="messaging-nav-item" onClick={() => navigate('/organiser/club')}>
          🏛️ Mon club
        </div>
        <div className="messaging-nav-item" onClick={() => navigate('/organiser/events')}>
          📅 Mes événements
        </div>
        <div className="messaging-nav-item" onClick={() => navigate('/organiser/adhesions')}>
          👥 Membres
        </div>
        <div className="messaging-nav-item active">✉️ Messages</div>
      </div>

      {/* Main Messaging Area */}
      <div className="messaging-main">
        {/* Conversation List */}
        <div className="messaging-conv-list">
          <div className="messaging-conv-header">
            <h3>Messagerie</h3>
            <div className="messaging-search-box">
              <span>🔍</span>
              <input
                placeholder="Rechercher un membre…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="messaging-conv-tabs">
            <div
              className={`messaging-conv-tab ${activeTab === 'individuel' ? 'active' : ''}`}
              onClick={() => setActiveTab('individuel')}
            >
              Individuel
            </div>
            <div
              className={`messaging-conv-tab ${activeTab === 'broadcast' ? 'active' : ''}`}
              onClick={() => setActiveTab('broadcast')}
            >
              Broadcast
            </div>
          </div>

          <div className="messaging-conv-items">
            {loading || searching ? (
              <p className="messaging-muted">Chargement...</p>
            ) : displayList.length === 0 ? (
              <p className="messaging-muted">{searchQuery.trim() ? 'Aucun membre trouvé.' : 'Aucune conversation.'}</p>
            ) : (
              displayList.map(item => {
                const isSearchResult = searchQuery.trim() && searchResults.includes(item)
                const conv = item
                return (
                  <div
                    key={conv.id || conv.member_id}
                    className={`messaging-conv-item ${selectedConv?.id === conv.id || selectedConv?.member_id === conv.id ? 'active' : ''} ${
                      conv.unread ? 'unread' : ''
                    } ${activeTab === 'broadcast' ? 'broadcast' : ''}`}
                    onClick={() => isSearchResult ? handleStartConversation(conv) : setSelectedConv(conv)}
                  >
                    <div
                      className="messaging-conv-avatar"
                      style={{ background: activeTab === 'broadcast' ? '#F39C12' : getAvatarColor(conv.id || conv.member_id) }}
                    >
                      {activeTab === 'broadcast' ? '📢' : getInitials(conv.name)}
                    </div>
                    <div className="messaging-conv-info">
                      <div className="messaging-conv-name">{conv.name}</div>
                      <div className="messaging-conv-preview">{isSearchResult ? 'Nouveau membre' : (conv.lastMessage?.substring(0, 50) || 'Aucun message')}</div>
                    </div>
                    <div className="messaging-conv-meta">
                      <div className="messaging-conv-time">{!isSearchResult && formatTime(conv.lastMessageAt)}</div>
                      {conv.unread && <div className="messaging-unread-dot"></div>}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Chat Zone */}
        {selectedConv ? (
          <div className="messaging-chat-zone">
            {/* Header */}
            <div className="messaging-chat-header">
              <div
                className="messaging-chat-avatar"
                style={{ background: activeTab === 'broadcast' ? '#F39C12' : getAvatarColor(selectedConv.id) }}
              >
                {activeTab === 'broadcast' ? '📢' : getInitials(selectedConv.name)}
              </div>
              <div>
                <div className="messaging-chat-name">{selectedConv.name}</div>
                <div className="messaging-chat-sub">
                  {activeTab === 'broadcast' ? 'Tous les membres' : `Membre depuis ${selectedConv.memberSince || 'N/A'}`}
                </div>
              </div>
              <div className="messaging-chat-actions">
                <button className="messaging-btn-icon" title="Voir le profil">
                  👤
                </button>
                <button className="messaging-btn-icon" title="Informations">
                  ℹ️
                </button>
              </div>
            </div>

            {/* Messages */}
          <div className="messaging-messages">
  {messages.length === 0 ? (
    <div className="messaging-empty-chat">
      <div className="messaging-empty-icon">💬</div>
      <p>Aucun message yet</p>
    </div>
  ) : (
    messages.map((msg) => (
      <div
        key={msg.id}
        className={`messaging-msg ${msg.isOwn ? 'me' : ''}`}
      >
        <div
          className="messaging-msg-av"
          style={{
            background: msg.isOwn
              ? '#1A1A2E'
              : getAvatarColor(selectedConv.id)
          }}
        >
          {msg.isOwn ? 'M' : getInitials(msg.senderName)}
        </div>

        <div className="messaging-msg-content">
          {!msg.isOwn && (
            <div className="messaging-msg-sender">
              {msg.senderName}
            </div>
          )}

          <div className="messaging-msg-bubble">
            {msg.content}
          </div>

          <div className="messaging-msg-time">
            {formatTime(msg.sentAt)}
          </div>
        </div>
      </div>
    ))
  )}

  <div ref={messagesEndRef}></div>
</div>

            {/* Input Zone */}
            <div className="messaging-input-zone">
              {isBroadcastMode && (
                <div className="messaging-broadcast-panel">
                  <div className="messaging-bp-header">
                    <span className="messaging-bp-title">📢 Envoyer à tous les membres</span>
                    <button
                      className="messaging-bp-close"
                      onClick={() => setIsBroadcastMode(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <select className="messaging-bp-select">
                    <option>Tous les membres du club (142)</option>
                    <option>Sélectionner des membres spécifiques…</option>
                  </select>
                </div>
              )}
              <div className="messaging-input-tools">
                <button
                  className="messaging-tool-btn"
                  onClick={() => setIsBroadcastMode(!isBroadcastMode)}
                >
                  📢 Broadcast
                </button>
                <button className="messaging-tool-btn">📎 Fichier</button>
                <button className="messaging-tool-btn">😊 Emoji</button>
              </div>
              <div className="messaging-input-row">
                <textarea
                  className="messaging-input-box"
                  placeholder="Écrire un message…"
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
                  className="messaging-btn-send"
                  onClick={handleSendMessage}
                  disabled={sending || !inputValue.trim()}
                >
                  {sending ? '⏱️' : 'Envoyer ↑'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="messaging-empty-state">
            <p>Sélectionnez une conversation pour démarrer.</p>
          </div>
        )}
      </div>
    </div>
  )
}
