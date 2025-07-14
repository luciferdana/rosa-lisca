/**
 * Rosa Lisca - Google Apps Script Backend FINAL
 * Dengan implementasi upload gambar yang lengkap
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
    console.log('✅ Spreadsheet ready');
    
    // Create all sheets
    createProjectsSheet(spreadsheet);
    createTransactionsSheet(spreadsheet);
    createBillingsSheet(spreadsheet);
    createCashRequestsSheet(spreadsheet);
    createUsersSheet(spreadsheet);
    createFilesSheet(spreadsheet);
    console.log('✅ All sheets created');
    
    // Create folder structure
    setupFolderStructure();
    console.log('✅ Folder structure ready');
    
    // Insert dummy data
    insertDummyData(spreadsheet);
    console.log('✅ Dummy data inserted');
    
    console.log('✅ Database setup completed!');
    return { success: true, message: 'Database initialized successfully' };
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return { success: false, message: error.toString() };
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
 * Handle GET requests untuk test koneksi
 */
function doGet(e) {
  try {
    console.log('📥 GET Request received:', e);
    
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
        return createResponse(false, 'File not found: ' + error.message);
      }
    }
    
    // Default response untuk test koneksi
    return createResponse(true, 'Rosa Lisca Apps Script API is running', {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      folderConfigured: CONFIG.FOLDER_ID,
      sheetsReady: true
    });
    
  } catch (error) {
    console.error('❌ Error in doGet:', error);
    return createResponse(false, error.toString());
  }
}

/**
 * Main handler untuk POST requests
 */
function doPost(e) {
  try {
    console.log('📨 POST Request received');
    console.log('Raw postData:', e.postData);
    
    if (!e.postData || !e.postData.contents) {
      return createResponse(false, 'No data received');
    }
    
    let data = JSON.parse(e.postData.contents);
    let action = data.action;
    
    console.log(`📋 Action: ${action}`);
    console.log('📋 Data:', JSON.stringify(data, null, 2));
    
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
      case 'deleteBilling':
        return handleDeleteBilling(data);
      case 'getCashRequests':
        return handleGetCashRequests(data);
      case 'createCashRequest':
        return handleCreateCashRequest(data);
      case 'updateCashRequest':
        return handleUpdateCashRequest(data);
      case 'deleteCashRequest':
        return handleDeleteCashRequest(data);
      case 'updateCashRequestStatus':
        return handleUpdateCashRequestStatus(data);
      case 'uploadImage':
        return handleUploadImage(data);
      case 'getFileInfo':
        return handleGetFileInfo(data);
      case 'deleteFile':
        return handleDeleteFile(data);
      default:
        return createResponse(false, `Unknown action: ${action}`);
    }
    
  } catch (error) {
    console.error('❌ Error in doPost:', error);
    return createResponse(false, 'Server error: ' + error.toString());
  }
}

/**
 * Handle login
 */
function handleLogin(data) {
  try {
    console.log('🔐 Processing login for:', data.email);
    
    let spreadsheet = getOrCreateSpreadsheet();
    let usersSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.USERS);
    let users = sheetToObjects(usersSheet);
    
    for (let user of users) {
      if (user.Email === data.email && user.Password === data.password) {
        console.log('✅ Login successful');
        return createResponse(true, 'Login successful', {
          id: user.ID,
          email: user.Email,
          name: user.Name,
          role: user.Role
        });
      }
    }
    
    console.log('❌ Invalid credentials');
    return createResponse(false, 'Invalid credentials');
    
  } catch (error) {
    console.error('Error in handleLogin:', error);
    return createResponse(false, 'Login error: ' + error.message);
  }
}

/**
 * Handle get projects
 */
function handleGetProjects() {
  try {
    console.log('📋 Getting projects...');
    
    let spreadsheet = getOrCreateSpreadsheet();
    let projectsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.PROJECTS);
    let projects = sheetToObjects(projectsSheet);
    
    // Get related data untuk setiap project
    let enrichedProjects = projects.map(project => {
      return {
        id: project.ID,
        name: project.Name,
        status: project.Status,
        contractValue: project.ContractValue,
        downPayment: project.DownPayment,
        createdAt: project.CreatedAt,
        billings: getBillingsByProjectId(project.ID),
        transactions: getTransactionsByProjectId(project.ID),
        cashRequests: getCashRequestsByProjectId(project.ID)
      };
    });
    
    console.log(`✅ Found ${enrichedProjects.length} projects`);
    return createResponse(true, 'Projects retrieved', { projects: enrichedProjects });
    
  } catch (error) {
    console.error('Error in handleGetProjects:', error);
    return createResponse(false, 'Get projects error: ' + error.message);
  }
}

/**
 * Handle create project
 */
function handleCreateProject(data) {
  try {
    console.log('➕ Creating project:', data.projectData?.name);
    
    let spreadsheet = getOrCreateSpreadsheet();
    let projectsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.PROJECTS);
    
    let newId = getNextId(projectsSheet);
    let projectData = data.projectData;
    
    let newProject = [
      newId,
      projectData.name,
      projectData.status || 'MENDATANG',
      parseFloat(projectData.contractValue) || 0,
      parseFloat(projectData.downPayment) || 0,
      1, // CompanyId
      new Date(),
      new Date()
    ];
    
    projectsSheet.appendRow(newProject);
    
    console.log(`✅ Project created with ID: ${newId}`);
    return createResponse(true, 'Project created', {
      id: newId,
      name: projectData.name,
      status: projectData.status || 'MENDATANG'
    });
    
  } catch (error) {
    console.error('Error in handleCreateProject:', error);
    return createResponse(false, 'Create project error: ' + error.message);
  }
}

