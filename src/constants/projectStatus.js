// Project status constants based on database enum

export const PROJECT_STATUS = {
  BERJALAN: 'BERJALAN',
  SELESAI: 'SELESAI',
  MENDATANG: 'MENDATANG'
};

// Frontend display labels for project status  
export const PROJECT_STATUS_LABELS = {
  [PROJECT_STATUS.BERJALAN]: 'Berjalan',
  [PROJECT_STATUS.SELESAI]: 'Selesai',
  [PROJECT_STATUS.MENDATANG]: 'Mendatang'
};

// Options for form select dropdown
export const PROJECT_STATUS_OPTIONS = [
  { value: PROJECT_STATUS.BERJALAN, label: PROJECT_STATUS_LABELS[PROJECT_STATUS.BERJALAN] },
  { value: PROJECT_STATUS.SELESAI, label: PROJECT_STATUS_LABELS[PROJECT_STATUS.SELESAI] },
  { value: PROJECT_STATUS.MENDATANG, label: PROJECT_STATUS_LABELS[PROJECT_STATUS.MENDATANG] }
];

// Helper to get label from status value
export const getProjectStatusLabel = (status) => {
  return PROJECT_STATUS_LABELS[status] || status;
};