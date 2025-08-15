/**
 * Complete Google Apps Script Web App for Time Off Request
 * - Serves an embeddable HTML form for Google Sites (doGet)
 * - Handles submissions (doPost)
 * - Logs to Google Sheets and emails recipients
 * - All HTML, CSS, and JavaScript embedded in this file
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
  const html = HtmlService.createHtmlOutput(getHtmlContent())
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

    const sheet = getOrCreateSheet(CONFIG.sheetId, CONFIG.sheetName);
    const timestamp = new Date();

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
    
    // Send emails individually for better reliability
    const recipients = (CONFIG.emailRecipients || [])
      .map(function(r){ return (r || '').trim(); })
      .filter(function(r){ return r && isValidEmail(r); });
    
    // Filter out invalid emails and log them
    const invalidEmails = (CONFIG.emailRecipients || [])
      .map(function(r){ return (r || '').trim(); })
      .filter(function(r){ return r && !isValidEmail(r); });
    
    if (invalidEmails.length > 0) {
      console.warn('Invalid email addresses found in CONFIG:', invalidEmails);
    }
    
    let emailErrors = [];
    
    if (recipients.length > 0) {
      // Check email quota before sending
      if (!checkEmailQuota()) {
        console.error('Insufficient email quota to send to all recipients');
        emailErrors.push('Email quota exceeded');
      } else {
        // Send emails individually
        for (let i = 0; i < recipients.length; i++) {
          const recipient = recipients[i];
          try { 
            MailApp.sendEmail(recipient, subject, body, options);
            console.log(`Email sent successfully to: ${recipient}`);
            // Small delay to avoid rate limiting
            if (i < recipients.length - 1) {
              Utilities.sleep(100);
            }
          } catch (err) {
            console.error(`Failed to send email to ${recipient}:`, err);
            emailErrors.push(`${recipient}: ${err.message}`);
          }
        }
      }
      
      // Log email status
      if (emailErrors.length > 0) {
        console.warn(`Email delivery issues: ${emailErrors.length}/${recipients.length} failed`);
        console.warn('Failed recipients:', emailErrors);
      } else {
        console.log(`All emails sent successfully to ${recipients.length} recipients`);
      }
    } else {
      console.warn('No valid email recipients found in CONFIG.emailRecipients');
    }

    // If submitted from Apps Script form (Sites embed), redirect to success page
    if (e && e.parameter && e.parameter.__embedded) {
      const success = HtmlService.createHtmlOutput(getSuccessHtml()).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
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

// Function to validate email address format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to check email quota (Apps Script limit: 100 emails/day for free accounts)
function checkEmailQuota() {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // This is an approximation - actual quota tracking would require storing sent counts
    const remainingQuota = MailApp.getRemainingDailyQuota();
    console.log(`Remaining email quota: ${remainingQuota}`);
    
    if (remainingQuota < CONFIG.emailRecipients.length) {
      console.warn(`Low email quota: ${remainingQuota} remaining, need ${CONFIG.emailRecipients.length}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error checking email quota:', err);
    return true; // Proceed if we can't check quota
  }
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

function getHtmlContent() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Behavior Intervention Team - Time Off Request</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <style>
:root {
  --bg: #000000;
  --panel: rgba(255, 255, 255, 0.98);
  --text-outside: #ffffff;
  --text-form: #0f172a;
  --text-light: #1e293b;
  --muted-outside: #e5e7eb;
  --muted-form: #64748b;
  --primary: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  --primary-hover: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
  --border: rgba(148, 163, 184, 0.3);
  --border-focus: rgba(59, 130, 246, 0.5);
  --success: #059669;
  --error: #dc2626;
  --shadow-sm: 0 1px 2px 0 rgba(255, 255, 255, 0.1);
  --shadow-md: 0 4px 6px -1px rgba(255, 255, 255, 0.1), 0 2px 4px -1px rgba(255, 255, 255, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(255, 255, 255, 0.1), 0 4px 6px -2px rgba(255, 255, 255, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(255, 255, 255, 0.1), 0 10px 10px -5px rgba(255, 255, 255, 0.04);
}

/* Force dark background with white form - override any preferences */
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #000000 !important;
    --panel: rgba(255, 255, 255, 0.98) !important;
    --text-outside: #ffffff !important;
    --text-form: #0f172a !important;
    --muted-outside: #e5e7eb !important;
    --muted-form: #64748b !important;
    --border: rgba(148, 163, 184, 0.3) !important;
  }
}

