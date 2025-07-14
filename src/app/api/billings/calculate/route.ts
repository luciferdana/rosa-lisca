import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { billingCalculationSchema } from '@/lib/validations';
import { calculateBillingDetails, validateBillingCalculation } from '@/lib/calculations';

// POST /api/billings/calculate - Calculate billing details
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { billingValue, downPaymentDeduction } = billingCalculationSchema.parse(body);

    // Validate calculation
    const validation = validateBillingCalculation(billingValue, downPaymentDeduction);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.errors },
        { status: 400 }
      );
    }

    // Calculate billing details
    const calculations = calculateBillingDetails(billingValue, downPaymentDeduction);

    return NextResponse.json({
      billingValue,
      downPaymentDeduction,
      ...calculations,
      nilaiKwintansi: billingValue, // For frontend compatibility
    });

  } catch (error) {
    console.error('Billing calculation error:', error);
    
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