import { Router } from 'express'
import Feedback from '../models/b423065_Feedback.js'
import Token from '../models/b423065_Token.js'
import { requireAdmin, requireAuth } from '../middleware/b423065_auth.js'
import { asyncHandler, text } from '../utils/b423065_helpers.js'
import { MEALS, isValidDateKey, nowIST } from '../utils/b423065_dates.js'

const router = Router()

router.use(requireAuth)

router.get(
  '/mine',
  asyncHandler(async (req, res) => {
    const feedback = await Feedback.find({ user: req.user._id }).sort({ dateKey: -1 }).limit(400).lean()
    res.json({ feedback })
  })
)

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const dateKey = text(req.body.dateKey)
    const mealType = text(req.body.mealType)
    const rating = Number(req.body.rating)
    const comment = text(req.body.comment).slice(0, 500)
    if (!isValidDateKey(dateKey) || !MEALS[mealType]) return res.status(400).json({ message: 'Invalid meal' })
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Choose a rating between 1 and 5' })
    }
    if (dateKey > nowIST().dateKey) return res.status(400).json({ message: 'You can review a meal only after its day' })
    const token = await Token.findOne({
      user: req.user._id,
      dateKey,
      mealType,
      status: { $in: ['booked', 'used'] }
    })
    if (!token) return res.status(400).json({ message: 'You can only review meals you had a token for' })
    const feedback = await Feedback.findOneAndUpdate(
      { user: req.user._id, dateKey, mealType },
      { rating, comment },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    return res.status(201).json({ feedback })
  })
)

router.get(
  '/admin/all',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const summary = await Feedback.aggregate([
      { $group: { _id: '$mealType', average: { $avg: '$rating' }, count: { $sum: 1 } } }
    ])
    const recent = await Feedback.find()
      .sort({ updatedAt: -1 })
      .limit(100)
      .populate('user', 'rollNo name')
      .lean()
    res.json({
      summary: summary.map(row => ({
        mealType: row._id,
        average: Math.round(row.average * 10) / 10,
        count: row.count
      })),
      recent
    })
  })
)

export default router
