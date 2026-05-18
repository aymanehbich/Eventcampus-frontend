import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getConversations, getMessages, sendMessage, startConversation } from '../../api/messages'
import Navbar from '../../components/Navbar'
import './StudentMessaging.css'

export default function StudentMessaging() {
  const navigate = useNavigate()
  const location = useLocation()
  const [conversations, setConversations] = useState([])
  const [selectedConv, setSelectedConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv.id)
    }
  }, [selectedConv])

  useEffect(() => {
    const convId = location.state?.conversationId
    const organizerId = location.state?.organizerId
    const organizerName = location.state?.organizerName

    if (convId) {
      const conv = conversations.find(c => c.id === convId)
      if (conv) setSelectedConv(conv)
    } else if (organizerId) {
      startConvWithOrganizer(organizerId, organizerName)
    }
  }, [conversations])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const res = await getConversations('individuel')
      const raw = Array.isArray(res.data) ? res.data : (res.data?.data || [])

      const formatted = raw.map(conv => {
        const otherParticipant = conv.participants?.find(
          p => p.id !== Number(localStorage.getItem('user_id'))
        )
        return {
          id: conv.id,
          name: conv.name || otherParticipant?.name || 'Contact',
          lastMessage: conv.last_message?.content || 'Aucun message',
          lastMessageAt: conv.last_message?.created_at || conv.updated_at,
        }
      })

      setConversations(formatted)
    } catch (err) {
      console.error('Erreur lors du chargement des conversations', err)
    } finally {
      setLoading(false)
    }
  }

  const startConvWithOrganizer = async (organizerId, organizerName) => {
    try {
      setLoading(true)
      const res = await startConversation(organizerId)
      const convData = res.data.data || res.data

      const newConv = {
        id: convData.id,
        name: organizerName || convData.name || 'Organisateur',
        lastMessage: convData.last_message?.content || 'Nouvelle conversation',
        lastMessageAt: convData.last_message?.created_at || convData.updated_at,
      }

      setConversations(prev => {
        const exists = prev.find(c => c.id === newConv.id)
        if (exists) return prev
        return [newConv, ...prev]
      })
      setSelectedConv(newConv)
    } catch (err) {
      console.error('Impossible de démarrer la conversation', err)
      alert('Impossible de démarrer la conversation avec l\'organisateur.')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (convId) => {
    try {
      const res = await getMessages(convId)
      const raw = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.messages || [])
      const currentUserId = Number(localStorage.getItem('user_id')) || JSON.parse(localStorage.getItem('user') || '{}')?.id

      const formatted = raw.map(msg => {
        const senderId = msg.sender?.id || msg.user_id
        return {
          id: msg.id,
          content: msg.content,
          sentAt: msg.created_at,
          isOwn: Number(senderId) === Number(currentUserId),
          senderName: msg.sender?.name || 'Utilisateur',
        }
      })

      setMessages(formatted)
    } catch (err) {
      console.error('Erreur lors du chargement des messages', err)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedConv) return

    setSending(true)
    try {
      await sendMessage(selectedConv.id, inputValue.trim())
      setInputValue('')
      await fetchMessages(selectedConv.id)
      await fetchConversations()
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
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
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

  return (
    <div className="student-messaging-body">
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Fraunces:wght@700;900&display=swap" rel="stylesheet" />
      <Navbar />

      <div className="student-messaging-layout">
        <div className="student-messaging-conv-list">
          <div className="student-messaging-list-header">
            <h3>Conversations</h3>
          </div>

          <div className="student-messaging-conv-items">
            {loading ? (
              <p className="student-messaging-muted">Chargement...</p>
            ) : conversations.length === 0 ? (
              <p className="student-messaging-muted">Aucune conversation.</p>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.id}
                  className={`student-messaging-conv-item ${selectedConv?.id === conv.id ? 'active' : ''}`}
                  onClick={() => setSelectedConv(conv)}
                >
                  <div
                    className="student-messaging-conv-avatar"
                    style={{ background: getAvatarColor(conv.id) }}
                  >
                    {getInitials(conv.name)}
                  </div>
                  <div className="student-messaging-conv-info">
                    <div className="student-messaging-conv-name">{conv.name}</div>
                    <div className="student-messaging-conv-preview">
                      {conv.lastMessage?.substring(0, 50) || 'Aucun message'}
                    </div>
                  </div>
                  <div className="student-messaging-conv-meta">
                    <div className="student-messaging-conv-time">{formatTime(conv.lastMessageAt)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="student-messaging-chat-zone">
          {selectedConv ? (
            <>
              <div className="student-messaging-chat-header">
                <div
                  className="student-messaging-chat-avatar"
                  style={{ background: getAvatarColor(selectedConv.id) }}
                >
                  {getInitials(selectedConv.name)}
                </div>
                <div>
                  <div className="student-messaging-chat-name">{selectedConv.name}</div>
                  <div className="student-messaging-chat-sub">Conversation privée</div>
                </div>
              </div>

              <div className="student-messaging-messages">
                {messages.length === 0 ? (
                  <div className="student-messaging-empty-chat">
                    <div className="student-messaging-empty-icon">💬</div>
                    <p>Aucun message. Envoyez le premier !</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`student-messaging-msg ${msg.isOwn ? 'me' : ''}`}
                    >
                      <div
                        className="student-messaging-msg-av"
                        style={{
                          background: msg.isOwn ? '#1A1A2E' : getAvatarColor(selectedConv.id),
                        }}
                      >
                        {msg.isOwn ? 'M' : getInitials(msg.senderName)}
                      </div>
                      <div className="student-messaging-msg-content">
                        {!msg.isOwn && (
                          <div className="student-messaging-msg-sender">{msg.senderName}</div>
                        )}
                        <div className="student-messaging-msg-bubble">{msg.content}</div>
                        <div className="student-messaging-msg-time">{formatTime(msg.sentAt)}</div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="student-messaging-input-zone">
                <div className="student-messaging-input-row">
                  <textarea
                    className="student-messaging-input-box"
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
                    className="student-messaging-btn-send"
                    onClick={handleSendMessage}
                    disabled={sending || !inputValue.trim()}
                  >
                    {sending ? '⏱️' : 'Envoyer ↑'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="student-messaging-empty-state">
              <div className="student-messaging-empty-icon">✉️</div>
              <p>Sélectionnez une conversation pour démarrer.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
