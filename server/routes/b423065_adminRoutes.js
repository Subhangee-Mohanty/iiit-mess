import { Router } from 'express'
import mongoose from 'mongoose'
import User from '../models/b423065_User.js'
import Token from '../models/b423065_Token.js'
import Due from '../models/b423065_Due.js'
import Feedback from '../models/b423065_Feedback.js'
import { requireAdmin, requireAuth } from '../middleware/b423065_auth.js'
import { asyncHandler, computeDues, text } from '../utils/b423065_helpers.js'
import { MEAL_TYPES, addDays, isValidDateKey, nowIST } from '../utils/b423065_dates.js'

const router = Router()

router.use(requireAuth, requireAdmin)

router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const today = nowIST().dateKey
    const weekEnd = addDays(today, 6)

    const [students, dueRows, todayRows, weekRows, ratingRows] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Due.aggregate([{ $group: { _id: '$type', total: { $sum: '$amount' } } }]),
      Token.aggregate([
        { $match: { dateKey: today, status: { $ne: 'cancelled' } } },
        { $group: { _id: '$mealType', count: { $sum: 1 } } }
      ]),
      Token.aggregate([
        { $match: { dateKey: { $gte: today, $lte: weekEnd }, status: { $ne: 'cancelled' } } },
        { $group: { _id: '$dateKey', count: { $sum: 1 }, amount: { $sum: '$price' } } }
      ]),
      Feedback.aggregate([{ $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } }])
    ])

    const sums = { charge: 0, refund: 0, payment: 0 }
    dueRows.forEach(row => {
      sums[row._id] = row.total
    })

    const todayMeals = {}
    MEAL_TYPES.forEach(type => {
      todayMeals[type] = 0
    })
    todayRows.forEach(row => {
      todayMeals[row._id] = row.count
    })

    const weekMap = new Map(weekRows.map(row => [row._id, row]))
    const week = []
    for (let i = 0; i < 7; i += 1) {
      const dateKey = addDays(today, i)
      const row = weekMap.get(dateKey)
      week.push({ dateKey, count: row ? row.count : 0, amount: row ? row.amount : 0 })
    }

    res.json({
      today,
      students,
      outstanding: sums.charge - sums.refund - sums.payment,
      collected: sums.payment,
      todayMeals,
      week,
      rating: ratingRows.length
        ? { average: Math.round(ratingRows[0].average * 10) / 10, count: ratingRows[0].count }
        : { average: 0, count: 0 }
    })
  })
)

router.get(
  '/students',
  asyncHandler(async (req, res) => {
    const query = text(req.query.q)
    const filter = { role: 'student' }
    if (query) {
      const safe = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      filter.$or = [{ rollNo: { $regex: safe, $options: 'i' } }, { name: { $regex: safe, $options: 'i' } }]
    }
    const students = await User.find(filter).sort({ rollNo: 1 }).limit(300).lean()
    const rows = await Due.aggregate([
      { $match: { user: { $in: students.map(student => student._id) } } },
      { $group: { _id: { user: '$user', type: '$type' }, total: { $sum: '$amount' } } }
    ])
    const balances = new Map()
    rows.forEach(row => {
      const key = String(row._id.user)
      const current = balances.get(key) || 0
      balances.set(key, current + (row._id.type === 'charge' ? row.total : -row.total))
    })
    res.json({
      students: students.map(student => ({
        _id: student._id,
        rollNo: student.rollNo,
        name: student.name,
        email: student.email,
        hostel: student.hostel,
        room: student.room,
        phone: student.phone,
        dues: balances.get(String(student._id)) || 0
      }))
    })
  })
)

router.get(
  '/students/:id/dues',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Student not found' })
    const student = await User.findOne({ _id: req.params.id, role: 'student' }).lean()
    if (!student) return res.status(404).json({ message: 'Student not found' })
    const dues = await computeDues(req.params.id, 200)
    return res.json({
      student: { _id: student._id, rollNo: student.rollNo, name: student.name },
      dues
    })
  })
)

router.post(
  '/payments',
  asyncHandler(async (req, res) => {
    const userId = text(req.body.userId)
    const amount = Number(req.body.amount)
    const note = text(req.body.note).slice(0, 120)
    if (!mongoose.isValidObjectId(userId)) return res.status(404).json({ message: 'Student not found' })
    if (!Number.isFinite(amount) || amount <= 0 || amount > 100000) {
      return res.status(400).json({ message: 'Enter an amount between 1 and 100000' })
    }
    const student = await User.findOne({ _id: userId, role: 'student' })
    if (!student) return res.status(404).json({ message: 'Student not found' })
    await Due.create({
      user: student._id,
      type: 'payment',
      amount: Math.round(amount * 100) / 100,
      description: note ? `Payment received: ${note}` : 'Payment received at the mess office',
      createdBy: req.user._id
    })
    return res.status(201).json({ dues: await computeDues(student._id) })
  })
)

router.get(
  '/tokens',
  asyncHandler(async (req, res) => {
    const date = isValidDateKey(req.query.date) ? req.query.date : nowIST().dateKey
    const tokens = await Token.find({ dateKey: date, status: { $ne: 'cancelled' } })
      .populate('user', 'rollNo name hostel room')
      .sort({ createdAt: 1 })
      .lean()
    const counts = {}
    MEAL_TYPES.forEach(type => {
      counts[type] = 0
    })
    tokens.forEach(token => {
      counts[token.mealType] += 1
    })
    res.json({ date, tokens, counts })
  })
)

router.post(
  '/redeem',
  asyncHandler(async (req, res) => {
    const code = text(req.body.code).toUpperCase()
    if (!code) return res.status(400).json({ message: 'Enter a token code' })
    const token = await Token.findOne({ code }).populate('user', 'rollNo name')
    if (!token) return res.status(404).json({ message: 'No token found with this code' })
    if (token.status === 'used') return res.status(400).json({ message: 'This token has already been used' })
    if (token.status === 'cancelled') return res.status(400).json({ message: 'This token was cancelled' })
    if (token.dateKey !== nowIST().dateKey) {
      return res.status(400).json({ message: `This token is valid only on ${token.dateKey}` })
    }
    token.status = 'used'
    token.usedAt = new Date()
    await token.save()
    return res.json({ token })
  })
)

export default router
