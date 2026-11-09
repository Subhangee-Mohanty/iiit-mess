import jwt from 'jsonwebtoken'
import config from '../b423065_config.js'
import User from '../models/b423065_User.js'

export function signToken(user) {
  return jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: '7d' })
}

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ message: 'Please log in to continue' })
  try {
    const payload = jwt.verify(token, config.jwtSecret)
    const user = await User.findById(payload.id)
    if (!user) return res.status(401).json({ message: 'This account no longer exists' })
    req.user = user
    return next()
  } catch {
    return res.status(401).json({ message: 'Session expired, please log in again' })
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'This area is only for mess administrators' })
  }
  return next()
}
