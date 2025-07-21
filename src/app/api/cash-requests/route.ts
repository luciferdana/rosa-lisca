import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { cashRequestSchema, paginationSchema, filterSchema } from '@/lib/validations';
import { generateRequestNumber, calculateCashRequestTotal } from '@/lib/calculations';

// GET /api/cash-requests - Get all cash requests dengan filtering
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

    // Parse filters with safe defaults
    const status = searchParams.get('status') || '';
    const projectIdParam = searchParams.get('projectId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    console.log('Cash Requests API - Query params:', { page, limit, status, projectIdParam, startDate, endDate });

    // Build where clause
    const where: any = {
      project: {
        companyId: session.user.companyId,
      },
    };

    if (status) {
      where.status = status;
    }

    if (projectIdParam) {
      const projectId = parseInt(projectIdParam);
      if (!isNaN(projectId)) {
        where.projectId = projectId;
      }
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const cashRequests = await prisma.cashRequest.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
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
        items: true,
        history: {
          orderBy: {
            actionDate: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });    // Format response - transform to match frontend expectations
    const formattedCashRequests = cashRequests.map(cashRequest => {
      // Extract title and description from the combined description field
      const fullDescription = cashRequest.description || '';
      const descriptionParts = fullDescription.split('\n\n');
      const title = descriptionParts.length > 1 ? descriptionParts[0] : '';
      const description = descriptionParts.length > 1 ? descriptionParts.slice(1).join('\n\n') : fullDescription;

      return {
        ...cashRequest,
        id: cashRequest.id,
        title,
        description,
        nomorPengajuan: cashRequest.requestNumber,
        totalJumlah: Number(cashRequest.totalAmount),
        uraian: description,
        status: cashRequest.status,
        pengaju: cashRequest.requestedBy?.name || '',
        tanggalPengajuan: cashRequest.createdAt,
        tanggalDisetujui: cashRequest.approvedAt,
        // Properly format user objects to prevent React child errors
        requestedBy: cashRequest.requestedBy?.name || 'Unknown',
        approvedBy: cashRequest.approvedBy?.name || null,
        // Keep original fields for API compatibility
        totalAmount: Number(cashRequest.totalAmount),
        items: cashRequest.items.map(item => ({
          ...item,
          // Map database fields to frontend expected fields
          qty: Number(item.quantity),
          description: item.itemName,
          total: Number(item.totalPrice),
          // Keep original fields for API compatibility
          quantity: Number(item.quantity),
          itemName: item.itemName,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
        })),
      };
    });

    // Calculate summary statistics
    const allCashRequests = await prisma.cashRequest.findMany({
      where: {
        project: {
          companyId: session.user.companyId,
        },
      },
      select: {
        status: true,
        totalAmount: true,
      },
    });

    const summary = {
      total: allCashRequests.length,
      pending: allCashRequests.filter(r => r.status === 'PENDING').length,
      approved: allCashRequests.filter(r => r.status === 'APPROVED').length,
      rejected: allCashRequests.filter(r => r.status === 'REJECTED').length,
      totalAmount: allCashRequests.reduce((sum, r) => sum + Number(r.totalAmount), 0),
      approvedAmount: allCashRequests
        .filter(r => r.status === 'APPROVED')
        .reduce((sum, r) => sum + Number(r.totalAmount), 0),
    };

    const totalCount = await prisma.cashRequest.count({ where });

    return NextResponse.json({
      cashRequests: formattedCashRequests,
      summary,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });

  } catch (error) {
    console.error('Cash requests GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/cash-requests - Create new cash request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }    const body = await request.json();
    console.log('Received cash request data:', body); // Debug log
      // Transform form data to match schema
    const transformedData = {
      projectId: body.projectId,
      title: body.title || body.judulPengajuan,
      description: body.description || body.uraian,
      totalAmount: body.totalAmount,
      // Convert attachmentFileId to string if it's a number
      attachmentFileId: body.attachmentFileId != null ? String(body.attachmentFileId) : undefined,
      attachmentUrl: body.attachmentUrl,
      requestedBy: body.requestedBy,
      bankAccount: body.bankAccount,
      items: body.items.map((item: any) => ({
        itemName: item.description || item.itemName,
        quantity: item.qty || item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        totalPrice: item.total || item.totalPrice,
      })),
    };
    
    const validatedData = cashRequestSchema.parse(transformedData);

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

    // Validate that total amount matches items total
    const calculatedTotal = calculateCashRequestTotal(validatedData.items);
    if (Math.abs(calculatedTotal - validatedData.totalAmount) > 0.01) {
      return NextResponse.json(
        { error: 'Total amount does not match items total' },
        { status: 400 }
      );
    }

    // Generate request number
    const requestNumber = generateRequestNumber(body.projectId);    const cashRequest = await prisma.cashRequest.create({
      data: {
        projectId: body.projectId,
        requestNumber,
        totalAmount: validatedData.totalAmount,
        description: validatedData.title ? `${validatedData.title}\n\n${validatedData.description}` : validatedData.description,
        requestedById: parseInt(session.user.id!),
        items: {
          create: validatedData.items.map(item => ({
            itemName: item.itemName,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
        history: {
          create: {
            action: 'Submitted',
            actionBy: session.user.name!,
            comments: 'Pengajuan kas baru dibuat',
            actionDate: new Date(),
          },
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: true,
        history: true,
      },
    });

    return NextResponse.json({
      ...cashRequest,
      totalAmount: Number(cashRequest.totalAmount),
      items: cashRequest.items.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
    }, { status: 201 });

  } catch (error) {
    console.error('Cash requests POST error:', error);
    
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