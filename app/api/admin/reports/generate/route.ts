import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Generate monthly salary reports for previous month
export async function POST() {
  try {
    const now = new Date()
    // previous month
    const month = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999)

    const employees = await prisma.employee.findMany()

    const totalWorkingDays = 22

    const results: any[] = []

    for (const emp of employees) {
      const attendance = await prisma.attendance.findMany({
        where: {
          employeeId: emp.id,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
      })

      const presentCount = attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length
      const lateCount = attendance.filter(a => a.status === 'LATE').length
      const halfDayCount = attendance.filter(a => a.status === 'HALF_DAY' || a.status === 'HALF DAY').length
      const absentCount = attendance.filter(a => a.status === 'ABSENT').length
      const totalHours = attendance.reduce((s, a) => s + (a.workingHours || 0), 0)

      const earnedSalary = Math.round((presentCount / totalWorkingDays) * (emp.monthlySalary || 0))

      // Penalty escalation logic
      const overageDays = attendance.filter(a => (((a as any).totalBreakMinutes || 0) > 60)).length
      const overageToLate = Math.floor(overageDays / 5)
      const totalLates = lateCount + overageToLate
      const lateToAbsent = Math.floor(totalLates / 3)
      const halfDayToAbsent = Math.floor(halfDayCount / 2)
      const totalPenaltyAbsents = lateToAbsent + halfDayToAbsent

      const daysWorkedAdjusted = Math.max(0, presentCount - totalPenaltyAbsents)
      const dailySalary = (emp.monthlySalary || 0) / totalWorkingDays
      const deductions = Math.round(totalPenaltyAbsents * dailySalary)


      // Sum commissions from sales leads in month
      const leads = await prisma.salesLead.findMany({
        where: { employeeId: emp.id, confirmed: true, confirmedAt: { gte: startOfMonth, lte: endOfMonth } },
      })
      const totalCommission = leads.reduce((s, l) => s + (l.commission || 0), 0)

      // Upsert salary record (apply penalties to net salary)
      const monthKey = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), 1)
      const netBeforeDeductions = earnedSalary + totalCommission
      const netSalary = Math.max(0, netBeforeDeductions - deductions)

      await prisma.salaryRecord.upsert({
        where: { employeeId_month: { employeeId: emp.id, month: monthKey } },
        create: {
          employeeId: emp.id,
          month: monthKey,
          daysWorked: daysWorkedAdjusted,
          totalSalary: emp.monthlySalary || 0,
          earnedSalary,
          commission: totalCommission,
          monthlyIncentive: 0,
          deductions,
          netSalary,
          status: 'PENDING',
        },
        update: {
          daysWorked: daysWorkedAdjusted,
          totalSalary: emp.monthlySalary || 0,
          earnedSalary,
          commission: totalCommission,
          deductions,
          netSalary,
        },
      })

      results.push({ employeeId: emp.id, presentCount, earnedSalary, totalCommission })
    }

    return NextResponse.json({ success: true, data: results })
  } catch (error) {
    console.error('Failed to generate monthly reports:', error)
    return NextResponse.json({ success: false, message: 'Failed to generate reports' }, { status: 500 })
  }
}
