// API service untuk Rosa Lisca frontend
import { 
  ProjectFormData, 
  BillingFormData, 
  TransactionFormData, 
  CashRequestFormData,
  ProjectFilters,
  BillingFilters,
  TransactionFilters,
  CashRequestFilters
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

class ApiService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}/api${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Projects API
  async getProjects(filters?: ProjectFilters) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const query = params.toString();
    return this.request(`/projects${query ? `?${query}` : ''}`);
  }

  async getProject(id: number) {
    return this.request(`/projects/${id}`);
  }

  async createProject(data: ProjectFormData) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: number, data: ProjectFormData) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: number) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Billings API
  async getBillings(filters?: BillingFilters) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const query = params.toString();
    return this.request(`/billings${query ? `?${query}` : ''}`);
  }

  async getBilling(id: number) {
    return this.request(`/billings/${id}`);
  }

  async createBilling(data: BillingFormData) {
    return this.request('/billings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBilling(id: number, data: BillingFormData) {
    return this.request(`/billings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBilling(id: number) {
    return this.request(`/billings/${id}`, {
      method: 'DELETE',
    });
  }

  async updateBillingStatus(id: number, status: string, paymentDate?: string, retentionPaid?: boolean) {
    return this.request(`/billings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, paymentDate, retentionPaid }),
    });
  }

  async calculateBilling(billingValue: number, downPaymentDeduction: number) {
    return this.request('/billings/calculate', {
      method: 'POST',
      body: JSON.stringify({ billingValue, downPaymentDeduction }),
    });
  }

  // Transactions API
  async getTransactions(filters?: TransactionFilters) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const query = params.toString();
    return this.request(`/transactions${query ? `?${query}` : ''}`);
  }

  async getTransaction(id: number) {
    return this.request(`/transactions/${id}`);
  }

  async createTransaction(data: TransactionFormData) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTransaction(id: number, data: TransactionFormData) {
    return this.request(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTransaction(id: number) {
    return this.request(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  async getTransactionSummary(filters?: TransactionFilters) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const query = params.toString();
    return this.request(`/transactions/summary${query ? `?${query}` : ''}`);
  }

  // Cash Requests API
  async getCashRequests(filters?: CashRequestFilters) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const query = params.toString();
    return this.request(`/cash-requests${query ? `?${query}` : ''}`);
  }

  async getCashRequest(id: number) {
    return this.request(`/cash-requests/${id}`);
  }

  async createCashRequest(data: CashRequestFormData) {
    return this.request('/cash-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCashRequest(id: number, data: CashRequestFormData) {
    return this.request(`/cash-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCashRequest(id: number) {
    return this.request(`/cash-requests/${id}`, {
      method: 'DELETE',
    });
  }

  async updateCashRequestStatus(id: number, status: string, comments?: string) {
    return this.request(`/cash-requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, comments }),
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export individual methods for easier importing
export const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getBillings,
  getBilling,
  createBilling,
  updateBilling,
  deleteBilling,
  updateBillingStatus,
  calculateBilling,
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
  getCashRequests,
  getCashRequest,
  createCashRequest,
  updateCashRequest,
  deleteCashRequest,
  updateCashRequestStatus,
} = apiService;