* { 
  box-sizing: border-box; 
}

html, body { 
  height: 100%; 
  scroll-behavior: smooth;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  font-weight: 400;
  color: var(--text-outside) !important;
  background: var(--bg) !important;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;
}

.container {
  max-width: 840px;
  margin: 0 auto;
  padding: 16px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Mobile-first responsive breakpoints */
@media (min-width: 480px) {
  .container {
    padding: 20px;
    margin: 20px auto;
    min-height: auto;
  }
}

@media (min-width: 768px) {
  .container {
    padding: 32px 24px;
    margin: 40px auto;
  }
}

.title { 
  font-size: 1.75rem; 
  font-weight: 700; 
  margin: 0 0 8px; 
  color: var(--text-outside);
  letter-spacing: -0.02em;
  text-align: center;
  line-height: 1.2;
}

.subtitle { 
  color: var(--muted-outside); 
  margin: 0 0 20px; 
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
  line-height: 1.5;
}

.description, .note { 
  color: var(--muted-outside); 
  margin: 0 0 16px; 
  font-size: 1rem;
  line-height: 1.6;
  text-align: center;
}

@media (min-width: 480px) {
  .description, .note { 
    font-size: 1.05rem;
  }
}

/* Desktop typography improvements */
@media (min-width: 768px) {
  .title { 
    font-size: 2.25rem;
    color: var(--text-outside);
    text-align: left;
  }
  
  .subtitle { 
    font-size: 1.1rem;
    text-align: left;
  }
  
  .description, .note { 
    font-size: 1rem;
    text-align: left;
  }
}

form {
  background: var(--panel) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1.5px solid var(--border) !important;
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--shadow-lg);
  position: relative;
  overflow: hidden;
  width: 100%;
  margin: 0;
}

form::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
}

/* Enhanced mobile form styling */
@media (min-width: 480px) {
  form {
    padding: 24px;
    border-radius: 18px;
  }
}

@media (min-width: 768px) {
  form {
    padding: 32px;
    border-radius: 20px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: var(--shadow-xl);
  }
  
  form::before {
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  }
}

section { 
  margin: 20px 0 24px; 
  position: relative;
}

section h2 { 
  font-size: 1.375rem; 
  margin: 0 0 16px; 
  color: var(--text-form); 
  font-weight: 700; 
  letter-spacing: -0.01em;
  text-align: center;
}

/* Desktop section styling */
@media (min-width: 768px) {
  section { 
    margin: 24px 0 32px; 
  }
  
  section h2 { 
    font-size: 1.5rem; 
    margin: 0 0 20px; 
    letter-spacing: -0.015em;
    display: flex;
    align-items: center;
    gap: 12px;
    text-align: left;
  }

  section h2::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, var(--border), transparent);
  }
}

.grid { 
  display: grid; 
  grid-template-columns: 1fr; 
  gap: 16px; 
}

@media (min-width: 640px) { 
  .grid { 
    grid-template-columns: 1fr 1fr; 
    gap: 20px; 
  } 
}

@media (min-width: 768px) { 
  .grid { 
    gap: 24px; 
  } 
}

.field { 
  display: flex; 
  flex-direction: column; 
  gap: 10px; 
  position: relative;
}

.field label { 
  font-weight: 600; 
  color: var(--text-form); 
  font-size: 1rem;
  letter-spacing: 0.01em;
  margin-bottom: 4px;
}

.hint { 
  color: var(--muted-form); 
  margin: 0; 
  font-size: 0.95rem; 
  line-height: 1.5;
}

/* Checkbox field styling */
.checkbox-field {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  margin: 8px 0;
}

.checkbox-field input[type="checkbox"] {
  width: 20px;
  height: 20px;
  min-width: 20px;
  margin: 2px 0 0 0;
  cursor: pointer;
  accent-color: var(--primary);
}

.checkbox-field label {
  flex: 1;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-form);
  cursor: pointer;
  line-height: 1.5;
  margin-bottom: 0;
}

@media (max-width: 767px) {
  .checkbox-field {
    padding: 18px 16px;
    gap: 16px;
  }
  
  .checkbox-field input[type="checkbox"] {
    width: 24px;
    height: 24px;
    min-width: 24px;
  }
  
  .checkbox-field label {
    font-size: 1.05rem;
  }
}

