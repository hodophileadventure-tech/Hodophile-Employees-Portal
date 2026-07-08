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

    // Get ALL sales leads (confirmed and unconfirmed) for this employee
    const allSalesLeads = await prisma.salesLead.findMany({
      where: {
        employeeId,
      },
      orderBy: {
        confirmedAt: 'desc',
      },
    })

    const confirmedSalesLeads = allSalesLeads.filter(l => l.confirmed)
    const unconfirmedSalesLeads = allSalesLeads.filter(l => !l.confirmed)

    // Calculate totals
    const totalCommissionFromSalaryRecords = salaryRecords.reduce((sum, record) => sum + record.commission, 0)
    const totalCommissionFromLeads = confirmedSalesLeads.reduce((sum, lead) => sum + lead.commission, 0)
    const unaccountedCommission = totalCommissionFromSalaryRecords - totalCommissionFromLeads

    console.log('[COMMISSION BREAKDOWN]', {
      employeeId,
      totalCommissionFromSalaryRecords,
      totalCommissionFromLeads,
      unaccountedCommission,
      confirmedLeads: confirmedSalesLeads.length,
      unconfirmedLeads: unconfirmedSalesLeads.length,
    })

    return NextResponse.json({
      success: true,
      data: {
        salaryRecords,
        confirmedSalesLeads,
        unconfirmedSalesLeads,
        summary: {
          totalCommissionFromSalaryRecords,
          totalCommissionFromLeads,
          unaccountedCommission,
          totalConfirmedLeads: confirmedSalesLeads.length,
          totalUnconfirmedLeads: unconfirmedSalesLeads.length,
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
