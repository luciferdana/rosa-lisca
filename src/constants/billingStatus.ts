// Billing status constants based on database enum

export const BILLING_STATUS = {
  BELUM_DIBAYAR: 'BELUM_DIBAYAR',
  DIBAYAR: 'DIBAYAR', 
  DIBAYAR_RETENSI_BELUM_DIBAYARKAN: 'DIBAYAR_RETENSI_BELUM_DIBAYARKAN'
} as const;

// Frontend display labels for billing status
export const BILLING_STATUS_LABELS = {
  [BILLING_STATUS.BELUM_DIBAYAR]: 'Belum Dibayar',
  [BILLING_STATUS.DIBAYAR]: 'Dibayar',
  [BILLING_STATUS.DIBAYAR_RETENSI_BELUM_DIBAYARKAN]: 'Dibayar (Retensi Belum Dibayarkan)'
} as const;

// Options for form select dropdown
export const BILLING_STATUS_OPTIONS = [
  { value: BILLING_STATUS.BELUM_DIBAYAR, label: BILLING_STATUS_LABELS[BILLING_STATUS.BELUM_DIBAYAR] },
  { value: BILLING_STATUS.DIBAYAR, label: BILLING_STATUS_LABELS[BILLING_STATUS.DIBAYAR] },
  { value: BILLING_STATUS.DIBAYAR_RETENSI_BELUM_DIBAYARKAN, label: BILLING_STATUS_LABELS[BILLING_STATUS.DIBAYAR_RETENSI_BELUM_DIBAYARKAN] }
];

// Helper to get label from status value
export const getBillingStatusLabel = (status: string): string => {
  return BILLING_STATUS_LABELS[status as keyof typeof BILLING_STATUS_LABELS] || status;
};