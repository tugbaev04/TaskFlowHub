import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../kanban.css';
import { projectTasks, emptyTaskStructure } from '../data/tasks';
import { projects } from '../data/projects';

function ProjectBoard() {
    const { projectId, weekId } = useParams();
    const [tasks, setTasks] = useState(emptyTaskStructure);
    const [loading, setLoading] = useState(true);
    const [projectName, setProjectName] = useState('');

    useEffect(() => {
        // Get tasks for the specific project and week
        if (projectId && weekId) {
            try {
                const projectWeekTasks = projectTasks[projectId]?.[`week-${weekId}`] || emptyTaskStructure;
                setTasks(projectWeekTasks);
                
                // Find the project name from the projects data
                const project = projects.find(p => p.id === projectId);
                if (project) {
                    setProjectName(project.name);
                } else {
                    setProjectName(projectId); // Fallback to ID if not found
                }
            } catch (error) {
                console.error('Error loading tasks:', error);
                setTasks(emptyTaskStructure);
            }
        }
        setLoading(false);
    }, [projectId, weekId]);

    const handleTaskDragStart = (e, task, sourceColumn) => {
        e.dataTransfer.setData('task', task);
        e.dataTransfer.setData('sourceColumn', sourceColumn);
    };

    const handleColumnDragOver = (e) => {
        e.preventDefault();
    };

    const handleColumnDrop = (e, targetColumn) => {
        e.preventDefault();
        const task = e.dataTransfer.getData('task');
        const sourceColumn = e.dataTransfer.getData('sourceColumn');
        
        if (sourceColumn === targetColumn) return;

        // Create new tasks state
        const newTasks = { ...tasks };
        
        // Remove from source column
        newTasks[sourceColumn] = newTasks[sourceColumn].filter(t => t !== task);
        
        // Add to target column
        newTasks[targetColumn] = [...newTasks[targetColumn], task];
        
        setTasks(newTasks);
    };

    if (loading) {
        return <div>Loading tasks...</div>;
    }

    const columnTitles = {
        todo: 'To Do',
        inProgress: 'In Progress',
        done: 'Done'
    };

    return (
        <div className="kanban-container">
            <h2>Project: {projectName} (Week {weekId})</h2>
            <div className="kanban">
                {Object.entries(tasks).map(([column, columnTasks]) => (
                    <div 
                        className="kanban-column" 
                        key={column}
                        onDragOver={handleColumnDragOver}
                        onDrop={(e) => handleColumnDrop(e, column)}
                    >
                        <h3>{columnTitles[column] || column}</h3>
                        {columnTasks.map((task, i) => (
                            <div 
                                className="kanban-task" 
                                key={i}
                                draggable
                                onDragStart={(e) => handleTaskDragStart(e, task, column)}
                            >
                                {task}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProjectBoard;