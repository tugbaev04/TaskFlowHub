import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Select, Tabs, Divider } from 'antd';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { projects } from '../data/projects';
import { useTaskContext } from '../context/TaskContext.jsx';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const Analytics = () => {
    const [tasksByStatus, setTasksByStatus] = useState({ todo: 0, inProgress: 0, done: 0 });
    const [tasksByProject, setTasksByProject] = useState([]);
    const [tasksByWeek, setTasksByWeek] = useState([]);
    const [selectedProject, setSelectedProject] = useState('all');
    const [productivityTrend, setProductivityTrend] = useState([]);

    useEffect(() => {
        calculateAnalytics();
    }, [selectedProject, projectTasks, projects]);

    const calculateAnalytics = () => {
        // Reset counters
        let todoCount = 0;
        let inProgressCount = 0;
        let doneCount = 0;
        const projectTaskCounts = {};
        const weekTaskCounts = {};
        const productivity = [];

        // Process all projects and their tasks
        Object.keys(projectTasks).forEach(projectId => {
            if (selectedProject !== 'all' && projectId !== selectedProject) return;

            // Initialize project count if not exists
            if (!projectTaskCounts[projectId]) {
                projectTaskCounts[projectId] = { total: 0, done: 0 };
            }

            // Process weeks
            Object.keys(projectTasks[projectId]).forEach(week => {
                const weekTasks = projectTasks[projectId][week];

                // Count by status
                todoCount += weekTasks.todo.length;
                inProgressCount += weekTasks.inProgress.length;
                doneCount += weekTasks.done.length;

                // Count by project
                projectTaskCounts[projectId].total += weekTasks.todo.length + weekTasks.inProgress.length + weekTasks.done.length;
                projectTaskCounts[projectId].done += weekTasks.done.length;

                // Count by week
                if (!weekTaskCounts[week]) {
                    weekTaskCounts[week] = { total: 0, done: 0 };
                }
                weekTaskCounts[week].total += weekTasks.todo.length + weekTasks.inProgress.length + weekTasks.done.length;
                weekTaskCounts[week].done += weekTasks.done.length;

                // Add to productivity trend (simplified for demo)
                const weekNumber = parseInt(week.replace('week-', ''));
                productivity.push({
                    week: weekNumber,
                    project: projectId,
                    completed: weekTasks.done.length,
                    total: weekTasks.todo.length + weekTasks.inProgress.length + weekTasks.done.length
                });
            });
        });

        // Set state with calculated values
        setTasksByStatus({ todo: todoCount, inProgress: inProgressCount, done: doneCount });

        // Convert project counts to array for easier rendering
        const projectArray = Object.keys(projectTaskCounts).map(projectId => {
            const project = projects.find(p => p.id === projectId) || { name: projectId };
            return {
                id: projectId,
                name: project.name,
                total: projectTaskCounts[projectId].total,
                done: projectTaskCounts[projectId].done,
                completion: projectTaskCounts[projectId].total > 0 
                    ? Math.round((projectTaskCounts[projectId].done / projectTaskCounts[projectId].total) * 100) 
                    : 0
            };
        });
        setTasksByProject(projectArray);

        // Convert week counts to array
        const weekArray = Object.keys(weekTaskCounts).map(week => {
            return {
                id: week,
                name: week.replace('week-', 'Week '),
                total: weekTaskCounts[week].total,
                done: weekTaskCounts[week].done,
                completion: weekTaskCounts[week].total > 0 
                    ? Math.round((weekTaskCounts[week].done / weekTaskCounts[week].total) * 100) 
                    : 0
            };
        }).sort((a, b) => {
            // Sort weeks numerically
            const weekA = parseInt(a.id.replace('week-', ''));
            const weekB = parseInt(b.id.replace('week-', ''));
            return weekA - weekB;
        });
        setTasksByWeek(weekArray);

        // Set productivity trend
        setProductivityTrend(productivity);
    };

    // Helper function to render a bar chart
    const renderBarChart = (data, valueKey, maxValue) => {
        return (
            <div className="bar-chart">
                {data.map((item, index) => (
                    <div key={index} className="bar-chart-item">
                        <div className="bar-chart-label">{item.name}</div>
                        <div className="bar-chart-bar-container">
                            <div 
                                className="bar-chart-bar"
                                style={{ 
                                    width: `${(item[valueKey] / maxValue) * 100}%`,
                                    backgroundColor: valueKey === 'completion' 
                                        ? `hsl(${item.completion}, 70%, 50%)` 
                                        : '#1677ff'
                                }}
                            ></div>
                            <div className="bar-chart-value">{item[valueKey]}{valueKey === 'completion' ? '%' : ''}</div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Find max values for charts inside the render function
    const maxTotalTasks = Math.max(...tasksByProject.map(p => p.total), 1);
    const maxCompletion = 100; // Always 100% for completion rate

    return (
        <div className="analytics">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Title level={2}>Analytics</Title>
                <Select 
                    defaultValue="all" 
                    style={{ width: 200 }} 
                    onChange={value => setSelectedProject(value)}
                >
                    <Option value="all">All Projects</Option>
                    {projects.map(project => (
                        <Option key={project.id} value={project.id}>{project.name}</Option>
                    ))}
                </Select>
            </div>

            <Tabs defaultActiveKey="1">
                <TabPane tab="Overview" key="1">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={8}>
                            <Card title="Tasks by Status">
                                <div className="stat-container">
                                    <div className="stat-item">
                                        <div className="stat-value" style={{ color: '#f87171' }}>{tasksByStatus.todo}</div>
                                        <div className="stat-label">To Do</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value" style={{ color: '#60a5fa' }}>{tasksByStatus.inProgress}</div>
                                        <div className="stat-label">In Progress</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value" style={{ color: '#34d399' }}>{tasksByStatus.done}</div>
                                        <div className="stat-label">Done</div>
                                    </div>
                                </div>
                                <div className="pie-chart">
                                    {(tasksByStatus.todo + tasksByStatus.inProgress + tasksByStatus.done) > 0 ? (
                                        <>
                                            <div className="pie-slice todo" style={{ 
                                                '--percentage': tasksByStatus.todo / (tasksByStatus.todo + tasksByStatus.inProgress + tasksByStatus.done) * 100 
                                            }}></div>
                                            <div className="pie-slice in-progress" style={{ 
                                                '--percentage': tasksByStatus.inProgress / (tasksByStatus.todo + tasksByStatus.inProgress + tasksByStatus.done) * 100 
                                            }}></div>
                                            <div className="pie-slice done" style={{ 
                                                '--percentage': tasksByStatus.done / (tasksByStatus.todo + tasksByStatus.inProgress + tasksByStatus.done) * 100 
                                            }}></div>
                                        </>
                                    ) : (
                                        <div className="no-data">No data</div>
                                    )}
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} md={16}>
                            <Card title="Completion Rate by Project">
                                {renderBarChart(tasksByProject, 'completion', maxCompletion)}
                            </Card>
                        </Col>
                    </Row>

                    <Divider />

                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                            <Card title="Tasks by Project">
                                {renderBarChart(tasksByProject, 'total', maxTotalTasks)}
                            </Card>
                        </Col>
                        <Col xs={24} md={12}>
                            <Card title="Tasks by Week">
                                {renderBarChart(tasksByWeek, 'total', maxTotalTasks)}
                            </Card>
                        </Col>
                    </Row>
                </TabPane>
                <TabPane tab="Productivity" key="2">
                    <Card title="Productivity Trend">
                        <Text>This section would contain more detailed productivity analytics over time.</Text>
                        <div className="placeholder-chart">
                            <div className="chart-line"></div>
                            <div className="chart-line"></div>
                            <div className="chart-line"></div>
                        </div>
                    </Card>
                </TabPane>
            </Tabs>

            <style jsx>{`
                .stat-container {
                    display: flex;
                    justify-content: space-around;
                    margin-bottom: 20px;
                }
                .stat-item {
                    text-align: center;
                }
                .stat-value {
                    font-size: 24px;
                    font-weight: bold;
                }
                .stat-label {
                    font-size: 14px;
                    color: #666;
                }
                .bar-chart {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .bar-chart-item {
                    display: flex;
                    align-items: center;
                }
                .bar-chart-label {
                    width: 100px;
                    font-size: 14px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .bar-chart-bar-container {
                    flex: 1;
                    height: 20px;
                    background-color: #f0f0f0;
                    border-radius: 4px;
                    overflow: hidden;
                    position: relative;
                }
                .bar-chart-bar {
                    height: 100%;
                    transition: width 0.3s ease;
                }
                .bar-chart-value {
                    position: absolute;
                    right: 8px;
                    top: 0;
                    line-height: 20px;
                    font-size: 12px;
                    color: #333;
                }
                .pie-chart {
                    width: 150px;
                    height: 150px;
                    border-radius: 50%;
                    background-color: #f0f0f0;
                    position: relative;
                    margin: 0 auto;
                    overflow: hidden;
                }
                .pie-slice {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    transform-origin: 50% 50%;
                    clip-path: polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%);
                }
                .pie-slice.todo {
                    background-color: #f87171;
                    transform: rotate(0deg);
                    clip-path: polygon(50% 50%, 50% 0%, calc(50% + var(--percentage) * 1%) 0%);
                }
                .pie-slice.in-progress {
                    background-color: #60a5fa;
                    transform: rotate(calc(var(--percentage) * 3.6deg));
                }
                .pie-slice.done {
                    background-color: #34d399;
                    transform: rotate(calc((var(--percentage)) * 3.6deg));
                }
                .placeholder-chart {
                    height: 200px;
                    background-color: #f9f9f9;
                    border-radius: 8px;
                    position: relative;
                    margin-top: 20px;
                    overflow: hidden;
                }
                .chart-line {
                    position: absolute;
                    height: 2px;
                    background-color: #e0e0e0;
                    width: 100%;
                }
                .chart-line:nth-child(1) {
                    top: 25%;
                }
                .chart-line:nth-child(2) {
                    top: 50%;
                }
                .chart-line:nth-child(3) {
                    top: 75%;
                }
                .no-data {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100%;
                    color: #999;
                    font-size: 14px;
                }
            `}</style>
        </div>
    );
};

export default Analytics;
