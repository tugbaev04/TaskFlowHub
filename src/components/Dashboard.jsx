import React from 'react';
import { Card, Row, Col, Statistic, List, Typography, Progress } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { projects } from '../data/projects';
import { projectTasks } from '../data/tasks';

const { Title, Text } = Typography;

const Dashboard = () => {
    // Calculate task statistics
    const calculateTaskStats = () => {
        let totalTasks = 0;
        let completedTasks = 0;
        let inProgressTasks = 0;

        Object.keys(projectTasks).forEach(projectId => {
            Object.keys(projectTasks[projectId]).forEach(week => {
                const weekTasks = projectTasks[projectId][week];
                totalTasks += weekTasks.todo.length + weekTasks.inProgress.length + weekTasks.done.length;
                completedTasks += weekTasks.done.length;
                inProgressTasks += weekTasks.inProgress.length;
            });
        });

        return {
            total: totalTasks,
            completed: completedTasks,
            inProgress: inProgressTasks,
            completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        };
    };

    const stats = calculateTaskStats();

    return (
        <div className="dashboard">
            <Title level={2}>Dashboard</Title>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic 
                            title="Total Tasks" 
                            value={stats.total} 
                            prefix={<TeamOutlined />} 
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic 
                            title="In Progress" 
                            value={stats.inProgress} 
                            prefix={<ClockCircleOutlined />} 
                            valueStyle={{ color: '#1677ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic 
                            title="Completed" 
                            value={stats.completed} 
                            prefix={<CheckCircleOutlined />} 
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Overall Progress */}
            <Card title="Overall Progress" className="mb-6">
                <Progress 
                    percent={stats.completionRate} 
                    status="active" 
                    strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                    }}
                />
                <Text>{stats.completionRate}% of all tasks completed</Text>
            </Card>

            {/* Projects List */}
            <Card title="Your Projects">
                <List
                    dataSource={projects}
                    renderItem={(project) => (
                        <List.Item>
                            <List.Item.Meta
                                title={<Link to={`/projects/${project.id}`}>{project.name}</Link>}
                                description={`${project.weeks.length} weeks`}
                            />
                            {/* Calculate project completion */}
                            {(() => {
                                let projectTotal = 0;
                                let projectCompleted = 0;

                                if (projectTasks[project.id]) {
                                    Object.keys(projectTasks[project.id]).forEach(week => {
                                        const weekTasks = projectTasks[project.id][week];
                                        projectTotal += weekTasks.todo.length + weekTasks.inProgress.length + weekTasks.done.length;
                                        projectCompleted += weekTasks.done.length;
                                    });
                                }

                                const completionPercent = projectTotal > 0 ? Math.round((projectCompleted / projectTotal) * 100) : 0;

                                return (
                                    <Progress 
                                        percent={completionPercent} 
                                        size="small" 
                                        status={completionPercent === 100 ? "success" : "active"} 
                                    />
                                );
                            })()}
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    );
};

export default Dashboard;
