import { fetchSavedJobs, appendSavedJob, updateSavedJob, deleteSavedJob } from '@/lib/sheets';
import { mockSavedJobs } from '@/lib/mockSavedJobs';
import type { SavedJob } from '@/types';

export async function GET() {
  try {
    const jobs = await fetchSavedJobs();
    return Response.json({ jobs, isDemo: false });
  } catch {
    return Response.json({ jobs: mockSavedJobs, isDemo: true });
  }
}

export async function POST(request: Request) {
  try {
    const job = (await request.json()) as SavedJob;
    await appendSavedJob(job);
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, error: String(err) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const job = (await request.json()) as SavedJob;
    await updateSavedJob(job);
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const no = searchParams.get('no');
  if (!no) return Response.json({ success: false, error: 'no is required' }, { status: 400 });
  try {
    await deleteSavedJob(no);
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, error: String(err) }, { status: 500 });
  }
}