@media (min-width: 768px) {
  .field label {
    font-size: 0.95rem;
  }
  
  .hint {
    font-size: 0.9rem;
  }
  
  .checkbox-field label {
    font-size: 0.95rem;
  }
}

input[type="text"], input[type="email"], input[type="date"], input[type="time"], select, textarea {
  width: 100%;
  padding: 16px;
  color: var(--text-form) !important;
  background: var(--panel) !important;
  border: 2px solid var(--border) !important;
  border-radius: 12px;
  outline: none;
  transition: all 0.2s ease;
  font-size: 16px; /* Prevents zoom on iOS */
  font-weight: 500;
  box-shadow: var(--shadow-sm);
  position: relative;
  min-height: 44px; /* iOS recommended touch target */
  -webkit-appearance: none;
  appearance: none;
}

input::placeholder, textarea::placeholder { 
  color: var(--muted-form); 
  opacity: 0.8; 
  font-weight: 400;
}

textarea { 
  resize: vertical; 
  min-height: 120px; 
  line-height: 1.6;
  font-family: inherit;
}

@media (min-width: 768px) {
  textarea { 
    min-height: 100px; 
  }
}

input:focus, select:focus, textarea:focus {
  border-color: var(--border-focus) !important;
  box-shadow: 0 0 0 4px var(--border-focus), var(--shadow-md);
  transform: translateY(-1px);
}

input:hover, select:hover, textarea:hover {
  border-color: var(--border-focus);
  box-shadow: var(--shadow-md);
}

/* Specific styling for date and time inputs */
input[type="date"], input[type="time"] {
  font-family: inherit;
  cursor: pointer;
}

/* Date picker icon styling */
input[type="date"]::-webkit-calendar-picker-indicator,
input[type="time"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2364748b'%3e%3cpath fill-rule='evenodd' d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z' clip-rule='evenodd' /%3e%3c/svg%3e");
  background-size: 20px;
  background-repeat: no-repeat;
  background-position: center;
  width: 20px;
  height: 20px;
  margin-left: 8px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

input[type="time"]::-webkit-calendar-picker-indicator {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2364748b'%3e%3cpath fill-rule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z' clip-rule='evenodd' /%3e%3c/svg%3e");
}

input[type="date"]::-webkit-calendar-picker-indicator:hover,
input[type="time"]::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}

/* Mobile specific adjustments */
@media (max-width: 767px) {
  input[type="date"], input[type="time"] {
    font-size: 16px; /* Prevent zoom on iOS */
    min-height: 56px; /* Larger touch target on mobile */
    padding: 18px 16px;
  }
  
  input[type="date"]::-webkit-calendar-picker-indicator,
  input[type="time"]::-webkit-calendar-picker-indicator {
    width: 24px;
    height: 24px;
    background-size: 24px;
    margin-left: 12px;
  }
}

/* Desktop specific adjustments */
@media (min-width: 768px) {
  input[type="date"], input[type="time"] {
    min-height: 44px;
    padding: 14px 16px;
  }
}

.actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 16px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

@media (min-width: 768px) {
  .actions {
    flex-direction: row;
    align-items: center;
    gap: 20px;
    margin-top: 32px;
    padding-top: 0;
    border-top: none;
  }
}

button {
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 18px 24px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.01em;
  width: 100%;
  min-height: 56px; /* Large touch target for mobile */
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
}

button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s;
}

button:hover {
  background: var(--primary-hover);
  box-shadow: var(--shadow-lg);
  transform: translateY(-1px);
}

button:active {
  transform: translateY(1px);
  box-shadow: var(--shadow-sm);
}

button:hover::before {
  left: 100%;
}

/* Desktop button styling */
@media (min-width: 768px) {
  button {
    width: auto;
    padding: 16px 32px;
    border-radius: 16px;
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    min-height: auto;
  }
  
  button:hover {
    box-shadow: var(--shadow-xl);
    transform: translateY(-2px);
  }
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: var(--shadow-sm);
}

button:disabled::before {
  display: none;
}

.status {
  color: var(--muted-outside);
  min-height: 1.2em;
  font-size: 1rem;
  margin-left: auto;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  white-space: pre-line;
  text-align: right;
  line-height: 1.5;
}

@media (max-width: 767px) {
  .status {
    margin-left: 0;
    text-align: center;
    margin-top: 12px;
  }
}

