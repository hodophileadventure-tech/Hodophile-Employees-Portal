// app/api/employee/commission-breakdown/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const employeeId = request.nextUrl.searchParams.get('employeeId')

    if (!employeeId) {
      return NextResponse.json(
        { success: false, message: 'employeeId is required' },
        { status: 400 }
      )
    }

    // Get all salary records with commission
    const salaryRecords = await prisma.salaryRecord.findMany({
      where: {
        employeeId,
        commission: { gt: 0 },
      },
      orderBy: {
        month: 'desc',
      },
    })

    // Get all sales leads
    const salesLeads = await prisma.salesLead.findMany({
      where: {
        employeeId,
        confirmed: true,
      },
      orderBy: {
        confirmedAt: 'desc',
      },
    })

    // Calculate totals
    const totalCommissionFromSalaryRecords = salaryRecords.reduce((sum, record) => sum + record.commission, 0)
    const totalCommissionFromLeads = salesLeads.reduce((sum, lead) => sum + lead.commission, 0)
    const unaccountedCommission = totalCommissionFromSalaryRecords - totalCommissionFromLeads

    return NextResponse.json({
      success: true,
      data: {
        salaryRecords,
        salesLeads,
        summary: {
          totalCommissionFromSalaryRecords,
          totalCommissionFromLeads,
          unaccountedCommission,
          totalLeads: salesLeads.length,
        },
      },
    })
  } catch (error) {
    console.error('Failed to get commission breakdown:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get commission breakdown' },
      { status: 500 }
    )
  }
}
