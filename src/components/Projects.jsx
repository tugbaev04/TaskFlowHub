import React, { useState } from 'react';
import { Card, List, Typography, Button, Modal, Form, Input, Popconfirm, Progress, Tabs, Badge } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { projects } from '../data/projects';
import { projectTasks } from '../data/tasks';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Projects = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [localProjects, setLocalProjects] = useState(projects);
    const [form] = Form.useForm();

    // Calculate project statistics
    const calculateProjectStats = (projectId) => {
        let totalTasks = 0;
        let completedTasks = 0;

        if (projectTasks[projectId]) {
            Object.keys(projectTasks[projectId]).forEach(week => {
                const weekTasks = projectTasks[projectId][week];
                totalTasks += weekTasks.todo.length + weekTasks.inProgress.length + weekTasks.done.length;
                completedTasks += weekTasks.done.length;
            });
        }

        return {
            total: totalTasks,
            completed: completedTasks,
            completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        };
    };

    const showAddProjectModal = () => {
        setEditingProject({ isNew: true });
        form.resetFields();
        setIsModalVisible(true);
    };

    const showEditProjectModal = (project) => {
        setEditingProject({ ...project, isNew: false });
        form.setFieldsValue({
            name: project.name,
            description: project.description || '',
        });
        setIsModalVisible(true);
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        setEditingProject(null);
    };

    const handleModalOk = () => {
        form.validateFields().then(values => {
            const { name, description } = values;

            if (editingProject.isNew) {
                // Add new project
                const newProject = {
                    id: `project-${Date.now()}`,
                    name,
                    description,
                    weeks: ['Week 1'],
                };

                setLocalProjects([...localProjects, newProject]);
            } else {
                // Update existing project
                setLocalProjects(localProjects.map(project => 
                    project.id === editingProject.id 
                        ? { ...project, name, description }
                        : project
                ));
            }

            setIsModalVisible(false);
            setEditingProject(null);
        });
    };

    const handleDeleteProject = (projectId) => {
        setLocalProjects(localProjects.filter(project => project.id !== projectId));
    };

    const handleAddWeek = (projectId) => {
        setLocalProjects(localProjects.map(project => {
            if (project.id === projectId) {
                const weekNumber = project.weeks.length + 1;
                return {
                    ...project,
                    weeks: [...project.weeks, `Week ${weekNumber}`]
                };
            }
            return project;
        }));
    };

    // If a specific project is selected, show its details
    if (projectId && !projectId.includes('week-')) {
        const project = localProjects.find(p => p.id === projectId);

        if (!project) {
            return <div>Project not found</div>;
        }

        const stats = calculateProjectStats(projectId);

        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <Title level={2}>{project.name}</Title>
                    <Button 
                        type="primary" 
                        icon={<EditOutlined />} 
                        onClick={() => showEditProjectModal(project)}
                    >
                        Edit Project
                    </Button>
                </div>

                {project.description && (
                    <Text style={{ marginBottom: 20, display: 'block' }}>{project.description}</Text>
                )}

                <Card title="Project Progress" style={{ marginBottom: 20 }}>
                    <Progress 
                        percent={stats.completionRate} 
                        status={stats.completionRate === 100 ? "success" : "active"} 
                    />
                    <Text>{stats.completed} of {stats.total} tasks completed</Text>
                </Card>

                <Card 
                    title="Project Weeks" 
                    extra={
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />} 
                            onClick={() => handleAddWeek(project.id)}
                        >
                            Add Week
                        </Button>
                    }
                >
                    <List
                        grid={{ gutter: 16, column: 3 }}
                        dataSource={project.weeks}
                        renderItem={(week, index) => {
                            const weekId = index + 1;
                            const weekStats = projectTasks[project.id]?.[`week-${weekId}`] 
                                ? {
                                    todo: projectTasks[project.id][`week-${weekId}`].todo.length,
                                    inProgress: projectTasks[project.id][`week-${weekId}`].inProgress.length,
                                    done: projectTasks[project.id][`week-${weekId}`].done.length
                                }
                                : { todo: 0, inProgress: 0, done: 0 };

                            const totalTasks = weekStats.todo + weekStats.inProgress + weekStats.done;

                            return (
                                <List.Item>
                                    <Card 
                                        title={week}
                                        extra={
                                            <Link to={`/projects/${project.id}/week-${weekId}`}>
                                                <Button type="link" icon={<ArrowRightOutlined />}>View</Button>
                                            </Link>
                                        }
                                    >
                                        {totalTasks > 0 ? (
                                            <>
                                                <div style={{ marginBottom: 10 }}>
                                                    <Badge color="red" text={`To Do: ${weekStats.todo}`} style={{ marginRight: 10 }} />
                                                    <Badge color="blue" text={`In Progress: ${weekStats.inProgress}`} style={{ marginRight: 10 }} />
                                                    <Badge color="green" text={`Done: ${weekStats.done}`} />
                                                </div>
                                                <Progress 
                                                    percent={totalTasks > 0 ? Math.round((weekStats.done / totalTasks) * 100) : 0} 
                                                    size="small" 
                                                    status="active" 
                                                />
                                            </>
                                        ) : (
                                            <Text type="secondary">No tasks yet</Text>
                                        )}
                                    </Card>
                                </List.Item>
                            );
                        }}
                    />
                </Card>
            </div>
        );
    }

    // Otherwise, show the list of all projects
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Title level={2}>Projects</Title>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={showAddProjectModal}
                >
                    New Project
                </Button>
            </div>

            <List
                grid={{ gutter: 16, column: 2 }}
                dataSource={localProjects}
                renderItem={project => {
                    const stats = calculateProjectStats(project.id);

                    return (
                        <List.Item>
                            <Card 
                                title={
                                    <Link to={`/projects/${project.id}`}>{project.name}</Link>
                                }
                                actions={[
                                    <Button 
                                        type="text" 
                                        icon={<EditOutlined />} 
                                        onClick={() => showEditProjectModal(project)}
                                    >
                                        Edit
                                    </Button>,
                                    <Popconfirm
                                        title="Are you sure you want to delete this project?"
                                        onConfirm={() => handleDeleteProject(project.id)}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button 
                                            type="text" 
                                            danger 
                                            icon={<DeleteOutlined />}
                                        >
                                            Delete
                                        </Button>
                                    </Popconfirm>
                                ]}
                            >
                                <div style={{ marginBottom: 10 }}>
                                    <Text>{project.weeks.length} weeks</Text>
                                    <Text style={{ float: 'right' }}>{stats.total} tasks</Text>
                                </div>
                                <Progress 
                                    percent={stats.completionRate} 
                                    status={stats.completionRate === 100 ? "success" : "active"} 
                                />
                            </Card>
                        </List.Item>
                    );
                }}
            />

            <Modal
                title={editingProject?.isNew ? "Create New Project" : "Edit Project"}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Project Name"
                        rules={[{ required: true, message: 'Please enter a project name' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Projects;
