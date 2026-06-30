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

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const user = verifyAuth(authHeader)
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('profilePicture')

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, message: 'No image file provided' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, message: 'Please upload an image file' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    const employee = await prisma.employee.update({
      where: { userId: user.id },
      data: { profilePicture: dataUrl },
    })

    return NextResponse.json({ success: true, data: employee, message: 'Profile picture updated successfully' })
  } catch (error) {
    console.error('Failed to update employee profile picture:', error)
    return NextResponse.json({ success: false, message: 'Failed to update profile picture' }, { status: 500 })
  }
}
