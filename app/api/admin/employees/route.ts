// app/api/admin/employees/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const createEmployeeSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string(),
  cnicNumber: z.string(),
  address: z.string(),
  emergencyContactName: z.string(),
  emergencyContactNumber: z.string(),
  designation: z.string(),
  department: z.string(),
  monthlySalary: z.number(),
  joiningDate: z.string(),
  password: z.string().min(6).optional(),
  reportingTime: z.string().optional(),
  logoutTime: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ success: true, data: employees })
  } catch (error) {
    console.error('Failed to fetch employees:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validated = createEmployeeSchema.parse(body)

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 400 }
      )
    }

    // Check if CNIC already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { cnicNumber: validated.cnicNumber },
    })

    if (existingEmployee) {
      return NextResponse.json(
        { success: false, message: 'CNIC number already exists' },
        { status: 400 }
      )
    }

    // Use provided password if available, otherwise generate default
    const providedPassword = (body.password as string) || undefined
    const defaultPassword = providedPassword || 'emp123'
    const hashedPassword = await bcrypt.hash(defaultPassword, 10)

    // Create user account
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        password: hashedPassword,
        role: 'EMPLOYEE',
      },
    })

    // Generate employee ID
    const employeeCount = await prisma.employee.count()
    const employeeId = `EMP${String(employeeCount + 1).padStart(3, '0')}`

    // Create employee record
    const employee = await prisma.employee.create({
      data: {
        userId: user.id,
        fullName: validated.fullName,
        email: validated.email,
        phoneNumber: validated.phoneNumber,
        cnicNumber: validated.cnicNumber,
        address: validated.address,
        emergencyContactName: validated.emergencyContactName,
        emergencyContactNumber: validated.emergencyContactNumber,
        designation: validated.designation,
        department: validated.department,
        monthlySalary: validated.monthlySalary,
        joiningDate: new Date(validated.joiningDate),
        employeeId,
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Employee created successfully',
        data: employee,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Failed to create employee:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid input', errors: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, message: 'Failed to create employee' },
      { status: 500 }
    )
  }
}
