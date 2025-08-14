# Time Off Request Form Setup Guide

## Issue: "Backend not configured" Error

The error occurs because the Apps Script Web App URL is not configured in the frontend code. Here's how to fix it:

## Step 1: Deploy the Apps Script

1. **Open Google Apps Script**:
   - Go to [script.google.com](https://script.google.com)
   - Create a new project or open existing one

2. **Copy the Code.gs content**:
   - Copy the contents of `apps_script/Code.gs` into your Apps Script project
   - Copy the contents of `apps_script/Index.html` as a new HTML file named "Index"
   - Copy the contents of `apps_script/Success.html` as a new HTML file named "Success"

3. **Configure the settings**:
   - Update the `CONFIG` object in `Code.gs`:
     - `sheetId`: Your Google Sheet ID (create a new sheet if needed)
     - `emailRecipients`: Add the correct email addresses
     - `driveFolderId`: Your Google Drive folder ID for storing documents

4. **Deploy as Web App**:
   - Click "Deploy" → "New deployment"
   - Choose "Web app" as type
   - Set "Execute as" to "Me"
   - Set "Who has access" to "Anyone" (or "Anyone with Google Account" for restricted access)
   - Click "Deploy"
   - **Copy the Web App URL** (you'll need this for the next step)

## Step 2: Update the Frontend Configuration

1. **Update script.js**:
   - Replace `YOUR_SCRIPT_ID` in the `APPS_SCRIPT_URL` with your actual Apps Script Web App URL
   - The URL should look like: `https://script.google.com/macros/s/AKfycbz.../exec`

## Step 3: Verify Permissions

### Google Sheet Permissions:
1. **Create or open your Google Sheet**
2. **Share the sheet** with the email addresses in `emailRecipients`
3. **Give them "Editor" access** so the script can write to the sheet

### Google Drive Permissions:
1. **Create a folder** for storing uploaded documents
2. **Share the folder** with the email recipients
3. **Update the `driveFolderId`** in the CONFIG object

## Step 4: Test the Form

1. **Open your HTML form** in a browser
2. **Fill out the form** with test data
3. **Submit the form**
4. **Check for success**:
   - You should see a success message with a random quote
   - Check your Google Sheet for the new entry
   - Check your email for the notification

## Troubleshooting

### Common Issues:

1. **"Backend not configured"**:
   - Make sure `APPS_SCRIPT_URL` is set correctly in `script.js`
   - Verify the Apps Script is deployed as a Web App

2. **"Permission denied"**:
   - Check that the Google Sheet is shared with the script's executing user
   - Verify the Drive folder permissions

3. **"File upload failed"**:
   - Check the Drive folder permissions
   - Verify the file size is under 10MB
   - Ensure the file type is supported

4. **"Email not sent"**:
   - Check that the email addresses in `emailRecipients` are correct
   - Verify the script has permission to send emails

### Security Considerations:

1. **API Key Protection**: The Apps Script URL is public, but the script validates submissions
2. **File Upload Limits**: Files are limited to 10MB and specific types
3. **Honeypot Protection**: The form includes spam protection
4. **CORS Configuration**: The script is configured to handle cross-origin requests

## Configuration Reference

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
