import mongoose from 'mongoose'

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    body: { type: String, required: true, trim: true, maxlength: 1000 },
    pinned: { type: Boolean, default: false },
    author: { type: String, default: 'Mess Office' }
  },
  { timestamps: true }
)

export default mongoose.model('Notice', noticeSchema)
