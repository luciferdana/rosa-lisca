import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { idSchema } from '@/lib/validations';
import { z } from 'zod';
import { backendToFrontendStatus } from '@/lib/statusMapping';

const statusUpdateSchema = z.object({
  status: z.enum(['BELUM_DIBAYAR', 'DIBAYAR', 'DIBAYAR_RETENSI_BELUM_DIBAYARKAN']),
  paymentDate: z.string().optional(),
  retentionPaid: z.boolean().optional(),
});

// PATCH /api/billings/[id]/status - Update billing status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = idSchema.parse(params);
    const billingId = parseInt(id);

    const body = await request.json();
    const { status, paymentDate, retentionPaid } = statusUpdateSchema.parse(body);

    // Check if billing exists and belongs to user's company
    const existingBilling = await prisma.billing.findFirst({
      where: {
        id: billingId,
        project: {
          companyId: session.user.companyId,
        },
      },
    });

    if (!existingBilling) {
      return NextResponse.json({ error: 'Billing not found' }, { status: 404 });
    }

    // Update data based on status
    const updateData: any = { status };

    if (status !== 'BELUM_DIBAYAR') {
      updateData.paymentDate = paymentDate ? new Date(paymentDate) : new Date();
    } else {
      updateData.paymentDate = null;
    }

    if (status === 'DIBAYAR') {
      updateData.retentionPaid = retentionPaid ?? true;
    } else if (status === 'DIBAYAR_RETENSI_BELUM_DIBAYARKAN') {
      updateData.retentionPaid = false;
    }

    const updatedBilling = await prisma.billing.update({
      where: { id: billingId },
      data: updateData,
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
      ...updatedBilling,
      status: backendToFrontendStatus(updatedBilling.status), // Convert status for frontend
      billingValue: Number(updatedBilling.billingValue),
      downPaymentDeduction: Number(updatedBilling.downPaymentDeduction),
      retention5Percent: Number(updatedBilling.retention5Percent),
      dpp: Number(updatedBilling.dpp),
      ppn11Percent: Number(updatedBilling.ppn11Percent),
      pph265Percent: Number(updatedBilling.pph265Percent),
      finalAmount: Number(updatedBilling.finalAmount),
    });

  } catch (error) {
    console.error('Billing status update error:', error);
    
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