import mongoose from 'mongoose'

const dueSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['charge', 'refund', 'payment'], required: true },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, default: '' },
    token: { type: mongoose.Schema.Types.ObjectId, ref: 'Token', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
)

export default mongoose.model('Due', dueSchema)
