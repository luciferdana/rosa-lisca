import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { filterSchema } from '@/lib/validations';
import { calculateCashSummary, generateCashFlowByMonth, generateTransactionsByCategory } from '@/lib/calculations';

// GET /api/transactions/summary - Get transaction summary and analytics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const { projectId, startDate, endDate } = filterSchema.parse({
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

    if (projectId) {
      where.projectId = parseInt(projectId);
    }

    if (startDate && endDate) {
      where.transactionDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Get transactions
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        transactionDate: 'desc',
      },
    });

    // Convert to format expected by calculations
    const formattedTransactions = transactions.map(t => ({
      jenis: t.type,
      jumlah: Number(t.amount),
      tanggal: t.transactionDate.toISOString(),
      jenisDetail: t.category,
      deskripsi: t.description,
      perusahaan: t.companyName,
    }));

    // Calculate summary
    const summary = calculateCashSummary(formattedTransactions);

    // Generate analytics
    const cashFlow = generateCashFlowByMonth(formattedTransactions);
    const transactionsByCategory = generateTransactionsByCategory(formattedTransactions);

    // Get count by type
    const typeCount = {
      pemasukan: transactions.filter(t => t.type === 'PEMASUKAN').length,
      pengeluaran: transactions.filter(t => t.type === 'PENGELUARAN').length,
    };

    // Recent transactions (last 5)
    const recentTransactions = transactions.slice(0, 5).map(transaction => ({
      ...transaction,
      amount: Number(transaction.amount),
    }));

    return NextResponse.json({
      summary,
      analytics: {
        cashFlow,
        transactionsByCategory,
        typeCount,
      },
      recentTransactions,
      totalTransactions: transactions.length,
    });

  } catch (error) {
    console.error('Transaction summary error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}