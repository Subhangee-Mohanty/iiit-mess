const TOKEN_KEY = 'mess_token'

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export const setToken = value => {
  try {
    if (value) localStorage.setItem(TOKEN_KEY, value)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    return
  }
}

async function request(method, url, body) {
  const headers = {}
  const token = getToken()
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`/api${url}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    })
  } catch {
    const error = new Error('Cannot reach the server. Please check your connection.')
    error.status = 0
    throw error
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    if (response.status === 401 && token) window.dispatchEvent(new Event('mess-unauthorized'))
    const error = new Error((data && data.message) || 'Something went wrong. Please try again.')
    error.status = response.status
    error.issues = data && data.issues
    throw error
  }
  return data
}

export const api = {
  get: url => request('GET', url),
  post: (url, body = {}) => request('POST', url, body),
  put: (url, body = {}) => request('PUT', url, body),
  del: url => request('DELETE', url)
}
