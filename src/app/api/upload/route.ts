import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 
      'image/png', 
      'image/gif', 
      'image/webp',
      'application/pdf'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Allowed: ' + allowedTypes.join(', ') 
      }, { status: 400 });
    }

    // Validate file size (5MB max)
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB default
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB` 
      }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');

    // Create unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${session.user.companyId}_${timestamp}_${sanitizedName}`;

    // Save to database
    const fileUpload = await prisma.fileUpload.create({
      data: {
        fileName: sanitizedName,
        fileType: file.type,
        fileSize: file.size,
        base64Data: base64Data,
        uploadedBy: parseInt(session.user.id!),
        companyId: session.user.companyId,
      },
    });

    return NextResponse.json({
      success: true,
      id: fileUpload.id,
      fileName: sanitizedName,
      url: `/api/files/${fileUpload.id}`, // URL untuk retrieve file
      size: file.size,
      type: file.type,
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}