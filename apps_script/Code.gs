/**
 * Google Apps Script Web App for Time Off Request
 * - Serves an embeddable HTML form for Google Sites (doGet)
 * - Handles submissions (doPost)
 * - Logs to Google Sheets and emails four recipients
 */

// ======== CONFIGURE ========
const CONFIG = {
  sheetId: 'PUT_YOUR_SHEET_ID_HERE',
  sheetName: 'Responses',
  emailRecipients: [
    'rob@example.com',
    'cristal@example.com',
    'recipient3@example.com',
    'recipient4@example.com',
  ],
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
    const reason = (form.reason || '').trim();
    const description = (form.description || '').trim();
    const formName = (form.formName || 'Time Off Form').trim();
    const formSecret = (form.formSecret || '').trim();

    if (!name || !email || !startDate || !startTime || !endDate || !endTime || !absenceType || !reason) {
      return json({ success: false, message: 'Missing required fields' }, headers);
    }

    // Optional file upload via HTML form uses e.files if multipart/form-data
    let attachmentBlob = null;
    if (e && e.parameters && e.parameters['doctorNote'] && e.parameters['doctorNote'].length) {
      // If sent as base64 use a different approach. For native form uploads, e.files is populated.
    }
    if (e && e.files && e.files['doctorNote']) {
      const file = e.files['doctorNote'];
      const sizeBytes = (file && file.getBytes) ? file.getBytes().length : 0;
      const contentType = (file && file.getContentType) ? file.getContentType() : '';
      if (sizeBytes > CONFIG.maxUploadBytes) {
        return json({ success: false, message: 'File too large' }, headers);
      }
      if (CONFIG.allowedMimeTypes.indexOf(contentType) === -1) {
        return json({ success: false, message: 'Unsupported file type' }, headers);
      }
      attachmentBlob = file;
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
      reason,
      description,
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
      `Reason: ${reason}`,
      description ? `Description: ${description}` : null,
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
      'Timestamp', 'Name', 'Email', 'Start Date', 'Start Time', 'End Date', 'End Time', 'Absence Type', 'Reason', 'Description', 'Form Secret'
    ]);
  }
  return sheet;
}

// Helper to include HTML partials if needed
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}


