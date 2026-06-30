// app/api/admin/attendance/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const logAttendanceSchema = z.object({
  employeeId: z.string(),
  date: z.string(),
  checkInTime: z.string(), // HH:MM format
  checkOutTime: z.string(), // HH:MM format
})

const attendanceQuerySchema = z.object({
  mode: z.enum(['daily', 'monthly']).optional(),
  date: z.string().optional(),
  month: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const validated = attendanceQuerySchema.parse({
      mode: url.searchParams.get('mode') ?? 'daily',
      date: url.searchParams.get('date') ?? undefined,
      month: url.searchParams.get('month') ?? undefined,
    })

    const today = new Date()
    let startDate = new Date(today)
    let endDate = new Date(today)

    if (validated.mode === 'daily') {
      if (validated.date) {
        startDate = new Date(validated.date)
      }
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(startDate)
      endDate.setHours(23, 59, 59, 999)
    } else {
      const [year, month] = validated.month
        ? validated.month.split('-').map(Number)
        : [today.getFullYear(), today.getMonth() + 1]

      startDate = new Date(year, month - 1, 1)
      endDate = new Date(year, month, 1)
    }

    const [totalEmployees, attendanceRecords] = await Promise.all([
      prisma.employee.count({ where: { status: 'ACTIVE' } }),
      prisma.attendance.findMany({
        where: {
          date: {
            gte: startDate,
            lt: endDate,
          },
        },
        include: {
          employee: {
            select: {
              fullName: true,
              employeeId: true,
            },
          },
        },
        orderBy: {
          checkInTime: 'desc',
        },
      }),
    ])

    const presentCount = attendanceRecords.filter(
      (record) => record.status === 'PRESENT' || record.status === 'LATE'
    ).length
    const lateCount = attendanceRecords.filter(
      (record) => record.status === 'LATE'
    ).length

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalEmployees,
          presentCount,
          lateCount,
          absentCount:
            validated.mode === 'daily'
              ? Math.max(totalEmployees - presentCount, 0)
              : undefined,
          totalRecords: attendanceRecords.length,
        },
        records: attendanceRecords,
      },
    })
  } catch (error) {
    console.error('Failed to fetch attendance records:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid query parameters', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Failed to fetch attendance records' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = logAttendanceSchema.parse(body)

    // Get employee with reporting time
    const employee = await prisma.employee.findUnique({
      where: { id: validated.employeeId },
    })

    if (!employee) {
      return NextResponse.json(
        { success: false, message: 'Employee not found' },
        { status: 404 }
      )
    }

    const date = new Date(validated.date)
    const checkInTime = new Date(
      `${validated.date}T${validated.checkInTime}:00`
    )
    const checkOutTime = new Date(
      `${validated.date}T${validated.checkOutTime}:00`
    )

    // Calculate working hours
    const workingHours =
      (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)

    // Determine attendance status
    let status = 'PRESENT'
    let isLate = false

    if (employee.reportingTime) {
      const reportingDate = new Date(
        `${validated.date}T${employee.reportingTime}:00`
      )

      // Check if employee is late (checked in after reporting time)
      const minutesLate =
        (checkInTime.getTime() - reportingDate.getTime()) / (1000 * 60)
      if (minutesLate > 0) {
        status = 'LATE'
        isLate = true
      }
    }

    // Create or update attendance record
    const attendance = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: validated.employeeId,
          date,
        },
      },
      update: {
        checkInTime,
        checkOutTime,
        workingHours: parseFloat(workingHours.toFixed(2)),
        status,
      },
      create: {
        employeeId: validated.employeeId,
        date,
        checkInTime,
        checkOutTime,
        workingHours: parseFloat(workingHours.toFixed(2)),
        status,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Attendance logged successfully${isLate ? ' (LATE)' : ''}`,
      data: attendance,
    })
  } catch (error) {
    console.error('Failed to log attendance:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid input', errors: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, message: 'Failed to log attendance' },
      { status: 500 }
    )
  }
}
