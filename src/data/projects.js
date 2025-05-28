export const projects = [
    {
        id: 'project-a',
        name: 'Project A',
        weeks: ['Week 1', 'Week 2'],
    },
    {
        id: 'project-b',
        name: 'Project B',
        weeks: ['Week 1', 'Week 2', 'Week 3'],
    },
];

// Log to confirm the projects are loaded
console.log('Projects loaded:', projects.map(p => p.id));