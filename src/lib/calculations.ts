// Business logic calculations for Rosa Lisca - Backend version

export interface BillingCalculation {
  retention5Percent: number;
  dpp: number;
  ppn11Percent: number;
  pph265Percent: number;
  finalAmount: number;
}

export interface CashSummary {
  totalPemasukan: number;
  totalPengeluaran: number;
  saldo: number;
}

export interface ProjectProgress {
  progressPercent: number;
  remainingAmount: number;
}

// Kalkulasi detail billing sesuai dengan frontend
export const calculateBillingDetails = (
  billingValue: number,
  downPaymentDeduction: number = 0
): BillingCalculation => {
  // Nilai kwintansi = billing value
  const nilaiKwintansi = billingValue;
  
  // Retensi 5% dari nilai kwintansi
  const retention5Percent = nilaiKwintansi * 0.05;
  
  // DPP = Nilai Kwintansi - Potongan Uang Muka - Retensi 5%
  const dpp = nilaiKwintansi - downPaymentDeduction - retention5Percent;
  
  // PPN 11% dari DPP
  const ppn11Percent = dpp * 0.11;
  
  // PPH 2.65% dari DPP
  const pph265Percent = dpp * 0.0265;
  
  // Nilai Masuk Rekening = DPP + PPN - PPH
  const finalAmount = dpp + ppn11Percent - pph265Percent;

  return {
    retention5Percent: Math.round(retention5Percent),
    dpp: Math.round(dpp),
    ppn11Percent: Math.round(ppn11Percent),
    pph265Percent: Math.round(pph265Percent),
    finalAmount: Math.round(finalAmount)
  };
};

// Kalkulasi summary kas dari transaksi
export const calculateCashSummary = (transactions: any[]): CashSummary => {
  if (!transactions || !Array.isArray(transactions)) {
    return {
      totalPemasukan: 0,
      totalPengeluaran: 0,
      saldo: 0
    };
  }

  const totalPemasukan = transactions
    .filter(t => t.type === 'PEMASUKAN')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalPengeluaran = transactions
    .filter(t => t.type === 'PENGELUARAN')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const saldo = totalPemasukan - totalPengeluaran;

  return {
    totalPemasukan,
    totalPengeluaran,
    saldo
  };
};

// Kalkulasi progress proyek
export const calculateProjectProgress = (
  totalTagihan: number,
  totalLunas: number
): ProjectProgress => {
  if (!totalTagihan || totalTagihan === 0) {
    return {
      progressPercent: 0,
      remainingAmount: 0
    };
  }

  const progressPercent = (totalLunas / totalTagihan) * 100;
  const remainingAmount = totalTagihan - totalLunas;

  return {
    progressPercent: Math.min(progressPercent, 100),
    remainingAmount: Math.max(remainingAmount, 0)
  };
};

// Generate monthly cash flow data
export const generateCashFlowByMonth = (transactions: any[]) => {
  if (!transactions || !Array.isArray(transactions)) {
    return [];
  }

  const monthlyData: { [key: string]: any } = {};

  transactions.forEach(transaction => {
    const date = new Date(transaction.transactionDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthKey,
        pemasukan: 0,
        pengeluaran: 0
      };
    }

    if (transaction.type === 'PEMASUKAN') {
      monthlyData[monthKey].pemasukan += Number(transaction.amount) || 0;
    } else {
      monthlyData[monthKey].pengeluaran += Number(transaction.amount) || 0;
    }
  });

  return Object.values(monthlyData).sort((a: any, b: any) => a.month.localeCompare(b.month));
};

// Generate transactions by category
export const generateTransactionsByCategory = (transactions: any[]) => {
  if (!transactions || !Array.isArray(transactions)) {
    return [];
  }

  const categoryData: { [key: string]: any } = {};

  transactions.forEach(transaction => {
    const category = transaction.category || 'Lain-lain';
    
    if (!categoryData[category]) {
      categoryData[category] = {
        name: category,
        value: 0,
        count: 0
      };
    }

    categoryData[category].value += Number(transaction.amount) || 0;
    categoryData[category].count += 1;
  });

  return Object.values(categoryData).sort((a: any, b: any) => b.value - a.value);
};

// Validate billing input
export const validateBillingCalculation = (
  billingValue: number,
  downPaymentDeduction: number
) => {
  const errors: string[] = [];

  if (!billingValue || billingValue <= 0) {
    errors.push('Nilai tagihan harus lebih dari 0');
  }

  if (downPaymentDeduction < 0) {
    errors.push('Potongan uang muka tidak boleh negatif');
  }

  if (downPaymentDeduction >= billingValue) {
    errors.push('Potongan uang muka tidak boleh lebih dari atau sama dengan nilai tagihan');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generate request number
export const generateRequestNumber = (projectId: number, year: number = new Date().getFullYear()) => {
  const timestamp = Date.now().toString().slice(-4);
  return `CR${String(projectId).padStart(3, '0')}/${year}/${timestamp}`;
};

// Calculate total from cash request items
export const calculateCashRequestTotal = (items: any[]) => {
  if (!items || !Array.isArray(items)) {
    return 0;
  }

  return items.reduce((total, item) => {
    // Use the already calculated totalPrice instead of recalculating
    const itemTotal = Number(item.totalPrice) || (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    return total + itemTotal;
  }, 0);
};