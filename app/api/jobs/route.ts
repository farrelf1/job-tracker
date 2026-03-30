import { fetchJobApplications } from '@/lib/sheets';
import { mockJobs } from '@/lib/mockData';

export async function GET() {
  try {
    const jobs = await fetchJobApplications();
    return Response.json({ jobs, isDemo: false });
  } catch {
    return Response.json({ jobs: mockJobs, isDemo: true });
  }
}
