import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { cashRequestSchema, idSchema } from '@/lib/validations';
import { calculateCashRequestTotal } from '@/lib/calculations';

// GET /api/cash-requests/[id] - Get single cash request
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
    const cashRequestId = parseInt(id);

    const cashRequest = await prisma.cashRequest.findFirst({
      where: {
        id: cashRequestId,
        project: {
          companyId: session.user.companyId,
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
    });

    if (!cashRequest) {
      return NextResponse.json({ error: 'Cash request not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...cashRequest,
      totalAmount: Number(cashRequest.totalAmount),
      items: cashRequest.items.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
    });

  } catch (error) {
    console.error('Cash request GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/cash-requests/[id] - Update cash request
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
    const cashRequestId = parseInt(id);

    const body = await request.json();
    const validatedData = cashRequestSchema.parse(body);

    // Check if cash request exists and belongs to user's company
    const existingCashRequest = await prisma.cashRequest.findFirst({
      where: {
        id: cashRequestId,
        project: {
          companyId: session.user.companyId,
        },
      },
    });

    if (!existingCashRequest) {
      return NextResponse.json({ error: 'Cash request not found' }, { status: 404 });
    }

    // Only allow updates if status is PENDING
    if (existingCashRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Cannot update cash request that is not pending' },
        { status: 400 }
      );
    }

    // Validate that total amount matches items total
    const calculatedTotal = calculateCashRequestTotal(validatedData.items);
    if (Math.abs(calculatedTotal - validatedData.totalAmount) > 0.01) {
      return NextResponse.json(
        { error: 'Total amount does not match items total' },
        { status: 400 }
      );
    }

    // Update using transaction to ensure data consistency
    const updatedCashRequest = await prisma.$transaction(async (tx) => {
      // Delete existing items
      await tx.cashRequestItem.deleteMany({
        where: { cashRequestId },
      });

      // Update cash request with new data
      const updated = await tx.cashRequest.update({
        where: { id: cashRequestId },
        data: {
          totalAmount: validatedData.totalAmount,
          description: validatedData.description,
          items: {
            create: validatedData.items.map(item => ({
              itemName: item.itemName,
              quantity: item.quantity,
              unit: item.unit,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
            })),
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
          approvedBy: {
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

      // Add history entry
      await tx.cashRequestHistory.create({
        data: {
          cashRequestId,
          action: 'Updated',
          actionBy: session.user.name!,
          comments: 'Pengajuan kas diperbarui',
          actionDate: new Date(),
        },
      });

      return updated;
    });

    return NextResponse.json({
      ...updatedCashRequest,
      totalAmount: Number(updatedCashRequest.totalAmount),
      items: updatedCashRequest.items.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
    });

  } catch (error) {
    console.error('Cash request PUT error:', error);
    
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

// DELETE /api/cash-requests/[id] - Delete cash request
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
    const cashRequestId = parseInt(id);

    // Check if cash request exists and belongs to user's company
    const existingCashRequest = await prisma.cashRequest.findFirst({
      where: {
        id: cashRequestId,
        project: {
          companyId: session.user.companyId,
        },
      },
    });

    if (!existingCashRequest) {
      return NextResponse.json({ error: 'Cash request not found' }, { status: 404 });
    }

    // Only allow deletion if status is PENDING
    if (existingCashRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Cannot delete cash request that is not pending' },
        { status: 400 }
      );
    }

    await prisma.cashRequest.delete({
      where: { id: cashRequestId },
    });

    return NextResponse.json({ message: 'Cash request deleted successfully' });

  } catch (error) {
    console.error('Cash request DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}