/**
 * Handle create transaction
 */
function handleCreateTransaction(data) {
  try {
    console.log('💰 Creating transaction for project:', data.projectId);
    
    let spreadsheet = getOrCreateSpreadsheet();
    let transactionsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.TRANSACTIONS);
    
    let newId = getNextId(transactionsSheet);
    let transactionData = data.transactionData;
    
    let newTransaction = [
      newId,
      data.projectId,
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
    
    transactionsSheet.appendRow(newTransaction);
    
    console.log(`✅ Transaction created with ID: ${newId}`);
    return createResponse(true, 'Transaction created', { 
      id: newId,
      projectId: data.projectId,
      type: transactionData.type,
      amount: transactionData.amount
    });
    
  } catch (error) {
    console.error('Error in handleCreateTransaction:', error);
    return createResponse(false, 'Create transaction error: ' + error.message);
  }
}

/**
 * Handle upload image - IMPLEMENTASI LENGKAP
 */
function handleUploadImage(data) {
  try {
    console.log('📸 Processing image upload...');
    
    let uploadData = data.uploadData;
    console.log('Upload data received:', {
      filename: uploadData.filename,
      mimeType: uploadData.mimeType,
      uploadType: uploadData.uploadType,
      hasBase64: !!uploadData.base64Data
    });
    
    // Validasi file
    let validation = validateFile(uploadData);
    if (!validation.valid) {
      console.log('❌ Validation failed:', validation.message);
      return createResponse(false, validation.message);
    }
    
    // Clean base64 data (remove data:image/jpeg;base64, prefix if exists)
    let base64Data = uploadData.base64Data;
    if (base64Data.includes(',')) {
      base64Data = base64Data.split(',')[1];
    }
    
    // Decode base64 dan buat blob
    let decodedData = Utilities.base64Decode(base64Data);
    let blob = Utilities.newBlob(decodedData, uploadData.mimeType, uploadData.filename);
    
    console.log('📁 Creating blob:', {
      size: blob.getBytes().length,
      type: blob.getContentType(),
      name: blob.getName()
    });
    
    // Get target folder
    let targetFolder = getOrCreateSubFolder(uploadData.uploadType);
    console.log('📂 Target folder:', targetFolder.getName());
    
    // Upload file ke Drive
    let file = targetFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    console.log('☁️ File uploaded to Drive:', file.getId());
    
    // Generate URLs
    let fileInfo = {
      fileId: file.getId(),
      filename: uploadData.filename,
      originalName: uploadData.originalName || uploadData.filename,
      mimeType: uploadData.mimeType,
      size: blob.getBytes().length,
      uploadType: uploadData.uploadType,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${file.getId()}&sz=w200-h200`,
      viewUrl: `https://drive.google.com/file/d/${file.getId()}/view`,
      downloadUrl: `https://drive.google.com/uc?id=${file.getId()}`,
      uploadDate: new Date().toISOString()
    };
    
    console.log('🔗 Generated URLs:', fileInfo);
    
    // Save file info ke spreadsheet
    saveFileInfo(fileInfo);
    
    console.log('✅ Image upload completed successfully');
    return createResponse(true, 'File uploaded successfully', fileInfo);
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    return createResponse(false, 'Upload failed: ' + error.message);
  }
}

/**
 * Save file info ke Files sheet
 */
function saveFileInfo(fileInfo) {
  try {
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
    
    console.log('💾 File info saved to spreadsheet with ID:', newId);
    
  } catch (error) {
    console.error('Error saving file info:', error);
  }
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
  
  // Check filename
  if (!uploadData.filename || uploadData.filename.trim() === '') {
    return {
      valid: false,
      message: 'Invalid filename'
    };
  }
  
  // Check base64 data
  if (!uploadData.base64Data || uploadData.base64Data.trim() === '') {
    return {
      valid: false,
      message: 'No file data provided'
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
 * Test function untuk development
 */
function testAppsScript() {
  console.log('🧪 Testing Apps Script functionality...');
  
  // Test database setup
  let setupResult = setupDatabase();
  console.log('Setup result:', setupResult);
  
  // Test get projects
  let projectsResult = handleGetProjects();
  console.log('Projects result:', projectsResult.getContent());
  
  return { 
    setup: setupResult,
    projects: JSON.parse(projectsResult.getContent())
  };
}

// Placeholder handlers untuk endpoint lain yang belum diimplementasi
function handleUpdateProject(data) { return createResponse(false, 'Not implemented yet'); }
function handleGetTransactions(data) { return createResponse(true, 'Transactions retrieved', { transactions: [] }); }
function handleUpdateTransaction(data) { return createResponse(false, 'Not implemented yet'); }
function handleDeleteTransaction(data) { return createResponse(false, 'Not implemented yet'); }
function handleGetBillings(data) { return createResponse(true, 'Billings retrieved', { billings: [] }); }
function handleCreateBilling(data) { return createResponse(false, 'Not implemented yet'); }
function handleUpdateBilling(data) { return createResponse(false, 'Not implemented yet'); }
function handleDeleteBilling(data) { return createResponse(false, 'Not implemented yet'); }
function handleGetCashRequests(data) { return createResponse(true, 'Cash requests retrieved', { cashRequests: [] }); }
function handleCreateCashRequest(data) { return createResponse(false, 'Not implemented yet'); }
function handleUpdateCashRequest(data) { return createResponse(false, 'Not implemented yet'); }
function handleDeleteCashRequest(data) { return createResponse(false, 'Not implemented yet'); }
function handleUpdateCashRequestStatus(data) { return createResponse(false, 'Not implemented yet'); }
function handleDeleteFile(data) { return createResponse(false, 'Not implemented yet'); }
