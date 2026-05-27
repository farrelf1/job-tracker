import type { SavedJob } from '@/types';

export const mockSavedJobs: SavedJob[] = [
  {
    no: '1',
    roleTitle: 'Product Designer',
    company: 'Figma',
    contract: 'Full Time',
    jobLink: 'https://figma.com/careers',
    deadline: '2026-06-30',
    notes: 'Dream role — check back monthly',
  },
  {
    no: '2',
    roleTitle: 'Software Engineer Intern',
    company: 'Stripe',
    contract: 'Intern',
    jobLink: 'https://stripe.com/jobs',
    deadline: '2026-07-15',
    notes: 'Summer intake opens Q2',
  },
  {
    no: '3',
    roleTitle: 'MT Programme',
    company: 'HSBC',
    contract: 'MT',
    jobLink: '',
    deadline: '',
    notes: 'Graduate scheme — applications open October',
  },
];
