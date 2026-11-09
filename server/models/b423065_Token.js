import mongoose from 'mongoose'

const tokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dateKey: { type: String, required: true },
    dayIndex: { type: Number, required: true },
    mealType: { type: String, required: true, enum: ['breakfast', 'lunch', 'dinner'] },
    items: { type: [String], default: [] },
    price: { type: Number, required: true, min: 0 },
    code: { type: String, required: true, unique: true },
    status: { type: String, enum: ['booked', 'used', 'cancelled'], default: 'booked' },
    usedAt: { type: Date, default: null }
  },
  { timestamps: true }
)

tokenSchema.index({ user: 1, dateKey: 1, mealType: 1 }, { unique: true })
tokenSchema.index({ dateKey: 1, status: 1 })

export default mongoose.model('Token', tokenSchema)
