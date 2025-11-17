declare module "linkedin-jobs-api" {
  interface QueryOptions {
    keyword: string;
    location: string;
    dateSincePosted?: string;
    jobType?: string;
    remoteFilter?: string;
    salary?: string;
    experienceLevel?: string;
    limit?: string;
  }

  interface Job {
    position: string;
    company: string;
    companyLogo?: string;
    location: string;
    date: string;
    salary?: string;
    jobUrl: string;
    jobId?: string;
  }

  const linkedInJobsAPI: {
    query: (options: QueryOptions) => Promise<Job[]>;
  };

  export default linkedInJobsAPI;
}
