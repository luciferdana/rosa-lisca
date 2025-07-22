import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { projectSchema, idSchema } from '@/lib/validations';
import { calculateProjectProgress } from '@/lib/calculations';

// GET /api/projects/[id] - Get single project dengan details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = idSchema.parse(params);
    const projectId = parseInt(id);

    // Build where clause based on user role
    const where: any = {
      id: projectId,
      companyId: session.user.companyId,
    };

    // For KEUANGAN users, ensure they can only access assigned projects
    if (session.user.role === 'KEUANGAN') {
      where.assignments = {
        some: {
          userId: parseInt(session.user.id!),
          isActive: true
        }
      };
    }

    const project = await prisma.project.findFirst({
      where,
      include: {
        assignments: session.user.role === 'KEUANGAN' ? {
          where: {
            userId: parseInt(session.user.id!),
            isActive: true
          }
        } : false,
        billings: {
          orderBy: { createdAt: 'asc' },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
        cashRequests: {
          include: {
            items: true,
            history: true,
            requestedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            approvedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Calculate totals
    const totalTagihan = project.billings.reduce(
      (sum, billing) => sum + Number(billing.finalAmount), 
      0
    );
    
    const totalLunas = project.billings
      .filter(billing => billing.status === 'DIBAYAR' || billing.status === 'DIBAYAR_RETENSI_BELUM_DIBAYARKAN')
      .reduce((sum, billing) => sum + Number(billing.finalAmount), 0);

    const progress = calculateProjectProgress(totalTagihan, totalLunas);

    // Convert Decimal fields to numbers
    const formattedProject = {
      ...project,
      contractValue: Number(project.contractValue),
      downPayment: Number(project.downPayment),
      totalTagihan,
      totalLunas,
      progressPercent: progress.progressPercent,
      remainingAmount: progress.remainingAmount,
      billings: project.billings.map(billing => ({
        ...billing,
        billingValue: Number(billing.billingValue),
        downPaymentDeduction: Number(billing.downPaymentDeduction),
        retention5Percent: Number(billing.retention5Percent),
        dpp: Number(billing.dpp),
        ppn11Percent: Number(billing.ppn11Percent),
        pph265Percent: Number(billing.pph265Percent),
        finalAmount: Number(billing.finalAmount),
      })),
      transactions: project.transactions.map(transaction => ({
        ...transaction,
        amount: Number(transaction.amount),
      })),
      cashRequests: project.cashRequests.map(cashRequest => ({
        ...cashRequest,
        totalAmount: Number(cashRequest.totalAmount),
        items: cashRequest.items.map(item => ({
          ...item,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
        })),
      })),
    };

    return NextResponse.json(formattedProject);

  } catch (error) {
    console.error('Project GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = idSchema.parse(params);
    const projectId = parseInt(id);

    const body = await request.json();
    const validatedData = projectSchema.parse(body);

    // Check if project exists and belongs to user's company
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        companyId: session.user.companyId,
      },
    });

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // For KEUANGAN users, verify they are assigned to the project
    if (session.user.role === 'KEUANGAN') {
      const assignment = await prisma.projectAssignment.findFirst({
        where: {
          userId: parseInt(session.user.id!),
          projectId: projectId,
          isActive: true
        }
      });

      if (!assignment) {
        return NextResponse.json({ error: 'Not authorized to edit this project' }, { status: 403 });
      }
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: validatedData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      ...updatedProject,
      contractValue: Number(updatedProject.contractValue),
      downPayment: Number(updatedProject.downPayment),
    });

  } catch (error) {
    console.error('Project PUT error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = idSchema.parse(params);
    const projectId = parseInt(id);

    // Check if project exists and belongs to user's company
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        companyId: session.user.companyId,
      },
    });

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // For KEUANGAN users, verify they are assigned to the project
    if (session.user.role === 'KEUANGAN') {
      const assignment = await prisma.projectAssignment.findFirst({
        where: {
          userId: parseInt(session.user.id!),
          projectId: projectId,
          isActive: true
        }
      });

      if (!assignment) {
        return NextResponse.json({ error: 'Not authorized to delete this project' }, { status: 403 });
      }
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({ message: 'Project deleted successfully' });

  } catch (error) {
    console.error('Project DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}