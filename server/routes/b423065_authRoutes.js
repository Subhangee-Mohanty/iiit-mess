import { Router } from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/b423065_User.js'
import { requireAuth, signToken } from '../middleware/b423065_auth.js'
import { asyncHandler, text } from '../utils/b423065_helpers.js'

const router = Router()

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const rollNo = text(req.body.rollNo).toUpperCase()
    const name = text(req.body.name)
    const email = text(req.body.email).toLowerCase()
    const password = typeof req.body.password === 'string' ? req.body.password : ''
    const hostel = text(req.body.hostel)
    const room = text(req.body.room)
    const phone = text(req.body.phone)

    if (!rollNo || !name || !email || !password) {
      return res.status(400).json({ message: 'Roll number, name, email and password are required' })
    }
    if (!/^[A-Z0-9]{6,12}$/.test(rollNo)) {
      return res.status(400).json({ message: 'Enter a valid roll number such as B423065' })
    }
    if (name.length < 2) return res.status(400).json({ message: 'Enter your full name' })
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email address' })
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' })
    if (phone && !/^[0-9+\-\s]{8,15}$/.test(phone)) {
      return res.status(400).json({ message: 'Enter a valid phone number' })
    }

    const existing = await User.findOne({ $or: [{ rollNo }, { email }] })
    if (existing) {
      const message = existing.rollNo === rollNo ? 'This roll number is already registered' : 'This email is already registered'
      return res.status(409).json({ message })
    }

    const user = await User.create({
      rollNo,
      name,
      email,
      hostel,
      room,
      phone,
      password: await bcrypt.hash(password, 10),
      role: 'student'
    })
    return res.status(201).json({ token: signToken(user), user: user.toSafe() })
  })
)

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const identifier = text(req.body.identifier)
    const password = typeof req.body.password === 'string' ? req.body.password : ''
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Enter your roll number and password' })
    }
    const user = await User.findOne({
      $or: [{ rollNo: identifier.toUpperCase() }, { email: identifier.toLowerCase() }]
    })
    const valid = user ? await bcrypt.compare(password, user.password) : false
    if (!valid) return res.status(401).json({ message: 'Invalid roll number or password' })
    return res.json({ token: signToken(user), user: user.toSafe() })
  })
)

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user.toSafe() })
})

router.put(
  '/profile',
  requireAuth,
  asyncHandler(async (req, res) => {
    const name = text(req.body.name)
    const phone = text(req.body.phone)
    if (name.length < 2) return res.status(400).json({ message: 'Enter your full name' })
    if (phone && !/^[0-9+\-\s]{8,15}$/.test(phone)) {
      return res.status(400).json({ message: 'Enter a valid phone number' })
    }
    req.user.name = name
    req.user.phone = phone
    req.user.hostel = text(req.body.hostel)
    req.user.room = text(req.body.room)
    await req.user.save()
    return res.json({ user: req.user.toSafe() })
  })
)

router.put(
  '/password',
  requireAuth,
  asyncHandler(async (req, res) => {
    const current = typeof req.body.currentPassword === 'string' ? req.body.currentPassword : ''
    const next = typeof req.body.newPassword === 'string' ? req.body.newPassword : ''
    if (!(await bcrypt.compare(current, req.user.password))) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }
    if (next.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' })
    req.user.password = await bcrypt.hash(next, 10)
    await req.user.save()
    return res.json({ message: 'Password updated' })
  })
)

export default router
