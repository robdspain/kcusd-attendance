/**
 * Multi-Form System for Google Sites Integration
 * - Card-based landing page for form selection
 * - Modular form architecture
 * - Enhanced email delivery and logging
 * - Self-contained with embedded HTML/CSS/JS
 */

// ======== SHARED CONFIGURATION ========
const SHARED_CONFIG = {
  // Common Google Services
  sheetId: '1WbaeyvFCGdRp67BXxkDYE0JmkJ8QWWmbdAAqv7jxpPI',
  driveFolderId: '1pdc32jn7MVw4D0dMgxptM--Sht7q_f13',
  driveFolderName: 'Form Submissions',
  
  // File upload settings
  maxUploadBytes: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'application/pdf', 'image/png', 'image/jpeg', 'image/heic', 'image/heif'
  ],
  
  // System settings
  allowedOrigin: '*',
  organizationName: 'Behavior Intervention Team',
};

// ======== FORM CONFIGURATIONS ========
const FORMS = {
  'time-off': {
    title: 'Time Off Request',
    description: 'Request time off with automatic email notifications',
    icon: '✈️',
    color: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    sheetName: 'Time Off Responses',
    emailRecipients: [
      'spain-r@kcusd.com',
      'lopez-cr@kcusd.com',
      'muniz-d@kcusd.com',
      'evaristo-a@kcusd.com',
    ],
    enabled: true,
  },
  
  'student-absence': {
    title: 'Student Absence',
    description: 'Report when a student will be out',
    icon: '🎓',
    color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    sheetName: 'Student Absences',
    emailRecipients: [
      'spain-r@kcusd.com',
      'lopez-cr@kcusd.com',
      'muniz-d@kcusd.com',
      'evaristo-a@kcusd.com',
    ],
    enabled: true,
  },
  
  'incident-report': {
    title: 'Incident Report',
    description: 'Report incidents and safety concerns',
    icon: '📋',
    color: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
    sheetName: 'Incident Reports',
    emailRecipients: [
      'spain-r@kcusd.com',
      'lopez-cr@kcusd.com',
    ],
    enabled: false, // Will be implemented later
  },
  
  'field-trip-support': {
    title: 'Field Trip Support Request',
    description: 'Request support for student field trips',
    icon: '🚌',
    color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    sheetName: 'Field Trip Support',
    emailRecipients: [
      'spain-r@kcusd.com',
    ],
    enabled: true,
  },
  
  'equipment-request': {
    title: 'Equipment Request',
    description: 'Request equipment or supplies',
    icon: '🛠️',
    color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    sheetName: 'Equipment Requests',
    emailRecipients: [
      'spain-r@kcusd.com',
    ],
    enabled: false, // Will be implemented later
  },
  
  'meeting-request': {
    title: 'Meeting Request',
    description: 'Schedule team meetings and consultations',
    icon: '👥',
    color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    sheetName: 'Meeting Requests',
    emailRecipients: [
      'spain-r@kcusd.com',
      'lopez-cr@kcusd.com',
    ],
    enabled: false, // Will be implemented later
  }
};

const SUPERVISION_SCHEDULING = [
  {
    title: 'Rob — Individual RBT Supervision',
    description: 'Book individual supervision with Rob.',
    icon: '🧑‍🏫',
    url: 'https://calendly.com/robspain/individual-rbt-supervision-clone',
    color: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
  },
  {
    title: 'Rob — Individual BCBA/BCaBA Supervision',
    description: 'Book individual BCBA or BCaBA supervision with Rob.',
    icon: '📚',
    url: 'https://calendly.com/robspain/individual-bcba-bcaba-supervision',
    color: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
  },
  {
    title: 'Cristal — RBT Supervision',
    description: 'Book individual RBT supervision with Cristal.',
    icon: '🗓️',
    url: 'https://calendly.com/cristal01',
    color: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
  },
];

function doGet(e) {
  const formType = (e && e.parameter && e.parameter.form) ? e.parameter.form : 'landing';
  
  switch (formType) {
    case 'landing':
      return createLandingPage();
    case 'time-off':
      return createTimeOffForm();
    case 'student-absence':
      return createStudentAbsenceForm();
    case 'field-trip-support':
      return createFieldTripSupportForm();
    default:
      return createLandingPage();
  }
}

function doPost(e) {
  try {
    if (!e || !e.parameter) {
      return json({ success: false, message: 'No form data received' });
    }
    
    const formType = e.parameter.formType;
    
    switch (formType) {
      case 'time-off':
        return handleTimeOffSubmission(e);
      case 'student-absence':
        return handleStudentAbsenceSubmission(e);
      case 'field-trip-support':
        return handleFieldTripSupportSubmission(e);
      default:
        return json({ success: false, message: 'Unknown form type' });
    }
  } catch (error) {
    console.error('Form submission error:', error);
    return json({ success: false, message: String(error) });
  }
}

// ======== LANDING PAGE ========
function createLandingPage() {
  const html = HtmlService.createHtmlOutput(getLandingPageHtml())
    .setTitle(`${SHARED_CONFIG.organizationName} - Forms`)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return html;
}

function getLandingPageHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${SHARED_CONFIG.organizationName} - Forms</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
${getSharedStyles()}

/* Landing Page Specific Styles */
.landing-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.header {
  text-align: center;
  margin-bottom: 60px;
}

.header h1 {
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 16px;
  color: var(--text-outside);
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header p {
  font-size: 1.25rem;
  color: var(--muted-outside);
  margin: 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.dashboard-section {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto 48px;
}

.dashboard-section:last-child {
  margin-bottom: 0;
}

.section-title {
  color: var(--text-outside);
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 16px;
  text-align: center;
}

.form-card {
  background: var(--panel);
  border: 2px solid var(--border);
  border-radius: 20px;
  padding: 32px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  text-decoration: none;
  color: inherit;
  display: block;
}

.form-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--card-gradient);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.form-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: var(--border-focus);
}

.form-card:hover::before {
  opacity: 1;
}

.form-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  display: block;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 12px;
  color: var(--text-form);
  letter-spacing: -0.01em;
}

.card-description {
  color: var(--muted-form);
  margin: 0;
  line-height: 1.6;
  font-size: 1rem;
}

.card-status {
  position: absolute;
  top: 16px;
  right: 16px;
  background: var(--success);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-status.coming-soon {
  background: var(--muted-form);
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 2.5rem;
  }
  
  .header p {
    font-size: 1.1rem;
  }
  
  .cards-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .form-card {
    padding: 24px;
  }
}
  </style>
</head>
<body>
  <div class="landing-container">
    <div class="header">
      <h1>${SHARED_CONFIG.organizationName}</h1>
      <p>Select the form you need to complete. All submissions are automatically logged and email notifications are sent to the appropriate team members.</p>
    </div>
    
    <section class="dashboard-section" aria-labelledby="forms-heading">
      <h2 id="forms-heading" class="section-title">Team Forms</h2>
      <div class="cards-grid">
        ${generateFormCards()}
      </div>
    </section>

    <section class="dashboard-section" aria-labelledby="supervision-heading">
      <h2 id="supervision-heading" class="section-title">Supervision Scheduling</h2>
      <div class="cards-grid">
        ${generateSupervisionCards()}
      </div>
    </section>
  </div>

  <script>
    function selectForm(formType) {
      if (formType === 'time-off' || formType === 'student-absence' || formType === 'field-trip-support') {
        window.location.href = '${ScriptApp.getService().getUrl()}?form=' + formType;
      } else {
        alert('This form is coming soon! Currently available: Time Off Request, Student Absence, and Field Trip Support.');
      }
    }
  </script>
