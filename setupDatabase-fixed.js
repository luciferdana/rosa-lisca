/**
 * FUNCTION SETUPDATABASE YANG DIPERBAIKI
 * Copy semua kode ini ke Google Apps Script Editor
 */

// 🎯 ID FOLDER GOOGLE DRIVE ANDA
const FOLDER_ID = "169H831SqR3sR0Tsk7xsjNso_mLCSgAfY";

// Konfigurasi
const CONFIG = {
  FOLDER_ID: FOLDER_ID,
  SPREADSHEET_NAME: 'Rosa Lisca Database',
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
 * FUNCTION UTAMA - Setup database
 * Jalankan function ini di Apps Script
 */
function setupDatabase() {
  console.log('🚀 [START] Setting up Rosa Lisca database...');
  
  try {
    // Step 1: Test folder access
    console.log('📁 Testing folder access...');
    testFolderAccess();
    
    // Step 2: Create spreadsheet
    console.log('📊 Creating spreadsheet...');
    let spreadsheet = createSpreadsheet();
    console.log('✅ Spreadsheet created/found:', spreadsheet.getName());
    
    // Step 3: Create sheets
    console.log('📋 Creating sheets...');
    createAllSheets(spreadsheet);
    
    // Step 4: Create folders
    console.log('📁 Creating folder structure...');
    createFolderStructure();
    
    // Step 5: Insert dummy data
    console.log('💾 Inserting dummy data...');
    insertAllDummyData(spreadsheet);
    
    console.log('🎉 [SUCCESS] Database setup completed!');
    return 'SUCCESS: Database initialized successfully';
    
  } catch (error) {
    console.error('❌ [ERROR] Database setup failed:', error.toString());
    return 'ERROR: ' + error.toString();
  }
}

/**
 * Test folder access
 */
function testFolderAccess() {
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    console.log('✅ Folder found:', folder.getName());
    return true;
  } catch (error) {
    console.error('❌ Cannot access folder:', error.toString());
    throw new Error('Cannot access Google Drive folder: ' + FOLDER_ID);
  }
}

/**
 * Create atau get spreadsheet
 */
function createSpreadsheet() {
  try {
    // Cari spreadsheet yang sudah ada
    let files = DriveApp.getFilesByName(CONFIG.SPREADSHEET_NAME);
    
    if (files.hasNext()) {
      console.log('📊 Found existing spreadsheet');
      return SpreadsheetApp.open(files.next());
    } else {
      console.log('📊 Creating new spreadsheet');
      return SpreadsheetApp.create(CONFIG.SPREADSHEET_NAME);
    }
  } catch (error) {
    console.error('❌ Error creating spreadsheet:', error.toString());
    throw error;
  }
}

/**
 * Create all sheets
 */
