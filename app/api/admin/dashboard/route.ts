import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function formatTime(value: Date | string | null | undefined) {
  if (!value) return '--'
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export async function GET() {
  try {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    // Get current month range for attendance pie chart
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const monthEnd = new Date()
    monthEnd.setMonth(monthEnd.getMonth() + 1)
    monthEnd.setDate(0)
    monthEnd.setHours(23, 59, 59, 999)

    const [
      totalEmployees,
      employees,
      todaysAttendance,
      salaryAggregate,
      monthlyAttendance,
      salesLeads,
    ] = await Promise.all([
      prisma.employee.count({ where: { status: 'ACTIVE' } }),
      prisma.employee.findMany({
        select: {
          department: true,
          fullName: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.attendance.findMany({
        where: {
          date: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
        include: {
          employee: {
            select: {
              fullName: true,
            },
          },
        },
        orderBy: {
          checkInTime: 'desc',
        },
        take: 10,
      }),
      prisma.employee.aggregate({
        _sum: {
          monthlySalary: true,
        },
      }),
      prisma.attendance.findMany({
        where: {
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      }),
      prisma.salesLead.findMany({
        include: {
          employee: {
            select: {
              fullName: true,
              id: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 100,
      }),
    ])

    // For live status, fetch today's breaks and map by employee
    const todaysBreaks = await prisma.break.findMany({
      where: {
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      orderBy: { breakStart: 'desc' },
    })

    const breakMap = new Map<string, any[]>()
    todaysBreaks.forEach((b) => {
      const arr = breakMap.get(b.employeeId) || []
      arr.push(b)
      breakMap.set(b.employeeId, arr)
    })

    // Map employees to include live status
    const employeeStatuses = await Promise.all(
      employees.map(async (emp: any) => {
        // find today's attendance if exists
        const att = todaysAttendance.find((a: any) => a.employeeId === emp.id)
        const breaks = breakMap.get(emp.id) || []
        const onBreak = breaks.some((b) => !b.breakEnd)
        const lastBreak = breaks[0]
        let currentBreakDuration = 0
        if (onBreak) {
          const active = breaks.find((b) => !b.breakEnd)
          if (active) {
            currentBreakDuration = Math.floor((Date.now() - new Date(active.breakStart).getTime()) / 60000)
          }
        } else if (lastBreak && lastBreak.duration) {
          currentBreakDuration = lastBreak.duration
        }

        return {
          id: emp.id,
          fullName: emp.fullName,
          department: emp.department,
          status: emp.status,
          todaysAttendance: att ? { status: att.status, checkInTime: att.checkInTime } : null,
          onBreak,
          currentBreakDuration,
          totalBreaksToday: breaks.length,
        }
      })
    )

    const presentToday = todaysAttendance.filter((entry) => entry.status === 'PRESENT' || entry.status === 'LATE').length
    const absentToday = Math.max(totalEmployees - presentToday, 0)
    const monthlyExpense = salaryAggregate._sum.monthlySalary ?? 0

    const departmentMap = new Map<string, number>()
    employees.forEach((employee) => {
      const current = departmentMap.get(employee.department) ?? 0
      departmentMap.set(employee.department, current + 1)
    })

    const departments = Array.from(departmentMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalEmployees > 0 ? Math.round((count / totalEmployees) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)

    const recentActivity = todaysAttendance.length > 0
      ? todaysAttendance.map((entry) => ({
          action: entry.employee?.fullName || 'Employee',
          activity: entry.checkOutTime ? 'Checked out' : 'Checked in',
          time: entry.checkInTime ? formatTime(entry.checkInTime) : 'Today',
        }))
      : employees.slice(0, 5).map((employee) => ({
          action: employee.fullName,
          activity: 'Added employee',
          time: employee.createdAt ? new Date(employee.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today',
        }))

    // Calculate attendance breakdown for pie chart
    const attendanceBreakdown = {
      PRESENT: monthlyAttendance.filter((a) => a.status === 'PRESENT').length,
      ABSENT: monthlyAttendance.filter((a) => a.status === 'ABSENT').length,
      LATE: monthlyAttendance.filter((a) => a.status === 'LATE').length,
      HALFDAY: monthlyAttendance.filter((a) => a.status === 'HALFDAY').length,
    }

    // Calculate sales agent performance
    const salesAgentMap = new Map<
      string,
      { name: string; id: string; sales: number; commission: number }
    >()

    salesLeads.forEach((lead: any) => {
      const agentId = lead.employeeId
      const agentName = lead.employee?.fullName || 'Unknown'

      const current = salesAgentMap.get(agentId) || {
        name: agentName,
        id: agentId,
        sales: 0,
        commission: 0,
      }

      // Use leadWorth as the lead value
      current.sales += (lead.leadWorth || 0)
      current.commission += (lead.commission || 0)

      salesAgentMap.set(agentId, current)
    })

    const salesAgentPerformance = Array.from(salesAgentMap.values()).sort(
      (a, b) => b.sales - a.sales
    )

    return NextResponse.json({
      success: true,
      data: {
        totalEmployees,
        presentToday,
        absentToday,
        monthlyExpense,
        departments,
        recentActivity,
        attendanceBreakdown,
        salesAgentPerformance,
        employeeStatuses,
      },
    })
  } catch (error) {
    console.error('Failed to fetch admin dashboard stats:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
