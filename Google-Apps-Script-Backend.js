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
    return createResponse(false, error.toString());
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

// ===============================
// API ENDPOINTS
// ===============================

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
      case 'login':
        return handleLogin(data);
      case 'getProjects':
        return handleGetProjects();
      case 'createProject':
        return handleCreateProject(data);
      case 'updateProject':
        return handleUpdateProject(data);
      case 'getTransactions':
        return handleGetTransactions(data);
      case 'createTransaction':
        return handleCreateTransaction(data);
      case 'updateTransaction':
        return handleUpdateTransaction(data);
      case 'deleteTransaction':
        return handleDeleteTransaction(data);
      case 'getBillings':
        return handleGetBillings(data);
      case 'createBilling':
        return handleCreateBilling(data);
      case 'updateBilling':
        return handleUpdateBilling(data);
      case 'getCashRequests':
        return handleGetCashRequests(data);
      case 'createCashRequest':
        return handleCreateCashRequest(data);      case 'updateCashRequestStatus':
        return handleUpdateCashRequestStatus(data);
      case 'uploadImage':
        return handleUploadImage(data);
      case 'getFileInfo':
        return handleGetFileInfo(data);
      case 'deleteFile':
        return handleDeleteFile(data);
      case 'deleteBilling':
        return handleDeleteBilling(data);
      case 'updateCashRequest':
        return handleUpdateCashRequest(data);
      case 'deleteCashRequest':
        return handleDeleteCashRequest(data);
      default:
        return createResponse(false, `Unknown action: ${action}`);
    }
    
  } catch (error) {
    console.error('❌ Error in doPost:', error);
    return createResponse(false, error.toString());
  }
}

/**
 * Handle login
 */
function handleLogin(data) {
  let spreadsheet = getOrCreateSpreadsheet();
  let usersSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.USERS);
  let users = sheetToObjects(usersSheet);
  
  for (let user of users) {
    if (user.Email === data.email && user.Password === data.password) {
      return createResponse(true, 'Login successful', {
        id: user.ID,
        email: user.Email,
        name: user.Name,
        role: user.Role
      });
    }
  }
  
  return createResponse(false, 'Invalid credentials');
}

/**
 * Handle upload image (improved)
 */
function handleUploadImage(data) {
  try {
    return createResponse(true, 'Upload functionality available', {
      message: 'File upload ready - implement when needed',
      fileId: 'dummy-file-id-' + new Date().getTime(),
      thumbnailUrl: 'https://via.placeholder.com/200x200.png?text=Uploaded+Image',
      viewUrl: '#',
      downloadUrl: '#'
    });
  } catch (error) {
    console.error('Upload error:', error);
    return createResponse(false, 'Upload failed: ' + error.toString());
  }
}

/**
 * Handle create project (improved)
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
 * Handle get projects (improved)
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

// Utility functions
function getOrCreateSpreadsheet() {
  let files = DriveApp.getFilesByName(CONFIG.SPREADSHEET_NAME);
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  } else {
    throw new Error('Spreadsheet not found. Run setupDatabase() first.');
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
 * Handle update transaction
 */
function handleUpdateTransaction(data) {
  let spreadsheet = getOrCreateSpreadsheet();
  let transactionsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.TRANSACTIONS);
  let transactions = sheetToObjects(transactionsSheet);
  
  // Find transaction by ID
  let rowIndex = -1;
  for (let i = 0; i < transactions.length; i++) {
    if (transactions[i].ID == data.transactionId) {
      rowIndex = i + 2; // +2 karena header row dan 0-based index
      break;
    }
  }
  
  if (rowIndex === -1) {
    return createResponse(false, 'Transaction not found');
  }
  
  let transactionData = data.transactionData;
  let updatedTransaction = [
    data.transactionId,
    transactions[rowIndex - 2].ProjectId, // Keep original project ID
    transactionData.type,
    parseFloat(transactionData.amount) || 0,
    transactionData.description || '',
    transactionData.companyName || '',
    transactionData.category || '',
    transactionData.transactionDate || new Date().toISOString().split('T')[0],
    transactionData.receiptUrl || '',
    transactionData.fileId || '',
    new Date()
  ];
  
  transactionsSheet.getRange(rowIndex, 1, 1, updatedTransaction.length).setValues([updatedTransaction]);
  
  return createResponse(true, 'Transaction updated', { id: data.transactionId });
}

/**
 * Handle delete transaction
 */