</body>
</html>`;
}

function generateFormCards() {
  let cardsHtml = '';
  
  for (const [formKey, form] of Object.entries(FORMS)) {
    const statusClass = form.enabled ? 'available' : 'coming-soon';
    const statusText = form.enabled ? 'Available' : 'Coming Soon';
    const disabledClass = form.enabled ? '' : 'disabled';
    
    cardsHtml += `
      <div class="form-card ${disabledClass}" 
           onclick="selectForm('${formKey}')" 
           style="--card-gradient: ${form.color}">
        <div class="card-status ${statusClass}">${statusText}</div>
        <div class="card-icon">${form.icon}</div>
        <h3 class="card-title">${form.title}</h3>
        <p class="card-description">${form.description}</p>
      </div>
    `;
  }
  
  return cardsHtml;
}

function generateSupervisionCards() {
  return SUPERVISION_SCHEDULING.map((appointment) => `
    <a class="form-card"
       href="${appointment.url}"
       target="_top"
       rel="noopener noreferrer"
       style="--card-gradient: ${appointment.color}">
      <div class="card-status available">Schedule</div>
      <div class="card-icon">${appointment.icon}</div>
      <h3 class="card-title">${appointment.title}</h3>
      <p class="card-description">${appointment.description}</p>
    </a>
  `).join('');
}

// ======== TIME OFF FORM MODULE ========
function createTimeOffForm() {
  const html = HtmlService.createHtmlOutput(getTimeOffFormHtml())
    .setTitle('Time Off Request')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return html;
}

function getTimeOffFormHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Time Off Request</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
${getSharedStyles()}

/* Form specific styles */
.form-container {
  max-width: 840px;
  margin: 0 auto;
  padding: 16px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-outside);
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 20px;
  padding: 8px 16px;
  border-radius: 12px;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--border);
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-4px);
}

.form-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--text-outside);
  letter-spacing: -0.02em;
  text-align: center;
  line-height: 1.2;
}

.form-description {
  color: var(--muted-outside);
  margin: 0 0 32px;
  font-size: 1rem;
  line-height: 1.6;
  text-align: center;
}

@media (min-width: 768px) {
  .form-container {
    padding: 32px 24px;
    margin: 40px auto;
  }
  
  .form-title {
    font-size: 2.25rem;
    text-align: left;
  }
  
  .form-description {
    font-size: 1rem;
    text-align: left;
  }
}
  </style>
</head>
<body>
  <div class="form-container">
    <a href="${ScriptApp.getService().getUrl()}" class="back-button">
      ← Back to Forms
    </a>
    
    <h1 class="form-title">Time Off Request</h1>
    <p class="form-description">
      If you need to be out for any amount of time fill out this form. An email will be sent to Rob and Cristal. If you are going to be out less than 24 hours before your start time you must text Rob and Cristal so the schedule can be adjusted.
    </p>

    ${getTimeOffFormContent()}
  </div>

  <script>
${getTimeOffFormScript()}
  </script>
</body>
</html>`;
}

