const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  await prisma.salaryRecord.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.employee.deleteMany()
  await prisma.user.deleteMany()

  const adminPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@hodophile.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  console.log('✅ Admin user created:', adminUser.email)

  console.log('ℹ️ No hard-coded employee accounts are seeded. Create employees from the admin panel or import data instead.')
  console.log('⏳ Attendance records will populate when employees log in/out')
  console.log('ℹ️ No employee salary records were created.')
  console.log('✅ Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
