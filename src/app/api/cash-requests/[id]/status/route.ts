import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { idSchema, cashRequestStatusSchema } from '@/lib/validations';

// PATCH /api/cash-requests/[id]/status - Update cash request status (approval/rejection)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to approve (ADMIN role only)
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions to approve/reject cash requests' },
        { status: 403 }
      );
    }

    const { id } = idSchema.parse(params);
    const cashRequestId = parseInt(id);

    const body = await request.json();
    const { status, comments } = cashRequestStatusSchema.parse(body);

    // Check if cash request exists and belongs to user's company
    const existingCashRequest = await prisma.cashRequest.findFirst({
      where: {
        id: cashRequestId,
        project: {
          companyId: session.user.companyId,
        },
      },
      include: {
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!existingCashRequest) {
      return NextResponse.json({ error: 'Cash request not found' }, { status: 404 });
    }

    // Only allow status updates if current status is PENDING
    if (existingCashRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Cannot update status of cash request that is not pending' },
        { status: 400 }
      );
    }

    // Users cannot approve their own requests
    if (existingCashRequest.requestedById === parseInt(session.user.id!)) {
      return NextResponse.json(
        { error: 'Cannot approve/reject your own cash request' },
        { status: 400 }
      );
    }

    // Update using transaction to ensure data consistency
    const updatedCashRequest = await prisma.$transaction(async (tx) => {
      // Update cash request status
      const updateData: any = {
        status,
      };

      if (status === 'APPROVED' || status === 'REJECTED') {
        updateData.approvedById = parseInt(session.user.id!);
        updateData.approvedAt = new Date();
      }

      const updated = await tx.cashRequest.update({
        where: { id: cashRequestId },
        data: updateData,
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

      // Add history entry
      const actionComments = comments || (status === 'APPROVED' ? 'Pengajuan disetujui' : 'Pengajuan ditolak');
      await tx.cashRequestHistory.create({
        data: {
          cashRequestId,
          action: status === 'APPROVED' ? 'Approved' : 'Rejected',
          actionBy: session.user.name!,
          comments: actionComments,
          actionDate: new Date(),
        },
      });

      return updated;
    });

    return NextResponse.json({
      ...updatedCashRequest,
      totalAmount: Number(updatedCashRequest.totalAmount),
      // Properly format user objects to prevent React child errors
      requestedBy: updatedCashRequest.requestedBy?.name || 'Unknown',
      approvedBy: updatedCashRequest.approvedBy?.name || null,
      items: updatedCashRequest.items.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
    });

  } catch (error) {
    console.error('Cash request status update error:', error);
    
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