import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const user = verifyAuth(authHeader)
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const employee = await prisma.employee.findUnique({
      where: { userId: user.id },
    })

    if (!employee) {
      return NextResponse.json({ success: false, message: 'Employee not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: employee })
  } catch (error) {
    console.error('Failed to fetch current employee:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch employee' }, { status: 500 })
  }
}
