import { fetchSavedJobs, getSpreadsheetUrl } from '@/lib/sheets';
import { mockSavedJobs } from '@/lib/mockSavedJobs';
import SavedDashboard from '@/components/SavedDashboard';

export const revalidate = 60;

export default async function SavedPage() {
  let jobs = mockSavedJobs;
  let isDemo = true;

  try {
    const fetched = await fetchSavedJobs();
    jobs = fetched;
    isDemo = false;
  } catch {
    // Credentials not configured — fall back to demo data
  }

  return <SavedDashboard jobs={jobs} isDemo={isDemo} spreadsheetUrl={getSpreadsheetUrl()} />;
}
