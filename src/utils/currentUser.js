// The login flow stores the whole user object under "user" (there is no separate "user_id" key).
export function getCurrentUserId() {
  try {
    const stored = JSON.parse(localStorage.getItem('user') || 'null')
    return Number(stored?.id ?? localStorage.getItem('user_id')) || null
  } catch {
    return Number(localStorage.getItem('user_id')) || null
  }
}
