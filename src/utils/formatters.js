// Utility functions for formatting data

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Rp 0';
  }
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatNumber = (number) => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }
  
  return new Intl.NumberFormat('id-ID').format(number);
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

export const formatDateShort = (dateString) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};

export const formatPercent = (decimal) => {
  if (decimal === null || decimal === undefined || isNaN(decimal)) {
    return '0%';
  }
  
  return new Intl.NumberFormat('id-ID', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(decimal);
};

export const parseNumber = (numberString) => {
  if (!numberString) return '';
  
  // Convert to string and remove leading zeros, but keep single zero
  let cleaned = numberString.toString().replace(/^0+/, '') || '0';
  
  // Remove any non-digit characters except decimal point
  cleaned = cleaned.replace(/[^\d.-]/g, '');
  
  // Handle empty string after cleaning
  if (!cleaned || cleaned === '') return '';
  
  // Return as number for calculation, but preserve the cleaned string format
  const number = parseFloat(cleaned);
  return isNaN(number) ? '' : number;
};

export const formatNumberInput = (value) => {
  if (!value && value !== 0) return '';
  
  // Convert to string and remove leading zeros
  let cleaned = value.toString().replace(/^0+/, '') || '0';
  
  // If it's just zero, return empty string to avoid showing 0
  if (cleaned === '0') return '';
  
  return cleaned;
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};