function createAllSheets(spreadsheet) {
  const sheets = [
    { name: CONFIG.SHEETS.PROJECTS, headers: ['ID', 'Name', 'Status', 'ContractValue', 'DownPayment', 'CompanyId', 'CreatedAt', 'UpdatedAt'] },
    { name: CONFIG.SHEETS.TRANSACTIONS, headers: ['ID', 'ProjectId', 'Type', 'Amount', 'Description', 'CompanyName', 'Category', 'TransactionDate', 'ReceiptUrl', 'FileId', 'CreatedAt'] },
    { name: CONFIG.SHEETS.BILLINGS, headers: ['ID', 'ProjectId', 'ProjectName', 'Uraian', 'TanggalMasukBerkas', 'TanggalJatuhTempo', 'NilaiTagihan', 'PotonganUangMuka', 'Retensi5Persen', 'NilaiKwintansi', 'DPP', 'PPN11Persen', 'PPH265Persen', 'NilaiMasukRekening', 'NomorFaktur', 'Status', 'TanggalPembayaran', 'RetensiDibayar', 'CreatedAt'] },
    { name: CONFIG.SHEETS.CASH_REQUESTS, headers: ['ID', 'ProjectId', 'ProjectName', 'Title', 'Description', 'TotalAmount', 'Status', 'RequestedBy', 'RequestDate', 'ApprovedBy', 'ApprovedDate', 'Items', 'ReceiptUrl', 'FileId', 'CreatedAt'] },
    { name: CONFIG.SHEETS.USERS, headers: ['ID', 'Email', 'Password', 'Name', 'Role', 'CompanyId', 'CreatedAt'] },
    { name: CONFIG.SHEETS.FILES, headers: ['ID', 'Filename', 'OriginalName', 'MimeType', 'Size', 'DriveFileId', 'UploadType', 'UploadDate', 'UploadedBy', 'ThumbnailUrl', 'ViewUrl', 'DownloadUrl'] }
  ];
  
  sheets.forEach(sheetConfig => {
    try {
      let sheet = spreadsheet.getSheetByName(sheetConfig.name);
      
      if (!sheet) {
        sheet = spreadsheet.insertSheet(sheetConfig.name);
        console.log('📋 Created sheet:', sheetConfig.name);
      } else {
        console.log('📋 Found existing sheet:', sheetConfig.name);
      }
      
      // Add headers if sheet is empty
      if (sheet.getLastRow() === 0) {
        sheet.getRange(1, 1, 1, sheetConfig.headers.length).setValues([sheetConfig.headers]);
        sheet.getRange(1, 1, 1, sheetConfig.headers.length).setFontWeight('bold');
        sheet.setFrozenRows(1);
        console.log('✅ Added headers to:', sheetConfig.name);
      }
      
    } catch (error) {
      console.error('❌ Error creating sheet ' + sheetConfig.name + ':', error.toString());
    }
  });
}

/**
 * Create folder structure
 */
function createFolderStructure() {
  try {
    const mainFolder = DriveApp.getFolderById(FOLDER_ID);
    
    const subFolders = [
      'Bukti Transaksi',
      'Bukti Cash Request',
      'Dokumen Proyek', 
      'Dokumen Billing'
    ];
    
    subFolders.forEach(folderName => {
      try {
        const existing = mainFolder.getFoldersByName(folderName);
        if (!existing.hasNext()) {
          mainFolder.createFolder(folderName);
          console.log('📁 Created folder:', folderName);
        } else {
          console.log('📁 Found existing folder:', folderName);
        }
      } catch (error) {
        console.error('❌ Error creating folder ' + folderName + ':', error.toString());
      }
    });
    
  } catch (error) {
    console.error('❌ Error in folder structure setup:', error.toString());
    throw error;
  }
}

/**
 * Insert dummy data
 */
function insertAllDummyData(spreadsheet) {
  try {
    // Insert admin user
    insertUserData(spreadsheet);
    
    // Insert dummy projects
    insertProjectData(spreadsheet);
    
    // Insert dummy transactions
    insertTransactionData(spreadsheet);
    
    console.log('✅ All dummy data inserted');
    
  } catch (error) {
    console.error('❌ Error inserting dummy data:', error.toString());
    throw error;
  }
}

/**
 * Insert user data
 */
function insertUserData(spreadsheet) {
  try {
    let usersSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.USERS);
    
    if (usersSheet.getLastRow() <= 1) {
      usersSheet.appendRow([
        1, 'admin@rosalisca.com', 'admin123', 'Administrator', 'ADMIN', 1, new Date()
      ]);
      console.log('👤 Inserted admin user');
    } else {
      console.log('👤 User data already exists');
    }
  } catch (error) {
    console.error('❌ Error inserting user data:', error.toString());
  }
}

/**
 * Insert project data
 */
