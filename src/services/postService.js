import apiClient from './api';
 
const SKILLS = ['React', 'Node.js', 'TypeScript', 'Python', 'Go', 'Rust', 'Docker', 'Kubernetes', 'GraphQL', 'PostgreSQL', 'AWS', 'Figma'];
const ROLES = ['Frontend Engineer', 'Backend Engineer', 'Platform Engineer', 'Full-Stack Engineer'];
 
// JSONPlaceholder has no skills/roles: these are derived deterministically for demo purposes.
export const enrich = (u) => ({
  ...u,
  skills: [0, 1, 2].map((k) => SKILLS[(u.id + k * 4) % SKILLS.length]),
  role: ROLES[u.id % 4],
  projects: u.company.bs.split(' ').map((w) => w[0].toUpperCase() + w.slice(1)),
});
 
export const getUsers = () => apiClient.get('/users').then((r) => r.data.map(enrich));
export const getUser = (id) => apiClient.get(`/users/${id}`).then((r) => enrich(r.data));
// JSONPlaceholder returns Latin "lorem ipsum" text. To keep all content in English,
// display text is replaced with deterministic English sample articles (by post id).
const TOPICS = ['React Performance', 'API Design', 'TypeScript Patterns', 'Docker Workflows', 'Database Indexing', 'CI/CD Pipelines', 'Code Review Habits', 'Testing Strategy', 'Kubernetes Basics', 'GraphQL Schemas'];
const ANGLES = ['A Practical Guide to', 'Lessons Learned from', 'Common Mistakes in', 'Getting Started with', 'Scaling', 'Best Practices for', 'Debugging', 'Rethinking', 'Why Teams Struggle with', 'Shipping Faster with'];
const MIDDLE = [
  'We compare the main approaches and explain the trade-offs that matter in production.',
  'Each step is backed by a short example that you can adapt to your own codebase.',
  'The goal is to keep the solution simple, readable and easy for the whole team to maintain.',
  'We also cover the pitfalls that usually show up only after the first release.',
  'Measuring results early helps the team decide what is worth improving next.',
  'Clear conventions and good documentation make this work much easier to share.',
];
const ENDING = [
  'By the end, you will have a checklist to apply on your next project.',
  'Feedback from teammates is welcome, so please share what has worked for you.',
  'Follow-up posts will go deeper into tooling and automation.',
  'The key takeaway is to start small, measure and iterate.',
  'These habits help distributed teams stay aligned and ship with confidence.',
];
const toEnglish = (p) => {
  const i = p.id - 1, topic = TOPICS[Math.floor(i / 10) % TOPICS.length];
  return {
    ...p,
    title: `${ANGLES[i % ANGLES.length]} ${topic}`,
    body: `This article walks through ${topic} using examples from real engineering projects. ${MIDDLE[i % MIDDLE.length]} ${ENDING[i % ENDING.length]}`,
  };
};
 
export const getPostsByUser = (id) => apiClient.get('/posts', { params: { userId: id } }).then((r) => r.data.map(toEnglish));
export const getPosts = () => apiClient.get('/posts').then((r) => r.data.map(toEnglish));
export const createPost = (payload) => apiClient.post('/posts', payload); // expect HTTP 201
 