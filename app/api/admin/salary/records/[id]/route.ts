import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSalarySchema = z.object({
  totalSalary: z.number().optional(),
  earnedSalary: z.number().optional(),
  commission: z.number().optional(),
  monthlyIncentive: z.number().optional(),
  netSalary: z.number().optional(),
  status: z.enum(['PENDING', 'PROCESSED', 'PAID']).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const salaryRecord = await prisma.salaryRecord.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            fullName: true,
            employeeId: true,
          },
        },
      },
    })

    if (!salaryRecord) {
      return NextResponse.json(
        { success: false, message: 'Salary record not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: salaryRecord })
  } catch (error) {
    console.error('Failed to fetch salary record:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch salary record' },
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
    const validated = updateSalarySchema.parse(body)

    const salaryRecord = await prisma.salaryRecord.update({
      where: { id },
      data: validated,
      include: {
        employee: {
          select: {
            fullName: true,
            employeeId: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Salary record updated successfully',
      data: salaryRecord,
    })
  } catch (error) {
    console.error('Failed to update salary record:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid input', errors: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, message: 'Failed to update salary record' },
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
    const salaryRecord = await prisma.salaryRecord.findUnique({
      where: { id },
    })

    if (!salaryRecord) {
      return NextResponse.json(
        { success: false, message: 'Salary record not found' },
        { status: 404 }
      )
    }

    await prisma.salaryRecord.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Salary record deleted successfully',
    })
  } catch (error) {
    console.error('Failed to delete salary record:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete salary record' },
      { status: 500 }
    )
  }
}
