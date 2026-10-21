import { getCurrentUserId } from '../../utils/currentUser'
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
          p => p.id !== getCurrentUserId()
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
      const currentUserId = getCurrentUserId()

      const formatted = raw.map(msg => {
        const senderId = msg.sender?.id || msg.user_id
        return {
          id: msg.id,
          content: msg.content,
          attachmentUrl: msg.attachment_url || null,
          attachmentName: msg.attachment_name || null,
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

  const getAvatarTone = (id) => {
    const tones = ['green', 'terra', 'dark', 'brown']
    return tones[id % tones.length]
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
      <Navbar />

      <div className={`student-messaging-layout${selectedConv ? ' has-conv' : ''}`}>
        <div className="student-messaging-conv-list">
          <div className="student-messaging-list-header">
            <h1>Conversations</h1>
          </div>

          <div className="student-messaging-conv-items">
            {loading ? (
              <p className="student-messaging-muted" role="status">Chargement...</p>
            ) : conversations.length === 0 ? (
              <p className="student-messaging-muted">Aucune conversation.</p>
            ) : (
              conversations.map(conv => (
                <button
                  type="button"
                  key={conv.id}
                  className={`student-messaging-conv-item ${selectedConv?.id === conv.id ? 'active' : ''}`}
                  aria-current={selectedConv?.id === conv.id ? 'true' : undefined}
                  onClick={() => setSelectedConv(conv)}
                >
                  <div
                    className={`student-messaging-conv-avatar tone-${getAvatarTone(conv.id)}`}
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
                </button>
              ))
            )}
          </div>
        </div>

        <div className="student-messaging-chat-zone">
          {selectedConv ? (
            <>
              <div className="student-messaging-chat-header">
                <button
                  type="button"
                  className="student-messaging-back"
                  onClick={() => setSelectedConv(null)}
                  aria-label="Retour aux conversations"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m12 19-7-7 7-7" />
                    <path d="M19 12H5" />
                  </svg>
                </button>
                <div
                  className={`student-messaging-chat-avatar tone-${getAvatarTone(selectedConv.id)}`}
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
                    <svg className="student-messaging-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                    </svg>
                    <p>Aucun message. Envoyez le premier !</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`student-messaging-msg ${msg.isOwn ? 'me' : ''}`}
                    >
                      <div
                        className={`student-messaging-msg-av ${msg.isOwn ? 'tone-own' : `tone-${getAvatarTone(selectedConv.id)}`}`}
                      >
                        {msg.isOwn ? 'M' : getInitials(msg.senderName)}
                      </div>
                      <div className="student-messaging-msg-content">
                        {!msg.isOwn && (
                          <div className="student-messaging-msg-sender">{msg.senderName}</div>
                        )}
                        <div className="student-messaging-msg-bubble">
                          {msg.content}
                          {msg.attachmentUrl && (
                            /\.(jpe?g|png|gif|webp)$/i.test(msg.attachmentName || '') ? (
                              <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="student-messaging-attach-img">
                                <img src={msg.attachmentUrl} alt={msg.attachmentName || 'Image jointe'} />
                              </a>
                            ) : (
                              <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" download className="student-messaging-attach">
                                {msg.attachmentName || 'Fichier joint'}
                              </a>
                            )
                          )}
                        </div>
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
                    className="student-messaging-btn-send"
                    onClick={handleSendMessage}
                    disabled={sending || !inputValue.trim()}
                  >
                    {sending ? 'Envoi…' : (
                      <>
                        Envoyer
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="m5 12 7-7 7 7" />
                          <path d="M12 19V5" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="student-messaging-empty-state">
              <svg className="student-messaging-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <p>Sélectionnez une conversation pour démarrer.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
