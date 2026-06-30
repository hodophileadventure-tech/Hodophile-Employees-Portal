import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

function getEmployeeIdFromToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    return decoded.employeeId
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const employeeId = getEmployeeIdFromToken(token)

    if (!employeeId) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = body // 'start' or 'end'

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (action === 'start') {
      // Start a new break
      const existingActiveBreak = await prisma.break.findFirst({
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
      const todayBreaks = await prisma.break.findMany({
        where: {
          employeeId,
          date: today,
          breakEnd: { not: null },
        },
      })

      const totalBreakMinutes = todayBreaks.reduce(
        (sum, brk) => sum + (brk.duration || 0),
        0
      )

      if (totalBreakMinutes >= 60) {
        return NextResponse.json(
          {
            success: false,
            message: 'Daily break limit (1 hour) has been reached',
          },
          { status: 400 }
        )
      }

      const breakRecord = await prisma.break.create({
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
      const activeBreak = await prisma.break.findFirst({
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

      const updatedBreak = await prisma.break.update({
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
        const allBreaksToday = await prisma.break.findMany({
          where: {
            employeeId,
            date: today,
            breakEnd: { not: null },
          },
        })

        const totalBreakMinutes = allBreaksToday.reduce(
          (sum, brk) => sum + (brk.duration || 0),
          0
        )

        await prisma.attendance.update({
          where: { id: attendance.id },
          data: { totalBreakMinutes },
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
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const employeeId = getEmployeeIdFromToken(token)

    if (!employeeId) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const breaks = await prisma.break.findMany({
      where: {
        employeeId,
        date: today,
      },
      orderBy: { breakStart: 'asc' },
    })

    const activeBreak = breaks.find((brk) => !brk.breakEnd)
    const totalBreakMinutes = breaks.reduce(
      (sum, brk) => sum + (brk.duration || 0),
      0
    )

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
