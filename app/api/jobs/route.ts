import { fetchJobApplications, appendJobApplication, updateJobApplication } from '@/lib/sheets';
import { mockJobs } from '@/lib/mockData';
import type { JobApplication } from '@/types';

export async function GET() {
  try {
    const jobs = await fetchJobApplications();
    return Response.json({ jobs, isDemo: false });
  } catch {
    return Response.json({ jobs: mockJobs, isDemo: true });
  }
}

export async function POST(request: Request) {
  try {
    const job = (await request.json()) as JobApplication;
    await appendJobApplication(job);
    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const job = (await request.json()) as JobApplication;
    await updateJobApplication(job);
    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}
