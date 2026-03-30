import { fetchJobApplications } from '@/lib/sheets';
import { mockJobs } from '@/lib/mockData';
import Dashboard from '@/components/Dashboard';

export const revalidate = 60;

export default async function Page() {
  let jobs = mockJobs;
  let isDemo = true;

  try {
    const fetched = await fetchJobApplications();
    if (fetched.length > 0) {
      jobs = fetched;
      isDemo = false;
    }
  } catch {
    // Credentials not configured — fall back to demo data
  }

  return <Dashboard jobs={jobs} isDemo={isDemo} />;
}