function handleDeleteTransaction(data) {
  let spreadsheet = getOrCreateSpreadsheet();
  let transactionsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.TRANSACTIONS);
  let transactions = sheetToObjects(transactionsSheet);
  
  // Find transaction by ID
  let rowIndex = -1;
  for (let i = 0; i < transactions.length; i++) {
    if (transactions[i].ID == data.transactionId) {
      rowIndex = i + 2; // +2 karena header row dan 0-based index
      break;
    }
  }
  
  if (rowIndex === -1) {
    return createResponse(false, 'Transaction not found');
  }
  
  transactionsSheet.deleteRow(rowIndex);
  
  return createResponse(true, 'Transaction deleted', { id: data.transactionId });
}

/**
 * Handle upload image
 */
function handleUploadImage(data) {
  try {
    let uploadData = data.uploadData;
    
    // Validasi file
    let validation = validateFile(uploadData);
    if (!validation.valid) {
      return createResponse(false, validation.message);
    }
    
    // Decode base64 dan buat blob
    let decodedData = Utilities.base64Decode(uploadData.base64Data);
    let blob = Utilities.newBlob(decodedData, uploadData.mimeType, uploadData.filename);
    
    // Get target folder
    let targetFolder = getOrCreateSubFolder(uploadData.uploadType);
    
    // Upload file ke Drive
    let file = targetFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Generate URLs
    let fileInfo = {
      fileId: file.getId(),
      filename: uploadData.filename,
      originalName: uploadData.originalName,
      mimeType: uploadData.mimeType,
      size: blob.getBytes().length,
      uploadType: uploadData.uploadType,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${file.getId()}&sz=w200-h200`,
      viewUrl: `https://drive.google.com/file/d/${file.getId()}/view`,
      downloadUrl: `https://drive.google.com/uc?id=${file.getId()}`,
      uploadDate: new Date().toISOString()
    };
    
    // Save file info ke spreadsheet
    saveFileInfo(fileInfo);
    
    return createResponse(true, 'File uploaded successfully', fileInfo);
    
  } catch (error) {
    console.error('Upload error:', error);
    return createResponse(false, 'Upload failed: ' + error.message);
  }
}

/**
 * Save file info ke Files sheet
 */
function saveFileInfo(fileInfo) {
  let spreadsheet = getOrCreateSpreadsheet();
  let filesSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.FILES);
  let newId = getNextId(filesSheet);
  
  filesSheet.appendRow([
    newId,
    fileInfo.filename,
    fileInfo.originalName,
    fileInfo.mimeType,
    fileInfo.size,
    fileInfo.fileId,
    fileInfo.uploadType,
    fileInfo.uploadDate,
    'system', // UploadedBy
    fileInfo.thumbnailUrl,
    fileInfo.viewUrl,
    fileInfo.downloadUrl
  ]);
}

/**
 * Validate file upload
 */
