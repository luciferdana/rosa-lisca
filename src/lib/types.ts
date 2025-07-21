// Type definitions untuk Rosa Lisca
import { User, Company, Project, Billing, Transaction, CashRequest, CashRequestItem, CashRequestHistory } from '@prisma/client';

// Session types
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'KEUANGAN';
  companyId: number;
  company: {
    id: number;
    name: string;
    code: string | null;
  };
}

// Extended types dengan relations
export interface ProjectWithDetails extends Project {
  billings: Billing[];
  transactions: Transaction[];
  cashRequests: (CashRequest & {
    items: CashRequestItem[];
    history: CashRequestHistory[];
    requestedBy: Pick<User, 'id' | 'name' | 'email'>;
    approvedBy: Pick<User, 'id' | 'name' | 'email'> | null;
  })[];
  createdBy: Pick<User, 'id' | 'name' | 'email'> | null;
  totalTagihan: number;
  totalLunas: number;
  progressPercent: number;
  remainingAmount: number;
}

export interface BillingWithProject extends Billing {
  project: Pick<Project, 'id' | 'name' | 'status'>;
}

export interface TransactionWithProject extends Transaction {
  project: Pick<Project, 'id' | 'name' | 'status'>;
  createdBy: Pick<User, 'id' | 'name' | 'email'> | null;
}

export interface CashRequestWithDetails extends CashRequest {
  project: Pick<Project, 'id' | 'name' | 'status'>;
  requestedBy: Pick<User, 'id' | 'name' | 'email'>;
  approvedBy: Pick<User, 'id' | 'name' | 'email'> | null;
  items: CashRequestItem[];
  history: CashRequestHistory[];
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProjectListResponse {
  projects: ProjectWithDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BillingListResponse {
  billings: BillingWithProject[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TransactionListResponse {
  transactions: TransactionWithProject[];
  summary: {
    totalPemasukan: number;
    totalPengeluaran: number;
    saldo: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CashRequestListResponse {
  cashRequests: CashRequestWithDetails[];
  summary: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    totalAmount: number;
    approvedAmount: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface ProjectFormData {
  name: string;
  status: 'MENDATANG' | 'BERJALAN' | 'SELESAI';
  contractValue: number;
  downPayment: number;
}

export interface BillingFormData {
  projectId: number;
  description: string;
  invoiceNumber?: string;
  billingValue: number;
  downPaymentDeduction: number;
  entryDate: string;
  dueDate?: string;
  status?: 'BELUM_DIBAYAR' | 'DIBAYAR' | 'DIBAYAR_RETENSI_BELUM_DIBAYARKAN';
  paymentDate?: string;
  retentionPaid?: boolean;
}

export interface TransactionFormData {
  projectId: number;
  type: 'PEMASUKAN' | 'PENGELUARAN';
  amount: number;
  description: string;
  companyName?: string;
  category?: string;
  transactionDate: string;
  receiptUrl?: string;
}

export interface CashRequestFormData {
  projectId: number;
  totalAmount: number;
  description: string;
  items: {
    itemName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
  }[];
}

// Filter types
export interface ProjectFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BillingFilters {
  status?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface TransactionFilters {
  projectId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CashRequestFilters {
  status?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Analytics types
export interface CashFlowData {
  month: string;
  pemasukan: number;
  pengeluaran: number;
}

export interface TransactionCategoryData {
  name: string;
  value: number;
  count: number;
}

export interface TransactionSummary {
  summary: {
    totalPemasukan: number;
    totalPengeluaran: number;
    saldo: number;
  };
  analytics: {
    cashFlow: CashFlowData[];
    transactionsByCategory: TransactionCategoryData[];
    typeCount: {
      pemasukan: number;
      pengeluaran: number;
    };
  };
  recentTransactions: TransactionWithProject[];
  totalTransactions: number;
}