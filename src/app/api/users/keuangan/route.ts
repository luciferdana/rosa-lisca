import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - Get all users with KEUANGAN role (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only admin can view users
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      where: {
        companyId: session.user.companyId,
        role: 'KEUANGAN'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        assignedProjects: {
          where: {
            isActive: true
          },
          include: {
            project: {
              select: {
                id: true,
                name: true,
                status: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(users);

  } catch (error) {
    console.error('Get KEUANGAN users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}