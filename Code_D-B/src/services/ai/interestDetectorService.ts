import { sanitize } from '../../utils/helpers/stringHelpers';

/**
 * Interest Detector Service — fast, offline keyword-based detection.
 */

const INTEREST_MAP: Record<string, string> = {
  // Frontend
  react: 'React / Frontend',
  angular: 'Angular / Frontend',
  vue: 'Vue.js / Frontend',
  html: 'HTML / CSS',
  css: 'HTML / CSS',
  tailwind: 'CSS Frameworks',
  bootstrap: 'CSS Frameworks',
  frontend: 'Frontend Development',

  // Backend
  node: 'Node.js / Backend',
  express: 'Node.js / Backend',
  django: 'Python / Backend',
  flask: 'Python / Backend',
  fastapi: 'Python / Backend',
  backend: 'Backend Development',
  api: 'API Development',
  rest: 'API Development',

  // Languages
  python: 'Python',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  java: 'Java',
  cpp: 'C++',
  golang: 'Go',
  rust: 'Rust',

  // Data / AI
  ai: 'Artificial Intelligence',
  ml: 'Machine Learning',
  'deep learning': 'Deep Learning',
  tensorflow: 'Machine Learning',
  pytorch: 'Machine Learning',
  data: 'Data Science',
  pandas: 'Data Science',
  sql: 'Databases',
  mongodb: 'Databases',
  database: 'Databases',

  // DevOps / Cloud
  docker: 'DevOps',
  kubernetes: 'DevOps',
  aws: 'Cloud Computing',
  azure: 'Cloud Computing',
  devops: 'DevOps',

  // General CS
  algorithm: 'Algorithms',
  leetcode: 'Data Structures & Algorithms',
  dsa: 'Data Structures & Algorithms',
  system: 'System Design',
  web: 'Web Development',
};

/**
 * Detects learning interests from a plain-text string.
 *
 * @param   {string} text - Raw text
 * @returns {string[]}    - Deduplicated array of matched interest labels
 */
export const detectInterests = (text = ''): string[] => {
  const input = sanitize(text).toLowerCase();
  const found = new Set<string>();

  for (const [keyword, interest] of Object.entries(INTEREST_MAP)) {
    if (input.includes(keyword)) {
      found.add(interest);
    }
  }

  return [...found];
};
