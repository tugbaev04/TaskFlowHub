import React, { createContext, useState, useContext } from 'react';
import { projectTasks as initialProjectTasks, emptyTaskStructure } from '../data/tasks';

// Create the context
const TaskContext = createContext();

// Create a provider component
export const TaskProvider = ({ children }) => {
  // Initialize state with the data from tasks.js
  const [projectTasks, setProjectTasks] = useState(initialProjectTasks);

  // Function to update tasks for a specific project and week
  const updateProjectTasks = (projectId, weekId, newTasks) => {
    setProjectTasks(prevTasks => ({
      ...prevTasks,
      [projectId]: {
        ...prevTasks[projectId],
        [`week-${weekId}`]: newTasks
      }
    }));
  };

  // Function to get tasks for a specific project and week
  const getProjectTasks = (projectId, weekId) => {
    return projectTasks[projectId]?.[`week-${weekId}`] || emptyTaskStructure;
  };

  // Function to move a task between columns
  const moveTask = (projectId, weekId, taskId, sourceColumn, targetColumn) => {
    const currentTasks = getProjectTasks(projectId, weekId);
    
    // Find the task in the source column
    const taskToMove = currentTasks[sourceColumn].find(task => 
      typeof task === 'object' ? task.id === taskId : false
    );
    
    if (!taskToMove) return;
    
    // Create new tasks object with the task moved to the target column
    const newTasks = {
      ...currentTasks,
      [sourceColumn]: currentTasks[sourceColumn].filter(task => 
        typeof task === 'object' ? task.id !== taskId : task !== taskToMove
      ),
      [targetColumn]: [...currentTasks[targetColumn], taskToMove]
    };
    
    updateProjectTasks(projectId, weekId, newTasks);
  };

  // Function to add a new task
  const addTask = (projectId, weekId, column, task) => {
    const currentTasks = getProjectTasks(projectId, weekId);
    
    const newTasks = {
      ...currentTasks,
      [column]: [...currentTasks[column], task]
    };
    
    updateProjectTasks(projectId, weekId, newTasks);
  };

  // Function to update an existing task
  const updateTask = (projectId, weekId, column, taskId, updatedTask) => {
    const currentTasks = getProjectTasks(projectId, weekId);
    
    const newTasks = {
      ...currentTasks,
      [column]: currentTasks[column].map(task => 
        typeof task === 'object' && task.id === taskId ? updatedTask : task
      )
    };
    
    updateProjectTasks(projectId, weekId, newTasks);
  };

  // Function to delete a task
  const deleteTask = (projectId, weekId, column, taskId) => {
    const currentTasks = getProjectTasks(projectId, weekId);
    
    const newTasks = {
      ...currentTasks,
      [column]: currentTasks[column].filter(task => 
        typeof task === 'object' ? task.id !== taskId : true
      )
    };
    
    updateProjectTasks(projectId, weekId, newTasks);
  };

  // Value object to be provided to consumers
  const value = {
    projectTasks,
    getProjectTasks,
    updateProjectTasks,
    moveTask,
    addTask,
    updateTask,
    deleteTask
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

// Custom hook to use the task context
export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

export default TaskContext;