function insertProjectData(spreadsheet) {
  try {
    let projectsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.PROJECTS);
    
    if (projectsSheet.getLastRow() <= 1) {
      let projects = [
        [1, 'Proyek Pembangunan Gedung A', 'BERJALAN', 2500000000, 250000000, 1, new Date(), new Date()],
        [2, 'Renovasi Kantor Pusat', 'SELESAI', 1200000000, 120000000, 1, new Date(), new Date()],
        [3, 'Proyek Infrastruktur Jalan', 'MENDATANG', 3000000000, 300000000, 1, new Date(), new Date()],
        [4, 'Pembangunan Jembatan Layang', 'BERJALAN', 5000000000, 500000000, 1, new Date(), new Date()]
      ];
      
      projects.forEach((project, index) => {
        projectsSheet.appendRow(project);
        console.log('🏗️ Inserted project:', project[1]);
      });
    } else {
      console.log('🏗️ Project data already exists');
    }
  } catch (error) {
    console.error('❌ Error inserting project data:', error.toString());
  }
}

/**
 * Insert transaction data
 */
function insertTransactionData(spreadsheet) {
  try {
    let transactionsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.TRANSACTIONS);
    
    if (transactionsSheet.getLastRow() <= 1) {
      let transactions = [
        [1, 1, 'PEMASUKAN', 250000000, 'Uang muka dari klien', 'PT ABC', 'Pembayaran Tagihan', '2024-01-15', '', '', new Date()],
        [2, 1, 'PENGELUARAN', 50000000, 'Pembelian material', 'Toko Bangunan XYZ', 'Material', '2024-01-20', '', '', new Date()],
        [3, 2, 'PEMASUKAN', 120000000, 'Pelunasan proyek', 'PT DEF', 'Pembayaran Tagihan', '2024-02-01', '', '', new Date()]
      ];
      
      transactions.forEach((transaction, index) => {
        transactionsSheet.appendRow(transaction);
        console.log('💰 Inserted transaction:', transaction[4]);
      });
    } else {
      console.log('💰 Transaction data already exists');
    }
  } catch (error) {
    console.error('❌ Error inserting transaction data:', error.toString());
  }
}

/**
 * Test function sederhana
 */
function testSimple() {
  console.log('🧪 Simple test starting...');
  console.log('📁 Folder ID:', FOLDER_ID);
  
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    console.log('✅ Folder access OK:', folder.getName());
    return 'SUCCESS: Folder access working';
  } catch (error) {
    console.error('❌ Folder access failed:', error.toString());
    return 'ERROR: ' + error.toString();
  }
}

/**
 * Main API handlers (copy dari file sebelumnya)
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

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createResponse(false, 'No postData received');
    }

    let data = JSON.parse(e.postData.contents);
    let action = data.action;
    
    console.log('📨 Received action:', action);
    
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
        return createResponse(false, 'Unknown action: ' + action);
    }
    
  } catch (error) {
    console.error('❌ Error in doPost:', error);
    return createResponse(false, 'Error in doPost: ' + error.toString());
  }
}

function handleGetProjects() {
  try {
    let spreadsheet = getSpreadsheet();
    let projectsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.PROJECTS);
    let projects = sheetToObjects(projectsSheet);
    
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

function handleCreateProject(data) {
  try {
    let spreadsheet = getSpreadsheet();
    let projectsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.PROJECTS);
    
    let newId = getNextId(projectsSheet);
    let projectData = data.projectData || {};
    
    let newProject = [
      newId,
      projectData.name || 'Test Project',
      projectData.status || 'MENDATANG',
      parseFloat(projectData.contractValue) || 1000000,
      parseFloat(projectData.downPayment) || 100000,
      1,
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

function handleCreateTransaction(data) {
  try {
    let spreadsheet = getSpreadsheet();
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

// Utility functions
function getSpreadsheet() {
  let files = DriveApp.getFilesByName(CONFIG.SPREADSHEET_NAME);
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  } else {
    throw new Error('Spreadsheet not found. Run setupDatabase() first.');
  }
}

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

function getNextId(sheet) {
  let lastRow = sheet.getLastRow();
  if (lastRow === 1) return 1;
  
  let lastId = sheet.getRange(lastRow, 1).getValue();
  return parseInt(lastId) + 1;
}

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
