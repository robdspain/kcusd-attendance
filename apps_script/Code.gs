/**
 * Google Apps Script Web App for Time Off Request
 * - Serves an embeddable HTML form for Google Sites (doGet)
 * - Handles submissions (doPost)
 * - Logs to Google Sheets and emails four recipients
 */

// ======== CONFIGURE ========
const CONFIG = {
  sheetId: '1WbaeyvFCGdRp67BXxkDYE0JmkJ8QWWmbdAAqv7jxpPI',
  sheetName: 'Responses',
  emailRecipients: [
    'spain-r@kcusd.com',
    'lopez-cr@kcusd.com',
    'muniz-d@kcusd.com',
    'evaristo-a@kcusd.com',
  ],
  // Google Drive folder for storing uploaded documents
  driveFolderId: '1pdc32jn7MVw4D0dMgxptM--Sht7q_f13', // Time Off Request Documents folder
  driveFolderName: 'Time Off Request Documents', // Name for the folder if it needs to be created
  // Restrict uploads to these MIME types and max size (bytes)
  maxUploadBytes: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'application/pdf', 'image/png', 'image/jpeg', 'image/heic', 'image/heif'
  ],
  // When embedded in Google Sites, CORS is not needed; kept for API use
  allowedOrigin: '*',
};

function doGet() {
  const tpl = HtmlService.createTemplateFromFile('same error - Exception: No HTML file named Index was found. (line 28, file "Code")Index');
  tpl.actionUrl = ScriptApp.getService().getUrl();
  tpl.formName = 'Behavior Intervention Team - Time Off';
  tpl.formSecret = Utilities.getUuid();
  const html = tpl.evaluate()
    .setTitle('Time Off Request')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return html;
}

function doPost(e) {
  try {
    const origin = e && e.parameter && e.parameter.origin;
    const headers = {
      'Access-Control-Allow-Origin': CONFIG.allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (!e || !e.parameter) {
      return json({ success: false, message: 'No data' }, headers);
    }

    // Honeypot
    if (e.parameter.website) {
      return json({ success: true, message: 'Ignored' }, headers);
    }

    const form = e.parameter;
    const name = (form.name || '').trim();
    const email = (form.email || '').trim();
    const startDate = (form.startDate || '').trim();
    const startTime = (form.startTime || '').trim();
    const endDate = (form.endDate || '').trim();
    const endTime = (form.endTime || '').trim();
    const absenceType = (form.absenceType || '').trim();
    const frontlineEntry = form.frontlineEntry === 'on' ? 'Yes' : 'No';
    const reason = (form.reason || '').trim();
    const description = (form.description || '').trim();
    const formName = (form.formName || 'Time Off Form').trim();
    const formSecret = (form.formSecret || '').trim();

    if (!name || !email || !startDate || !startTime || !endDate || !endTime || !absenceType || form.frontlineEntry !== 'on' || !reason) {
      return json({ success: false, message: 'Missing required fields' }, headers);
    }

    // Optional file upload via HTML form uses e.files if multipart/form-data
    let fileLink = '';
    let fileName = '';
    let attachmentBlob = null;
    if (e && e.files && e.files['doctorNote']) {
      const file = e.files['doctorNote'];
      const sizeBytes = (file && file.getBytes) ? file.getBytes().length : 0;
      const contentType = (file && file.getContentType) ? file.getContentType() : '';
      fileName = (file && file.getName) ? file.getName() : 'uploaded_file';
      
      if (sizeBytes > CONFIG.maxUploadBytes) {
        return json({ success: false, message: 'File too large' }, headers);
      }
      if (CONFIG.allowedMimeTypes.indexOf(contentType) === -1) {
        return json({ success: false, message: 'Unsupported file type' }, headers);
      }
      
      // Keep the file for email attachment
      attachmentBlob = file;
      
      // Save file to Google Drive and get shareable link
      try {
        const driveFile = saveFileToDrive(file, name, timestamp);
        fileLink = driveFile.getUrl();
        fileName = driveFile.getName();
      } catch (error) {
        console.error('Error saving file to Drive:', error);
        return json({ success: false, message: 'Failed to save file to Drive' }, headers);
      }
    }

    const sheet = getOrCreateSheet(CONFIG.sheetId, CONFIG.sheetName);
    const timestamp = new Date();
    const row = [
      Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss'),
      name,
      email,
      startDate,
      startTime,
      endDate,
      endTime,
      absenceType,
      frontlineEntry,
      reason,
      description,
      fileLink || '',
      formSecret,
    ];
    sheet.appendRow(row);

    const subject = `[Time Off] ${name} — ${startDate} ${startTime} → ${endDate} ${endTime}`;
    const body = [
      `${formName} submission`,
      '',
      `Name: ${name}`,
      `Email: ${email}`,
      `Start: ${startDate} ${startTime}`,
      `End: ${endDate} ${endTime}`,
      `Absence Type: ${absenceType}`,
      `Frontline Entry Completed: ${frontlineEntry}`,
      `Reason: ${reason}`,
      description ? `Description: ${description}` : null,
      fileLink ? `Document (attached & stored): ${fileLink}` : null,
      '',
      `Logged at: ${Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss')}`,
    ].filter(Boolean).join('\n');

    const options = { name: 'Time Off Form' };
    if (attachmentBlob) {
      options.attachments = [attachmentBlob];
    }
    const recipients = (CONFIG.emailRecipients || []).map(function(r){ return (r || '').trim(); }).filter(function(r){ return r; });
    if (recipients.length > 0) {
      try { 
        MailApp.sendEmail(recipients.join(','), subject, body, options); 
      } catch (err) {
        console.error('Failed to send email:', err);
      }
    }

    // If submitted from Apps Script form (Sites embed), redirect to success page
    if (e && e.parameter && e.parameter.__embedded) {
      const success = HtmlService.createTemplateFromFile('Success').evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
      return success;
    }

    return json({ success: true }, headers);
  } catch (error) {
    return json({ success: false, message: String(error) });
  }
}

function json(obj, headers) {
  const out = ContentService.createTextOutput(JSON.stringify(obj));
  out.setMimeType(ContentService.MimeType.JSON);
  if (headers) {
    const response = out;
  }
  return out;
}

function getOrCreateSheet(sheetId, sheetName) {
  const ss = SpreadsheetApp.openById(sheetId);
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow([
      'Timestamp', 'Name', 'Email', 'Start Date', 'Start Time', 'End Date', 'End Time', 'Absence Type', 'Frontline Entry', 'Reason', 'Description', 'Document Link', 'Form Secret'
    ]);
  }
  return sheet;
}

