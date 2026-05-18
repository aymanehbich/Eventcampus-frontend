import api from './axios'

export const startConversation = (memberId) =>
  api.post(`/messages/start/${memberId}`)

export const getConversations = (type = 'individuel') =>
  api.get('/messages/conversations', { params: { type } })

export const createConversation = (memberId) =>
  api.post('/messages/conversations', { member_id: memberId })

export const getMessages = (conversationId) =>
  api.get(`/messages/conversations/${conversationId}`)

export const sendMessage = (conversationId, content, isBroadcast = false) =>
  api.post(`/messages/conversations/${conversationId}/send`, { content, is_broadcast: isBroadcast })

export const searchMembers = (query) =>
  api.get('/messages/search-members', { params: { q: query } })

export const sendBroadcastMessage = (content, memberIds = null) =>
  api.post('/messages/broadcast', { content, member_ids: memberIds })

export const getReceivedMessages = () =>
  api.get('/messages/received')

export const markMessageAsRead = (messageId) =>
  api.put(`/messages/${messageId}/read`)
