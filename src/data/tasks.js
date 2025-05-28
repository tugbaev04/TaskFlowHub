// Data structure to store tasks for each project and week
export const projectTasks = {
  'project-a': {
    'week-1': {
      todo: ['Create wireframes', 'Research competitors'],
      inProgress: ['Setup development environment'],
      done: ['Initial project planning'],
    },
    'week-2': {
      todo: ['Design user dashboard', 'Plan database schema'],
      inProgress: ['Create component library'],
      done: ['Finalize tech stack'],
    },
  },
  'project-b': {
    'week-1': {
      todo: ['Market research', 'Define user personas'],
      inProgress: ['Competitor analysis'],
      done: ['Project kickoff meeting'],
    },
    'week-2': {
      todo: ['Design prototype', 'Plan MVP features'],
      inProgress: ['User interviews'],
      done: ['Requirements gathering'],
    },
  },
  'project-c': {
    'week-1': {
      todo: ['Setup CI/CD pipeline', 'Create test plan'],
      inProgress: ['Architecture design'],
      done: ['Requirements analysis'],
    },
    'week-2': {
      todo: ['Implement auth flow', 'Create API endpoints'],
      inProgress: ['Database setup'],
      done: ['Project infrastructure setup'],
    },
  },
};

// Default empty task structure
export const emptyTaskStructure = {
  todo: [],
  inProgress: [],
  done: [],
};
