
const STORAGE_KEY = 'devdirectory_applications_v1';

// Demo jobs only. Replace these with a trusted jobs API later.
export const demoJobs = [
  {
    id: 'job-101',
    title: 'Frontend Developer Intern',
    company: 'Demo Tech',
    location: 'Remote, India',
    type: 'Internship',
    skills: ['React', 'JavaScript', 'CSS'],
    description: 'Build responsive interfaces and reusable React components.',
    applyUrl: 'https://example.com/careers',
  },
  {
    id: 'job-102',
    title: 'Junior Full Stack Developer',
    company: 'Sample Digital',
    location: 'Jaipur, India',
    type: 'Full-time',
    skills: ['React', 'Node.js', 'JavaScript'],
    description: 'Work on frontend features and REST API integrations.',
    applyUrl: 'https://example.com/careers',
  },
  {
    id: 'job-103',
    title: 'Python Developer Intern',
    company: 'Demo AI Labs',
    location: 'Remote, India',
    type: 'Internship',
    skills: ['Python', 'SQL', 'Git'],
    description: 'Assist with Python applications and data workflows.',
    applyUrl: 'https://example.com/careers',
  },
  {
    id: 'job-104',
    title: 'Backend Developer',
    company: 'Sample Cloud',
    location: 'Bengaluru, India',
    type: 'Full-time',
    skills: ['Node.js', 'SQL', 'REST API'],
    description: 'Develop backend APIs and maintain application services.',
    applyUrl: 'https://example.com/careers',
  },
  {
    id: 'job-105',
    title: 'UI Developer Intern',
    company: 'Demo Design Co',
    location: 'Jaipur, India',
    type: 'Internship',
    skills: ['HTML', 'CSS', 'JavaScript'],
    description: 'Create accessible web pages from design specifications.',
    applyUrl: 'https://example.com/careers',
  },
  {
    id: 'job-106',
    title: 'Junior React Developer',
    company: 'Sample Web Studio',
    location: 'Remote, India',
    type: 'Full-time',
    skills: ['React', 'JavaScript', 'Git'],
    description: 'Build and maintain modern React web applications.',
    applyUrl: 'https://example.com/careers',
  },
];

export function getApplications() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function storeApplications(applications) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
}

export function saveApplication(job, status = 'Saved') {
  const applications = getApplications();
  const existing = applications.find((item) => item.jobId === job.id);

  if (existing) {
    if (status === 'Applied') {
      existing.status = 'Applied';
      existing.updatedAt = new Date().toISOString();
      storeApplications(applications);
    }
    return;
  }

  applications.unshift({
    jobId: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    applyUrl: job.applyUrl,
    status,
    savedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  storeApplications(applications);
}

export function updateApplicationStatus(jobId, status) {
  const applications = getApplications().map((item) =>
    item.jobId === jobId
      ? { ...item, status, updatedAt: new Date().toISOString() }
      : item
  );

  storeApplications(applications);
}

export function removeApplication(jobId) {
  storeApplications(getApplications().filter((item) => item.jobId !== jobId));
}
