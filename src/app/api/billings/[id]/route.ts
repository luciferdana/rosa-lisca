import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { billingSchema, idSchema } from '@/lib/validations';
import { calculateBillingDetails } from '@/lib/calculations';
import { backendToFrontendStatus } from '@/lib/statusMapping';

// GET /api/billings/[id] - Get single billing
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
    const billingId = parseInt(id);

    const billing = await prisma.billing.findFirst({
      where: {
        id: billingId,
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
      },
    });

    if (!billing) {
      return NextResponse.json({ error: 'Billing not found' }, { status: 404 });
    }    return NextResponse.json({
      ...billing,
      status: backendToFrontendStatus(billing.status), // Convert status for frontend
      billingValue: Number(billing.billingValue),
      downPaymentDeduction: Number(billing.downPaymentDeduction),
      retention5Percent: Number(billing.retention5Percent),
      dpp: Number(billing.dpp),
      ppn11Percent: Number(billing.ppn11Percent),
      pph265Percent: Number(billing.pph265Percent),
      finalAmount: Number(billing.finalAmount),
    });

  } catch (error) {
    console.error('Billing GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/billings/[id] - Update billing
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
    const billingId = parseInt(id);

    const body = await request.json();
    const validatedData = billingSchema.parse(body);

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

    // Recalculate billing details
    const calculations = calculateBillingDetails(
      validatedData.billingValue,
      validatedData.downPaymentDeduction
    );

    const updatedBilling = await prisma.billing.update({
      where: { id: billingId },
      data: {
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
        status: validatedData.status || existingBilling.status,
        paymentDate: validatedData.paymentDate ? new Date(validatedData.paymentDate) : null,
        retentionPaid: validatedData.retentionPaid ?? existingBilling.retentionPaid,
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
    console.error('Billing PUT error:', error);
    
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

// DELETE /api/billings/[id] - Delete billing
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
    const billingId = parseInt(id);

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

    await prisma.billing.delete({
      where: { id: billingId },
    });

    return NextResponse.json({ message: 'Billing deleted successfully' });

  } catch (error) {
    console.error('Billing DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}