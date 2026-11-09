import { Router } from 'express'
import mongoose from 'mongoose'
import Notice from '../models/b423065_Notice.js'
import { requireAdmin, requireAuth } from '../middleware/b423065_auth.js'
import { asyncHandler, text } from '../utils/b423065_helpers.js'

const router = Router()

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const notices = await Notice.find().sort({ pinned: -1, createdAt: -1 }).limit(30).lean()
    res.json({ notices })
  })
)

router.post(
  '/',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const title = text(req.body.title)
    const body = text(req.body.body)
    if (!title || !body) return res.status(400).json({ message: 'Title and message are required' })
    const notice = await Notice.create({
      title: title.slice(0, 120),
      body: body.slice(0, 1000),
      pinned: Boolean(req.body.pinned),
      author: req.user.name
    })
    return res.status(201).json({ notice })
  })
)

router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Notice not found' })
    await Notice.findByIdAndDelete(req.params.id)
    return res.json({ message: 'Notice removed' })
  })
)

export default router
