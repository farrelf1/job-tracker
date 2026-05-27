export interface JobApplication {
  no: string;
  company: string;
  roleTitle: string;
  contract: string;
  jobLink: string;
  applicationDate: string;
  response: string;
  interviewStage: string;
  interviewDetails: string;
  offer: string;
  notes: string;
}

export interface SavedJob {
  no: string;
  roleTitle: string;
  company: string;
  contract: string;
  jobLink: string;
  deadline: string;
  notes: string;
}
