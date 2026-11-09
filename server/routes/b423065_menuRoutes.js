import { Router } from 'express'
import mongoose from 'mongoose'
import MenuItem from '../models/b423065_MenuItem.js'
import { requireAdmin, requireAuth } from '../middleware/b423065_auth.js'
import { asyncHandler } from '../utils/b423065_helpers.js'

const router = Router()

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const menu = await MenuItem.find().sort({ dayIndex: 1 }).lean()
    res.json({ menu })
  })
)

router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Menu entry not found' })
    const rawItems = Array.isArray(req.body.items) ? req.body.items : []
    const items = rawItems
      .map(item => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean)
      .slice(0, 10)
    const price = Number(req.body.price)
    if (!items.length) return res.status(400).json({ message: 'Add at least one dish' })
    if (!Number.isFinite(price) || price < 0 || price > 2000) {
      return res.status(400).json({ message: 'Enter a price between 0 and 2000' })
    }
    const entry = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { items, price: Math.round(price) },
      { new: true, runValidators: true }
    )
    if (!entry) return res.status(404).json({ message: 'Menu entry not found' })
    return res.json({ entry })
  })
)

export default router
