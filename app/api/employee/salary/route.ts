import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const authUser = verifyAuth(authHeader)

    if (!authUser?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const monthParam = request.nextUrl.searchParams.get('month')
    let monthStart: Date
    if (monthParam) {
      const [y, m] = monthParam.split('-').map(Number)
      monthStart = new Date(y, m - 1, 1)
    } else {
      const now = new Date()
      monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const employee = await prisma.employee.findUnique({ where: { userId: authUser.id } })
    if (!employee) return NextResponse.json({ success: false, message: 'Employee not found' }, { status: 404 })

    const salaryRecord = await prisma.salaryRecord.findUnique({
      where: { employeeId_month: { employeeId: employee.id, month: monthStart } },
    })

    // Also fetch sales leads and attendance if needed
    const leads = await prisma.salesLead.findMany({ where: { employeeId: employee.id, confirmed: true, confirmedAt: { gte: monthStart, lte: new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59) } } })

    return NextResponse.json({ success: true, data: { salaryRecord, leads, employee } })
  } catch (error) {
    console.error('Failed to fetch salary record:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch salary record' }, { status: 500 })
  }
}
