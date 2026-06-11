// app/api/sales/leads/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const confirmLeadSchema = z.object({
  employeeId: z.string(),
  leadWorth: z.number().positive(),
})

// Calculate commission based on lead worth
function calculateCommission(leadWorth: number): number {
  if (leadWorth <= 25000) {
    return 500
  } else {
    return 1000
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = confirmLeadSchema.parse(body)

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: validated.employeeId },
    })

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

    const commission = calculateCommission(validated.leadWorth)

    // Create sales lead record
    const lead = await prisma.salesLead.create({
      data: {
        employeeId: validated.employeeId,
        leadWorth: validated.leadWorth,
        confirmed: true,
        confirmedAt: new Date(),
        commission,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Lead confirmed successfully',
        data: {
          ...lead,
          commissionEarned: commission,
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