.status.success { 
  color: var(--success); 
  font-weight: 600; 
  animation: slideInSuccess 0.5s ease-out;
  background: rgba(5, 150, 105, 0.1);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(5, 150, 105, 0.2);
  font-size: 1rem;
  box-shadow: var(--shadow-sm);
}

@media (max-width: 767px) {
  .status.success {
    padding: 20px 16px;
    font-size: 1rem;
    margin-top: 16px;
  }
}

.status.error { 
  color: var(--error); 
  font-weight: 600; 
  animation: slideInError 0.5s ease-out;
}

@keyframes slideInSuccess {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInError {
  from {
    opacity: 0;
    transform: translateX(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

/* Add fade-in animation for the entire form */
form {
  animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Add stagger animation for form fields - disabled on mobile for performance */
@media (min-width: 768px) {
  .field {
    animation: fadeInField 0.6s ease-out both;
  }

  .field:nth-child(1) { animation-delay: 0.1s; }
  .field:nth-child(2) { animation-delay: 0.2s; }
  .field:nth-child(3) { animation-delay: 0.3s; }
  .field:nth-child(4) { animation-delay: 0.4s; }
}

@keyframes fadeInField {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile orientation support */
@media screen and (max-height: 600px) and (orientation: landscape) {
  .container {
    min-height: auto;
    padding: 12px;
    justify-content: flex-start;
  }
  
  form {
    padding: 16px;
  }
  
  section {
    margin: 16px 0 20px;
  }
}

.visually-hidden {
  position: absolute !important;
  height: 1px; width: 1px;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
  white-space: nowrap;
}

.hidden-iframe { display: none; }
    </style>
  </head>
  <body>
    <main class="container" role="main">
      <h1 class="title">Behavior Intervention Team Request for Time Off</h1>
      <p class="description">
        If you need to be out for any amount of time fill out this form. An email will be sent to Rob and Cristal. If you are going to be out less than 24 hours before your start time you must text Rob and Cristal so the schedule can be adjusted.
      </p>

      <form id="timeOffForm" method="POST" action="\${ScriptApp.getService().getUrl()}" enctype="multipart/form-data" novalidate>
        <input type="hidden" name="formName" value="Behavior Intervention Team - Time Off" />
        <input type="hidden" name="__embedded" value="true" />
        <div class="visually-hidden" aria-hidden="true">
          <label for="website">Website</label>
          <input id="website" name="website" type="text" tabindex="-1" autocomplete="off" />
        </div>

        <section aria-labelledby="section-time-off">
          <h2 id="section-time-off">Time Off</h2>

          <div class="field">
            <label for="name">Name<span aria-hidden="true"> *</span></label>
            <input id="name" name="name" type="text" required aria-required="true" autocomplete="name" />
            <p class="hint" id="name-hint"></p>
          </div>

          <div class="field">
            <label for="email">Email<span aria-hidden="true"> *</span></label>
            <input id="email" name="email" type="email" required aria-required="true" autocomplete="email" />
          </div>

          <div class="grid">
            <div class="field">
              <label for="startDate">Start Date<span aria-hidden="true"> *</span></label>
              <input id="startDate" name="startDate" type="date" required aria-required="true" />
            </div>
            <div class="field">
              <label for="startTime">Start Time<span aria-hidden="true"> *</span></label>
              <input id="startTime" name="startTime" type="time" required aria-required="true" />
            </div>
          </div>
        </section>

        <section aria-labelledby="section-end">
          <h2 id="section-end">End</h2>

          <div class="field">
            <label for="description">Description (optional)</label>
            <textarea id="description" name="description" rows="3" placeholder="Any additional context"></textarea>
          </div>

          <div class="grid">
            <div class="field">
              <label for="endDate">End Date<span aria-hidden="true"> *</span></label>
              <input id="endDate" name="endDate" type="date" required aria-required="true" />
            </div>
            <div class="field">
              <label for="endTime">End Time<span aria-hidden="true"> *</span></label>
              <input id="endTime" name="endTime" type="time" required aria-required="true" />
            </div>
          </div>

          <div class="field">
            <label for="absenceType">Absence Type<span aria-hidden="true"> *</span></label>
            <select id="absenceType" name="absenceType" required aria-required="true">
              <option value="" disabled selected>Select one</option>
              <option value="Sick Leave (for yourself)">Sick Leave (for yourself)</option>
              <option value="Personal Necessity (for someone else)">Personal Necessity (for someone else)</option>
              <option value="Bereavement">Bereavement</option>
              <option value="Jury Duty">Jury Duty</option>
              <option value="Industrial Accident">Industrial Accident</option>
              <option value="Vacation">Vacation</option>
              <option value="School Business">School Business</option>
              <option value="Association Leave">Association Leave</option>
              <option value="PN - Urgent Personal Business">PN - Urgent Personal Business</option>
              <option value="Personal Day without Pay">Personal Day without Pay</option>
              <option value="Personal Urgent">Personal Urgent</option>
              <option value="FMLA">FMLA</option>
              <option value="Flex">Flex</option>
            </select>
          </div>

          <div class="field">
            <div class="checkbox-field">
              <input id="frontlineEntry" name="frontlineEntry" type="checkbox" required aria-required="true" />
              <label for="frontlineEntry">I have filled out my Frontline entry for this absence<span aria-hidden="true"> *</span></label>
            </div>
          </div>

          <div class="field">
            <label for="reason">Reason<span aria-hidden="true"> *</span></label>
            <textarea id="reason" name="reason" rows="4" required aria-required="true" placeholder="Brief reason"></textarea>
          </div>

          <div class="field">
            <label for="doctorNote">If you have a doctor's note, you may upload it here</label>
            <input id="doctorNote" name="doctorNote" type="file" accept=".pdf,.png,.jpg,.jpeg,.heic,.heif" />
            <p class="hint">Max 10 MB. Accepted: PDF, PNG, JPG, HEIC.</p>
          </div>
        </section>

        <div class="actions">
          <button id="submitBtn" type="submit">Submit</button>
          <div id="status" role="status" aria-live="polite" class="status"></div>
        </div>

        <input type="hidden" id="formSecret" name="formSecret" />
      </form>
    </main>

    <script>
(() => {
  const form = document.getElementById('timeOffForm');
  const statusEl = document.getElementById('status');
  const submitBtn = document.getElementById('submitBtn');
  const secretInput = document.getElementById('formSecret');

  // 100 Quotes about leaving, being gone, or taking off
  const quotes = [
    "Sometimes you have to step outside, get some air, and remind yourself of who you are and where you want to be.",
    "The hardest part isn't leaving. It's not looking back.",
    "Every exit is an entry somewhere else.",
    "Don't be afraid of change. You may lose something good, but you may gain something better.",
    "Sometimes you need to sit lonely on the floor in a quiet room in order to hear your own voice.",
    "The cave you fear to enter holds the treasure you seek.",
    "Life is about moving on, accepting changes, and looking forward to what makes you stronger.",
    "Sometimes the best thing you can do is walk away.",
    "You can't start the next chapter if you keep re-reading the last one.",
    "Distance doesn't separate people. Silence does.",
    "Sometimes you have to forget what you want to remember what you deserve.",
    "The only way to make sense out of change is to plunge into it, move with it, and join the dance.",
    "Letting go doesn't mean giving up, but rather accepting that there are things that cannot be.",
    "Adventure awaits, but first, coffee... and a plane ticket.",
    "I haven't been everywhere, but it's on my list.",
    "Travel is the only thing you buy that makes you richer.",
    "Not all who wander are lost.",
    "Life is short, and the world is wide.",
    "Adventure is out there, you just have to know where to find it.",
    "Sometimes you need to take a break from everyone and spend time alone.",
    "The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.",
    "To travel is to live.",
    "We travel, initially, to lose ourselves; and we travel, next, to find ourselves.",
    "Sometimes you need to step outside, get some air, and remind yourself of who you are.",
    "The journey not the arrival matters.",
    "A ship in harbor is safe, but that is not what ships are built for.",
    "Sometimes you have to go away to really see where you belong.",
    "The best time to leave is when everyone is asking you to stay.",
    "Sometimes the most productive thing you can do is relax.",
    "Rest when you're weary. Refresh and renew yourself, your body, your mind, your spirit.",
    "Take time to make your soul happy.",
    "Self-care is not a luxury. It's a necessity.",
    "You owe yourself the love that you so freely give to other people.",
    "Sometimes you need to sit lonely on the floor to hear your own voice again.",
    "Take time to breathe. Take time to create. Take time to reflect, take time to let go.",
    "Your only obligation in any lifetime is to be true to yourself.",
    "Sometimes you need to distance yourself to see things clearly.",
    "Taking time off is not a sign of weakness, it's a sign of wisdom.",
    "The time you enjoy wasting is not wasted time.",
    "Rest is not idleness, and to lie sometimes on the grass under trees on a summer's day is not a waste of time.",
    "Almost everything will work again if you unplug it for a few minutes, including you.",
    "Sometimes you need to disconnect to reconnect with what matters most.",
    "In the depth of winter, I finally learned that within me there lay an invincible summer.",
    "You are never too old to set another goal or to dream a new dream.",
    "The secret of change is to focus all of your energy not on fighting the old, but building the new.",
    "Every moment is a fresh beginning.",
    "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    "Be yourself; everyone else is already taken.",
    "The only impossible journey is the one you never begin.",
    "Life isn't about finding yourself. Life is about creating yourself.",
    "Don't wait for opportunity. Create it.",
    "Your life does not get better by chance, it gets better by change.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "The way I see it, if you want the rainbow, you gotta put up with the rain.",
    "Believe you can and you're halfway there.",
    "It does not matter how slowly you go as long as you do not stop.",
    "Sometimes you win, sometimes you learn.",
    "The only way to do great work is to love what you do.",
    "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart.",
    "Life is what happens to you while you're busy making other plans.",
    "The purpose of our lives is to be happy.",
    "Get busy living or get busy dying.",
    "You only live once, but if you do it right, once is enough.",
    "In the end, we will remember not the words of our enemies, but the silence of our friends.",
    "Life is really simple, but we insist on making it complicated.",
    "The unexamined life is not worth living.",
    "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.",
    "Yesterday is history, tomorrow is a mystery, today is a gift.",
    "It is during our darkest moments that we must focus to see the light.",
    "Whoever is happy will make others happy too.",
    "Life is 10% what happens to you and 90% how you react to it.",
    "Time you enjoy wasting is not wasted time.",
    "When one door of happiness closes, another opens.",
    "Life is short. Smile while you still have teeth.",
    "The best revenge is massive success.",
    "Life is like riding a bicycle. To keep your balance, you must keep moving.",
    "You miss 100% of the shots you don't take.",
    "Whether you think you can or you think you can't, you're right.",
    "I have not failed. I've just found 10,000 ways that won't work.",
    "A person who never made a mistake never tried anything new.",
    "The person who says it cannot be done should not interrupt the person who is doing it.",
    "There are no traffic jams along the extra mile.",
    "It is never too late to be what you might have been.",
    "A successful man is one who can lay a firm foundation with the bricks others have thrown at him.",
    "No one can make you feel inferior without your consent.",
    "Strive not to be a success, but rather to be of value.",
    "Two roads diverged in a wood, and I took the one less traveled by, and that made all the difference.",
    "I can't change the direction of the wind, but I can adjust my sails.",
    "The only person you are destined to become is the person you decide to be.",
    "Go confidently in the direction of your dreams.",
    "What we think, we become.",
    "All our dreams can come true if we have the courage to pursue them.",
    "The future belongs to those who prepare for it today.",
    "Don't judge each day by the harvest you reap but by the seeds that you plant.",
    "The best time to plant a tree was 20 years ago. The second best time is now.",
    "A goal is a dream with a deadline.",
    "You are never too old to set another goal or dream a new dream.",
    "The difference between ordinary and extraordinary is that little extra.",
    "Success is not how high you have climbed, but how you make a positive difference to the world.",
    "Don't be afraid to give yourself everything you've ever wanted in life.",
    "Your limitation—it's only your imagination.",
    "Push yourself, because no one else is going to do it for you.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Success doesn't just find you. You have to go out and get it.",
    "The harder you work for something, the greater you'll feel when you achieve it.",
    "Dream bigger. Do bigger.",
    "Don't stop when you're tired. Stop when you're done.",
    "Wake up with determination. Go to bed with satisfaction.",
    "Do something today that your future self will thank you for.",
    "Little things make big days.",
    "It's going to be hard, but hard does not mean impossible.",
    "Don't wait for opportunity. Create it."
  ];

  // Function to get a random quote
  function getRandomQuote() {
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  // Basic runtime validation + keyboard focus management
  function setStatus(msg, type) {
    statusEl.textContent = msg || '';
    statusEl.classList.remove('success', 'error');
    if (type) statusEl.classList.add(type);
  }

  function validateDates() {
    const startDate = form.startDate.value;
    const endDate = form.endDate.value;
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return 'End Date cannot be earlier than Start Date';
    }
    return '';
  }

  function validateTimes() {
    // Optional: Only compare times if same day
    const startDate = form.startDate.value;
    const endDate = form.endDate.value;
    const startTime = form.startTime.value;
    const endTime = form.endTime.value;
    if (startDate && endDate && startDate === endDate && startTime && endTime) {
      const start = new Date(\`\${startDate}T\${startTime}:00\`);
      const end = new Date(\`\${endDate}T\${endTime}:00\`);
      if (end < start) {
        return 'End Time cannot be earlier than Start Time when dates are the same';
      }
    }
    return '';
  }

  function generateSecret() {
    const random = Math.random().toString(36).slice(2) + Date.now().toString(36);
    return random;
  }

  secretInput.value = generateSecret();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setStatus('', '');

    // Honeypot check
    if (form.website && form.website.value) {
      setStatus('Submission blocked.', 'error');
      return;
    }

    // Required fields
    const required = ['name', 'email', 'startDate', 'startTime', 'endDate', 'endTime', 'absenceType', 'frontlineEntry', 'reason'];
    for (const field of required) {
      const el = form[field];
      if (field === 'frontlineEntry') {
        if (!el || !el.checked) {
          el && el.focus();
          setStatus('Please confirm you have filled out your Frontline entry.', 'error');
          return;
        }
      } else {
        if (!el || !el.value) {
          el && el.focus();
          setStatus('Please complete all required fields.', 'error');
          return;
        }
      }
    }

    const dateError = validateDates();
    if (dateError) { setStatus(dateError, 'error'); return; }
    const timeError = validateTimes();
    if (timeError) { setStatus(timeError, 'error'); return; }

    try {
      submitBtn.disabled = true;
      setStatus('Submitting…');

      // Form submits to the Apps Script URL automatically
      // The form will redirect to success page on successful submission
      
    } catch (err) {
      setStatus(\`Submission failed: \${err.message}\`, 'error');
      submitBtn.disabled = false;
    }
  });
})();
    </script>
  </body>
</html>`;
}

function getSuccessHtml() {
  const quotes = [
    "Sometimes you have to step outside, get some air, and remind yourself of who you are and where you want to be.",
    "The hardest part isn't leaving. It's not looking back.",
    "Every exit is an entry somewhere else.",
    "Don't be afraid of change. You may lose something good, but you may gain something better.",
    "Sometimes you need to sit lonely on the floor in a quiet room in order to hear your own voice.",
    "The cave you fear to enter holds the treasure you seek.",
    "Life is about moving on, accepting changes, and looking forward to what makes you stronger.",
    "Sometimes the best thing you can do is walk away.",
    "You can't start the next chapter if you keep re-reading the last one.",
    "Distance doesn't separate people. Silence does.",
    "Sometimes you have to forget what you want to remember what you deserve.",
    "The only way to make sense out of change is to plunge into it, move with it, and join the dance.",
    "Letting go doesn't mean giving up, but rather accepting that there are things that cannot be.",
    "Adventure awaits, but first, coffee... and a plane ticket.",
    "I haven't been everywhere, but it's on my list.",
    "Travel is the only thing you buy that makes you richer.",
    "Not all who wander are lost.",
    "Life is short, and the world is wide.",
    "Adventure is out there, you just have to know where to find it.",
    "Sometimes you need to take a break from everyone and spend time alone."
  ];
  
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Request Submitted Successfully</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        background: #000000;
        color: #ffffff;
        margin: 0;
        padding: 20px;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .container {
        max-width: 600px;
        text-align: center;
        background: rgba(255, 255, 255, 0.98);
        color: #0f172a;
        padding: 40px;
        border-radius: 20px;
        box-shadow: 0 20px 25px -5px rgba(255, 255, 255, 0.1);
      }
      h1 {
        color: #059669;
        font-size: 2rem;
        margin-bottom: 20px;
      }
      .quote {
        font-style: italic;
        font-size: 1.1rem;
        color: #64748b;
        margin: 30px 0;
        line-height: 1.6;
      }
      .message {
        font-size: 1.1rem;
        line-height: 1.6;
        margin-bottom: 30px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>✈️ Time Off Request Submitted!</h1>
      <div class="message">
        Your request has been successfully submitted and logged. You will receive a confirmation email shortly.
      </div>
      <div class="quote">
        "\${randomQuote}"
      </div>
      <p>You may now close this window.</p>
    </div>
  </body>
</html>`;
}


