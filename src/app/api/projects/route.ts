import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { projectSchema } from '@/lib/validations';
import { calculateProjectProgress } from '@/lib/calculations';

// GET /api/projects - Get all projects dengan filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    // Build where clause
    const where: any = {
      companyId: session.user.companyId,
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Get projects dengan relations
    const projects = await prisma.project.findMany({
      where,
      include: {
        billings: {
          select: {
            id: true,
            finalAmount: true,
            status: true,
            paymentDate: true,
          },
        },
        transactions: {
          select: {
            id: true,
            type: true,
            amount: true,
          },
        },
        cashRequests: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calculate totals untuk setiap project
    const projectsWithTotals = projects.map(project => {
      const totalTagihan = project.billings.reduce(
        (sum, billing) => sum + Number(billing.finalAmount), 
        0
      );
      
      const totalLunas = project.billings
        .filter(billing => billing.status === 'DIBAYAR' || billing.status === 'DIBAYAR_RETENSI_BELUM_DIBAYARKAN')
        .reduce((sum, billing) => sum + Number(billing.finalAmount), 0);

      const progress = calculateProjectProgress(totalTagihan, totalLunas);

      return {
        ...project,
        totalTagihan,
        totalLunas,
        progressPercent: progress.progressPercent,
        remainingAmount: progress.remainingAmount,
        contractValue: Number(project.contractValue),
        downPayment: Number(project.downPayment),
      };
    });

    // Get total count untuk pagination
    const totalCount = await prisma.project.count({ where });

    return NextResponse.json({
      projects: projectsWithTotals,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });

  } catch (error) {
    console.error('Projects GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = projectSchema.parse(body);

    const project = await prisma.project.create({
      data: {
        ...validatedData,
        companyId: session.user.companyId,
        createdById: parseInt(session.user.id!),
      },
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
      ...project,
      contractValue: Number(project.contractValue),
      downPayment: Number(project.downPayment),
      totalTagihan: 0,
      totalLunas: 0,
      progressPercent: 0,
      remainingAmount: Number(project.contractValue),
    }, { status: 201 });

  } catch (error) {
    console.error('Projects POST error:', error);
    
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