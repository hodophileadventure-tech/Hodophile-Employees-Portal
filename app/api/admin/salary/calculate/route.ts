// app/api/admin/salary/calculate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const calculateSalarySchema = z.object({
  employeeId: z.string(),
  month: z.string(), // YYYY-MM format
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = calculateSalarySchema.parse(body)

    // Get employee
    const employee = await prisma.employee.findUnique({
      where: { id: validated.employeeId },
    })

    if (!employee) {
      return NextResponse.json(
        { success: false, message: 'Employee not found' },
        { status: 404 }
      )
    }

    // Parse month
    const [year, month] = validated.month.split('-').map(Number)
    const monthDate = new Date(year, month - 1, 1)
    const nextMonthDate = new Date(year, month, 1)

    // Get attendance records for the month
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        employeeId: validated.employeeId,
        date: {
          gte: monthDate,
          lt: nextMonthDate,
        },
      },
    })

    // Count working days (PRESENT status)
    const daysWorked = attendanceRecords.filter(
      (a) => a.status === 'PRESENT'
    ).length

    const daysInMonth = new Date(year, month, 0).getDate()
    const dailySalary = employee.monthlySalary / daysInMonth
    const earnedSalary = dailySalary * daysWorked

    // Get sales leads for the month (if employee is sales executive)
    let totalCommission = 0
    let monthlyIncentive = 0

    if (employee.designation.toLowerCase().includes('sales executive')) {
      const salesLeads = await prisma.salesLead.findMany({
        where: {
          employeeId: validated.employeeId,
          confirmed: true,
          confirmedAt: {
            gte: monthDate,
            lt: nextMonthDate,
          },
        },
      })

      // Calculate total commission
      totalCommission = salesLeads.reduce((sum, lead) => sum + lead.commission, 0)

      // Calculate total lead worth for incentive
      const totalLeadWorth = salesLeads.reduce(
        (sum, lead) => sum + lead.leadWorth,
        0
      )

      // Check if eligible for monthly incentive (>= 1 Crore)
      if (totalLeadWorth >= 10000000) {
        monthlyIncentive = 30000
      }
    }

    // Calculate net salary
    const netSalary = earnedSalary + totalCommission + monthlyIncentive

    // Create or update salary record
    const salaryRecord = await prisma.salaryRecord.upsert({
      where: {
        employeeId_month: {
          employeeId: validated.employeeId,
          month: monthDate,
        },
      },
      update: {
        daysWorked,
        totalSalary: employee.monthlySalary,
        earnedSalary: parseFloat(earnedSalary.toFixed(2)),
        commission: parseFloat(totalCommission.toFixed(2)),
        monthlyIncentive: parseFloat(monthlyIncentive.toFixed(2)),
        netSalary: parseFloat(netSalary.toFixed(2)),
      },
      create: {
        employeeId: validated.employeeId,
        month: monthDate,
        daysWorked,
        totalSalary: employee.monthlySalary,
        earnedSalary: parseFloat(earnedSalary.toFixed(2)),
        commission: parseFloat(totalCommission.toFixed(2)),
        monthlyIncentive: parseFloat(monthlyIncentive.toFixed(2)),
        netSalary: parseFloat(netSalary.toFixed(2)),
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Salary calculated successfully',
      data: salaryRecord,
    })
  } catch (error) {
    console.error('Failed to calculate salary:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid input', errors: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, message: 'Failed to calculate salary' },
      { status: 500 }
    )
  }
}
