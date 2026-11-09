import mongoose from 'mongoose'

const menuItemSchema = new mongoose.Schema(
  {
    dayIndex: { type: Number, required: true, min: 0, max: 6 },
    mealType: { type: String, required: true, enum: ['breakfast', 'lunch', 'dinner'] },
    items: { type: [String], default: [] },
    price: { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
)

menuItemSchema.index({ dayIndex: 1, mealType: 1 }, { unique: true })

export default mongoose.model('MenuItem', menuItemSchema)
