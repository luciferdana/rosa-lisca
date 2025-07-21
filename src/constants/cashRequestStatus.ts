// Cash request status constants based on database enum

export const CASH_REQUEST_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
} as const;

// Frontend display labels for cash request status
export const CASH_REQUEST_STATUS_LABELS = {
  [CASH_REQUEST_STATUS.PENDING]: 'Pending',
  [CASH_REQUEST_STATUS.APPROVED]: 'Approved', 
  [CASH_REQUEST_STATUS.REJECTED]: 'Rejected'
} as const;

// Options for form select dropdown
export const CASH_REQUEST_STATUS_OPTIONS = [
  { value: CASH_REQUEST_STATUS.PENDING, label: CASH_REQUEST_STATUS_LABELS[CASH_REQUEST_STATUS.PENDING] },
  { value: CASH_REQUEST_STATUS.APPROVED, label: CASH_REQUEST_STATUS_LABELS[CASH_REQUEST_STATUS.APPROVED] },
  { value: CASH_REQUEST_STATUS.REJECTED, label: CASH_REQUEST_STATUS_LABELS[CASH_REQUEST_STATUS.REJECTED] }
];

// Helper to get label from status value
export const getCashRequestStatusLabel = (status: string): string => {
  return CASH_REQUEST_STATUS_LABELS[status as keyof typeof CASH_REQUEST_STATUS_LABELS] || status;
};