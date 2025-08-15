# Behavior Intervention Team — Multi-Form System

A comprehensive multi-form system with a card-based interface for Google Sites integration. Features modern design, automated email notifications, and Google Sheets data storage with a single-file deployment approach.

## ✨ Current Features

### 🎯 **Multi-Form Dashboard**
- **Card-based interface** - Clean selection page with form preview cards
- **Responsive design** - Works seamlessly on desktop, tablet, and mobile
- **Smart navigation** - Back buttons and breadcrumb navigation
- **Status indicators** - Shows which forms are available vs. coming soon

### 📋 **Available Forms (3/4)**

#### 1. ✈️ **Time Off Request**
- Complete staff absence form with Frontline integration
- File upload support (PDF, PNG, JPG, HEIC up to 10MB)
- Absence type dropdown with all district options
- 100 inspirational quotes on success page
- Enhanced email delivery with individual sending

#### 2. 🎓 **Student Absence Report**  
- Simple form for reporting student absences
- Date/time validation and duration tracking
- Required reason field with optional description
- Automatic email notifications to team

#### 3. 🚌 **Field Trip Support Request**
- Support request form for student field trips
- Current support times and trip details
- Radio button selection for parent attendance
- Staff count tracking and location details

#### 4. 🛠️ **Equipment Request** *(Coming Soon)*
- Placeholder ready for future implementation

## 🚀 Quick Deployment

### Single-File Deployment (Recommended)

1. **Create Google Apps Script Project**:
   ```
   • Go to script.google.com
   • Click "New Project"
   • Name your project (e.g., "BIT Multi-Form System")
   ```

2. **Deploy the Multi-Form System**:
   ```
   • Delete all existing code in Code.gs
   • Copy the ENTIRE contents of multi-form-system.gs
   • Paste into Code.gs
   • Save the project (Ctrl+S)
   ```

3. **Configure Your Settings**:
   Update the `SHARED_CONFIG` object at the top:
   ```javascript
   const SHARED_CONFIG = {
     sheetId: 'YOUR_GOOGLE_SHEET_ID',           // Required
     driveFolderId: 'YOUR_DRIVE_FOLDER_ID',     // Required for file uploads
     driveFolderName: 'Form Submissions',
     // ... other settings
   };
   ```

4. **Deploy as Web App**:
   ```
   • Click "Deploy" → "New deployment"
   • Choose "Web app" as type
   • Set "Execute as" to "Me"
   • Set "Who has access" to "Anyone"
   • Click "Deploy"
   • Copy the Web App URL
   ```

5. **Embed in Google Sites**:
   ```
   • Open your Google Site
   • Insert → Embed
   • Paste the Web App URL
   • Adjust size as needed
   ```

## ⚙️ Configuration Guide

### Required Google Services Setup

#### 1. **Google Sheet**
```
• Create new Google Sheet at sheets.google.com
• Copy Sheet ID from URL: /d/[SHEET_ID]/edit
• The system will auto-create tabs for each form type:
  - Time Off Responses
  - Student Absences  
  - Field Trip Support
```

#### 2. **Google Drive Folder**
```
• Create folder at drive.google.com
• Name it "Form Submissions" (or customize in config)
• Copy Folder ID from URL: /folders/[FOLDER_ID]
• Used for file uploads from Time Off Request form
```

#### 3. **Email Configuration**
Each form has its own email recipient list in the `FORMS` configuration:
```javascript
'time-off': {
  emailRecipients: [
    'spain-r@kcusd.com',
    'lopez-cr@kcusd.com', 
    'muniz-d@kcusd.com',
    'evaristo-a@kcusd.com',
  ],
},
```

## 🧪 Testing Your Deployment

1. **Open the landing page** at your Web App URL
2. **Test each available form**:
   - Time Off Request (with file upload)
   - Student Absence Report  
   - Field Trip Support Request
3. **Verify functionality**:
   - Forms submit successfully
   - Google Sheets receive data in correct tabs
   - Email notifications sent to recipients
   - Success pages display with proper navigation

## 🔒 Security & Validation

- **Honeypot protection** - Hidden fields block basic bots
- **Comprehensive validation** - Required fields, date/time logic, file restrictions
- **Individual email delivery** - Better reliability than bulk sending
- **Form secrets** - Unique identifiers for tracking submissions
- **Input sanitization** - All data cleaned and validated server-side

## 📊 Data Management

### **Automatic Sheet Creation**
The system creates appropriately formatted sheets for each form type:

- **Time Off Responses**: Name, Email, Dates, Absence Type, Frontline Entry, etc.
- **Student Absences**: Student Name, Dates, Reason, Description
- **Field Trip Support**: Student, Support Times, Trip Details, Parent Attendance

### **Email Notifications**
Smart email formatting with:
- Clear subject lines with key details
- Structured body with all form data
- Individual delivery with error tracking
- Timestamp logging for audit trails

## 📁 Project Structure

```
├── multi-form-system.gs       # 🎯 MAIN DEPLOYMENT FILE (use this!)
├── code-content.gs            # 📚 Original single-form version
├── index.html                 # 📚 Original standalone form
├── script.js                  # 📚 Original JavaScript  
├── styles.css                 # 📚 Original CSS
├── apps_script/               # 📚 Original Apps Script files
├── README.md                  # 📖 This documentation
└── SETUP_GUIDE.md             # 📖 Detailed troubleshooting guide
```

## 🔄 Next Steps

### **Immediate Deployment**
1. Use `multi-form-system.gs` as your `Code.gs` in Google Apps Script
2. Configure `SHARED_CONFIG` with your Google Sheet and Drive Folder IDs
3. Deploy as Web App and embed in Google Sites
4. Test all three available forms

### **Future Enhancements**
1. **Equipment Request Form** - Complete the placeholder form
2. **Additional Form Types** - Meeting requests, incident reports, etc.
3. **Advanced Features** - Form analytics, approval workflows, calendar integration
4. **UI Improvements** - Dark mode toggle, custom themes, accessibility enhancements

### **Customization Options**
- Update form colors and icons in the `FORMS` configuration
- Modify email recipients per form type
- Add new form types following the modular pattern
- Customize success messages and quotes

## 🆘 Troubleshooting

See `SETUP_GUIDE.md` for detailed troubleshooting including:
- Google Apps Script permissions
- Sheet and Drive folder setup
- Email delivery issues
- Form validation problems

## 🏗️ Architecture

**Self-Contained Multi-Form System**
```
┌─────────────────────────────────────┐
│        Google Apps Script           │
│                                     │
│  ┌─────────────┐ ┌─────────────┐   │
│  │   Backend   │ │  Frontend   │   │
│  │  Functions  │ │ Multi-Form  │   │
│  │             │ │ HTML/CSS/JS │   │
│  └─────────────┘ └─────────────┘   │
│                                     │
│  ↓ Routes to appropriate form       │
│  ↓ Validates and processes data     │
│  ↓ Stores in dedicated sheets       │
│  ↓ Sends targeted email alerts     │
└─────────────────────────────────────┘
```

This system provides a scalable, maintainable solution for multiple form types with consistent UX and centralized management.