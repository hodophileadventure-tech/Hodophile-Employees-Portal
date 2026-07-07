// app/api/sales/leads/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const confirmLeadSchema = z.object({
  employeeId: z.string(),
  employeeEmail: z.string().email().optional(),
  customerName: z.string().min(1, 'Customer name is required'),
  customerNumber: z.string().optional(),
  destination: z.string().optional(),
  persons: z.number().int().positive('Number of persons must be greater than 0'),
  leadWorth: z.number().nonnegative().optional(),
  commission: z.number().nonnegative().optional(),
  leadId: z.string().optional(),
  sourceSystem: z.string().optional(),
  confirmedAt: z.string().optional(),
})

// Calculate commission based on lead worth
function calculateCommission(leadWorth: number): number {
  if (leadWorth <= 25000) {
    return 500
  } else {
    return 1000
  }
}

const getMonthStart = (date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0)
}

const upsertSalaryRecord = async (employeeId: string, commission: number) => {
  const month = getMonthStart()
  const existing = await prisma.salaryRecord.findUnique({
    where: {
      employeeId_month: {
        employeeId,
        month,
      },
    },
  })

  if (existing) {
    const updated = await prisma.salaryRecord.update({
      where: { id: existing.id },
      data: {
        commission: existing.commission + commission,
        netSalary: existing.totalSalary + existing.commission + commission - existing.deductions,
        updatedAt: new Date(),
      },
    })
    return updated
  }

  const employee = await prisma.employee.findUnique({ where: { id: employeeId } })
  const totalSalary = employee?.monthlySalary ?? 0
  const created = await prisma.salaryRecord.create({
    data: {
      employeeId,
      month,
      daysWorked: 0,
      totalSalary,
      earnedSalary: 0,
      deductions: 0,
      commission,
      monthlyIncentive: 0,
      netSalary: totalSalary + commission,
      status: 'PENDING',
    },
  })
  return created
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = confirmLeadSchema.parse(body)

    if (validated.sourceSystem === 'lead-manager') {
      if (!validated.employeeEmail) {
        return NextResponse.json(
          { success: false, message: 'employeeEmail is required for lead-manager payloads' },
          { status: 400 }
        )
      }

      if (validated.commission === undefined) {
        return NextResponse.json(
          { success: false, message: 'commission is required for lead-manager payloads' },
          { status: 400 }
        )
      }

      validated.customerNumber = validated.customerNumber ?? ''
      validated.destination = validated.destination ?? ''
      validated.leadWorth = validated.leadWorth ?? 0
    } else {
      if (!validated.customerNumber) {
        return NextResponse.json(
          { success: false, message: 'customerNumber is required' },
          { status: 400 }
        )
      }
      if (!validated.destination) {
        return NextResponse.json(
          { success: false, message: 'destination is required' },
          { status: 400 }
        )
      }
      if (validated.leadWorth === undefined) {
        return NextResponse.json(
          { success: false, message: 'leadWorth is required' },
          { status: 400 }
        )
      }
    }

    let employee;
    if (validated.sourceSystem === 'lead-manager') {
      employee = await prisma.employee.findUnique({
        where: { email: validated.employeeEmail! },
      })
    } else {
      employee = await prisma.employee.findFirst({
        where: {
          OR: [
            { id: validated.employeeId },
            { employeeId: validated.employeeId },
            { userId: validated.employeeId },
          ],
        },
      })
    }

    if (!employee) {
      return NextResponse.json(
        { success: false, message: 'Employee not found' },
        { status: 404 }
      )
    }

    // Only Sales Executives can log leads
    if (!employee.designation.toLowerCase().includes('sales executive')) {
      return NextResponse.json(
        { success: false, message: 'Only sales executives can log leads' },
        { status: 403 }
      )
    }

    let commission: number
    if (validated.sourceSystem === 'lead-manager') {
      if (validated.commission === undefined) {
        return NextResponse.json(
          { success: false, message: 'commission is required for lead-manager payloads' },
          { status: 400 }
        )
      }
      commission = validated.commission
    } else {
      commission = validated.commission ?? calculateCommission(validated.leadWorth)
    }

    if (validated.leadId) {
      const existingLead = await prisma.salesLead.findUnique({
        where: { sourceLeadId: validated.leadId },
      })
      if (existingLead) {
        return NextResponse.json(
          { success: true, message: 'Duplicate lead already recorded', data: existingLead },
          { status: 409 }
        )
      }
    }

    // Create sales lead record
    const lead = await prisma.salesLead.create({
      data: {
        employeeId: employee.id,
        customerName: validated.customerName,
        customerNumber: validated.customerNumber,
        destination: validated.destination,
        persons: validated.persons,
        leadWorth: validated.leadWorth,
        confirmed: true,
        confirmedAt: validated.confirmedAt ? new Date(validated.confirmedAt) : new Date(),
        commission,
        sourceLeadId: validated.leadId,
        sourceSystem: validated.sourceSystem || 'unknown',
      },
    })

    const salaryRecord = await upsertSalaryRecord(employee.id, commission)

    return NextResponse.json(
      {
        success: true,
        message: 'Lead confirmed successfully',
        data: {
          ...lead,
          commissionEarned: commission,
          salaryRecordId: salaryRecord.id,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Failed to confirm lead:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid input', errors: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, message: 'Failed to confirm lead' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const employeeId = request.nextUrl.searchParams.get('employeeId')
    const month = request.nextUrl.searchParams.get('month')

    let where: any = { confirmed: true }

    if (employeeId) {
      where.employeeId = employeeId
    }

    if (month) {
      const monthDate = new Date(month)
      const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)

      where.confirmedAt = {
        gte: startOfMonth,
        lte: endOfMonth,
      }
    }

    const leads = await prisma.salesLead.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeId: true,
          },
        },
      },
      orderBy: {
        confirmedAt: 'desc',
      },
    })

    // Calculate statistics
    const totalLeads = leads.length
    const totalWorth = leads.reduce((sum, lead) => sum + lead.leadWorth, 0)
    const totalCommission = leads.reduce((sum, lead) => sum + lead.commission, 0)
    const monthlyIncentive = totalWorth >= 10000000 ? 30000 : 0

    return NextResponse.json({
      success: true,
      data: {
        leads,
        statistics: {
          totalLeads,
          totalWorth,
          totalCommission,
          monthlyIncentive,
          isEligibleForIncentive: totalWorth >= 10000000,
        },
      },
    })
  } catch (error) {
    console.error('Failed to fetch leads:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}
