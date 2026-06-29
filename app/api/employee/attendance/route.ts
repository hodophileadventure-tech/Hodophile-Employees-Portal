// app/api/employee/attendance/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { z } from 'zod'

const attendanceActionSchema = z.object({
  action: z.enum(['check-in', 'check-out']),
})

function getStartOfToday() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

function getEndOfToday() {
  const date = new Date()
  date.setHours(23, 59, 59, 999)
  return date
}

function parseReportingTime(value: string | null | undefined) {
  if (!value) return null
  const [hours, minutes] = value.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date
}

function formatClock(value: Date | string | null | undefined) {
  if (!value) return undefined
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const authUser = verifyAuth(authHeader)
    const email = request.nextUrl.searchParams.get('email')
    const month = request.nextUrl.searchParams.get('month')

    let user = null
    if (authUser?.id) {
      user = await prisma.user.findUnique({ where: { id: authUser.id } })
    } else if (email) {
      user = await prisma.user.findUnique({ where: { email } })
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const employee = await prisma.employee.findUnique({
      where: { userId: user.id },
    })

    if (!employee) {
      return NextResponse.json(
        { success: false, message: 'Employee not found' },
        { status: 404 }
      )
    }

    let where: any = {
      employeeId: employee.id,
    }

    if (month) {
      const [year, monthNum] = month.split('-').map(Number)
      const startOfMonth = new Date(year, monthNum - 1, 1)
      const endOfMonth = new Date(year, monthNum, 0)

      where.date = {
        gte: startOfMonth,
        lte: endOfMonth,
      }
    } else {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      where.date = {
        gte: startOfMonth,
        lte: endOfMonth,
      }
    }

    const attendance = await prisma.attendance.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
    })

    const presentCount = attendance.filter((a) => a.status === 'PRESENT').length
    const absentCount = attendance.filter((a) => a.status === 'ABSENT').length
    const lateCount = attendance.filter((a) => a.status === 'LATE').length
    const halfDayCount = attendance.filter((a) => a.status === 'HALF_DAY').length
    const totalHours = attendance.reduce((sum, a) => sum + (a.workingHours || 0), 0)

    return NextResponse.json({
      success: true,
      data: {
        records: attendance,
        statistics: {
          presentCount,
          absentCount,
          lateCount,
          halfDayCount,
          totalHours: parseFloat(totalHours.toFixed(2)),
        },
        employee: {
          id: employee.id,
          fullName: employee.fullName,
          employeeId: employee.employeeId,
          reportingTime: employee.reportingTime,
          logoutTime: employee.logoutTime,
        },
      },
    })
  } catch (error) {
    console.error('Failed to fetch attendance:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch attendance' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const authUser = verifyAuth(authHeader)

    if (!authUser?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { action } = attendanceActionSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { id: authUser.id } })
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const employee = await prisma.employee.findUnique({ where: { userId: user.id } })
    if (!employee) {
      return NextResponse.json({ success: false, message: 'Employee not found' }, { status: 404 })
    }

    const todayStart = getStartOfToday()
    const todayEnd = getEndOfToday()

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId: employee.id,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      orderBy: {
        date: 'desc',
      },
    })

    const now = new Date()

    if (action === 'check-in') {
      if (existingAttendance) {
        return NextResponse.json({
          success: true,
          message: existingAttendance.checkOutTime ? 'You already checked out today' : 'You are already checked in today',
          data: {
            ...existingAttendance,
            checkInTime: formatClock(existingAttendance.checkInTime),
            checkOutTime: formatClock(existingAttendance.checkOutTime),
          },
        })
      }

      const reportingTime = parseReportingTime(employee.reportingTime)
      const status = reportingTime && now > reportingTime ? 'LATE' : 'PRESENT'

      const attendance = await prisma.attendance.create({
        data: {
          employeeId: employee.id,
          date: todayStart,
          checkInTime: now,
          status,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Checked in successfully',
        data: {
          ...attendance,
          checkInTime: formatClock(attendance.checkInTime),
          checkOutTime: formatClock(attendance.checkOutTime),
        },
      })
    }

    if (!existingAttendance) {
      return NextResponse.json(
        { success: false, message: 'No check-in record found for today' },
        { status: 400 }
      )
    }

    if (existingAttendance.checkOutTime) {
      return NextResponse.json({
        success: true,
        message: 'You already checked out today',
        data: {
          ...existingAttendance,
          checkInTime: formatClock(existingAttendance.checkInTime),
          checkOutTime: formatClock(existingAttendance.checkOutTime),
        },
      })
    }

    const workingHours = ((now.getTime() - new Date(existingAttendance.checkInTime).getTime()) / 3600000)
    const attendance = await prisma.attendance.update({
      where: { id: existingAttendance.id },
      data: {
        checkOutTime: now,
        workingHours: Number(workingHours.toFixed(2)),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Checked out successfully',
      data: {
        ...attendance,
        checkInTime: formatClock(attendance.checkInTime),
        checkOutTime: formatClock(attendance.checkOutTime),
      },
    })
  } catch (error) {
    console.error('Failed to update attendance:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update attendance' },
      { status: 500 }
    )
  }
}
