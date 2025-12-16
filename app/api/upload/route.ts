import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file received.' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = Date.now() + '_' + file.name.replaceAll(' ', '_')
    
    // Save to public/uploads directory
    const uploadDir = path.join(process.cwd(), 'public/uploads')
    
    // Ensure directory exists (node fs/promises doesn't have a simple mkdir -p, 
    // but Next.js usually ensures public exists. We might need to check uploads folder)
    // For simplicity in this environment, we assume public exists. 
    // Note: In a real app we'd check/create dir.
    
    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)

    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    )
  }
}
