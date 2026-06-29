import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const salaryRecords = await prisma.salaryRecord.findMany({
      include: {
        employee: {
          select: {
            fullName: true,
            employeeId: true,
          },
        },
      },
      orderBy: {
        month: 'desc',
      },
    })

    return NextResponse.json({ success: true, data: salaryRecords })
  } catch (error) {
    console.error('Failed to fetch salary records:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch salary records' },
      { status: 500 }
    )
  }
}