// Helper to include HTML partials if needed
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// Function to save uploaded file to Google Drive and return shareable link
function saveFileToDrive(fileBlob, submitterName, timestamp) {
  try {
    // Get or create the Drive folder
    let folder = getOrCreateDriveFolder();
    
    // Create a meaningful filename
    const originalName = fileBlob.getName() || 'document';
    const extension = originalName.substring(originalName.lastIndexOf('.')) || '';
    const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    const dateStr = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const fileName = `${dateStr}_${submitterName}_${baseName}${extension}`;
    
    // Create the file in the Drive folder
    const driveFile = folder.createFile(fileBlob.setName(fileName));
    
    // Set file permissions - make it viewable by the email recipients
    driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Share with specific email recipients
    const recipients = CONFIG.emailRecipients || [];
    recipients.forEach(function(email) {
      if (email && email.trim()) {
        try {
          driveFile.addEditor(email.trim());
        } catch (err) {
          console.log(`Could not add editor ${email}: ${err}`);
          // Continue if we can't add a specific user
        }
      }
    });
    
    return driveFile;
  } catch (error) {
    console.error('Error in saveFileToDrive:', error);
    throw error;
  }
}

// Function to get or create the Google Drive folder for storing documents
function getOrCreateDriveFolder() {
  try {
    // First try to get folder by ID if provided
    if (CONFIG.driveFolderId && CONFIG.driveFolderId !== 'PUT_YOUR_DRIVE_FOLDER_ID_HERE') {
      try {
        return DriveApp.getFolderById(CONFIG.driveFolderId);
      } catch (err) {
        console.log('Could not find folder by ID, will search by name or create new one');
      }
    }
    
    // Search for existing folder by name
    const folders = DriveApp.getFoldersByName(CONFIG.driveFolderName);
    if (folders.hasNext()) {
      return folders.next();
    }
    
    // Create new folder if none exists
    const newFolder = DriveApp.createFolder(CONFIG.driveFolderName);
    console.log(`Created new Drive folder: ${CONFIG.driveFolderName} (ID: ${newFolder.getId()})`);
    
    // Share the folder with the email recipients
    const recipients = CONFIG.emailRecipients || [];
    recipients.forEach(function(email) {
      if (email && email.trim()) {
        try {
          newFolder.addEditor(email.trim());
        } catch (err) {
          console.log(`Could not add folder editor ${email}: ${err}`);
        }
      }
    });
    
    return newFolder;
  } catch (error) {
    console.error('Error in getOrCreateDriveFolder:', error);
    throw error;
  }
}


