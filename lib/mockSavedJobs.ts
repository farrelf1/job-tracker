import type { SavedJob } from '@/types';

export const mockSavedJobs: SavedJob[] = [
  {
    no: '1',
    roleTitle: 'Product Designer',
    company: 'Figma',
    contract: 'Full Time',
    jobLink: 'https://figma.com/careers',
    notes: 'Dream role — check back monthly',
  },
  {
    no: '2',
    roleTitle: 'Software Engineer Intern',
    company: 'Stripe',
    contract: 'Intern',
    jobLink: 'https://stripe.com/jobs',
    notes: 'Summer intake opens Q2',
  },
  {
    no: '3',
    roleTitle: 'MT Programme',
    company: 'HSBC',
    contract: 'MT',
    jobLink: '',
    notes: 'Graduate scheme — applications open October',
  },
];
