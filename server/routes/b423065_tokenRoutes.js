import { Router } from 'express'
import mongoose from 'mongoose'
import MenuItem from '../models/b423065_MenuItem.js'
import Token from '../models/b423065_Token.js'
import Due from '../models/b423065_Due.js'
import { requireAuth } from '../middleware/b423065_auth.js'
import { asyncHandler, computeDues, uniqueCode } from '../utils/b423065_helpers.js'
import { MEALS, beforeCutoff, bookingStatus, dayIndexOf, isValidDateKey } from '../utils/b423065_dates.js'

const router = Router()

router.use(requireAuth)

router.get(
  '/mine',
  asyncHandler(async (req, res) => {
    const tokens = await Token.find({ user: req.user._id }).sort({ dateKey: -1, createdAt: -1 }).limit(400).lean()
    res.json({ tokens })
  })
)

router.post(
  '/submit',
  asyncHandler(async (req, res) => {
    const selections = Array.isArray(req.body.selections) ? req.body.selections : []
    if (!selections.length) return res.status(400).json({ message: 'Add at least one meal to your cart' })
    if (selections.length > 60) return res.status(400).json({ message: 'You can book at most 60 meals at a time' })

    const menu = await MenuItem.find().lean()
    const menuMap = new Map(menu.map(entry => [`${entry.dayIndex}-${entry.mealType}`, entry]))

    const seen = new Set()
    const issues = []
    let valid = []

    for (const selection of selections) {
      const dateKey = typeof selection?.dateKey === 'string' ? selection.dateKey : ''
      const mealType = typeof selection?.mealType === 'string' ? selection.mealType : ''
      const key = `${dateKey}|${mealType}`
      if (seen.has(key)) continue
      seen.add(key)

      if (!isValidDateKey(dateKey) || !MEALS[mealType]) {
        issues.push({ dateKey, mealType, message: 'Invalid selection' })
        continue
      }
      const status = bookingStatus(dateKey, mealType)
      if (!status.open) {
        issues.push({ dateKey, mealType, message: status.reason })
        continue
      }
      const entry = menuMap.get(`${dayIndexOf(dateKey)}-${mealType}`)
      if (!entry) {
        issues.push({ dateKey, mealType, message: 'This meal is not on the menu' })
        continue
      }
      valid.push({ dateKey, mealType, entry })
    }

    const existingMap = new Map()
    if (valid.length) {
      const existing = await Token.find({
        user: req.user._id,
        $or: valid.map(item => ({ dateKey: item.dateKey, mealType: item.mealType }))
      })
      existing.forEach(token => existingMap.set(`${token.dateKey}|${token.mealType}`, token))
      valid = valid.filter(item => {
        const previous = existingMap.get(`${item.dateKey}|${item.mealType}`)
        if (previous && previous.status !== 'cancelled') {
          issues.push({ dateKey: item.dateKey, mealType: item.mealType, message: 'Already booked' })
          return false
        }
        return true
      })
    }

    if (issues.length) {
      return res.status(400).json({ message: 'Some meals in your cart can no longer be booked', issues })
    }

    const created = []
    for (const item of valid) {
      const payload = {
        dayIndex: dayIndexOf(item.dateKey),
        items: item.entry.items,
        price: item.entry.price,
        code: await uniqueCode(),
        status: 'booked',
        usedAt: null
      }
      const previous = existingMap.get(`${item.dateKey}|${item.mealType}`)
      if (previous) {
        Object.assign(previous, payload)
        created.push(await previous.save())
      } else {
        created.push(
          await Token.create({ user: req.user._id, dateKey: item.dateKey, mealType: item.mealType, ...payload })
        )
      }
    }

    await Due.insertMany(
      created.map(token => ({
        user: req.user._id,
        type: 'charge',
        amount: token.price,
        description: `${MEALS[token.mealType].label} token for ${token.dateKey}`,
        token: token._id
      }))
    )

    const totalCharged = created.reduce((sum, token) => sum + token.price, 0)
    return res.status(201).json({ tokens: created, totalCharged, dues: await computeDues(req.user._id) })
  })
)

router.post(
  '/:id/cancel',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Token not found' })
    const token = await Token.findOne({ _id: req.params.id, user: req.user._id })
    if (!token) return res.status(404).json({ message: 'Token not found' })
    if (token.status !== 'booked') return res.status(400).json({ message: 'Only booked tokens can be cancelled' })
    if (!beforeCutoff(token.dateKey, token.mealType)) {
      return res.status(400).json({ message: 'The cancellation window for this meal has closed' })
    }
    token.status = 'cancelled'
    await token.save()
    await Due.create({
      user: req.user._id,
      type: 'refund',
      amount: token.price,
      description: `Refund for cancelled ${MEALS[token.mealType].label} token on ${token.dateKey}`,
      token: token._id
    })
    return res.json({ token, dues: await computeDues(req.user._id) })
  })
)

export default router
