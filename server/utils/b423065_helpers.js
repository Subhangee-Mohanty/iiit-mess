import crypto from 'crypto'
import mongoose from 'mongoose'
import Due from '../models/b423065_Due.js'
import Token from '../models/b423065_Token.js'

export const asyncHandler = handler => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next)
}

export const text = value => (typeof value === 'string' ? value.trim() : '')

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

const randomCode = () => {
  let code = 'MT-'
  for (let i = 0; i < 6; i += 1) code += ALPHABET[crypto.randomInt(ALPHABET.length)]
  return code
}

export async function uniqueCodes(count) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const pool = new Set()
    while (pool.size < count) pool.add(randomCode())
    const list = [...pool]
    const taken = await Token.find({ code: { $in: list } }).select('code').lean()
    if (!taken.length) return list
  }
  throw new Error('Could not generate token codes')
}

export async function computeDues(userId, entryLimit = 0) {
  const id = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId
  const rows = await Due.aggregate([
    { $match: { user: id } },
    { $group: { _id: '$type', total: { $sum: '$amount' } } }
  ])
  const sums = { charge: 0, refund: 0, payment: 0 }
  rows.forEach(row => {
    sums[row._id] = row.total
  })
  const result = {
    total: sums.charge - sums.refund - sums.payment,
    charges: sums.charge,
    refunds: sums.refund,
    payments: sums.payment
  }
  if (entryLimit > 0) {
    result.entries = await Due.find({ user: id }).sort({ createdAt: -1 }).limit(entryLimit).lean()
  }
  return result
}
