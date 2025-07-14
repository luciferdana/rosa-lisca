import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { billingSchema, paginationSchema, filterSchema } from '@/lib/validations';
import { calculateBillingDetails } from '@/lib/calculations';

// GET /api/billings - Get all billings dengan filtering
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

    const { status, projectId, startDate, endDate } = filterSchema.parse({
      status: searchParams.get('status'),
      projectId: searchParams.get('projectId'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
    });

    // Build where clause
    const where: any = {
      project: {
        companyId: session.user.companyId,
      },
    };

    if (status) {
      where.status = status;
    }

    if (projectId) {
      where.projectId = parseInt(projectId);
    }

    if (startDate && endDate) {
      where.entryDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const billings = await prisma.billing.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: {
        entryDate: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Format response
    const formattedBillings = billings.map(billing => ({
      ...billing,
      billingValue: Number(billing.billingValue),
      downPaymentDeduction: Number(billing.downPaymentDeduction),
      retention5Percent: Number(billing.retention5Percent),
      dpp: Number(billing.dpp),
      ppn11Percent: Number(billing.ppn11Percent),
      pph265Percent: Number(billing.pph265Percent),
      finalAmount: Number(billing.finalAmount),
    }));

    const totalCount = await prisma.billing.count({ where });

    return NextResponse.json({
      billings: formattedBillings,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });

  } catch (error) {
    console.error('Billings GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/billings - Create new billing
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = billingSchema.parse(body);

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

    // Calculate billing details
    const calculations = calculateBillingDetails(
      validatedData.billingValue,
      validatedData.downPaymentDeduction
    );

    const billing = await prisma.billing.create({
      data: {
        projectId: body.projectId,
        description: validatedData.description,
        invoiceNumber: validatedData.invoiceNumber,
        billingValue: validatedData.billingValue,
        downPaymentDeduction: validatedData.downPaymentDeduction,
        retention5Percent: calculations.retention5Percent,
        dpp: calculations.dpp,
        ppn11Percent: calculations.ppn11Percent,
        pph265Percent: calculations.pph265Percent,
        finalAmount: calculations.finalAmount,
        entryDate: new Date(validatedData.entryDate),
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        status: validatedData.status || 'BELUM_DIBAYAR',
        paymentDate: validatedData.paymentDate ? new Date(validatedData.paymentDate) : null,
        retentionPaid: validatedData.retentionPaid || false,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({
      ...billing,
      billingValue: Number(billing.billingValue),
      downPaymentDeduction: Number(billing.downPaymentDeduction),
      retention5Percent: Number(billing.retention5Percent),
      dpp: Number(billing.dpp),
      ppn11Percent: Number(billing.ppn11Percent),
      pph265Percent: Number(billing.pph265Percent),
      finalAmount: Number(billing.finalAmount),
    }, { status: 201 });

  } catch (error) {
    console.error('Billings POST error:', error);
    
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