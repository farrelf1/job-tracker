import { google } from 'googleapis';
import type { JobApplication } from '@/types';

function getAuth(scopes: string[]) {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    throw new Error('Google Sheets credentials not configured');
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey.replace(/\\n/g, '\n'),
    },
    scopes,
  });
}

function requireSpreadsheetId(): string {
  const id = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!id) throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID not configured');
  return id;
}

export async function fetchJobApplications(): Promise<JobApplication[]> {
  const spreadsheetId = requireSpreadsheetId();
  const auth = getAuth(['https://www.googleapis.com/auth/spreadsheets.readonly']);
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

export async function updateJobApplication(job: JobApplication): Promise<void> {
  const spreadsheetId = requireSpreadsheetId();
  const auth = getAuth(['https://www.googleapis.com/auth/spreadsheets']);
  const sheets = google.sheets({ version: 'v4', auth });

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'A2:A1000',
  });

  const rows = (data.values ?? []) as string[][];
  const rowIndex = rows.findIndex((r) => r[0]?.toString().trim() === job.no);
  if (rowIndex === -1) throw new Error(`Job #${job.no} not found in spreadsheet`);

  const sheetRow = rowIndex + 2; // +1 for 1-indexed, +1 for header row

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `A${sheetRow}:K${sheetRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        job.no, job.company, job.roleTitle, job.contract, job.jobLink,
        job.applicationDate, job.response, job.interviewStage,
        job.interviewDetails, job.offer, job.notes,
      ]],
    },
  });
}

export async function appendJobApplication(job: JobApplication): Promise<void> {
  const spreadsheetId = requireSpreadsheetId();
  const auth = getAuth(['https://www.googleapis.com/auth/spreadsheets']);
  const sheets = google.sheets({ version: 'v4', auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'A:K',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        job.no,
        job.company,
        job.roleTitle,
        job.contract,
        job.jobLink,
        job.applicationDate,
        job.response,
        job.interviewStage,
        job.interviewDetails,
        job.offer,
        job.notes,
      ]],
    },
  });
}
