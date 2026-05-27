import { google } from 'googleapis';
import type { JobApplication, SavedJob } from '@/types';

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

export function getSpreadsheetUrl(): string | undefined {
  const id = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  return id ? `https://docs.google.com/spreadsheets/d/${id}/edit` : undefined;
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

export async function deleteJobApplication(no: string): Promise<void> {
  const spreadsheetId = requireSpreadsheetId();
  const auth = getAuth(['https://www.googleapis.com/auth/spreadsheets']);
  const sheets = google.sheets({ version: 'v4', auth });

  // Find which data row has this no
  const { data: colA } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'A2:A1000',
  });
  const rows = (colA.values ?? []) as string[][];
  const dataRowIndex = rows.findIndex((r) => r[0]?.toString().trim() === no);
  if (dataRowIndex === -1) throw new Error(`Job #${no} not found`);

  // Get the first sheet's internal sheetId (needed by batchUpdate)
  const sheetInfo = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties',
  });
  const sheetId = sheetInfo.data.sheets?.[0]?.properties?.sheetId ?? 0;

  // Delete the row (header is sheet row 0, first data row is sheet row 1)
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: { sheetId, dimension: 'ROWS', startIndex: dataRowIndex + 1, endIndex: dataRowIndex + 2 },
        },
      }],
    },
  });

  // Renumber all remaining rows sequentially (1, 2, 3, …)
  const { data: afterData } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'A2:A1000',
  });
  const remaining = (afterData.values ?? []) as string[][];
  if (remaining.length === 0) return;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `A2:A${remaining.length + 1}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: remaining.map((_, i) => [String(i + 1)]) },
  });
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

// ── Saved Vacancy sheet ──────────────────────────────────────────────────────

const SAVED_RANGE_PREFIX = "'Saved Vacancy'";

async function getSavedSheetId(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string
): Promise<number> {
  const { data } = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties',
  });
  const sheet = data.sheets?.find((s) => s.properties?.title === 'Saved Vacancy');
  if (!sheet?.properties) throw new Error('Saved Vacancy sheet not found');
  return sheet.properties.sheetId!;
}

export async function fetchSavedJobs(): Promise<SavedJob[]> {
  const spreadsheetId = requireSpreadsheetId();
  const auth = getAuth(['https://www.googleapis.com/auth/spreadsheets.readonly']);
  const sheets = google.sheets({ version: 'v4', auth });

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SAVED_RANGE_PREFIX}!A2:G1000`,
  });

  const rows = (data.values ?? []) as string[][];
  return rows
    .filter((row) => row.some((cell) => cell?.toString().trim()))
    .map((row, index) => ({
      no: row[0]?.toString().trim() || String(index + 1),
      roleTitle: row[1]?.toString().trim() || '',
      company: row[2]?.toString().trim() || '',
      contract: row[3]?.toString().trim() || '',
      jobLink: row[4]?.toString().trim() || '',
      notes: row[5]?.toString().trim() || '',
      deadline: row[6]?.toString().trim() || '',
    }));
}

export async function appendSavedJob(job: SavedJob): Promise<void> {
  const spreadsheetId = requireSpreadsheetId();
  const auth = getAuth(['https://www.googleapis.com/auth/spreadsheets']);
  const sheets = google.sheets({ version: 'v4', auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${SAVED_RANGE_PREFIX}!A:G`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[job.no, job.roleTitle, job.company, job.contract, job.jobLink, job.notes, job.deadline]],
    },
  });
}

export async function updateSavedJob(job: SavedJob): Promise<void> {
  const spreadsheetId = requireSpreadsheetId();
  const auth = getAuth(['https://www.googleapis.com/auth/spreadsheets']);
  const sheets = google.sheets({ version: 'v4', auth });

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SAVED_RANGE_PREFIX}!A2:A1000`,
  });
  const rows = (data.values ?? []) as string[][];
  const rowIndex = rows.findIndex((r) => r[0]?.toString().trim() === job.no);
  if (rowIndex === -1) throw new Error(`Saved job #${job.no} not found`);

  const sheetRow = rowIndex + 2;
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SAVED_RANGE_PREFIX}!A${sheetRow}:G${sheetRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[job.no, job.roleTitle, job.company, job.contract, job.jobLink, job.notes, job.deadline]],
    },
  });
}

export async function deleteSavedJob(no: string): Promise<void> {
  const spreadsheetId = requireSpreadsheetId();
  const auth = getAuth(['https://www.googleapis.com/auth/spreadsheets']);
  const sheets = google.sheets({ version: 'v4', auth });

  const { data: colA } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SAVED_RANGE_PREFIX}!A2:A1000`,
  });
  const rows = (colA.values ?? []) as string[][];
  const dataRowIndex = rows.findIndex((r) => r[0]?.toString().trim() === no);
  if (dataRowIndex === -1) throw new Error(`Saved job #${no} not found`);

  const sheetId = await getSavedSheetId(sheets, spreadsheetId);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: { sheetId, dimension: 'ROWS', startIndex: dataRowIndex + 1, endIndex: dataRowIndex + 2 },
        },
      }],
    },
  });

  // Renumber remaining rows
  const { data: afterData } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SAVED_RANGE_PREFIX}!A2:A1000`,
  });
  const remaining = (afterData.values ?? []) as string[][];
  if (remaining.length === 0) return;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SAVED_RANGE_PREFIX}!A2:A${remaining.length + 1}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: remaining.map((_, i) => [String(i + 1)]) },
  });
}
