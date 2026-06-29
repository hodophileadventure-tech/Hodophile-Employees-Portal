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

  const employees = []
  const employeeData = [
    {
      fullName: 'Syed Altamash Ali',
      email: 'syedaltamash596@gmail.com',
      cnicNumber: '4220157700315',
      phoneNumber: '03308523285',
      address: 'Pakistan',
      emergencyContactName: 'Father',
      emergencyContactNumber: '03312425588',
      designation: 'Sales Executive',
      department: 'Sales',
      monthlySalary: 25000,
      employeeId: 'EMP001',
      reportingTime: '14:00',
      logoutTime: '22:00',
      workingDays: 'MON,TUE,WED,THU,FRI,SAT',
    },
    {
      fullName: 'Qasim Ateeque',
      email: 'mateeque39@gmail.com',
      cnicNumber: '4210195279155',
      phoneNumber: '03157734990',
      address: 'Pakistan',
      emergencyContactName: 'Father',
      emergencyContactNumber: '03361202211',
      designation: 'Web Developer',
      department: 'DevOps',
      monthlySalary: 50000,
      employeeId: 'EMP002',
      reportingTime: '10:00',
      logoutTime: '19:00',
      workingDays: 'MON,TUE,WED,THU,FRI',
    },
    {
      fullName: 'Sameer Khan',
      email: 'sk455689360@gmail.com',
      cnicNumber: '4220171666775',
      phoneNumber: '03192433608',
      address: 'Pakistan',
      emergencyContactName: 'Brother',
      emergencyContactNumber: '03489672050',
      designation: 'Sales Executive',
      department: 'Sales',
      monthlySalary: 25000,
      employeeId: 'EMP003',
      reportingTime: '14:00',
      logoutTime: '22:00',
      workingDays: 'MON,TUE,WED,THU,FRI,SAT',
    },
    {
      fullName: 'Maaz Ahmed Siddiqui',
      email: 'maazahmed120@gmail.com',
      cnicNumber: '4220106653569',
      phoneNumber: '03012497022',
      address: 'Pakistan',
      emergencyContactName: 'Brother',
      emergencyContactNumber: '03112820660',
      designation: 'Manager',
      department: 'Sales and Operations',
      monthlySalary: 80000,
      employeeId: 'EMP004',
      reportingTime: '14:00',
      logoutTime: '22:00',
      workingDays: 'MON,TUE,WED,THU,FRI,SAT',
    },
    {
      fullName: 'Maqsood Ahmed',
      email: 'ahmedkhen@gmail.com',
      cnicNumber: '4220107280471',
      phoneNumber: '03122041827',
      address: 'Pakistan',
      emergencyContactName: 'Wife',
      emergencyContactNumber: '03443046300',
      designation: 'Sales Executive',
      department: 'Sales',
      monthlySalary: 30000,
      employeeId: 'EMP005',
      reportingTime: '16:00',
      logoutTime: '22:00',
      workingDays: 'MON,TUE,WED,THU,FRI,SAT',
    },
  ]

  for (const emp of employeeData) {
    const empPassword = await bcrypt.hash('emp123', 10)
    const user = await prisma.user.create({
      data: {
        email: emp.email,
        password: empPassword,
        role: 'EMPLOYEE',
      },
    })

    const employee = await prisma.employee.create({
      data: {
        userId: user.id,
        ...emp,
        joiningDate: new Date('2023-01-15'),
      },
    })

    employees.push(employee)
    console.log(`✅ Employee created: ${employee.fullName}`)
  }

  console.log('⏳ Attendance records will populate when employees log in/out')

  const currentDate = new Date()
  for (const employee of employees) {
    const month = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const daysWorked = 0
    const earnedSalary = 0
    const netSalary = 0

    await prisma.salaryRecord.create({
      data: {
        employeeId: employee.id,
        month,
        daysWorked,
        totalSalary: employee.monthlySalary,
        earnedSalary,
        netSalary,
        status: 'PENDING',
      },
    })
  }

  console.log('✅ Salary records created (awaiting attendance)')
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
