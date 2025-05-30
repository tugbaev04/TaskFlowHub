import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Input, Modal, Form, Select, DatePicker, Tag, Tooltip, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FlagOutlined, CalendarOutlined } from '@ant-design/icons';
import '../kanban.css';
import { emptyTaskStructure } from '../data/tasks';
import { projects } from '../data/projects';
import { useTaskContext } from '../context/TaskContext.jsx';

const { Title, Text } = Typography;
const { Option } = Select;

function ProjectBoard() {
    const { projectId, weekParam } = useParams();
    const weekId = weekParam?.replace('week-', '');
    const { projectTasks, getProjectTasks, updateProjectTasks, moveTask, addTask, updateTask, deleteTask } = useTaskContext();
    const [tasks, setTasks] = useState(emptyTaskStructure);
    const [loading, setLoading] = useState(true);
    const [projectName, setProjectName] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        // Get tasks for the specific project and week
        if (projectId && weekId) {
            try {
                const projectWeekTasks = getProjectTasks(projectId, weekId);

                // Convert simple string tasks to object tasks with more properties
                const enhancedTasks = {};
                Object.entries(projectWeekTasks).forEach(([column, columnTasks]) => {
                    enhancedTasks[column] = columnTasks.map(task => {
                        // If task is already an object, return it as is
                        if (typeof task === 'object') return task;
                        // Otherwise, convert string to object
                        return {
                            id: Math.random().toString(36).substr(2, 9),
                            title: task,
                            description: '',
                            priority: 'medium',
                            dueDate: null
                        };
                    });
                });

                setTasks(enhancedTasks);

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
    }, [projectId, weekId, projectTasks]);

    const handleTaskDragStart = (e, taskId, sourceColumn) => {
        e.dataTransfer.setData('taskId', taskId);
        e.dataTransfer.setData('sourceColumn', sourceColumn);
    };

    const handleColumnDragOver = (e) => {
        e.preventDefault();
    };

    const handleColumnDrop = (e, targetColumn) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        const sourceColumn = e.dataTransfer.getData('sourceColumn');

        if (sourceColumn === targetColumn) return;

        // Move task in the context
        moveTask(projectId, weekId, taskId, sourceColumn, targetColumn);

        // Also update local state for immediate UI update
        const newTasks = { ...tasks };
        const taskToMove = newTasks[sourceColumn].find(task => task.id === taskId);
        if (!taskToMove) return;
        newTasks[sourceColumn] = newTasks[sourceColumn].filter(task => task.id !== taskId);
        newTasks[targetColumn] = [...newTasks[targetColumn], taskToMove];
        setTasks(newTasks);
    };

    const showAddTaskModal = (column) => {
        setEditingTask({ column, isNew: true });
        form.resetFields();
        setIsModalVisible(true);
    };

    const showEditTaskModal = (task, column) => {
        setEditingTask({ ...task, column, isNew: false });
        form.setFieldsValue({
            title: task.title,
            description: task.description,
            priority: task.priority,
            dueDate: task.dueDate ? new Date(task.dueDate) : null
        });
        setIsModalVisible(true);
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        setEditingTask(null);
    };

    const handleModalOk = () => {
        form.validateFields().then(values => {
            const { title, description, priority, dueDate } = values;

            const newTasks = { ...tasks };

            if (editingTask.isNew) {
                // Add new task
                const newTask = {
                    id: Math.random().toString(36).substr(2, 9),
                    title,
                    description,
                    priority,
                    dueDate: dueDate ? dueDate.toISOString() : null
                };

                // Update context
                addTask(projectId, weekId, editingTask.column, newTask);

                // Update local state
                newTasks[editingTask.column] = [...newTasks[editingTask.column], newTask];
            } else {
                // Create updated task object
                const updatedTask = { 
                    ...editingTask, 
                    title, 
                    description, 
                    priority, 
                    dueDate: dueDate ? dueDate.toISOString() : null 
                };

                // Update context
                updateTask(projectId, weekId, editingTask.column, editingTask.id, updatedTask);

                // Update local state
                newTasks[editingTask.column] = newTasks[editingTask.column].map(task => 
                    task.id === editingTask.id ? updatedTask : task
                );
            }

            setTasks(newTasks);
            setIsModalVisible(false);
            setEditingTask(null);
        });
    };

    const handleDeleteTask = (taskId, column) => {
        // Update context
        deleteTask(projectId, weekId, column, taskId);

        // Update local state for immediate UI update
        const newTasks = { ...tasks };
        newTasks[column] = newTasks[column].filter(task => task.id !== taskId);
        setTasks(newTasks);
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'red';
            case 'medium': return 'orange';
            case 'low': return 'green';
            default: return 'blue';
        }
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
            <Title level={2}>Project: {projectName} (Week {weekId})</Title>
            <div className="kanban">
                {Object.entries(tasks).map(([column, columnTasks]) => (
                    <div 
                        className="kanban-column" 
                        key={column}
                        onDragOver={handleColumnDragOver}
                        onDrop={(e) => handleColumnDrop(e, column)}
                    >
                        <div className="column-header">
                            <h3>{columnTitles[column] || column}</h3>
                            <Button 
                                type="primary" 
                                size="small" 
                                icon={<PlusOutlined />} 
                                onClick={() => showAddTaskModal(column)}
                            >
                                Add
                            </Button>
                        </div>
                        {columnTasks.map((task) => (
                            <div 
                                className={`kanban-task ${column === 'done' ? 'task-done' : ''}`} 
                                key={task.id}
                                draggable
                                onDragStart={(e) => handleTaskDragStart(e, task.id, column)}
                            >
                                <div className="task-header">
                                    <Text strong>{task.title}</Text>
                                    <div className="task-actions">
                                        <Button 
                                            type="text" 
                                            size="small" 
                                            icon={<EditOutlined />} 
                                            onClick={() => showEditTaskModal(task, column)}
                                        />
                                        <Button 
                                            type="text" 
                                            size="small" 
                                            danger 
                                            icon={<DeleteOutlined />} 
                                            onClick={() => handleDeleteTask(task.id, column)}
                                        />
                                    </div>
                                </div>
                                {task.description && (
                                    <Text type="secondary" className="task-description">
                                        {task.description}
                                    </Text>
                                )}
                                <div className="task-footer">
                                    {task.priority && (
                                        <Tooltip title={`Priority: ${task.priority}`}>
                                            <Tag color={getPriorityColor(task.priority)} icon={<FlagOutlined />}>
                                                {task.priority}
                                            </Tag>
                                        </Tooltip>
                                    )}
                                    {task.dueDate && (
                                        <Tooltip title={`Due: ${new Date(task.dueDate).toLocaleDateString()}`}>
                                            <Tag icon={<CalendarOutlined />}>
                                                {new Date(task.dueDate).toLocaleDateString()}
                                            </Tag>
                                        </Tooltip>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <Modal
                title={editingTask?.isNew ? "Add New Task" : "Edit Task"}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="title"
                        label="Task Title"
                        rules={[{ required: true, message: 'Please enter a task title' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    <Form.Item
                        name="priority"
                        label="Priority"
                        initialValue="medium"
                    >
                        <Select>
                            <Option value="high">High</Option>
                            <Option value="medium">Medium</Option>
                            <Option value="low">Low</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="dueDate"
                        label="Due Date"
                    >
                        <DatePicker />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default ProjectBoard;