function validateFile(uploadData) {
  // Check mime type
  if (!CONFIG.ALLOWED_TYPES.includes(uploadData.mimeType)) {
    return {
      valid: false,
      message: `File type ${uploadData.mimeType} not allowed. Allowed: ${CONFIG.ALLOWED_TYPES.join(', ')}`
    };
  }
  
  // Check file size
  if (uploadData.size && uploadData.size > CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      message: `File too large. Max size: ${CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }
  
  // Check filename
  if (!uploadData.filename || uploadData.filename.trim() === '') {
    return {
      valid: false,
      message: 'Invalid filename'
    };
  }
  
  return { valid: true };
}

/**
 * Get atau create subfolder
 */
function getOrCreateSubFolder(uploadType) {
  let mainFolder = DriveApp.getFolderById(CONFIG.FOLDER_ID);
  
  let subFolderNames = {
    'transaction': 'Bukti Transaksi',
    'receipt': 'Bukti Cash Request',
    'project': 'Dokumen Proyek',
    'billing': 'Dokumen Billing'
  };
  
  let subFolderName = subFolderNames[uploadType] || 'Lainnya';
  
  // Cari subfolder yang sudah ada
  let subFolders = mainFolder.getFoldersByName(subFolderName);
  
  if (subFolders.hasNext()) {
    return subFolders.next();
  } else {
    // Buat subfolder baru
    return mainFolder.createFolder(subFolderName);
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
 * Get transactions by project ID
 */
function getTransactionsByProjectId(projectId) {
  let spreadsheet = getOrCreateSpreadsheet();
  let transactionsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.TRANSACTIONS);
  let transactions = sheetToObjects(transactionsSheet);
  
  return transactions
    .filter(transaction => transaction.ProjectId == projectId)
    .map(transaction => ({
      id: transaction.ID,
      type: transaction.Type,
      amount: transaction.Amount,
      description: transaction.Description,
      companyName: transaction.CompanyName,
      category: transaction.Category,
      transactionDate: transaction.TransactionDate,
      receiptUrl: transaction.ReceiptUrl,
      fileId: transaction.FileId,
      createdAt: transaction.CreatedAt
    }));
}

/**
 * Get billings by project ID
 */
function getBillingsByProjectId(projectId) {
  let spreadsheet = getOrCreateSpreadsheet();
  let billingsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.BILLINGS);
  let billings = sheetToObjects(billingsSheet);
  
  return billings.filter(billing => billing.ProjectId == projectId);
}

/**
 * Get cash requests by project ID
 */
function getCashRequestsByProjectId(projectId) {
  let spreadsheet = getOrCreateSpreadsheet();
  let cashRequestsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.CASH_REQUESTS);
  let cashRequests = sheetToObjects(cashRequestsSheet);
  
  return cashRequests.filter(request => request.ProjectId == projectId);
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
 * Handle GET requests
 */
function doGet(e) {
  let fileId = e.parameter.fileId;
  let action = e.parameter.action || 'info';
  
  if (fileId) {
    try {
      if (action === 'download') {
        let file = DriveApp.getFileById(fileId);
        let blob = file.getBlob();
        
        return ContentService
          .createTextOutput(Utilities.base64Encode(blob.getBytes()))
          .setMimeType(ContentService.MimeType.TEXT);
      } else {
        // Return file info
        return handleGetFileInfo({ fileId: fileId });
      }
      
    } catch (error) {
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: false, 
          message: 'File not found: ' + error.message 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // Default response
  return ContentService
    .createTextOutput(JSON.stringify({ 
      success: true,
      message: 'Rosa Lisca Apps Script API is running',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle get file info
 */
function handleGetFileInfo(data) {
  try {
    let file = DriveApp.getFileById(data.fileId);
    
    let fileInfo = {
      fileId: data.fileId,
      filename: file.getName(),
      mimeType: file.getBlob().getContentType(),
      size: file.getSize(),
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${data.fileId}&sz=w200-h200`,
      viewUrl: `https://drive.google.com/file/d/${data.fileId}/view`,
      downloadUrl: `https://drive.google.com/uc?id=${data.fileId}`,
      lastModified: file.getLastUpdated().toISOString()
    };
    
    return createResponse(true, 'File info retrieved', fileInfo);
    
  } catch (error) {
    return createResponse(false, 'File not found: ' + error.message);
  }
}

/**
 * Handle delete billing
 */
function handleDeleteBilling(data) {
  try {
    let spreadsheet = getOrCreateSpreadsheet();
    let billingsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.BILLINGS);
    let billings = sheetToObjects(billingsSheet);
    
    // Find billing by ID
    let rowIndex = -1;
    for (let i = 0; i < billings.length; i++) {
      if (billings[i].ID == data.billingId) {
        rowIndex = i + 2; // +2 karena header row dan 0-based index
        break;
      }
    }
    
    if (rowIndex === -1) {
      return createResponse(false, 'Billing not found');
    }
    
    billingsSheet.deleteRow(rowIndex);
    
    return createResponse(true, 'Billing deleted', { id: data.billingId });
    
  } catch (error) {
    console.error('Error deleting billing:', error);
    return createResponse(false, 'Delete failed: ' + error.message);
  }
}

/**
 * Handle update cash request
 */
function handleUpdateCashRequest(data) {
  try {
    let spreadsheet = getOrCreateSpreadsheet();
    let cashRequestsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.CASH_REQUESTS);
    let cashRequests = sheetToObjects(cashRequestsSheet);
    
    // Find cash request by ID
    let rowIndex = -1;
    for (let i = 0; i < cashRequests.length; i++) {
      if (cashRequests[i].ID == data.requestId) {
        rowIndex = i + 2; // +2 karena header row dan 0-based index
        break;
      }
    }
    
    if (rowIndex === -1) {
      return createResponse(false, 'Cash request not found');
    }
    
    let cashRequestData = data.cashRequestData;
    let updatedCashRequest = [
      data.requestId,
      cashRequests[rowIndex - 2].ProjectId, // Keep original project ID
      cashRequests[rowIndex - 2].ProjectName, // Keep original project name
      cashRequestData.title || cashRequests[rowIndex - 2].Title,
      cashRequestData.description || cashRequests[rowIndex - 2].Description,
      parseFloat(cashRequestData.totalAmount) || cashRequests[rowIndex - 2].TotalAmount,
      cashRequestData.status || cashRequests[rowIndex - 2].Status,
      cashRequests[rowIndex - 2].RequestedBy, // Keep original
      cashRequests[rowIndex - 2].RequestDate, // Keep original
      cashRequestData.approvedBy || cashRequests[rowIndex - 2].ApprovedBy,
      cashRequestData.approvedDate || cashRequests[rowIndex - 2].ApprovedDate,
      JSON.stringify(cashRequestData.items) || cashRequests[rowIndex - 2].Items,
      cashRequestData.receiptUrl || cashRequests[rowIndex - 2].ReceiptUrl,
      cashRequestData.fileId || cashRequests[rowIndex - 2].FileId,
      new Date()
    ];
    
    cashRequestsSheet.getRange(rowIndex, 1, 1, updatedCashRequest.length).setValues([updatedCashRequest]);
    
    return createResponse(true, 'Cash request updated', { id: data.requestId });
    
  } catch (error) {
    console.error('Error updating cash request:', error);
    return createResponse(false, 'Update failed: ' + error.message);
  }
}

