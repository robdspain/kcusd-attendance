# Behavior Intervention Team — Time Off Request (Static Form + Google Apps Script)

This is a responsive, accessible form. You can host it on GitHub Pages, or entirely in Google Apps Script for embedding into Google Sites. Submissions are sent to a Google Apps Script backend that:

- Logs all answers to a Google Sheet
- Emails 4 recipients with the submission details
- Optionally includes an uploaded doctor's note (PDF/PNG/JPG/HEIC)

## 1) GitHub Pages

- Push this folder to a GitHub repo
- Enable GitHub Pages → Source: `main` (or `master`) → root

## 2) Google Sheet

- Create a new Google Sheet
- Copy the Sheet ID from the URL (the long string between `/d/` and `/edit`)

## 3) Apps Script Backend (Web App)

- In Google Drive, New → More → Google Apps Script
- File → New → Script, replace `Code.gs` with the contents of `apps_script/Code.gs`
- In `CONFIG`, set:
  - `sheetId` to your Sheet ID
  - `sheetName` (optional, default `Responses`)
  - `emailRecipients` to the 4 email addresses
  - Optionally restrict `allowedOrigin` to your GitHub Pages URL
- Save
- Deploy → New deployment → Type: Web app
  - Description: Time Off Form API
  - Execute as: Me
  - Who has access: Anyone
  - Deploy
- Copy the Web app URL

## 4a) Frontend configuration (GitHub Pages option)

- Open `script.js`
- Set `APPS_SCRIPT_URL` to the Web app URL from above
- Commit and push

## 4b) Google Sites embed (Apps Script option)

- In Apps Script, open Deployments → Copy Web app URL
- In Google Sites, Insert → Embed → paste the Web app URL
- Publish your Site and test the form inside the site

## 5) Test

- Open your GitHub Pages site
- Submit the form (try with and without a file)
- Confirm sheet row added and emails received

## Security and validation

- Honeypot field to deter basic bots
- Required field checks and basic date/time validation
- File type and size checks on backend (10 MB limit)
- Consider enabling reCAPTCHA Enterprise or challenge-based solutions if spam arises

## Notes

- If uploads fail, ensure the Web App deploy is current and `Who has access: Anyone`.
- Apps Script cannot set custom CORS response headers via `doPost` easily; the frontend uses `mode: 'cors'`. If you restrict `allowedOrigin`, also serve this through a proxy or use HtmlService if needed.

## Fields tracked

- Name, Email, Start Date/Time, End Date/Time, Absence Type, Reason, Description, optional `doctorNote` file
- Logged columns: Timestamp, the above fields, and a random `formSecret` per submission


