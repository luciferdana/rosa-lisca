import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Schema for assignment creation
const assignmentSchema = z.object({
  userId: z.number().int().positive(),
  projectId: z.number().int().positive(),
  isActive: z.boolean().default(true)
});

// GET - Get all project assignments (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only admin can view all assignments
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const assignments = await prisma.projectAssignment.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      },
      orderBy: {
        assignedAt: 'desc'
      }
    });

    return NextResponse.json(assignments);

  } catch (error) {
    console.error('Get assignments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new project assignment (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only admin can create assignments
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = assignmentSchema.parse(body);

    // Check if user exists and has KEUANGAN role
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'KEUANGAN') {
      return NextResponse.json(
        { error: 'Only users with KEUANGAN role can be assigned to projects' },
        { status: 400 }
      );
    }

    // Check if project exists and belongs to the same company
    const project = await prisma.project.findFirst({
      where: {
        id: validatedData.projectId,
        companyId: session.user.companyId
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.projectAssignment.findUnique({
      where: {
        userId_projectId: {
          userId: validatedData.userId,
          projectId: validatedData.projectId
        }
      }
    });

    if (existingAssignment) {
      // Update existing assignment
      const updatedAssignment = await prisma.projectAssignment.update({
        where: { id: existingAssignment.id },
        data: {
          isActive: validatedData.isActive,
          assignedAt: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          project: {
            select: {
              id: true,
              name: true,
              status: true
            }
          }
        }
      });

      return NextResponse.json(updatedAssignment);
    } else {
      // Create new assignment
      const assignment = await prisma.projectAssignment.create({
        data: {
          userId: validatedData.userId,
          projectId: validatedData.projectId,
          isActive: validatedData.isActive
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          project: {
            select: {
              id: true,
              name: true,
              status: true
            }
          }
        }
      });

      return NextResponse.json(assignment, { status: 201 });
    }

  } catch (error) {
    console.error('Create assignment error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}