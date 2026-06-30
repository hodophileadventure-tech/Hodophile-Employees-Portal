import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads', 'profiles')
    await fs.promises.mkdir(uploadsDir, { recursive: true })

    const extMatch = (file.name || '').match(/\.([0-9a-zA-Z]+)$/)
    const ext = extMatch ? extMatch[1] : 'png'
    const filename = `${id}-${Date.now()}.${ext}`
    const filePath = path.join(uploadsDir, filename)

    await fs.promises.writeFile(filePath, buffer)

    const publicPath = `/uploads/profiles/${filename}`

    const employee = await prisma.employee.update({
      where: { id },
      data: { profilePicture: publicPath },
    })

    return NextResponse.json({ success: true, data: { employee, url: publicPath } })
  } catch (error) {
    console.error('Failed to upload profile picture:', error)
    return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 })
  }
}
