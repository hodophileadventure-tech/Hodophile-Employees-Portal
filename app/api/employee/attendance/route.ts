// app/api/employee/attendance/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')
    const month = request.nextUrl.searchParams.get('month')

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email parameter required' },
        { status: 400 }
      )
    }

    // Get employee by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
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

    // Build query
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
      // Default to current month
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      where.date = {
        gte: startOfMonth,
        lte: endOfMonth,
      }
    }

    // Get attendance records
    const attendance = await prisma.attendance.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
    })

    // Calculate statistics
    const presentCount = attendance.filter(a => a.status === 'PRESENT').length
    const absentCount = attendance.filter(a => a.status === 'ABSENT').length
    const lateCount = attendance.filter(a => a.status === 'LATE').length
    const halfDayCount = attendance.filter(a => a.status === 'HALF_DAY').length
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
