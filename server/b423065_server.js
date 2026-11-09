import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import config from './b423065_config.js'
import { seedDatabase } from './b423065_seed.js'
import authRoutes from './routes/b423065_authRoutes.js'
import menuRoutes from './routes/b423065_menuRoutes.js'
import tokenRoutes from './routes/b423065_tokenRoutes.js'
import duesRoutes from './routes/b423065_duesRoutes.js'
import feedbackRoutes from './routes/b423065_feedbackRoutes.js'
import noticeRoutes from './routes/b423065_noticeRoutes.js'
import adminRoutes from './routes/b423065_adminRoutes.js'
import { BOOKING_WINDOW_DAYS, CUTOFF_MINUTES, MEALS, nowIST } from './utils/b423065_dates.js'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(currentDir, '..', 'dist')
const entryFile = 'b423065_index.html'

const app = express()

app.disable('x-powered-by')
app.use(cors())
app.use(express.json({ limit: '100kb' }))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' })
})

app.get('/api/meta', (req, res) => {
  const now = nowIST()
  res.json({
    today: now.dateKey,
    minutes: now.minutes,
    meals: MEALS,
    cutoffMinutes: CUTOFF_MINUTES,
    windowDays: BOOKING_WINDOW_DAYS
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/menu', menuRoutes)
app.use('/api/tokens', tokenRoutes)
app.use('/api/dues', duesRoutes)
app.use('/api/feedback', feedbackRoutes)
app.use('/api/notices', noticeRoutes)
app.use('/api/admin', adminRoutes)

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Endpoint not found' })
})

if (fs.existsSync(path.join(distDir, entryFile))) {
  app.use(express.static(distDir, { index: false }))
  app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, entryFile))
  })
} else {
  app.get('/', (req, res) => {
    res.send('API is running. Build the frontend with npm run build to serve the website from this server.')
  })
}

app.use((err, req, res, next) => {
  if (err.code === 11000) return res.status(409).json({ message: 'That record already exists' })
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map(item => item.message).join(', ') })
  }
  console.error(err)
  return res.status(500).json({ message: 'Server error. Please try again.' })
})

async function start() {
  try {
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 15000 })
    console.log('MongoDB connected')
    await seedDatabase()
    app.listen(config.port, () => {
      console.log(`Server listening on port ${config.port}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error.message)
    process.exit(1)
  }
}

start()
