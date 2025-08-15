# Behavior Intervention Team — Time Off Request Form

A responsive, accessible time off request form with Google Apps Script backend. Features a modern dark theme design with embedded functionality for easy deployment.

## ✨ Features

- **Self-contained deployment** - Single file contains everything
- **Enhanced email delivery** - Individual email sending with validation
- **Mobile-first responsive design** - Dark background with glassmorphic white form
- **File upload support** - PDF, PNG, JPG, HEIC files up to 10MB
- **Comprehensive validation** - Client and server-side validation
- **Accessibility features** - ARIA labels, keyboard navigation
- **100 inspirational quotes** - Random quotes displayed on successful submission

## 🚀 Quick Start

### Option 1: Self-Contained Apps Script (Recommended)

1. **Create Google Apps Script Project**:
   - Go to [script.google.com](https://script.google.com)
   - Create new project

2. **Deploy the Complete Solution**:
   - Replace `Code.gs` content with the entire `code-content.gs` file
   - Update the `CONFIG` object (see configuration below)
   - Deploy as Web App

3. **Embed in Google Sites**:
   - Copy the Web App URL from deployment
   - In Google Sites: Insert → Embed → paste URL

### Option 2: GitHub Pages + Apps Script Backend

1. **Setup GitHub Pages**:
   - Push this repo to GitHub
   - Enable GitHub Pages from `main` branch

2. **Deploy Backend**:
   - Use `apps_script/Code.gs` for backend only
   - Configure `APPS_SCRIPT_URL` in `script.js`

## ⚙️ Configuration

### Required Setup

1. **Google Sheet**:
   - Create new Google Sheet
   - Copy Sheet ID from URL (long string between `/d/` and `/edit`)

2. **Update CONFIG in code-content.gs**:
   ```javascript
   const CONFIG = {
     sheetId: 'YOUR_GOOGLE_SHEET_ID',
     emailRecipients: [
       'email1@domain.com',
       'email2@domain.com',
       // ... up to 4 recipients
     ],
     driveFolderId: 'YOUR_DRIVE_FOLDER_ID', // For file uploads
   };
   ```

3. **Deploy as Web App**:
   - Execute as: **Me**
   - Who has access: **Anyone**

## 🧪 Testing

1. **Open your deployed form**
2. **Fill out test submission**:
   - Complete all required fields
   - Optionally upload a test file
   - Check the Frontline entry checkbox
3. **Verify functionality**:
   - Form submits successfully
   - Google Sheet receives new row
   - All email recipients receive notification
   - File uploads to Google Drive (if included)

## 🔒 Security Features

- **Honeypot protection** - Hidden field to deter basic bots
- **Form validation** - Required field checks and date/time validation  
- **File restrictions** - 10MB limit, specific file types only
- **Email validation** - Individual sending with error tracking
- **Quota monitoring** - Tracks daily email limits
- **Input sanitization** - All form data is cleaned and validated

## 📊 Data Tracking

**Form Fields:**
- Name, Email, Start/End Date & Time
- Absence Type, Frontline Entry Confirmation
- Reason, Description (optional)
- File upload (optional)

**Sheet Columns:**
- Timestamp, all form fields, document link, form secret

## 📁 File Structure

```
├── code-content.gs          # 🎯 Main deployment file (self-contained)
├── index.html              # 📚 Original standalone form
├── script.js               # 📚 Original JavaScript  
├── styles.css              # 📚 Original CSS
├── apps_script/            # 📚 Original Apps Script files
│   ├── Code.gs             #     Backend only version
│   ├── Index.html          #     Form template
│   └── Success.html        #     Success page template
├── README.md               # 📖 This documentation
└── SETUP_GUIDE.md          # 📖 Detailed setup guide
```

## 🆘 Troubleshooting

See `SETUP_GUIDE.md` for detailed troubleshooting steps including:
- "Backend not configured" errors
- Permission issues  
- Email delivery problems
- File upload failures

## 🔧 Development

The repository contains both the original modular files and the new self-contained version:

- **Use `code-content.gs`** for new deployments (recommended)
- **Keep original files** for reference and development
- **All functionality preserved** in the embedded version


