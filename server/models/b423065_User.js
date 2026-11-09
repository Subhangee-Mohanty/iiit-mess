import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    rollNo: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    hostel: { type: String, default: '', trim: true },
    room: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' }
  },
  { timestamps: true }
)

userSchema.methods.toSafe = function toSafe() {
  const object = this.toObject()
  delete object.password
  delete object.__v
  return object
}

export default mongoose.model('User', userSchema)
