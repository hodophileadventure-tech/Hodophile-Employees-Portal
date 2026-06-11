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
      const [reportingHour, reportingMinute] = employee.reportingTime
        .split(':')
        .map(Number)
      const reportingDate = new Date(`${validated.date}T${employee.reportingTime}:00`)

      // Check if employee is late (more than 30 minutes)
      const minutesLate = (checkInTime.getTime() - reportingDate.getTime()) / (1000 * 60)
      if (minutesLate > 30) {
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
