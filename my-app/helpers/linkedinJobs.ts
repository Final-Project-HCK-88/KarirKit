import linkedInJobsAPI from "linkedin-jobs-api";

export interface LinkedInJob {
  position: string;
  company: string;
  companyLogo?: string;
  location: string;
  date: string;
  salary?: string;
  jobUrl: string;
  jobId?: string;
}

export interface JobSearchParams {
  keyword: string;
  location: string;
  dateSincePosted?: string;
  jobType?: string;
  remoteFilter?: string;
  salary?: string;
  experienceLevel?: string;
  limit?: string;
}

/**
 * Fetch jobs from LinkedIn based on search parameters
 */
export async function fetchLinkedInJobs(
  params: JobSearchParams
): Promise<LinkedInJob[]> {
  try {
    const queryOptions = {
      keyword: params.keyword,
      location: params.location,
      dateSincePosted: params.dateSincePosted || "past Week",
      jobType: params.jobType || "",
      remoteFilter: params.remoteFilter || "",
      salary: params.salary || "",
      experienceLevel: params.experienceLevel || "",
      limit: params.limit || "10",
    };

    console.log("Fetching LinkedIn jobs with params:", queryOptions);

    const jobs = await linkedInJobsAPI.query(queryOptions);

    console.log(`Found ${jobs.length} jobs from LinkedIn`);

    return jobs;
  } catch (error) {
    console.error("Error fetching LinkedIn jobs:", error);
    throw new Error(
      `Failed to fetch jobs from LinkedIn: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Fetch jobs based on user preferences
 */
export async function fetchJobsByPreferences(preferences: {
  position: string;
  location: string;
  expectedSalary?: number;
  industry?: string;
}) {
  const searchParams: JobSearchParams = {
    keyword: preferences.position,
    location: preferences.location,
    dateSincePosted: "past Week",
    limit: "20", // Fetch more to give AI better options
  };

  // Add salary filter if provided
  if (preferences.expectedSalary) {
    // Convert to salary range
    if (preferences.expectedSalary >= 10000000) {
      searchParams.salary = "100000+";
    } else if (preferences.expectedSalary >= 5000000) {
      searchParams.salary = "80000+";
    } else if (preferences.expectedSalary >= 3000000) {
      searchParams.salary = "60000+";
    }
  }

  return await fetchLinkedInJobs(searchParams);
}
