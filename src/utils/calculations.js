// Business logic calculations for Rosa Lisca

export const calculateBillingDetails = (billing) => {
  const {
    nilaiTagihan = 0,
    potonganUangMuka = 0,
    nilaiKwintansi = 0
  } = billing;

  // Retensi 5% dari nilai kwintansi
  const retensi5Persen = nilaiKwintansi * 0.05;
  
  // DPP = Nilai Kwintansi - Potongan Uang Muka - Retensi 5%
  const dpp = nilaiKwintansi - potonganUangMuka - retensi5Persen;
  
  // PPN 11% dari DPP
  const ppn11Persen = dpp * 0.11;
  
  // PPH 2.65% dari DPP
  const pph265Persen = dpp * 0.0265;
  
  // Nilai Masuk Rekening = DPP + PPN - PPH
  const nilaiMasukRekening = dpp + ppn11Persen - pph265Persen;

  return {
    retensi5Persen: Math.round(retensi5Persen),
    dpp: Math.round(dpp),
    ppn11Persen: Math.round(ppn11Persen),
    pph265Persen: Math.round(pph265Persen),
    nilaiMasukRekening: Math.round(nilaiMasukRekening)
  };
};

export const calculateCashSummary = (transactions) => {
  if (!transactions || !Array.isArray(transactions)) {
    return {
      totalPemasukan: 0,
      totalPengeluaran: 0,
      saldo: 0
    };
  }

  // Support both frontend format (jenis/jumlah) and backend format (type/amount)
  const totalPemasukan = transactions
    .filter(t => (t.jenis === 'Pemasukan' || t.jenis === 'PEMASUKAN' || t.type === 'PEMASUKAN'))
    .reduce((sum, t) => sum + (Number(t.jumlah || t.amount) || 0), 0);

  const totalPengeluaran = transactions
    .filter(t => (t.jenis === 'Pengeluaran' || t.jenis === 'PENGELUARAN' || t.type === 'PENGELUARAN'))
    .reduce((sum, t) => sum + (Number(t.jumlah || t.amount) || 0), 0);

  const saldo = totalPemasukan - totalPengeluaran;

  return {
    totalPemasukan,
    totalPengeluaran,
    saldo
  };
};

export const calculateProjectProgress = (project) => {
  if (!project || !project.totalTagihan) {
    return {
      progressPercent: 0,
      remainingAmount: 0
    };
  }

  const progressPercent = project.totalLunas / project.totalTagihan * 100;
  const remainingAmount = project.totalTagihan - project.totalLunas;

  return {
    progressPercent: Math.min(progressPercent, 100),
    remainingAmount: Math.max(remainingAmount, 0)
  };
};

export const generateCashFlowByMonth = (transactions) => {
  if (!transactions || !Array.isArray(transactions)) {
    return [];
  }

  const monthlyData = {};

  transactions.forEach(transaction => {
    const date = new Date(transaction.tanggal);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthKey,
        pemasukan: 0,
        pengeluaran: 0
      };
    }

    if (transaction.jenis === 'Pemasukan') {
      monthlyData[monthKey].pemasukan += transaction.jumlah || 0;
    } else {
      monthlyData[monthKey].pengeluaran += transaction.jumlah || 0;
    }
  });

  return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
};

export const generateTransactionsByType = (transactions) => {
  if (!transactions || !Array.isArray(transactions)) {
    return [];
  }

  const typeData = {};

  transactions.forEach(transaction => {
    const type = transaction.jenisDetail || 'Lain-lain';
    
    if (!typeData[type]) {
      typeData[type] = {
        name: type,
        value: 0,
        count: 0
      };
    }

    typeData[type].value += transaction.jumlah || 0;
    typeData[type].count += 1;
  });

  return Object.values(typeData).sort((a, b) => b.value - a.value);
};

export const validateBillingInput = (billing) => {
  const errors = {};

  if (!billing.uraian || billing.uraian.trim() === '') {
    errors.uraian = 'Uraian harus diisi';
  }

  if (!billing.tanggalMasukBerkas) {
    errors.tanggalMasukBerkas = 'Tanggal masuk berkas harus diisi';
  }

  if (!billing.nilaiTagihan || billing.nilaiTagihan <= 0) {
    errors.nilaiTagihan = 'Nilai tagihan harus lebih dari 0';
  }

  if (!billing.nilaiKwintansi || billing.nilaiKwintansi <= 0) {
    errors.nilaiKwintansi = 'Nilai kwintansi harus lebih dari 0';
  }

  if (billing.potonganUangMuka < 0) {
    errors.potonganUangMuka = 'Potongan uang muka tidak boleh negatif';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateTransactionInput = (transaction) => {
  const errors = {};

  if (!transaction.jenis) {
    errors.jenis = 'Jenis transaksi harus dipilih';
  }

  // Parse number for validation
  const jumlah = typeof transaction.jumlah === 'string' ? 
    parseFloat(transaction.jumlah.replace(/[^\d.-]/g, '')) : 
    transaction.jumlah;
    
  if (!jumlah || jumlah <= 0) {
    errors.jumlah = 'Jumlah harus lebih dari 0';
  }

  if (!transaction.deskripsi || transaction.deskripsi.trim() === '') {
    errors.deskripsi = 'Deskripsi harus diisi';
  }

  if (!transaction.tanggal) {
    errors.tanggal = 'Tanggal harus diisi';
  }

  if (!transaction.perusahaan || transaction.perusahaan.trim() === '') {
    errors.perusahaan = 'Perusahaan harus diisi';
  }

  if (!transaction.jenisDetail) {
    errors.jenisDetail = 'Jenis transaksi detail harus dipilih';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};