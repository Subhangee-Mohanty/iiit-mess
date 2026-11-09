import { Router } from 'express'
import { requireAuth } from '../middleware/b423065_auth.js'
import { asyncHandler, computeDues } from '../utils/b423065_helpers.js'

const router = Router()

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await computeDues(req.user._id, 300))
  })
)

export default router
