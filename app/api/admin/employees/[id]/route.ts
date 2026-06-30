// app/api/admin/employees/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateEmployeeSchema = z.object({
  status: z.string().optional(),
  fullName: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  designation: z.string().optional(),
  department: z.string().optional(),
  monthlySalary: z.number().optional(),
  reportingTime: z.string().optional(),
  logoutTime: z.string().optional(),
  workingDays: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const employee = await prisma.employee.findUnique({
      where: { id },
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

    if (!employee) {
      return NextResponse.json(
        { success: false, message: 'Employee not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: employee })
  } catch (error) {
    console.error('Failed to fetch employee:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch employee' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const validated = updateEmployeeSchema.parse(body)

    const employee = await prisma.employee.update({
      where: { id },
      data: validated,
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

    return NextResponse.json({
      success: true,
      message: 'Employee updated successfully',
      data: employee,
    })
  } catch (error) {
    console.error('Failed to update employee:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid input', errors: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, message: 'Failed to update employee' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const employee = await prisma.employee.findUnique({
      where: { id },
    })

    if (!employee) {
      return NextResponse.json(
        { success: false, message: 'Employee not found' },
        { status: 404 }
      )
    }

    // Delete user account associated with employee
    if (employee.userId) {
      await prisma.user.delete({
        where: { id: employee.userId },
      })
    }

    // Delete employee record
    await prisma.employee.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Employee deleted successfully',
    })
  } catch (error) {
    console.error('Failed to delete employee:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete employee' },
      { status: 500 }
    )
  }
}
