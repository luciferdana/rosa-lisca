// Status mapping functions for billing and other entities

// Map frontend display status to backend database status
export const frontendToBackendStatus = (frontendStatus: string): string => {
  const mapping: { [key: string]: string } = {
    'Belum Dibayar': 'BELUM_DIBAYAR',
    'Dibayar': 'DIBAYAR', 
    'Dibayar (Retensi Belum Dibayarkan)': 'DIBAYAR_RETENSI_BELUM_DIBAYARKAN'
  };
  
  return mapping[frontendStatus] || frontendStatus;
};

// Map backend database status to frontend display status
export const backendToFrontendStatus = (backendStatus: string): string => {
  const mapping: { [key: string]: string } = {
    'BELUM_DIBAYAR': 'Belum Dibayar',
    'DIBAYAR': 'Dibayar',
    'DIBAYAR_RETENSI_BELUM_DIBAYARKAN': 'Dibayar (Retensi Belum Dibayarkan)'
  };
  
  return mapping[backendStatus] || backendStatus;
};