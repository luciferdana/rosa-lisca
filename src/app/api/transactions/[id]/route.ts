import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { transactionSchema, idSchema } from '@/lib/validations';

// GET /api/transactions/[id] - Get single transaction
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
    const transactionId = parseInt(id);

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
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
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...transaction,
      amount: Number(transaction.amount),
    });

  } catch (error) {
    console.error('Transaction GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/transactions/[id] - Update transaction
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
    const transactionId = parseInt(id);

    const body = await request.json();
    const validatedData = transactionSchema.parse(body);

    // Check if transaction exists and belongs to user's company
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        project: {
          companyId: session.user.companyId,
        },
      },
    });

    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        type: validatedData.type,
        amount: validatedData.amount,
        description: validatedData.description,
        companyName: validatedData.companyName,
        category: validatedData.category,
        transactionDate: new Date(validatedData.transactionDate),
        receiptUrl: validatedData.receiptUrl,
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
      ...updatedTransaction,
      amount: Number(updatedTransaction.amount),
    });

  } catch (error) {
    console.error('Transaction PUT error:', error);
    
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

// DELETE /api/transactions/[id] - Delete transaction
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
    const transactionId = parseInt(id);

    // Check if transaction exists and belongs to user's company
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        project: {
          companyId: session.user.companyId,
        },
      },
    });

    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    await prisma.transaction.delete({
      where: { id: transactionId },
    });

    return NextResponse.json({ message: 'Transaction deleted successfully' });

  } catch (error) {
    console.error('Transaction DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}