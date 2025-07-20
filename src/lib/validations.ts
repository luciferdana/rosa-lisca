import { z } from 'zod';

// Validation schemas untuk Rosa Lisca

// User validation
export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

// Project validation
export const projectSchema = z.object({
  name: z.string().min(1, 'Nama proyek harus diisi'),
  status: z.enum(['MENDATANG', 'BERJALAN', 'SELESAI']),
  contractValue: z.number().positive('Nilai kontrak harus lebih dari 0'),
  downPayment: z.number().min(0, 'Uang muka tidak boleh negatif').optional(),
});

// Billing validation
export const billingSchema = z.object({
  description: z.string().min(1, 'Uraian harus diisi'),
  invoiceNumber: z.string().optional(),
  billingValue: z.number().positive('Nilai tagihan harus lebih dari 0'),
  downPaymentDeduction: z.number().min(0, 'Potongan uang muka tidak boleh negatif'),
  entryDate: z.string().min(1, 'Tanggal masuk berkas harus diisi'),
  dueDate: z.string().optional(),
  status: z.enum(['BELUM_DIBAYAR', 'DIBAYAR', 'DIBAYAR_RETENSI_BELUM_DIBAYARKAN']).optional(),
  paymentDate: z.string().optional(),
  retentionPaid: z.boolean().optional(),
});

// Transaction validation
export const transactionSchema = z.object({
  type: z.enum(['PEMASUKAN', 'PENGELUARAN']),
  amount: z.number().positive('Jumlah harus lebih dari 0'),
  description: z.string().min(1, 'Deskripsi harus diisi'),
  companyName: z.string().optional(),
  category: z.string().optional(),
  transactionDate: z.string().min(1, 'Tanggal transaksi harus diisi'),
  receiptUrl: z.string().optional(),
});

// Cash request validation
export const cashRequestSchema = z.object({
  projectId: z.number().optional(),
  title: z.string().min(1, 'Judul pengajuan harus diisi'),
  description: z.string().min(1, 'Deskripsi harus diisi'),
  requestedBy: z.string().min(1, 'Nama pengaju harus diisi').optional(),
  bankAccount: z.string().optional(),
  totalAmount: z.number().positive('Total amount harus lebih dari 0'),
  attachmentUrl: z.string().optional(),
  attachmentFileId: z.string().optional(),  items: z.array(z.object({
    itemName: z.string().min(1, 'Nama item harus diisi'),
    description: z.string().min(1, 'Deskripsi item harus diisi').optional(),
    quantity: z.number().positive('Quantity harus lebih dari 0'),
    qty: z.number().positive('Qty harus lebih dari 0').optional(),
    unit: z.string().min(1, 'Unit harus diisi'),
    unitPrice: z.number().positive('Harga satuan harus lebih dari 0'),
    totalPrice: z.number().positive('Total harga harus lebih dari 0'),
    total: z.number().positive('Total harga harus lebih dari 0').optional(),
  })).min(1, 'Minimal harus ada 1 item'),
});

// Cash request status update validation
export const cashRequestStatusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  comments: z.string().optional(),
});

// Generic ID validation
export const idSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID harus berupa angka'),
});

// Billing calculation validation
export const billingCalculationSchema = z.object({
  billingValue: z.number().positive('Nilai tagihan harus lebih dari 0'),
  downPaymentDeduction: z.number().min(0, 'Potongan uang muka tidak boleh negatif'),
});

// File upload validation
export const fileUploadSchema = z.object({
  filename: z.string().min(1, 'Filename harus diisi'),
  mimetype: z.string().refine(
    (type) => ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(type),
    'File harus berformat JPG, PNG, atau PDF'
  ),
  size: z.number().max(5 * 1024 * 1024, 'File maksimal 5MB'),
});

// Date range validation
export const dateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  'Tanggal mulai harus lebih kecil dari tanggal akhir'
);

// Pagination validation
export const paginationSchema = z.object({
  page: z.string().nullable().optional().transform((val) => val ? parseInt(val) : 1),
  limit: z.string().nullable().optional().transform((val) => val ? parseInt(val) : 10),
});

// Filter validation
export const filterSchema = z.object({
  status: z.string().optional(),
  search: z.string().optional(),
  projectId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});