function handleTimeOffSubmission(e) {
  const headers = {
    'Access-Control-Allow-Origin': SHARED_CONFIG.allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  const result = submitTimeOffForm(e && e.parameter, e && e.files && e.files['doctorNote']);

  if (e && e.parameter && e.parameter.__embedded && result.success) {
    return HtmlService.createHtmlOutput(getSuccessHtml('Time Off Request'))
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  return json(result, headers);
}

// Called from the HTML-service form through google.script.run. Passing the form
// element to Apps Script converts its file input into a Blob automatically.
function submitTimeOffForm(form, uploadedFile) {
  if (!form) {
    return { success: false, message: 'No form data received' };
  }
  uploadedFile = uploadedFile || form.doctorNote;

  // Honeypot check
  if (form.website) {
    return { success: true, message: 'Ignored' };
  }

  const formConfig = FORMS['time-off'];
  
  // Validate required fields
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
  const formSecret = (form.formSecret || '').trim();

  if (!name || !email || !startDate || !startTime || !endDate || !endTime || !absenceType || form.frontlineEntry !== 'on' || !reason) {
    return { success: false, message: 'Missing required fields' };
  }

  const sheet = getOrCreateSheet(SHARED_CONFIG.sheetId, formConfig.sheetName);
  const timestamp = new Date();

  // Handle file upload
  let fileLink = '';
  let attachmentBlob = null;
  if (uploadedFile) {
    const file = uploadedFile;
    const sizeBytes = (file && file.getBytes) ? file.getBytes().length : 0;
    const contentType = (file && file.getContentType) ? file.getContentType() : '';
    
    // Check for empty file
    if (sizeBytes === 0) {
      return { success: false, message: 'Cannot upload empty file' };
    }
    
    if (sizeBytes > SHARED_CONFIG.maxUploadBytes) {
      return { success: false, message: 'File too large (max 10MB)' };
    }
    
    if (!contentType || SHARED_CONFIG.allowedMimeTypes.indexOf(contentType) === -1) {
      return { success: false, message: 'Unsupported file type. Please upload PDF, PNG, JPG, or HEIC files.' };
    }
    
    attachmentBlob = file;
    
    try {
      const driveFile = saveFileToDrive(file, name, timestamp);
      fileLink = driveFile.getUrl();
    } catch (error) {
      console.error('Error saving file to Drive:', error);
      return { success: false, message: 'Failed to save file to Drive: ' + error.message };
    }
  }

  // Save to sheet
  const row = [
    Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss'),
    'Time Off Request', // Form Type
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

  // Send emails
  const emailResult = sendFormEmails({
    type: 'Time Off Request',
    recipients: formConfig.emailRecipients,
    data: { name, email, startDate, startTime, endDate, endTime, absenceType, frontlineEntry, reason, description, fileLink },
    attachmentBlob,
    timestamp
  });

  return { success: true };
}

// ======== SHARED UTILITIES ========
function getSharedStyles() {
  return `
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
  `;
}

function json(obj, headers) {
  const out = ContentService.createTextOutput(JSON.stringify(obj));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}

function getOrCreateSheet(sheetId, sheetName) {
  const ss = SpreadsheetApp.openById(sheetId);
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    // Create headers based on form type
    if (sheetName.includes('Time Off')) {
      sheet.appendRow([
        'Timestamp', 'Form Type', 'Name', 'Email', 'Start Date', 'Start Time', 'End Date', 'End Time', 'Absence Type', 'Frontline Entry', 'Reason', 'Description', 'Document Link', 'Form Secret'
      ]);
    } else if (sheetName.includes('Student')) {
      sheet.appendRow([
        'Timestamp', 'Form Type', 'Student Name', 'Start Date', 'Start Time', 'End Date', 'End Time', 'Reason', 'Description', 'Form Secret'
      ]);
    } else if (sheetName.includes('Field Trip')) {
      sheet.appendRow([
        'Timestamp', 'Form Type', 'Student Name', 'Current Support Times', 'Field Trip Date', 'Start Time', 'End Time', 'Nature of Trip', 'Location', 'Parents Attending', 'Staff Count', 'Form Secret'
      ]);
    } else {
      // Generic headers for other forms
      sheet.appendRow([
        'Timestamp', 'Form Type', 'Data', 'Form Secret'
      ]);
    }
  }
  return sheet;
}

function saveFileToDrive(fileBlob, submitterName, timestamp) {
  // Implementation from original code
  let folder = getOrCreateDriveFolder();
  
  const originalName = fileBlob.getName() || 'document';
  const extension = originalName.substring(originalName.lastIndexOf('.')) || '';
  const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
  const dateStr = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const fileName = `${dateStr}_${submitterName}_${baseName}${extension}`;
  
  const driveFile = folder.createFile(fileBlob.setName(fileName));
  driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  return driveFile;
}

function getOrCreateDriveFolder() {
  try {
    if (SHARED_CONFIG.driveFolderId && SHARED_CONFIG.driveFolderId !== 'PUT_YOUR_DRIVE_FOLDER_ID_HERE') {
      try {
        return DriveApp.getFolderById(SHARED_CONFIG.driveFolderId);
      } catch (err) {
        console.log('Could not find folder by ID, will search by name or create new one');
      }
    }
    
    const folders = DriveApp.getFoldersByName(SHARED_CONFIG.driveFolderName);
    if (folders.hasNext()) {
      return folders.next();
    }
    
    const newFolder = DriveApp.createFolder(SHARED_CONFIG.driveFolderName);
    console.log(`Created new Drive folder: ${SHARED_CONFIG.driveFolderName} (ID: ${newFolder.getId()})`);
    
    return newFolder;
  } catch (error) {
    console.error('Error in getOrCreateDriveFolder:', error);
    throw error;
  }
}

function sendFormEmails({ type, recipients, data, attachmentBlob, timestamp }) {
  const subject = `[${type}] ${data.name} — ${data.startDate} ${data.startTime} → ${data.endDate} ${data.endTime}`;
  const body = [
    `${type} submission`,
    '',
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Start: ${data.startDate} ${data.startTime}`,
    `End: ${data.endDate} ${data.endTime}`,
    `Absence Type: ${data.absenceType}`,
    `Frontline Entry Completed: ${data.frontlineEntry}`,
    `Reason: ${data.reason}`,
    data.description ? `Description: ${data.description}` : null,
    data.fileLink ? `Document: ${data.fileLink}` : null,
    '',
    `Logged at: ${Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss')}`,
  ].filter(Boolean).join('\n');

  const options = { name: `${type} System` };
  if (attachmentBlob) {
    options.attachments = [attachmentBlob];
  }

  let emailErrors = [];
  
  recipients.forEach(recipient => {
    try {
      MailApp.sendEmail(recipient, subject, body, options);
      console.log(`Email sent successfully to: ${recipient}`);
    } catch (err) {
      console.error(`Failed to send email to ${recipient}:`, err);
      emailErrors.push(`${recipient}: ${err.message}`);
    }
  });

  if (emailErrors.length > 0) {
    console.warn(`Email delivery issues: ${emailErrors.length}/${recipients.length} failed`);
  } else {
    console.log(`All emails sent successfully to ${recipients.length} recipients`);
  }

  return { success: emailErrors.length === 0, errors: emailErrors };
}

function getSuccessHtml(formType) {
  const quotes = [
    "Sometimes you have to step outside, get some air, and remind yourself of who you are and where you want to be.",
    "The hardest part isn't leaving. It's not looking back.",
    "Every exit is an entry somewhere else.",
    "Adventure awaits, but first, coffee... and a plane ticket.",
    "Taking time off is not a sign of weakness, it's a sign of wisdom.",
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
    .back-link {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
      color: white;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 600;
      transition: all 0.2s ease;
    }
    .back-link:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>✈️ ${formType.replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;')} Submitted!</h1>
    <div class="message">
      Your request has been successfully submitted and logged. You will receive a confirmation email shortly.
    </div>
    <div class="quote">
      "${randomQuote.replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}"
    </div>
    <a href="${ScriptApp.getService().getUrl()}" class="back-link">
      Return to Forms
    </a>
  </div>
</body>
</html>`;
}

// ======== TIME OFF FORM CONTENT ========
function getTimeOffFormContent() {
  return `
    <form id="timeOffForm" method="POST" action="${ScriptApp.getService().getUrl()}" enctype="multipart/form-data" novalidate style="
      background: var(--panel) !important;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1.5px solid var(--border) !important;
      border-radius: 16px;
      padding: 32px;
      box-shadow: var(--shadow-lg);
      position: relative;
      overflow: hidden;
      width: 100%;
      margin: 0;
    ">
      <input type="hidden" name="formType" value="time-off" />
      <input type="hidden" name="__embedded" value="true" />
      <div style="position: absolute !important; height: 1px; width: 1px; overflow: hidden; clip: rect(1px, 1px, 1px, 1px); white-space: nowrap;" aria-hidden="true">
        <label for="website">Website</label>
        <input id="website" name="website" type="text" tabindex="-1" autocomplete="off" />
      </div>

      <section aria-labelledby="section-time-off" style="margin: 20px 0 24px; position: relative;">
        <h2 id="section-time-off" style="font-size: 1.375rem; margin: 0 0 16px; color: var(--text-form); font-weight: 700; letter-spacing: -0.01em; text-align: center;">Time Off</h2>

        <div style="display: flex; flex-direction: column; gap: 10px; position: relative; margin-bottom: 16px;">
          <label for="name" style="font-weight: 600; color: var(--text-form); font-size: 1rem; letter-spacing: 0.01em; margin-bottom: 4px;">Name<span aria-hidden="true"> *</span></label>
          <input id="name" name="name" type="text" required aria-required="true" autocomplete="name" style="width: 100%; padding: 16px; color: var(--text-form) !important; background: var(--panel) !important; border: 2px solid var(--border) !important; border-radius: 12px; outline: none; transition: all 0.2s ease; font-size: 16px; font-weight: 500; box-shadow: var(--shadow-sm); position: relative; min-height: 44px;" />
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; position: relative; margin-bottom: 16px;">
          <label for="email" style="font-weight: 600; color: var(--text-form); font-size: 1rem; letter-spacing: 0.01em; margin-bottom: 4px;">Email<span aria-hidden="true"> *</span></label>
          <input id="email" name="email" type="email" required aria-required="true" autocomplete="email" style="width: 100%; padding: 16px; color: var(--text-form) !important; background: var(--panel) !important; border: 2px solid var(--border) !important; border-radius: 12px; outline: none; transition: all 0.2s ease; font-size: 16px; font-weight: 500; box-shadow: var(--shadow-sm); position: relative; min-height: 44px;" />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 16px;">
          <div style="display: flex; flex-direction: column; gap: 10px; position: relative;">
            <label for="startDate" style="font-weight: 600; color: var(--text-form); font-size: 1rem; letter-spacing: 0.01em; margin-bottom: 4px;">Start Date<span aria-hidden="true"> *</span></label>
            <input id="startDate" name="startDate" type="date" required aria-required="true" style="width: 100%; padding: 16px; color: var(--text-form) !important; background: var(--panel) !important; border: 2px solid var(--border) !important; border-radius: 12px; outline: none; transition: all 0.2s ease; font-size: 16px; font-weight: 500; box-shadow: var(--shadow-sm); position: relative; min-height: 44px; cursor: pointer;" />
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px; position: relative;">
            <label for="startTime" style="font-weight: 600; color: var(--text-form); font-size: 1rem; letter-spacing: 0.01em; margin-bottom: 4px;">Start Time<span aria-hidden="true"> *</span></label>
            <input id="startTime" name="startTime" type="time" required aria-required="true" style="width: 100%; padding: 16px; color: var(--text-form) !important; background: var(--panel) !important; border: 2px solid var(--border) !important; border-radius: 12px; outline: none; transition: all 0.2s ease; font-size: 16px; font-weight: 500; box-shadow: var(--shadow-sm); position: relative; min-height: 44px; cursor: pointer;" />
          </div>
        </div>
      </section>

      <section aria-labelledby="section-end" style="margin: 20px 0 24px; position: relative;">
        <h2 id="section-end" style="font-size: 1.375rem; margin: 0 0 16px; color: var(--text-form); font-weight: 700; letter-spacing: -0.01em; text-align: center;">End</h2>

        <div style="display: flex; flex-direction: column; gap: 10px; position: relative; margin-bottom: 16px;">
          <label for="description" style="font-weight: 600; color: var(--text-form); font-size: 1rem; letter-spacing: 0.01em; margin-bottom: 4px;">Description (optional)</label>
          <textarea id="description" name="description" rows="3" placeholder="Any additional context" style="width: 100%; padding: 16px; color: var(--text-form) !important; background: var(--panel) !important; border: 2px solid var(--border) !important; border-radius: 12px; outline: none; transition: all 0.2s ease; font-size: 16px; font-weight: 500; box-shadow: var(--shadow-sm); resize: vertical; min-height: 120px; line-height: 1.6; font-family: inherit;"></textarea>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 16px;">
          <div style="display: flex; flex-direction: column; gap: 10px; position: relative;">
            <label for="endDate" style="font-weight: 600; color: var(--text-form); font-size: 1rem; letter-spacing: 0.01em; margin-bottom: 4px;">End Date<span aria-hidden="true"> *</span></label>
            <input id="endDate" name="endDate" type="date" required aria-required="true" style="width: 100%; padding: 16px; color: var(--text-form) !important; background: var(--panel) !important; border: 2px solid var(--border) !important; border-radius: 12px; outline: none; transition: all 0.2s ease; font-size: 16px; font-weight: 500; box-shadow: var(--shadow-sm); position: relative; min-height: 44px; cursor: pointer;" />
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px; position: relative;">
            <label for="endTime" style="font-weight: 600; color: var(--text-form); font-size: 1rem; letter-spacing: 0.01em; margin-bottom: 4px;">End Time<span aria-hidden="true"> *</span></label>
            <input id="endTime" name="endTime" type="time" required aria-required="true" style="width: 100%; padding: 16px; color: var(--text-form) !important; background: var(--panel) !important; border: 2px solid var(--border) !important; border-radius: 12px; outline: none; transition: all 0.2s ease; font-size: 16px; font-weight: 500; box-shadow: var(--shadow-sm); position: relative; min-height: 44px; cursor: pointer;" />
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; position: relative; margin-bottom: 16px;">
          <label for="absenceType" style="font-weight: 600; color: var(--text-form); font-size: 1rem; letter-spacing: 0.01em; margin-bottom: 4px;">Absence Type<span aria-hidden="true"> *</span></label>
          <select id="absenceType" name="absenceType" required aria-required="true" style="width: 100%; padding: 16px; color: var(--text-form) !important; background: var(--panel) !important; border: 2px solid var(--border) !important; border-radius: 12px; outline: none; transition: all 0.2s ease; font-size: 16px; font-weight: 500; box-shadow: var(--shadow-sm); position: relative; min-height: 44px; cursor: pointer;">
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

        <div style="display: flex; flex-direction: column; gap: 10px; position: relative; margin-bottom: 16px;">
          <div style="display: flex; align-items: flex-start; gap: 12px; padding: 16px; background: rgba(59, 130, 246, 0.05); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 12px; margin: 8px 0;">
            <input id="frontlineEntry" name="frontlineEntry" type="checkbox" required aria-required="true" style="width: 20px; height: 20px; min-width: 20px; margin: 2px 0 0 0; cursor: pointer;" />
            <label for="frontlineEntry" style="flex: 1; font-size: 1rem; font-weight: 600; color: var(--text-form); cursor: pointer; line-height: 1.5; margin-bottom: 0;">I have filled out my Frontline entry for this absence<span aria-hidden="true"> *</span></label>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; position: relative; margin-bottom: 16px;">
          <label for="reason" style="font-weight: 600; color: var(--text-form); font-size: 1rem; letter-spacing: 0.01em; margin-bottom: 4px;">Reason<span aria-hidden="true"> *</span></label>
          <textarea id="reason" name="reason" rows="4" required aria-required="true" placeholder="Brief reason" style="width: 100%; padding: 16px; color: var(--text-form) !important; background: var(--panel) !important; border: 2px solid var(--border) !important; border-radius: 12px; outline: none; transition: all 0.2s ease; font-size: 16px; font-weight: 500; box-shadow: var(--shadow-sm); resize: vertical; min-height: 120px; line-height: 1.6; font-family: inherit;"></textarea>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; position: relative; margin-bottom: 16px;">
          <label for="doctorNote" style="font-weight: 600; color: var(--text-form); font-size: 1rem; letter-spacing: 0.01em; margin-bottom: 4px;">If you have a doctor's note, you may upload it here</label>
          <input id="doctorNote" name="doctorNote" type="file" accept=".pdf,.png,.jpg,.jpeg,.heic,.heif" style="width: 100%; padding: 16px; color: var(--text-form) !important; background: var(--panel) !important; border: 2px solid var(--border) !important; border-radius: 12px; outline: none; transition: all 0.2s ease; font-size: 16px; font-weight: 500; box-shadow: var(--shadow-sm); position: relative; min-height: 44px;" />
          <p style="color: var(--muted-form); margin: 0; font-size: 0.95rem; line-height: 1.5;">Max 10 MB. Accepted: PDF, PNG, JPG, HEIC.</p>
        </div>
      </section>

      <div style="display: flex; flex-direction: column; align-items: stretch; gap: 16px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border);">
        <button id="submitBtn" type="submit" style="background: var(--primary); color: white; border: none; border-radius: 12px; padding: 18px 24px; font-weight: 700; font-size: 16px; cursor: pointer; box-shadow: var(--shadow-md); transition: all 0.2s ease; width: 100%; min-height: 56px; display: flex; align-items: center; justify-content: center;">Submit Request</button>
        <div id="status" role="status" aria-live="polite" style="color: var(--muted-outside); min-height: 1.2em; font-size: 1rem; font-weight: 500; display: flex; align-items: center; gap: 8px; transition: all 0.3s ease; white-space: pre-line; text-align: center; line-height: 1.5;"></div>
      </div>
      
      <input type="hidden" id="formSecret" name="formSecret" />
    </form>
  `;
}

// ======== STUDENT ABSENCE FORM MODULE ========
function createStudentAbsenceForm() {
  const html = HtmlService.createHtmlOutput(getStudentAbsenceFormHtml())
    .setTitle('Student Absence Report')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return html;
}

function getStudentAbsenceFormHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Student Absence Report</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
${getSharedStyles()}

/* Form specific styles */
.form-container {
  max-width: 840px;
  margin: 0 auto;
  padding: 16px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-outside);
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 20px;
  padding: 8px 16px;
  border-radius: 12px;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--border);
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-4px);
}

.form-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--text-outside);
  letter-spacing: -0.02em;
  text-align: center;
  line-height: 1.2;
}

.form-description {
  color: var(--muted-outside);
  margin: 0 0 32px;
  font-size: 1rem;
  line-height: 1.6;
  text-align: center;
}

@media (min-width: 768px) {
  .form-container {
    padding: 32px 24px;
    margin: 40px auto;
  }
  
  .form-title {
    font-size: 2.25rem;
    text-align: left;
  }
  
  .form-description {
    font-size: 1rem;
    text-align: left;
  }
}
  </style>
</head>
<body>
  <div class="form-container">
    <a href="${ScriptApp.getService().getUrl()}" class="back-button">
      ← Back to Forms
    </a>
    
    <h1 class="form-title">Student Absence Report</h1>
    <p class="form-description">
      If you know that a student will be out please input the information into this form. This form is automatically collecting emails from all respondents.
    </p>

    ${getStudentAbsenceFormContent()}
  </div>

  <script>
${getStudentAbsenceFormScript()}
  </script>
</body>
</html>`;
}

function getStudentAbsenceFormContent() {
  return `
    <form id="studentAbsenceForm" method="POST" action="${ScriptApp.getService().getUrl()}" enctype="multipart/form-data" novalidate style="
      background: var(--panel) !important;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1.5px solid var(--border) !important;
      border-radius: 16px;
      padding: 32px;
      box-shadow: var(--shadow-lg);
      position: relative;
      overflow: hidden;
      width: 100%;
      margin: 0;
    ">
      <input type="hidden" name="formType" value="student-absence" />
      <input type="hidden" name="__embedded" value="true" />
      <div style="position: absolute !important; height: 1px; width: 1px; overflow: hidden; clip: rect(1px, 1px, 1px, 1px); white-space: nowrap;" aria-hidden="true">
        <label for="website">Website</label>
        <input id="website" name="website" type="text" tabindex="-1" autocomplete="off" />
      </div>

      <section aria-labelledby="section-student-out" style="margin: 20px 0 24px; position: relative;">
        <h2 id="section-student-out" style="font-size: 1.375rem; margin: 0 0 16px; color: var(--text-form); font-weight: 700; letter-spacing: -0.01em; text-align: center;">Student Out</h2>

        <div style="display: flex; flex-direction: column; gap: 10px; position: relative; margin-bottom: 16px;">
          <label for="studentName" style="font-weight: 600; color: var(--text-form); font-size: 1rem; letter-spacing: 0.01em; margin-bottom: 4px;">Student Name<span aria-hidden="true"> *</span></label>
          <input id="studentName" name="studentName" type="text" required aria-required="true" autocomplete="name" style="width: 100%; padding: 16px; color: var(--text-form) !important; background: var(--panel) !important; border: 2px solid var(--border) !important; border-radius: 12px; outline: none; transition: all 0.2s ease; font-size: 16px; font-weight: 500; box-shadow: var(--shadow-sm); position: relative; min-height: 44px;" />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 16px;">
          <div style="display: flex; flex-direction: column; gap: 10px; position: relative;">
            <label for="startDate" style="font-weight: 600; color: var(--text-form); font-size: 1rem; letter-spacing: 0.01em; margin-bottom: 4px;">Start Date<span aria-hidden="true"> *</span></label>
            <input id="startDate" name="startDate" type="date" required aria-required="true" style="width: 100%; padding: 16px; color: var(--text-form) !important; background: var(--panel) !important; border: 2px solid var(--border) !important; border-radius: 12px; outline: none; transition: all 0.2s ease; font-size: 16px; font-weight: 500; box-shadow: var(--shadow-sm); position: relative; min-height: 44px; cursor: pointer;" />
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px; position: relative;">
            <label for="startTime" style="font-weight: 600; color: var(--text-form); font-size: 1rem; letter-spacing: 0.01em; margin-bottom: 4px;">Start Time<span aria-hidden="true"> *</span></label>
            <input id="startTime" name="startTime" type="time" required aria-required="true" style="width: 100%; padding: 16px; color: var(--text-form) !important; background: var(--panel) !important; border: 2px solid var(--border) !important; border-radius: 12px; outline: none; transition: all 0.2s ease; font-size: 16px; font-weight: 500; box-shadow: var(--shadow-sm); position: relative; min-height: 44px; cursor: pointer;" />
          </div>
        </div>
      </section>

      <section aria-labelledby="section-end" style="margin: 20px 0 24px; position: relative;">
        <h2 id="section-end" style="font-size: 1.375rem; margin: 0 0 16px; color: var(--text-form); font-weight: 700; letter-spacing: -0.01em; text-align: center;">End</h2>

        <div style="display: flex; flex-direction: column; gap: 10px; position: relative; margin-bottom: 16px;">
          <label for="description" style="font-weight: 600; color: var(--text-form); font-size: 1rem; letter-spacing: 0.01em; margin-bottom: 4px;">Description (optional)</label>
          <textarea id="description" name="description" rows="3" placeholder="Any additional context" style="width: 100%; padding: 16px; color: var(--text-form) !important; background: var(--panel) !important; border: 2px solid var(--border) !important; border-radius: 12px; outline: none; transition: all 0.2s ease; font-size: 16px; font-weight: 500; box-shadow: var(--shadow-sm); resize: vertical; min-height: 120px; line-height: 1.6; font-family: inherit;"></textarea>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 16px;">
          <div style="display: flex; flex-direction: column; gap: 10px; position: relative;">
            <label for="endDate" style="font-weight: 600; color: var(--text-form); font-size: 1rem; letter-spacing: 0.01em; margin-bottom: 4px;">End Date<span aria-hidden="true"> *</span></label>
            <input id="endDate" name="endDate" type="date" required aria-required="true" style="width: 100%; padding: 16px; color: var(--text-form) !important; background: var(--panel) !important; border: 2px solid var(--border) !important; border-radius: 12px; outline: none; transition: all 0.2s ease; font-size: 16px; font-weight: 500; box-shadow: var(--shadow-sm); position: relative; min-height: 44px; cursor: pointer;" />
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px; position: relative;">
            <label for="endTime" style="font-weight: 600; color: var(--text-form); font-size: 1rem; letter-spacing: 0.01em; margin-bottom: 4px;">End Time<span aria-hidden="true"> *</span></label>
            <input id="endTime" name="endTime" type="time" required aria-required="true" style="width: 100%; padding: 16px; color: var(--text-form) !important; background: var(--panel) !important; border: 2px solid var(--border) !important; border-radius: 12px; outline: none; transition: all 0.2s ease; font-size: 16px; font-weight: 500; box-shadow: var(--shadow-sm); position: relative; min-height: 44px; cursor: pointer;" />
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; position: relative; margin-bottom: 16px;">
          <label for="reason" style="font-weight: 600; color: var(--text-form); font-size: 1rem; letter-spacing: 0.01em; margin-bottom: 4px;">Reason<span aria-hidden="true"> *</span></label>
          <textarea id="reason" name="reason" rows="4" required aria-required="true" placeholder="Brief reason for absence" style="width: 100%; padding: 16px; color: var(--text-form) !important; background: var(--panel) !important; border: 2px solid var(--border) !important; border-radius: 12px; outline: none; transition: all 0.2s ease; font-size: 16px; font-weight: 500; box-shadow: var(--shadow-sm); resize: vertical; min-height: 120px; line-height: 1.6; font-family: inherit;"></textarea>
        </div>
      </section>

      <div style="display: flex; flex-direction: column; align-items: stretch; gap: 16px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border);">
        <button id="submitBtn" type="submit" style="background: var(--primary); color: white; border: none; border-radius: 12px; padding: 18px 24px; font-weight: 700; font-size: 16px; cursor: pointer; box-shadow: var(--shadow-md); transition: all 0.2s ease; width: 100%; min-height: 56px; display: flex; align-items: center; justify-content: center;">Submit Report</button>
        <div id="status" role="status" aria-live="polite" style="color: var(--muted-outside); min-height: 1.2em; font-size: 1rem; font-weight: 500; display: flex; align-items: center; gap: 8px; transition: all 0.3s ease; white-space: pre-line; text-align: center; line-height: 1.5;"></div>
      </div>
      
      <input type="hidden" id="formSecret" name="formSecret" />
    </form>
  `;
}

function handleStudentAbsenceSubmission(e) {
  const headers = {
    'Access-Control-Allow-Origin': SHARED_CONFIG.allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  const result = submitStudentAbsenceForm(e && e.parameter);

  if (e && e.parameter && e.parameter.__embedded && result.success) {
    return HtmlService.createHtmlOutput(getSuccessHtml('Student Absence Report'))
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  return json(result, headers);
}

function submitStudentAbsenceForm(form) {
  if (!form) {
    return { success: false, message: 'No form data received' };
  }

  // Honeypot check
  if (form.website) {
    return { success: true, message: 'Ignored' };
  }

  const formConfig = FORMS['student-absence'];
  
  // Validate required fields
  const studentName = (form.studentName || '').trim();
  const startDate = (form.startDate || '').trim();
  const startTime = (form.startTime || '').trim();
  const endDate = (form.endDate || '').trim();
  const endTime = (form.endTime || '').trim();
  const reason = (form.reason || '').trim();
  const description = (form.description || '').trim();
  const formSecret = (form.formSecret || '').trim();

  if (!studentName || !startDate || !startTime || !endDate || !endTime || !reason) {
    return { success: false, message: 'Missing required fields' };
  }

  const sheet = getOrCreateSheet(SHARED_CONFIG.sheetId, formConfig.sheetName);
  const timestamp = new Date();

  // Save to sheet
  const row = [
    Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss'),
    'Student Absence', // Form Type
    studentName,
    startDate,
    startTime,
    endDate,
    endTime,
    reason,
    description,
    formSecret,
  ];
  sheet.appendRow(row);

  // Send emails
  const emailResult = sendStudentAbsenceEmails({
    type: 'Student Absence',
    recipients: formConfig.emailRecipients,
    data: { studentName, startDate, startTime, endDate, endTime, reason, description },
    timestamp
  });

  return { success: true };
}

function sendStudentAbsenceEmails({ type, recipients, data, timestamp }) {
  const subject = `[${type}] ${data.studentName} — ${data.startDate} ${data.startTime} → ${data.endDate} ${data.endTime}`;
  const body = [
    `${type} submission`,
    '',
    `Student Name: ${data.studentName}`,
    `Start: ${data.startDate} ${data.startTime}`,
    `End: ${data.endDate} ${data.endTime}`,
    `Reason: ${data.reason}`,
    data.description ? `Description: ${data.description}` : null,
    '',
    `Logged at: ${Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss')}`,
  ].filter(Boolean).join('\n');

  const options = { name: `${type} System` };

  let emailErrors = [];
  
  recipients.forEach(recipient => {
    try {
      MailApp.sendEmail(recipient, subject, body, options);
      console.log(`Email sent successfully to: ${recipient}`);
    } catch (err) {
      console.error(`Failed to send email to ${recipient}:`, err);
      emailErrors.push(`${recipient}: ${err.message}`);
    }
  });

  if (emailErrors.length > 0) {
    console.warn(`Email delivery issues: ${emailErrors.length}/${recipients.length} failed`);
  } else {
    console.log(`All emails sent successfully to ${recipients.length} recipients`);
  }

  return { success: emailErrors.length === 0, errors: emailErrors };
}

// ======== FIELD TRIP SUPPORT FORM MODULE ========
function createFieldTripSupportForm() {
  const html = HtmlService.createHtmlOutput(getFieldTripSupportFormHtml())
    .setTitle('Field Trip Support Request')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return html;
}

function getFieldTripSupportFormHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Field Trip Support Request</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
${getSharedStyles()}

/* Form specific styles */
.form-container {
  max-width: 840px;
  margin: 0 auto;
  padding: 16px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-outside);
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 20px;
  padding: 8px 16px;
  border-radius: 12px;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--border);
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-4px);
}

.form-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--text-outside);
  letter-spacing: -0.02em;
  text-align: center;
  line-height: 1.2;
}

.form-description {
  color: var(--muted-outside);
  margin: 0 0 32px;
  font-size: 1rem;
  line-height: 1.6;
  text-align: center;
}

@media (min-width: 768px) {
  .form-container {
    padding: 32px 24px;
    margin: 40px auto;
  }
  
  .form-title {
    font-size: 2.25rem;
    text-align: left;
  }
  
  .form-description {
    font-size: 1rem;
    text-align: left;
  }
}
  </style>
</head>
<body>
  <div class="form-container">
    <a href="${ScriptApp.getService().getUrl()}" class="back-button">
      ← Back to Forms
    </a>
    
    <h1 class="form-title">Field Trip Support Request</h1>
    <p class="form-description">
      If a student you currently provide support for is going on a field trip and teachers/admin are requesting support, please fill out this form.
    </p>

    ${getFieldTripSupportFormContent()}
  </div>

  <script>
${getFieldTripSupportFormScript()}
  </script>
</body>
</html>`;
}

function getFieldTripSupportFormContent() {
  return `
    <form id="fieldTripSupportForm" method="POST" action="${ScriptApp.getService().getUrl()}" enctype="multipart/form-data" novalidate style="
      background: var(--panel) !important;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1.5px solid var(--border) !important;
      border-radius: 16px;
      padding: 32px;
      box-shadow: var(--shadow-lg);
      position: relative;
      overflow: hidden;
      width: 100%;
      margin: 0;
    ">
      <input type="hidden" name="formType" value="field-trip-support" />
      <input type="hidden" name="__embedded" value="true" />
      <div style="position: absolute !important; height: 1px; width: 1px; overflow: hidden; clip: rect(1px, 1px, 1px, 1px); white-space: nowrap;" aria-hidden="true">
        <label for="website">Website</label>
        <input id="website" name="website" type="text" tabindex="-1" autocomplete="off" />
      </div>

      <section style="margin: 20px 0 24px; position: relative;">
        <div style="display: flex; flex-direction: column; gap: 10px; position: relative; margin-bottom: 16px;">
          <label for="studentName" style="font-weight: 600; color: var(--text-form); font-size: 1rem; letter-spacing: 0.01em; margin-bottom: 4px;">Student name<span aria-hidden="true"> *</span></label>
          <input id="studentName" name="studentName" type="text" required aria-required="true" autocomplete="name" style="width: 100%; padding: 16px; color: var(--text-form) !important; background: var(--panel) !important; border: 2px solid var(--border) !important; border-radius: 12px; outline: none; transition: all 0.2s ease; font-size: 16px; font-weight: 500; box-shadow: var(--shadow-sm); position: relative; min-height: 44px;" />
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; position: relative; margin-bottom: 16px;">
          <label for="currentSupportTimes" style="font-weight: 600; color: var(--text-form); font-size: 1rem; letter-spacing: 0.01em; margin-bottom: 4px;">Current support times<span aria-hidden="true"> *</span></label>
          <textarea id="currentSupportTimes" name="currentSupportTimes" rows="3" required aria-required="true" placeholder="e.g., Monday-Friday 9:00 AM - 2:00 PM" style="width: 100%; padding: 16px; color: var(--text-form) !important; background: var(--panel) !important; border: 2px solid var(--border) !important; border-radius: 12px; outline: none; transition: all 0.2s ease; font-size: 16px; font-weight: 500; box-shadow: var(--shadow-sm); resize: vertical; min-height: 120px; line-height: 1.6; font-family: inherit;"></textarea>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; position: relative; margin-bottom: 16px;">
          <label for="fieldTripDate" style="font-weight: 600; color: var(--text-form); font-size: 1rem; letter-spacing: 0.01em; margin-bottom: 4px;">Field Trip Date<span aria-hidden="true"> *</span></label>
          <input id="fieldTripDate" name="fieldTripDate" type="date" required aria-required="true" style="width: 100%; padding: 16px; color: var(--text-form) !important; background: var(--panel) !important; border: 2px solid var(--border) !important; border-radius: 12px; outline: none; transition: all 0.2s ease; font-size: 16px; font-weight: 500; box-shadow: var(--shadow-sm); position: relative; min-height: 44px; cursor: pointer;" />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 16px;">
          <div style="display: flex; flex-direction: column; gap: 10px; position: relative;">
            <label for="startTime" style="font-weight: 600; color: var(--text-form); font-size: 1rem; letter-spacing: 0.01em; margin-bottom: 4px;">Start time<span aria-hidden="true"> *</span></label>
            <input id="startTime" name="startTime" type="time" required aria-required="true" style="width: 100%; padding: 16px; color: var(--text-form) !important; background: var(--panel) !important; border: 2px solid var(--border) !important; border-radius: 12px; outline: none; transition: all 0.2s ease; font-size: 16px; font-weight: 500; box-shadow: var(--shadow-sm); position: relative; min-height: 44px; cursor: pointer;" />
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px; position: relative;">
            <label for="endTime" style="font-weight: 600; color: var(--text-form); font-size: 1rem; letter-spacing: 0.01em; margin-bottom: 4px;">End time<span aria-hidden="true"> *</span></label>
            <input id="endTime" name="endTime" type="time" required aria-required="true" style="width: 100%; padding: 16px; color: var(--text-form) !important; background: var(--panel) !important; border: 2px solid var(--border) !important; border-radius: 12px; outline: none; transition: all 0.2s ease; font-size: 16px; font-weight: 500; box-shadow: var(--shadow-sm); position: relative; min-height: 44px; cursor: pointer;" />
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; position: relative; margin-bottom: 16px;">
          <label for="natureOfTrip" style="font-weight: 600; color: var(--text-form); font-size: 1rem; letter-spacing: 0.01em; margin-bottom: 4px;">Nature of the Field Trip (i.e. to a play, to the zoo, etc.)?<span aria-hidden="true"> *</span></label>
          <textarea id="natureOfTrip" name="natureOfTrip" rows="3" required aria-required="true" placeholder="e.g., Educational visit to the science museum" style="width: 100%; padding: 16px; color: var(--text-form) !important; background: var(--panel) !important; border: 2px solid var(--border) !important; border-radius: 12px; outline: none; transition: all 0.2s ease; font-size: 16px; font-weight: 500; box-shadow: var(--shadow-sm); resize: vertical; min-height: 120px; line-height: 1.6; font-family: inherit;"></textarea>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; position: relative; margin-bottom: 16px;">
          <label for="location" style="font-weight: 600; color: var(--text-form); font-size: 1rem; letter-spacing: 0.01em; margin-bottom: 4px;">Location of the Field Trip<span aria-hidden="true"> *</span></label>
          <input id="location" name="location" type="text" required aria-required="true" placeholder="e.g., California Science Center, Los Angeles" style="width: 100%; padding: 16px; color: var(--text-form) !important; background: var(--panel) !important; border: 2px solid var(--border) !important; border-radius: 12px; outline: none; transition: all 0.2s ease; font-size: 16px; font-weight: 500; box-shadow: var(--shadow-sm); position: relative; min-height: 44px;" />
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; position: relative; margin-bottom: 16px;">
          <fieldset style="border: 2px solid var(--border); border-radius: 12px; padding: 16px; margin: 0;">
            <legend style="font-weight: 600; color: var(--text-form); font-size: 1rem; letter-spacing: 0.01em; padding: 0 8px;">Will the students parents be attending?<span aria-hidden="true"> *</span></legend>
            <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 8px;">
              <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; font-size: 1rem; color: var(--text-form);">
                <input type="radio" name="parentsAttending" value="Yes" required style="width: 20px; height: 20px; cursor: pointer;" />
                Yes
              </label>
              <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; font-size: 1rem; color: var(--text-form);">
                <input type="radio" name="parentsAttending" value="No" required style="width: 20px; height: 20px; cursor: pointer;" />
                No
              </label>
              <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; font-size: 1rem; color: var(--text-form);">
                <input type="radio" name="parentsAttending" value="Possibly" required style="width: 20px; height: 20px; cursor: pointer;" />
                Possibly
              </label>
            </div>
          </fieldset>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; position: relative; margin-bottom: 16px;">
          <label for="staffCount" style="font-weight: 600; color: var(--text-form); font-size: 1rem; letter-spacing: 0.01em; margin-bottom: 4px;">How many classroom staff members are going?<span aria-hidden="true"> *</span></label>
          <input id="staffCount" name="staffCount" type="number" min="0" required aria-required="true" placeholder="e.g., 3" style="width: 100%; padding: 16px; color: var(--text-form) !important; background: var(--panel) !important; border: 2px solid var(--border) !important; border-radius: 12px; outline: none; transition: all 0.2s ease; font-size: 16px; font-weight: 500; box-shadow: var(--shadow-sm); position: relative; min-height: 44px;" />
        </div>
      </section>

      <div style="display: flex; flex-direction: column; align-items: stretch; gap: 16px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border);">
        <button id="submitBtn" type="submit" style="background: var(--primary); color: white; border: none; border-radius: 12px; padding: 18px 24px; font-weight: 700; font-size: 16px; cursor: pointer; box-shadow: var(--shadow-md); transition: all 0.2s ease; width: 100%; min-height: 56px; display: flex; align-items: center; justify-content: center;">Submit Request</button>
        <div id="status" role="status" aria-live="polite" style="color: var(--muted-outside); min-height: 1.2em; font-size: 1rem; font-weight: 500; display: flex; align-items: center; gap: 8px; transition: all 0.3s ease; white-space: pre-line; text-align: center; line-height: 1.5;"></div>
      </div>
      
      <input type="hidden" id="formSecret" name="formSecret" />
    </form>
  `;
}

function handleFieldTripSupportSubmission(e) {
  const headers = {
    'Access-Control-Allow-Origin': SHARED_CONFIG.allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  const result = submitFieldTripSupportForm(e && e.parameter);

  if (e && e.parameter && e.parameter.__embedded && result.success) {
    return HtmlService.createHtmlOutput(getSuccessHtml('Field Trip Support Request'))
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  return json(result, headers);
}

function submitFieldTripSupportForm(form) {
  if (!form) {
    return { success: false, message: 'No form data received' };
  }

  // Honeypot check
  if (form.website) {
    return { success: true, message: 'Ignored' };
  }

  const formConfig = FORMS['field-trip-support'];
  
  // Validate required fields
  const studentName = (form.studentName || '').trim();
  const currentSupportTimes = (form.currentSupportTimes || '').trim();
  const fieldTripDate = (form.fieldTripDate || '').trim();
  const startTime = (form.startTime || '').trim();
  const endTime = (form.endTime || '').trim();
  const natureOfTrip = (form.natureOfTrip || '').trim();
  const location = (form.location || '').trim();
  const parentsAttending = (form.parentsAttending || '').trim();
  const staffCount = (form.staffCount || '').trim();
  const formSecret = (form.formSecret || '').trim();

  if (!studentName || !currentSupportTimes || !fieldTripDate || !startTime || !endTime || !natureOfTrip || !location || !parentsAttending || !staffCount) {
    return { success: false, message: 'Missing required fields' };
  }

  const sheet = getOrCreateSheet(SHARED_CONFIG.sheetId, formConfig.sheetName);
  const timestamp = new Date();

  // Save to sheet
  const row = [
    Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss'),
    'Field Trip Support Request', // Form Type
    studentName,
    currentSupportTimes,
    fieldTripDate,
    startTime,
    endTime,
    natureOfTrip,
    location,
    parentsAttending,
    staffCount,
    formSecret,
  ];
  sheet.appendRow(row);

  // Send emails
  const emailResult = sendFieldTripSupportEmails({
    type: 'Field Trip Support Request',
    recipients: formConfig.emailRecipients,
    data: { studentName, currentSupportTimes, fieldTripDate, startTime, endTime, natureOfTrip, location, parentsAttending, staffCount },
    timestamp
  });

  return { success: true };
}

function sendFieldTripSupportEmails({ type, recipients, data, timestamp }) {
  const subject = `[${type}] ${data.studentName} — ${data.fieldTripDate} ${data.startTime} → ${data.endTime}`;
  const body = [
    `${type} submission`,
    '',
    `Student Name: ${data.studentName}`,
    `Current Support Times: ${data.currentSupportTimes}`,
    `Field Trip Date: ${data.fieldTripDate}`,
    `Time: ${data.startTime} → ${data.endTime}`,
    `Nature of Trip: ${data.natureOfTrip}`,
    `Location: ${data.location}`,
    `Parents Attending: ${data.parentsAttending}`,
    `Staff Count: ${data.staffCount}`,
    '',
    `Logged at: ${Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss')}`,
  ].filter(Boolean).join('\n');

  const options = { name: `${type} System` };

  let emailErrors = [];
  
  recipients.forEach(recipient => {
    try {
      MailApp.sendEmail(recipient, subject, body, options);
      console.log(`Email sent successfully to: ${recipient}`);
    } catch (err) {
      console.error(`Failed to send email to ${recipient}:`, err);
      emailErrors.push(`${recipient}: ${err.message}`);
    }
  });

  if (emailErrors.length > 0) {
    console.warn(`Email delivery issues: ${emailErrors.length}/${recipients.length} failed`);
  } else {
    console.log(`All emails sent successfully to ${recipients.length} recipients`);
  }

  return { success: emailErrors.length === 0, errors: emailErrors };
}

function getFieldTripSupportFormScript() {
  return `
(() => {
  const form = document.getElementById('fieldTripSupportForm');
  const statusEl = document.getElementById('status');
  const submitBtn = document.getElementById('submitBtn');
  const secretInput = document.getElementById('formSecret');

  // Basic runtime validation + keyboard focus management
  function setStatus(msg, type) {
    statusEl.textContent = msg || '';
    statusEl.classList.remove('success', 'error');
    if (type) statusEl.classList.add(type);
  }

  function validateTimes() {
    const startTime = form.startTime.value;
    const endTime = form.endTime.value;
    if (startTime && endTime) {
      const start = new Date(\`2000-01-01T\${startTime}:00\`);
      const end = new Date(\`2000-01-01T\${endTime}:00\`);
      if (end < start) {
        return 'End time cannot be earlier than start time';
      }
    }
    return '';
  }

  function generateSecret() {
    const random = Math.random().toString(36).slice(2) + Date.now().toString(36);
    return random;
  }

  // Initialize form secret
  secretInput.value = generateSecret();

  // Add CSS styles for status messages
  const style = document.createElement('style');
  style.textContent = \`
    .status.success { color: var(--success); }
    .status.error { color: var(--error); }
    input:focus, select:focus, textarea:focus {
      border-color: var(--border-focus) !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
    }
    button:hover {
      background: var(--primary-hover) !important;
      transform: translateY(-1px);
      box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3) !important;
    }
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: var(--shadow-md) !important;
    }
    fieldset {
      background: rgba(59, 130, 246, 0.05);
    }
    fieldset legend {
      background: var(--panel);
      border-radius: 8px;
    }
  \`;
  document.head.appendChild(style);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setStatus('', '');

    // Honeypot check
    if (form.website && form.website.value) {
      setStatus('Submission blocked.', 'error');
      return;
    }

    // Required fields validation
    const required = ['studentName', 'currentSupportTimes', 'fieldTripDate', 'startTime', 'endTime', 'natureOfTrip', 'location', 'parentsAttending', 'staffCount'];
    for (const field of required) {
      const el = form[field];
      if (field === 'parentsAttending') {
        // Check if any radio button is selected
        const radios = form.querySelectorAll('input[name="parentsAttending"]');
        const isSelected = Array.from(radios).some(radio => radio.checked);
        if (!isSelected) {
          radios[0] && radios[0].focus();
          setStatus('Please select whether parents will be attending.', 'error');
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

    // Time validation
    const timeError = validateTimes();
    if (timeError) { setStatus(timeError, 'error'); return; }

    try {
      submitBtn.disabled = true;
      setStatus('Submitting…');

      google.script.run
        .withSuccessHandler((result) => {
          if (!result || !result.success) {
            setStatus((result && result.message) || 'Submission failed. Please try again.', 'error');
            submitBtn.disabled = false;
            return;
          }
          form.reset();
          setStatus('Submitted successfully. Your request has been logged.', 'success');
          submitBtn.disabled = false;
        })
        .withFailureHandler((err) => {
          setStatus('Submission failed: ' + (err.message || err), 'error');
          submitBtn.disabled = false;
        })
        .submitFieldTripSupportForm(form);
    } catch (err) {
      setStatus(\`Submission failed: \${err.message}\`, 'error');
      submitBtn.disabled = false;
    }
  });
})();
  `;
}

function getStudentAbsenceFormScript() {
  return `
(() => {
  const form = document.getElementById('studentAbsenceForm');
  const statusEl = document.getElementById('status');
  const submitBtn = document.getElementById('submitBtn');
  const secretInput = document.getElementById('formSecret');

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
    // Only compare times if same day
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

  // Initialize form secret
  secretInput.value = generateSecret();

  // Add CSS styles for status messages
  const style = document.createElement('style');
  style.textContent = \`
    .status.success { color: var(--success); }
    .status.error { color: var(--error); }
    input:focus, select:focus, textarea:focus {
      border-color: var(--border-focus) !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
    }
    button:hover {
      background: var(--primary-hover) !important;
      transform: translateY(-1px);
      box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3) !important;
    }
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: var(--shadow-md) !important;
    }
  \`;
  document.head.appendChild(style);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setStatus('', '');

    // Honeypot check
    if (form.website && form.website.value) {
      setStatus('Submission blocked.', 'error');
      return;
    }

    // Required fields validation
    const required = ['studentName', 'startDate', 'startTime', 'endDate', 'endTime', 'reason'];
    for (const field of required) {
      const el = form[field];
      if (!el || !el.value) {
        el && el.focus();
        setStatus('Please complete all required fields.', 'error');
        return;
      }
    }

    // Date and time validation
    const dateError = validateDates();
    if (dateError) { setStatus(dateError, 'error'); return; }
    const timeError = validateTimes();
    if (timeError) { setStatus(timeError, 'error'); return; }

    try {
      submitBtn.disabled = true;
      setStatus('Submitting…');

      google.script.run
        .withSuccessHandler((result) => {
          if (!result || !result.success) {
            setStatus((result && result.message) || 'Submission failed. Please try again.', 'error');
            submitBtn.disabled = false;
            return;
          }
          form.reset();
          setStatus('Submitted successfully. Your report has been logged.', 'success');
          submitBtn.disabled = false;
        })
        .withFailureHandler((err) => {
          setStatus('Submission failed: ' + (err.message || err), 'error');
          submitBtn.disabled = false;
        })
        .submitStudentAbsenceForm(form);
    } catch (err) {
      setStatus(\`Submission failed: \${err.message}\`, 'error');
      submitBtn.disabled = false;
    }
  });
})();
  `;
}

function getTimeOffFormScript() {
  return `
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
    // Only compare times if same day
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

  // Initialize form secret
  secretInput.value = generateSecret();

  // Add CSS styles for status messages
  const style = document.createElement('style');
  style.textContent = \`
    .status.success { color: var(--success); }
    .status.error { color: var(--error); }
    input:focus, select:focus, textarea:focus {
      border-color: var(--border-focus) !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
    }
    button:hover {
      background: var(--primary-hover) !important;
      transform: translateY(-1px);
      box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3) !important;
    }
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: var(--shadow-md) !important;
    }
  \`;
  document.head.appendChild(style);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setStatus('', '');

    // Honeypot check
    if (form.website && form.website.value) {
      setStatus('Submission blocked.', 'error');
      return;
    }

    // Required fields validation
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

    // Date and time validation
    const dateError = validateDates();
    if (dateError) { setStatus(dateError, 'error'); return; }
    const timeError = validateTimes();
    if (timeError) { setStatus(timeError, 'error'); return; }

    try {
      submitBtn.disabled = true;
      setStatus('Submitting…');

      google.script.run
        .withSuccessHandler((result) => {
          if (!result || !result.success) {
            setStatus((result && result.message) || 'Submission failed. Please try again.', 'error');
            submitBtn.disabled = false;
            return;
          }
          form.reset();
          setStatus('Submitted successfully. Your request has been logged.', 'success');
          submitBtn.disabled = false;
        })
        .withFailureHandler((err) => {
          setStatus('Submission failed: ' + (err.message || err), 'error');
          submitBtn.disabled = false;
        })
        .submitTimeOffForm(form);
    } catch (err) {
      setStatus(\`Submission failed: \${err.message}\`, 'error');
      submitBtn.disabled = false;
    }
  });
})();
  `;
}
