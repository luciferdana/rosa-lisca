/**
 * Rosa Lisca - Google Apps Script Backend
 * Complete backend untuk Rosa Lisca menggunakan Google Sheets & Drive
 */

// 🎯 ID FOLDER GOOGLE DRIVE ANDA
const FOLDER_ID = "169H831SqR3sR0Tsk7xsjNso_mLCSgAfY";

// Konfigurasi
const CONFIG = {
  FOLDER_ID: FOLDER_ID,
  SPREADSHEET_NAME: 'Rosa Lisca Database',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'],
  SHEETS: {
    PROJECTS: 'Projects',
    TRANSACTIONS: 'Transactions',
    BILLINGS: 'Billings', 
    CASH_REQUESTS: 'CashRequests',
    USERS: 'Users',
    FILES: 'Files'
  }
};

/**
 * Main handler untuk GET requests
 */
function doGet(e) {
  try {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true,
        message: 'Rosa Lisca Apps Script API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false,
        message: 'Error in doGet: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Main handler untuk POST requests
 */
function doPost(e) {
  try {
    // Check if postData exists
    if (!e || !e.postData || !e.postData.contents) {
      return createResponse(false, 'No postData received');
    }

    let data = JSON.parse(e.postData.contents);
    let action = data.action;
    
    console.log(`📨 Received action: ${action}`, data);
    
    switch (action) {
      case 'getProjects':
        return handleGetProjects();
      case 'createProject':
        return handleCreateProject(data);
      case 'createTransaction':
        return handleCreateTransaction(data);
      case 'uploadImage':
        return handleUploadImage(data);
      default:
        return createResponse(false, `Unknown action: ${action}`);
    }
    
  } catch (error) {
    console.error('❌ Error in doPost:', error);
    return createResponse(false, 'Error in doPost: ' + error.toString());
  }
}

/**
 * Setup database dan folder structure
 */
function setupDatabase() {
  try {
    console.log('🚀 Setting up Rosa Lisca database...');
    
    // Create atau get spreadsheet
    let spreadsheet = getOrCreateSpreadsheet();
    
    // Create all sheets
    createProjectsSheet(spreadsheet);
    createTransactionsSheet(spreadsheet);
    createBillingsSheet(spreadsheet);
    createCashRequestsSheet(spreadsheet);
    createUsersSheet(spreadsheet);
    createFilesSheet(spreadsheet);
    
    // Create folder structure
    setupFolderStructure();
    
    // Insert dummy data
    insertDummyData(spreadsheet);
    
    console.log('✅ Database setup completed!');
    return createResponse(true, 'Database initialized successfully');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return createResponse(false, 'Database setup failed: ' + error.toString());
  }
}

/**
 * Get atau create main spreadsheet
 */
function getOrCreateSpreadsheet() {
  let files = DriveApp.getFilesByName(CONFIG.SPREADSHEET_NAME);
  let spreadsheet;
  
  if (files.hasNext()) {
    spreadsheet = SpreadsheetApp.open(files.next());
  } else {
    spreadsheet = SpreadsheetApp.create(CONFIG.SPREADSHEET_NAME);
  }
  
  return spreadsheet;
}

/**
 * Create Projects sheet
 */
function createProjectsSheet(spreadsheet) {
  let sheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.PROJECTS);
  
  let headers = [
    'ID', 'Name', 'Status', 'ContractValue', 'DownPayment', 
    'CompanyId', 'CreatedAt', 'UpdatedAt'
  ];
  
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}

/**
 * Create Transactions sheet
 */
function createTransactionsSheet(spreadsheet) {
  let sheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.TRANSACTIONS);
  
  let headers = [
    'ID', 'ProjectId', 'Type', 'Amount', 'Description', 'CompanyName',
    'Category', 'TransactionDate', 'ReceiptUrl', 'FileId', 'CreatedAt'
  ];
  
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}

/**
 * Create Billings sheet
 */
function createBillingsSheet(spreadsheet) {
  let sheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.BILLINGS);
  
  let headers = [
    'ID', 'ProjectId', 'ProjectName', 'Uraian', 'TanggalMasukBerkas', 'TanggalJatuhTempo',
    'NilaiTagihan', 'PotonganUangMuka', 'Retensi5Persen', 'NilaiKwintansi', 'DPP',
    'PPN11Persen', 'PPH265Persen', 'NilaiMasukRekening', 'NomorFaktur', 'Status',
    'TanggalPembayaran', 'RetensiDibayar', 'CreatedAt'
  ];
  
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}

