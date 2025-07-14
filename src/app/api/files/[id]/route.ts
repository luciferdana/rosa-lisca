import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/files/[id] - Retrieve file and convert base64 to binary
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fileId = parseInt(params.id);
    
    // Get file from database
    const fileUpload = await prisma.fileUpload.findFirst({
      where: {
        id: fileId,
        companyId: session.user.companyId, // Ensure user can only access their company's files
      },
    });

    if (!fileUpload) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Convert base64 back to binary
    const buffer = Buffer.from(fileUpload.base64Data, 'base64');

    // Return file with proper headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': fileUpload.fileType,
        'Content-Length': fileUpload.fileSize.toString(),
        'Content-Disposition': `inline; filename="${fileUpload.fileName}"`,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });

  } catch (error) {
    console.error('File retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve file' },
      { status: 500 }
    );
  }
}

// DELETE /api/files/[id] - Delete file from database
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fileId = parseInt(params.id);
    
    // Check if file exists and belongs to user's company
    const fileUpload = await prisma.fileUpload.findFirst({
      where: {
        id: fileId,
        companyId: session.user.companyId,
      },
    });

    if (!fileUpload) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Delete file from database
    await prisma.fileUpload.delete({
      where: { id: fileId },
    });

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });

  } catch (error) {
    console.error('File deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
