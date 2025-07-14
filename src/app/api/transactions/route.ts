import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { transactionSchema, paginationSchema, filterSchema } from '@/lib/validations';
import { calculateCashSummary } from '@/lib/calculations';

// GET /api/transactions - Get all transactions dengan filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const { page, limit } = paginationSchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });

    const { projectId, startDate, endDate, search } = filterSchema.parse({
      projectId: searchParams.get('projectId'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      search: searchParams.get('search'),
    });

    // Build where clause
    const where: any = {
      project: {
        companyId: session.user.companyId,
      },
    };

    if (projectId) {
      where.projectId = parseInt(projectId);
    }

    if (startDate && endDate) {
      where.transactionDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
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
        transactionDate: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Format response
    const formattedTransactions = transactions.map(transaction => ({
      ...transaction,
      amount: Number(transaction.amount),
    }));

    // Calculate summary untuk filtered transactions
    const allFilteredTransactions = await prisma.transaction.findMany({
      where,
      select: {
        type: true,
        amount: true,
      },
    });

    const summary = calculateCashSummary(allFilteredTransactions.map(t => ({
      jenis: t.type,
      jumlah: Number(t.amount),
    })));

    const totalCount = await prisma.transaction.count({ where });

    return NextResponse.json({
      transactions: formattedTransactions,
      summary,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });

  } catch (error) {
    console.error('Transactions GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Create new transaction
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = transactionSchema.parse(body);

    // Validate project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: body.projectId,
        companyId: session.user.companyId,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        projectId: body.projectId,
        type: validatedData.type,
        amount: validatedData.amount,
        description: validatedData.description,
        companyName: validatedData.companyName,
        category: validatedData.category,
        transactionDate: new Date(validatedData.transactionDate),
        receiptUrl: validatedData.receiptUrl,
        createdById: parseInt(session.user.id!),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
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
    });

    return NextResponse.json({
      ...transaction,
      amount: Number(transaction.amount),
    }, { status: 201 });

  } catch (error) {
    console.error('Transactions POST error:', error);
    
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