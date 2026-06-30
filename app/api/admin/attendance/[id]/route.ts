import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const attendance = await prisma.attendance.findUnique({
      where: { id },
    })

    if (!attendance) {
      return NextResponse.json(
        { success: false, message: 'Attendance record not found' },
        { status: 404 }
      )
    }

    await prisma.attendance.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Attendance record deleted successfully',
    })
  } catch (error) {
    console.error('Failed to delete attendance record:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete attendance record' },
      { status: 500 }
    )
  }
}
