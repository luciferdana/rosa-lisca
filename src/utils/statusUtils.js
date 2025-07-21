// Utility functions untuk status mapping dan normalisasi

export const statusMapping = {
  // Database format to Display format
  toDisplay: {
    'BERJALAN': 'Berjalan',
    'SELESAI': 'Selesai', 
    'MENDATANG': 'Mendatang'
  },
  
  // Display format to Database format
  toDatabase: {
    'Berjalan': 'BERJALAN',
    'Selesai': 'SELESAI',
    'Mendatang': 'MENDATANG'
  }
};

export const normalizeStatusToDisplay = (status) => {
  if (!status) return '';
  return statusMapping.toDisplay[status] || status;
};

export const normalizeStatusToDatabase = (status) => {
  if (!status) return '';
  return statusMapping.toDatabase[status] || status;
};

export const getStatusColor = (status) => {
  const displayStatus = normalizeStatusToDisplay(status);
  
  switch (displayStatus) {
    case 'Berjalan': return 'bg-green-100 text-green-800 border-green-200';
    case 'Selesai': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Mendatang': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getStatusColorSimple = (status) => {
  const displayStatus = normalizeStatusToDisplay(status);
  
  switch (displayStatus) {
    case 'Berjalan': return 'text-green-600';
    case 'Selesai': return 'text-blue-600';
    case 'Mendatang': return 'text-yellow-600';
    default: return 'text-gray-600';
  }
};

export const getStatusIcon = (status) => {
  const displayStatus = normalizeStatusToDisplay(status);
  
  switch (displayStatus) {
    case 'Berjalan': return 'fas fa-play-circle';
    case 'Selesai': return 'fas fa-check-circle';
    case 'Mendatang': return 'fas fa-clock';
    default: return 'fas fa-circle';
  }
};
