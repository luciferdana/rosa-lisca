// Status mapping utilities for converting between frontend and backend status formats

// Frontend status names (Indonesian, user-friendly)
export const FRONTEND_STATUS = {
  BELUM_DIBAYAR: 'Belum Dibayar',
  DIBAYAR: 'Dibayar', 
  DIBAYAR_RETENSI_BELUM_DIBAYARKAN: 'Dibayar (Retensi Belum Dibayarkan)'
};

// Backend status values (English enum)
export const BACKEND_STATUS = {
  BELUM_DIBAYAR: 'BELUM_DIBAYAR',
  DIBAYAR: 'DIBAYAR',
  DIBAYAR_RETENSI_BELUM_DIBAYARKAN: 'DIBAYAR_RETENSI_BELUM_DIBAYARKAN'
};

// Convert frontend status to backend status
export const frontendToBackendStatus = (frontendStatus: string): string => {
  const mapping: Record<string, string> = {
    'Belum Dibayar': BACKEND_STATUS.BELUM_DIBAYAR,
    'Dibayar': BACKEND_STATUS.DIBAYAR,
    'Dibayar (Retensi Belum Dibayarkan)': BACKEND_STATUS.DIBAYAR_RETENSI_BELUM_DIBAYARKAN
  };
  
  return mapping[frontendStatus] || frontendStatus;
};

// Convert backend status to frontend status
export const backendToFrontendStatus = (backendStatus: string): string => {
  const mapping: Record<string, string> = {
    'BELUM_DIBAYAR': FRONTEND_STATUS.BELUM_DIBAYAR,
    'DIBAYAR': FRONTEND_STATUS.DIBAYAR,
    'DIBAYAR_RETENSI_BELUM_DIBAYARKAN': FRONTEND_STATUS.DIBAYAR_RETENSI_BELUM_DIBAYARKAN
  };
  
  return mapping[backendStatus] || backendStatus;
};

// Get all frontend status options
export const getAllFrontendStatuses = (): string[] => {
  return Object.values(FRONTEND_STATUS);
};

// Get all backend status options  
export const getAllBackendStatuses = (): string[] => {
  return Object.values(BACKEND_STATUS);
};

// Validate status format
export const isValidFrontendStatus = (status: string): boolean => {
  return Object.values(FRONTEND_STATUS).includes(status);
};

export const isValidBackendStatus = (status: string): boolean => {
  return Object.values(BACKEND_STATUS).includes(status);
};
