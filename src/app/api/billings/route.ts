import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { billingSchema, paginationSchema, filterSchema } from '@/lib/validations';
import { calculateBillingDetails } from '@/lib/calculations';
import { backendToFrontendStatus, frontendToBackendStatus } from '@/lib/statusMapping';

// GET /api/billings - Get all billings dengan filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Parse pagination with default values
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Parse filters with safe defaults - handle null values properly
    const status = searchParams.get('status') || undefined;
    const projectIdParam = searchParams.get('projectId') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    console.log('Billings API - Query params:', { page, limit, status, projectIdParam, startDate, endDate });

    // Build where clause
    const where: any = {
      project: {
        companyId: session.user.companyId,
      },
    };

    if (status && status !== 'null' && status !== '') {
      where.status = status;
    }

    if (projectIdParam && projectIdParam !== 'null' && projectIdParam !== '') {
      const projectId = parseInt(projectIdParam);
      if (!isNaN(projectId)) {
        where.projectId = projectId;
      }
    }

    if (startDate && endDate && startDate !== 'null' && endDate !== 'null' && startDate !== '' && endDate !== '') {
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
    });    // Format response - transform to match frontend expectations
    const formattedBillings = billings.map(billing => ({
      ...billing,
      id: billing.id,
      uraian: billing.description,
      nomorTagihan: billing.invoiceNumber || '',
      nilaiTagihan: Number(billing.billingValue),
      potonganUM: Number(billing.downPaymentDeduction),
      retensi5Persen: Number(billing.retention5Percent),
      dpp: Number(billing.dpp),
      ppn11Persen: Number(billing.ppn11Percent),
      pph265Persen: Number(billing.pph265Percent),
      jumlahDiterima: Number(billing.finalAmount),
      status: backendToFrontendStatus(billing.status), // Convert backend status to frontend
      tanggalMasukBerkas: billing.entryDate,
      tanggalJatuhTempo: billing.dueDate,
      tanggalPembayaran: billing.paymentDate,
      retensiDibayar: billing.retentionPaid,
      // Keep original fields for API compatibility
      billingValue: Number(billing.billingValue),
      downPaymentDeduction: Number(billing.downPaymentDeduction),
      retention5Percent: Number(billing.retention5Percent),
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
      // Map frontend field names (Indonesian) to backend field names (English)
    const mappedData = {
      ...body,
      // Map Indonesian field names to English for validation
      description: body.uraian || body.description,
      billingValue: body.nilaiTagihan || body.billingValue,
      downPaymentDeduction: body.potonganUangMuka || body.downPaymentDeduction,
      entryDate: body.tanggalMasukBerkas || body.entryDate,
      invoiceNumber: body.nomorFaktur || body.invoiceNumber,
      dueDate: body.tanggalJatuhTempo || body.dueDate,
      // Convert status from frontend to backend format
      status: body.status ? frontendToBackendStatus(body.status) : undefined,
      // Remove Indonesian field names to avoid conflicts
      uraian: undefined,
      nilaiTagihan: undefined,
      potonganUangMuka: undefined,
      tanggalMasukBerkas: undefined,
      nomorFaktur: undefined,
      tanggalJatuhTempo: undefined,
    };

    const validatedData = billingSchema.parse(mappedData);

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
    });    return NextResponse.json({
      ...billing,
      status: backendToFrontendStatus(billing.status), // Convert status for frontend
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