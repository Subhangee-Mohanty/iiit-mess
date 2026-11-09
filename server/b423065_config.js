import dotenv from 'dotenv'

dotenv.config()

const config = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/iiit_mess',
  jwtSecret: process.env.JWT_SECRET || 'iiit-bhubaneswar-mess-dev-secret',
  adminRoll: (process.env.ADMIN_ROLL || 'ADMIN').toUpperCase(),
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin@123',
  adminEmail: (process.env.ADMIN_EMAIL || 'mess.admin@iiit-bh.ac.in').toLowerCase(),
  seedDemo: process.env.SEED_DEMO !== 'false'
}

export default config
