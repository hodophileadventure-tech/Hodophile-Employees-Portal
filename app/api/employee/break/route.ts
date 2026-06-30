import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

async function getEmployeeIdFromAuthHeader(authHeader: string | null) {
  const authUser = verifyAuth(authHeader)
  if (!authUser?.id) return null

  const employee = await prisma.employee.findUnique({
    where: { userId: authUser.id },
  })

  return employee?.id ?? null
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const employeeId = await getEmployeeIdFromAuthHeader(authHeader)

    if (!employeeId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = body // 'start' or 'end'

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (action === 'start') {
      // Start a new break
      const existingActiveBreak = await (prisma as any)['break'].findFirst({
        where: {
          employeeId,
          date: today,
          breakEnd: null,
        },
      })

      if (existingActiveBreak) {
        return NextResponse.json(
          { success: false, message: 'A break is already in progress' },
          { status: 400 }
        )
      }

      // Check total break time today
      const todayBreaks = await (prisma as any)['break'].findMany({
        where: {
          employeeId,
          date: today,
          breakEnd: { not: null },
        },
      })

      const totalBreakMinutes = todayBreaks.reduce((sum: any, brk: any) => sum + (brk.duration || 0), 0)

      if (totalBreakMinutes >= 60) {
        return NextResponse.json(
          {
            success: false,
            message: 'Daily break limit (1 hour) has been reached',
          },
          { status: 400 }
        )
      }

      const breakRecord = await (prisma as any)['break'].create({
        data: {
          employeeId,
          date: today,
          breakStart: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Break started',
        data: breakRecord,
      })
    } else if (action === 'end') {
      // End the current break
      const activeBreak = await (prisma as any)['break'].findFirst({
        where: {
          employeeId,
          date: today,
          breakEnd: null,
        },
      })

      if (!activeBreak) {
        return NextResponse.json(
          { success: false, message: 'No active break found' },
          { status: 400 }
        )
      }

      const breakEnd = new Date()
      const durationMinutes = Math.round(
        (breakEnd.getTime() - activeBreak.breakStart.getTime()) / (1000 * 60)
      )

      const updatedBreak = await (prisma as any)['break'].update({
        where: { id: activeBreak.id },
        data: {
          breakEnd,
          duration: durationMinutes,
        },
      })

      // Update attendance total break time
      const attendance = await prisma.attendance.findUnique({
        where: {
          employeeId_date: {
            employeeId,
            date: today,
          },
        },
      })

      if (attendance) {
          const allBreaksToday = await (prisma as any)['break'].findMany({
            where: {
              employeeId,
              date: today,
              breakEnd: { not: null },
            },
          })

          const totalBreakMinutes = allBreaksToday.reduce((sum: any, brk: any) => sum + (brk.duration || 0), 0)

          await (prisma as any).attendance.update({
            where: { id: attendance.id },
            data: ({ totalBreakMinutes } as any),
          })
      }

      return NextResponse.json({
        success: true,
        message: 'Break ended',
        data: updatedBreak,
      })
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid action' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Failed to manage break:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to manage break' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const employeeId = await getEmployeeIdFromAuthHeader(authHeader)

    if (!employeeId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const breaks = await (prisma as any)['break'].findMany({
      where: {
        employeeId,
        date: today,
      },
      orderBy: { breakStart: 'asc' },
    })

    const activeBreak = breaks.find((brk: any) => !brk.breakEnd)
    const totalBreakMinutes = breaks.reduce((sum: any, brk: any) => sum + (brk.duration || 0), 0)

    return NextResponse.json({
      success: true,
      data: {
        breaks,
        activeBreak,
        totalBreakMinutes,
      },
    })
  } catch (error) {
    console.error('Failed to fetch breaks:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch breaks' },
      { status: 500 }
    )
  }
}