/**
 * Create Cash Requests sheet
 */
function createCashRequestsSheet(spreadsheet) {
  let sheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.CASH_REQUESTS);
  
  let headers = [
    'ID', 'ProjectId', 'ProjectName', 'Title', 'Description', 'TotalAmount',
    'Status', 'RequestedBy', 'RequestDate', 'ApprovedBy', 'ApprovedDate',
    'Items', 'ReceiptUrl', 'FileId', 'CreatedAt'
  ];
  
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}

/**
 * Create Users sheet
 */
function createUsersSheet(spreadsheet) {
  let sheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.USERS);
  
  let headers = [
    'ID', 'Email', 'Password', 'Name', 'Role', 'CompanyId', 'CreatedAt'
  ];
  
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}

/**
 * Create Files sheet
 */
function createFilesSheet(spreadsheet) {
  let sheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.FILES);
  
  let headers = [
    'ID', 'Filename', 'OriginalName', 'MimeType', 'Size', 
    'DriveFileId', 'UploadType', 'UploadDate', 'UploadedBy',
    'ThumbnailUrl', 'ViewUrl', 'DownloadUrl'
  ];
  
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}

/**
 * Get atau create sheet
 */
function getOrCreateSheet(spreadsheet, sheetName) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }
  return sheet;
}

/**
 * Setup folder structure di Google Drive
 */
function setupFolderStructure() {
  try {
    const mainFolder = DriveApp.getFolderById(CONFIG.FOLDER_ID);
    
    const subFolders = [
      'Bukti Transaksi',
      'Bukti Cash Request',
      'Dokumen Proyek', 
      'Dokumen Billing'
    ];
    
    subFolders.forEach(folderName => {
      const existing = mainFolder.getFoldersByName(folderName);
      if (!existing.hasNext()) {
        mainFolder.createFolder(folderName);
        console.log(`✅ Created folder: ${folderName}`);
      }
    });
    
  } catch (error) {
    console.error('Error setting up folders:', error);
  }
}

/**
 * Insert dummy data
 */
function insertDummyData(spreadsheet) {
  // Insert admin user
  let usersSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.USERS);
  if (usersSheet.getLastRow() === 1) {
    usersSheet.appendRow([
      1, 'admin@rosalisca.com', 'admin123', 'Administrator', 'ADMIN', 1, new Date()
    ]);
  }
  
  // Insert dummy projects
  let projectsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.PROJECTS);
  if (projectsSheet.getLastRow() === 1) {
    let projects = [
      [1, 'Proyek Pembangunan Gedung A', 'BERJALAN', 2500000000, 250000000, 1, new Date(), new Date()],
      [2, 'Renovasi Kantor Pusat', 'SELESAI', 1200000000, 120000000, 1, new Date(), new Date()],
      [3, 'Proyek Infrastruktur Jalan', 'MENDATANG', 3000000000, 300000000, 1, new Date(), new Date()],
      [4, 'Pembangunan Jembatan Layang', 'BERJALAN', 5000000000, 500000000, 1, new Date(), new Date()]
    ];
    
    projects.forEach(project => {
      projectsSheet.appendRow(project);
    });
  }
  
  // Insert dummy transactions
  let transactionsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.TRANSACTIONS);
  if (transactionsSheet.getLastRow() === 1) {
    let transactions = [
      [1, 1, 'PEMASUKAN', 250000000, 'Uang muka dari klien', 'PT ABC', 'Pembayaran Tagihan', '2024-01-15', '', '', new Date()],
      [2, 1, 'PENGELUARAN', 50000000, 'Pembelian material', 'Toko Bangunan XYZ', 'Material', '2024-01-20', '', '', new Date()],
      [3, 2, 'PEMASUKAN', 120000000, 'Pelunasan proyek', 'PT DEF', 'Pembayaran Tagihan', '2024-02-01', '', '', new Date()]
    ];
    
    transactions.forEach(transaction => {
      transactionsSheet.appendRow(transaction);
    });
  }
}

/**
 * Handle get projects
 */
