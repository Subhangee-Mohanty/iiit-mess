import bcrypt from 'bcryptjs'
import config from './b423065_config.js'
import User from './models/b423065_User.js'
import MenuItem from './models/b423065_MenuItem.js'
import Notice from './models/b423065_Notice.js'

const WEEKLY_MENU = [
  {
    breakfast: { items: ['Idli', 'Sambar', 'Coconut Chutney', 'Tea'], price: 30 },
    lunch: { items: ['Steamed Rice', 'Dal Tadka', 'Aloo Gobi', 'Chapati', 'Salad'], price: 60 },
    dinner: { items: ['Jeera Rice', 'Rajma Masala', 'Mixed Veg', 'Chapati', 'Gulab Jamun'], price: 55 }
  },
  {
    breakfast: { items: ['Poha', 'Sev', 'Boiled Egg or Banana', 'Tea'], price: 30 },
    lunch: { items: ['Steamed Rice', 'Sambar', 'Cabbage Poriyal', 'Papad', 'Curd'], price: 60 },
    dinner: { items: ['Veg Pulao', 'Paneer Butter Masala', 'Raita', 'Chapati'], price: 55 }
  },
  {
    breakfast: { items: ['Aloo Paratha', 'Curd', 'Pickle', 'Tea'], price: 30 },
    lunch: { items: ['Steamed Rice', 'Dalma', 'Baigan Bhaja', 'Chapati', 'Salad'], price: 60 },
    dinner: { items: ['Steamed Rice', 'Egg Curry or Soya Chaap', 'Dal Fry', 'Chapati'], price: 55 }
  },
  {
    breakfast: { items: ['Upma', 'Coconut Chutney', 'Banana', 'Tea'], price: 30 },
    lunch: { items: ['Chole', 'Bhature', 'Onion Salad', 'Lassi'], price: 60 },
    dinner: { items: ['Veg Fried Rice', 'Veg Manchurian', 'Hot and Sour Soup'], price: 55 }
  },
  {
    breakfast: { items: ['Puri', 'Aloo Bhaji', 'Tea'], price: 30 },
    lunch: { items: ['Steamed Rice', 'Dal Fry', 'Bhindi Fry', 'Chapati', 'Curd'], price: 60 },
    dinner: { items: ['Steamed Rice', 'Chicken Curry or Paneer Masala', 'Dal Fry', 'Chapati', 'Sweet'], price: 55 }
  },
  {
    breakfast: { items: ['Masala Dosa', 'Sambar', 'Chutney', 'Tea'], price: 30 },
    lunch: { items: ['Veg Biryani', 'Raita', 'Salad', 'Papad'], price: 60 },
    dinner: { items: ['Steamed Rice', 'Dal Makhani', 'Mixed Veg', 'Chapati', 'Ice Cream'], price: 55 }
  },
  {
    breakfast: { items: ['Chakuli Pitha', 'Ghugni', 'Tea'], price: 30 },
    lunch: { items: ['Pakhala Bhata', 'Badi Chura', 'Saga Bhaja', 'Fried Fish or Paneer'], price: 60 },
    dinner: { items: ['Special Thali', 'Dalma', 'Paneer Curry', 'Chapati', 'Kheer'], price: 55 }
  }
]

export async function seedDatabase() {
  const menuCount = await MenuItem.countDocuments()
  if (menuCount === 0) {
    const entries = []
    WEEKLY_MENU.forEach((day, dayIndex) => {
      Object.entries(day).forEach(([mealType, value]) => {
        entries.push({ dayIndex, mealType, items: value.items, price: value.price })
      })
    })
    await MenuItem.insertMany(entries)
    console.log('Weekly menu seeded')
  }

  await MenuItem.updateMany({ mealType: 'breakfast' }, { $set: { price: 30 } })
  await MenuItem.updateMany({ mealType: 'lunch' }, { $set: { price: 60 } })
  await MenuItem.updateMany({ mealType: 'dinner' }, { $set: { price: 55 } })

  const admin = await User.findOne({ rollNo: config.adminRoll })
  if (!admin) {
    await User.create({
      rollNo: config.adminRoll,
      name: 'Mess Administrator',
      email: config.adminEmail,
      password: await bcrypt.hash(config.adminPassword, 10),
      role: 'admin',
      hostel: 'Mess Office'
    })
    console.log(`Admin account created with roll number ${config.adminRoll}`)
  }

  if (config.seedDemo) {
    const demo = await User.findOne({ rollNo: 'DEMO001' })
    if (!demo) {
      await User.create({
        rollNo: 'DEMO001',
        name: 'Demo Student',
        email: 'demo.student@iiit-bh.ac.in',
        password: await bcrypt.hash('Student@123', 10),
        role: 'student',
        hostel: 'Boys Hostel 1',
        room: 'A-204',
        phone: '9876543210'
      })
      console.log('Demo student created')
    }
  }

  const noticeCount = await Notice.countDocuments()
  if (noticeCount === 0) {
    await Notice.create([
      {
        title: 'Welcome to the new mess portal',
        body: 'Book your meal tokens online. Booking and cancellation close two hours before each meal starts.',
        pinned: true,
        author: 'Mess Office'
      },
      {
        title: 'Dues are settled at the mess office',
        body: 'Your token amount is added to your dues automatically. Pay at the mess office and the admin will update your account.',
        pinned: false,
        author: 'Mess Office'
      }
    ])
  }
}
