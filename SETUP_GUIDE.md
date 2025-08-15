# Time Off Request Form - Complete Setup Guide

## 🚀 Quick Setup (Recommended)

### Self-Contained Deployment

The easiest way to deploy is using the complete `code-content.gs` file which contains everything embedded.

## Step 1: Create Google Apps Script Project

1. **Open Google Apps Script**:
   - Go to [script.google.com](https://script.google.com)
   - Click "New Project"

2. **Replace Code.gs Content**:
   - Delete all existing code in `Code.gs`
   - Copy the **entire contents** of `code-content.gs`
   - Paste into `Code.gs`

3. **No Additional Files Needed**:
   - ❌ No HTML files required
   - ❌ No external dependencies  
   - ✅ Everything is embedded in one file

## Step 2: Configure Your Settings

Update the `CONFIG` object at the top of the code:

```javascript
const CONFIG = {
  sheetId: 'YOUR_GOOGLE_SHEET_ID',           // Required
  sheetName: 'Responses',                    // Optional
  emailRecipients: [                         // Required
    'spain-r@kcusd.com',
    'lopez-cr@kcusd.com', 
    'muniz-d@kcusd.com',
    'evaristo-a@kcusd.com',
  ],
  driveFolderId: 'YOUR_DRIVE_FOLDER_ID',     // Required for file uploads
  driveFolderName: 'Time Off Request Documents',
  maxUploadBytes: 10 * 1024 * 1024,          // 10MB limit
  allowedMimeTypes: [                        // Supported file types
    'application/pdf', 'image/png', 'image/jpeg', 'image/heic', 'image/heif'
  ],
};
```

## Step 3: Deploy as Web App

1. **Save the Project**:
   - Click "Save" or `Ctrl+S`
   - Give your project a name

2. **Deploy**:
   - Click "Deploy" → "New deployment"
   - Choose "Web app" as type
   - Set "Execute as" to **"Me"**
   - Set "Who has access" to **"Anyone"**
   - Click "Deploy"
   - **Copy the Web App URL**

### 1. Create Google Sheet

1. **Create New Google Sheet**:
   - Go to [sheets.google.com](https://sheets.google.com)
   - Click "Blank" to create new sheet

2. **Get Sheet ID**:
   - Copy the long string from the URL between `/d/` and `/edit`
   - Example: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`

3. **Share Sheet** (Important):
   - Click "Share" button
   - Add your email recipients as "Editor"
   - This allows the script to write data

### 2. Create Google Drive Folder

1. **Create Folder**:
   - Go to [drive.google.com](https://drive.google.com)
   - Right-click → "New folder"
   - Name it "Time Off Request Documents"

2. **Get Folder ID**:
   - Open the folder
   - Copy the ID from the URL after `/folders/`
   - Example: `https://drive.google.com/drive/folders/YOUR_FOLDER_ID`

3. **Share Folder**:
   - Right-click folder → "Share"
   - Add email recipients as "Editor"

## Step 5: Test the Complete Form

1. **Open your Web App URL** in a browser
2. **Fill out test submission**:
   - Complete all required fields  
   - Upload a test file (optional)
   - Check "I have filled out my Frontline entry"
3. **Submit and verify**:
   - Success page with inspirational quote appears
   - New row appears in Google Sheet
   - Email notifications sent to all recipients
   - File uploaded to Google Drive (if included)

---

## 🔧 Troubleshooting

### Issue: "No HTML file named Index was found"

**Cause**: Using old Apps Script code that looks for external HTML files.

**Solution**: 
- Replace **entire** `Code.gs` content with `code-content.gs`
- The new version has everything embedded - no external HTML files needed

### Issue: "Permission denied" 

**Cause**: Google Sheet or Drive folder not properly shared.

**Solutions**:
- Share Google Sheet with your email as "Editor"
- Share Google Drive folder with your email as "Editor"  
- Make sure the IDs in CONFIG are correct

### Issue: "Email not sent" or "Some emails failed"

**Cause**: Email delivery issues or quota exceeded.

**Solutions**:
- Check Apps Script execution logs for detailed error messages
- Verify all email addresses in `emailRecipients` are correct
- Check daily email quota (100 emails/day for free accounts)
- The new version sends emails individually for better reliability

### Issue: "File upload failed"

**Cause**: Drive folder permissions or file restrictions.

**Solutions**:
- Verify Drive folder is shared properly
- Check file size (must be under 10MB)
- Ensure file type is supported (PDF, PNG, JPG, HEIC)
- Check Apps Script execution logs for specific error

### Issue: Form styling looks wrong

**Cause**: CSS not loading properly.

**Solution**: 
- Use `code-content.gs` which has all CSS embedded
- No external CSS files needed

## 🔍 Debugging

### Check Apps Script Logs

1. **Open Apps Script project**
2. **Click "Executions"** in left sidebar  
3. **View recent executions** for detailed error messages
4. **Look for email status logs**:
   - "Email sent successfully to: [email]"
   - "Failed to send email to [email]: [error]"

### Enhanced Logging Features

The new `code-content.gs` includes enhanced logging:
- ✅ Individual email delivery status
- ✅ Email quota monitoring  
- ✅ Invalid email address detection
- ✅ File upload status tracking
- ✅ Detailed error messages

---

## 📚 Alternative Setup: GitHub Pages + Apps Script Backend

If you prefer to host the form separately and use Apps Script only as a backend:

### 1. Setup GitHub Pages
- Push this repository to GitHub
- Enable GitHub Pages from Settings → Pages → Source: `main` branch

### 2. Configure Backend
- Use `apps_script/Code.gs` for backend-only deployment
- Deploy as Web App (same steps as above)

### 3. Connect Frontend
- Update `APPS_SCRIPT_URL` in `script.js` with your Web App URL
- Commit and push changes

This approach separates the frontend and backend but requires more configuration.

---

## 🏗️ Architecture

### Self-Contained Version (`code-content.gs`)
```
┌─────────────────────────────────────┐
│           Google Apps Script        │
│                                     │
│  ┌─────────────┐ ┌─────────────┐   │
│  │   Backend   │ │  Frontend   │   │
│  │  Functions  │ │ HTML/CSS/JS │   │
│  │             │ │  Embedded   │   │
│  └─────────────┘ └─────────────┘   │
│                                     │
│  ↓ Writes to Google Sheet          │
│  ↓ Sends emails                    │
│  ↓ Stores files in Drive           │
└─────────────────────────────────────┘
```

### Modular Version (Original)
```
┌─────────────────┐    ┌─────────────────┐
│   GitHub Pages  │    │ Google Apps     │
│                 │    │ Script          │
│  Frontend       │───▶│                 │
│  HTML/CSS/JS    │    │  Backend Only   │
│                 │    │  Functions      │
└─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Google Services │
                    │ • Sheets        │
                    │ • Drive         │
                    │ • Gmail         │
                    └─────────────────┘
```

## 📋 Configuration Reference

### Required Google Sheet Columns:
- Timestamp
- Name
- Email
- Start Date
- Start Time
- End Date
- End Time
- Absence Type
- Frontline Entry
- Reason
- Description
- Document Link
- Form Secret

### Supported File Types:
- PDF (.pdf)
- PNG (.png)
- JPEG (.jpg, .jpeg)
- HEIC (.heic, .heif)

### File Size Limit:
- Maximum 10MB per file

## Mobile Responsiveness

The form is designed to work across all devices and browsers. Test on:
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Tablet browsers
- Different screen sizes

## Security Checklist

- [ ] Apps Script deployed with appropriate permissions
- [ ] Google Sheet shared with correct users
- [ ] Drive folder permissions configured
- [ ] Email recipients verified
- [ ] File upload restrictions in place
- [ ] Form validation working
- [ ] Honeypot protection active