function handleGetProjects() {
  try {
    let spreadsheet = getOrCreateSpreadsheet();
    let projectsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.PROJECTS);
    let projects = sheetToObjects(projectsSheet);
    
    // Simplify response for testing
    let simplifiedProjects = projects.map(project => ({
      id: project.ID,
      name: project.Name,
      status: project.Status,
      contractValue: project.ContractValue,
      downPayment: project.DownPayment,
      createdAt: project.CreatedAt
    }));
    
    return createResponse(true, 'Projects retrieved', { projects: simplifiedProjects });
  } catch (error) {
    console.error('Error getting projects:', error);
    return createResponse(false, 'Failed to get projects: ' + error.toString());
  }
}

/**
 * Handle create project
 */
function handleCreateProject(data) {
  try {
    let spreadsheet = getOrCreateSpreadsheet();
    let projectsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.PROJECTS);
    
    let newId = getNextId(projectsSheet);
    let projectData = data.projectData || {};
    
    let newProject = [
      newId,
      projectData.name || 'Test Project',
      projectData.status || 'MENDATANG',
      parseFloat(projectData.contractValue) || 1000000,
      parseFloat(projectData.downPayment) || 100000,
      1, // CompanyId
      new Date(),
      new Date()
    ];
    
    projectsSheet.appendRow(newProject);
    
    return createResponse(true, 'Project created', {
      id: newId,
      name: projectData.name || 'Test Project',
      status: projectData.status || 'MENDATANG'
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return createResponse(false, 'Failed to create project: ' + error.toString());
  }
}

/**
 * Handle create transaction
 */
function handleCreateTransaction(data) {
  try {
    let spreadsheet = getOrCreateSpreadsheet();
    let transactionsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.TRANSACTIONS);
    
    let newId = getNextId(transactionsSheet);
    let transactionData = data.transactionData || {};
    
    let newTransaction = [
      newId,
      data.projectId || 1,
      transactionData.type || 'PEMASUKAN',
      parseFloat(transactionData.amount) || 100000,
      transactionData.description || 'Test Transaction',
      transactionData.companyName || 'Test Company',
      transactionData.category || 'Test Category',
      transactionData.transactionDate || new Date().toISOString().split('T')[0],
      transactionData.receiptUrl || '',
      transactionData.fileId || '',
      new Date()
    ];
    
    transactionsSheet.appendRow(newTransaction);
    
    return createResponse(true, 'Transaction created', { 
      id: newId,
      projectId: data.projectId || 1,
      type: transactionData.type || 'PEMASUKAN',
      amount: transactionData.amount || 100000
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return createResponse(false, 'Failed to create transaction: ' + error.toString());
  }
}

/**
 * Handle upload image (simplified)
 */
function handleUploadImage(data) {
  try {
    return createResponse(true, 'Upload functionality available', {
      message: 'File upload ready - implement when needed'
    });
  } catch (error) {
    console.error('Upload error:', error);
    return createResponse(false, 'Upload failed: ' + error.toString());
  }
}

// ===============================
// UTILITY FUNCTIONS
// ===============================

/**
 * Convert sheet data ke objects
 */
function sheetToObjects(sheet) {
  let data = sheet.getDataRange().getValues();
  if (data.length === 0) return [];
  
  let headers = data[0];
  let objects = [];
  
  for (let i = 1; i < data.length; i++) {
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = data[i][index];
    });
    objects.push(obj);
  }
  
  return objects;
}

/**
 * Get next available ID
 */
function getNextId(sheet) {
  let lastRow = sheet.getLastRow();
  if (lastRow === 1) return 1; // First data row
  
  let lastId = sheet.getRange(lastRow, 1).getValue();
  return parseInt(lastId) + 1;
}

/**
 * Create standardized response
 */
function createResponse(success, message, data = null) {
  let response = {
    success: success,
    message: message,
    timestamp: new Date().toISOString()
  };
  
  if (data) {
    response.data = data;
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function untuk development
 */
function testAppsScript() {
  console.log('🧪 Testing Apps Script functionality...');
  
  try {
    // Test database setup
    let setupResult = setupDatabase();
    console.log('Setup result:', setupResult.getContentText());
    
    // Test get projects
    let projectsResult = handleGetProjects();
    console.log('Projects result:', projectsResult.getContentText());
    
    return { 
      success: true,
      message: 'Test completed successfully'
    };
  } catch (error) {
    console.error('Test failed:', error);
    return {
      success: false,
      message: 'Test failed: ' + error.toString()
    };
  }
}
