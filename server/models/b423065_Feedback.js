import mongoose from 'mongoose'

const feedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dateKey: { type: String, required: true },
    mealType: { type: String, required: true, enum: ['breakfast', 'lunch', 'dinner'] },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', maxlength: 500 }
  },
  { timestamps: true }
)

feedbackSchema.index({ user: 1, dateKey: 1, mealType: 1 }, { unique: true })

export default mongoose.model('Feedback', feedbackSchema)