/**
 * Handle delete cash request
 */
function handleDeleteCashRequest(data) {
  try {
    let spreadsheet = getOrCreateSpreadsheet();
    let cashRequestsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.CASH_REQUESTS);
    let cashRequests = sheetToObjects(cashRequestsSheet);
    
    // Find cash request by ID
    let rowIndex = -1;
    for (let i = 0; i < cashRequests.length; i++) {
      if (cashRequests[i].ID == data.requestId) {
        rowIndex = i + 2; // +2 karena header row dan 0-based index
        break;
      }
    }
    
    if (rowIndex === -1) {
      return createResponse(false, 'Cash request not found');
    }
    
    cashRequestsSheet.deleteRow(rowIndex);
    
    return createResponse(true, 'Cash request deleted', { id: data.requestId });
    
  } catch (error) {
    console.error('Error deleting cash request:', error);
    return createResponse(false, 'Delete failed: ' + error.message);
  }
}

/**
 * Handle delete file
 */
function handleDeleteFile(data) {
  try {
    // Delete from Drive
    let file = DriveApp.getFileById(data.fileId);
    file.setTrashed(true);
    
    // Remove from Files sheet
    let spreadsheet = getOrCreateSpreadsheet();
    let filesSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.FILES);
    let files = sheetToObjects(filesSheet);
    
    // Find file by Drive ID
    let rowIndex = -1;
    for (let i = 0; i < files.length; i++) {
      if (files[i].DriveFileId == data.fileId) {
        rowIndex = i + 2; // +2 karena header row dan 0-based index
        break;
      }
    }
    
    if (rowIndex !== -1) {
      filesSheet.deleteRow(rowIndex);
    }
    
    return createResponse(true, 'File deleted', { id: data.fileId });
    
  } catch (error) {
    console.error('Error deleting file:', error);
    return createResponse(false, 'Delete failed: ' + error.message);
  }
}

/**
 * Handle update cash request status
 */
function handleUpdateCashRequestStatus(data) {
  try {
    let spreadsheet = getOrCreateSpreadsheet();
    let cashRequestsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.CASH_REQUESTS);
    let cashRequests = sheetToObjects(cashRequestsSheet);
    
    // Find cash request by ID
    let rowIndex = -1;
    for (let i = 0; i < cashRequests.length; i++) {
      if (cashRequests[i].ID == data.requestId) {
        rowIndex = i + 2; // +2 karena header row dan 0-based index
        break;
      }
    }
    
    if (rowIndex === -1) {
      return createResponse(false, 'Cash request not found');
    }
    
    // Update status
    cashRequestsSheet.getRange(rowIndex, 7).setValue(data.status); // Status column
    
    // Update approved info if approved
    if (data.status === 'APPROVED') {
      cashRequestsSheet.getRange(rowIndex, 10).setValue('Admin'); // ApprovedBy
      cashRequestsSheet.getRange(rowIndex, 11).setValue(new Date().toISOString().split('T')[0]); // ApprovedDate
    }
    
    return createResponse(true, 'Cash request status updated', { 
      id: data.requestId, 
      status: data.status 
    });
    
  } catch (error) {
    console.error('Error updating cash request status:', error);
    return createResponse(false, 'Update failed: ' + error.message);
  }
}

/**
 * Test function untuk development
 */
function testAppsScript() {
  console.log('🧪 Testing Apps Script functionality...');
  
  // Test database setup
  let setupResult = setupDatabase();
  console.log('Setup result:', setupResult.getContent());
  
  // Test get projects
  let projectsResult = handleGetProjects();
  console.log('Projects result:', projectsResult.getContent());
  
  return { 
    setup: JSON.parse(setupResult.getContent()),
    projects: JSON.parse(projectsResult.getContent())
  };
}
