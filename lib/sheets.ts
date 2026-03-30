import { google } from 'googleapis';
import type { JobApplication } from '@/types';

export async function fetchJobApplications(): Promise<JobApplication[]> {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!clientEmail || !privateKey || !spreadsheetId) {
    throw new Error('Google Sheets credentials not configured');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'A2:K1000',
  });

  const rows = (data.values ?? []) as string[][];

  return rows
    .filter((row) => row.some((cell) => cell?.toString().trim()))
    .map((row, index) => ({
      no: row[0]?.toString().trim() || String(index + 1),
      company: row[1]?.toString().trim() || '',
      roleTitle: row[2]?.toString().trim() || '',
      contract: row[3]?.toString().trim() || '',
      jobLink: row[4]?.toString().trim() || '',
      applicationDate: row[5]?.toString().trim() || '',
      response: row[6]?.toString().trim() || '',
      interviewStage: row[7]?.toString().trim() || '',
      interviewDetails: row[8]?.toString().trim() || '',
      offer: row[9]?.toString().trim() || '',
      notes: row[10]?.toString().trim() || '',
    }));
}
