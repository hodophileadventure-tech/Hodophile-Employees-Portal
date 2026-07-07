const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const adminEmail = 'admin@hodophile.com'
  const adminPassword = await bcrypt.hash('admin123', 10)

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN' },
    create: {
      email: adminEmail,
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  console.log('✅ Admin user ensured:', adminUser.email)
  console.log('ℹ️ Existing employee, attendance, and salary data are preserved.')
  console.log('ℹ️ No hard-coded employee accounts are seeded. Create employees from the admin panel or import data instead.')
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
