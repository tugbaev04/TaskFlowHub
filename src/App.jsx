import React from 'react';
import { LaptopOutlined, NotificationOutlined, UserOutlined } from '@ant-design/icons';
import { Layout, Menu, theme } from 'antd';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { projects } from './data/projects';
import { FolderOutlined } from '@ant-design/icons';
import ProjectBoard from './components/ProjectBoard';


import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import { Navigate } from 'react-router-dom';
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const { Header, Content, Sider } = Layout;

const headerItems = ['dashboard', 'projects', 'analytics', 'settings'].map(key => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1), // отображается с заглавной буквы
}));

const siderItems = projects.map((project) => ({
    key: project.id,
    icon: <FolderOutlined />,
    label: project.name,
    children: project.weeks.map((week, i) => ({
        key: `week_${i + 1}`,  // Simplified key for weeks
        label: week,
        // No longer storing projectId and weekId here
    })),
}));

function AppLayout() {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const navigate = useNavigate();

    const onHeaderClick = (e) => {
        navigate('/' + e.key.toLowerCase());
    };

    const onSiderClick = (info) => {
        console.log("Sidebar clicked:", info);
        
        // Using the keyPath provided by Ant Design Menu's onClick
        const { keyPath } = info;
        console.log("Key path:", keyPath);
        
        // keyPath[0] is the clicked item's key, keyPath[1] is the parent's key (if any)
        if (keyPath.length > 1 && keyPath[0].startsWith('week_')) {
            // This is a week item under a project
            const projectId = keyPath[1]; // The parent (project) key
            const weekId = keyPath[0].replace('week_', ''); // Extract week number
            
            console.log(`Navigating to project ${projectId}, week ${weekId}`);
            
            // Use a simpler URL format that matches our Route definition
            navigate(`/projects/${projectId}/week-${weekId}`);
            
            // After navigation, log the current URL
            setTimeout(() => {
                console.log("Current URL after navigation:", window.location.pathname);
            }, 100);
        } else {
            // This is a project item
            navigate(`/projects/${keyPath[0]}`);
        }
    };

    return (
        <Layout>
            <Header style={{ display: 'flex', alignItems: 'center', background: colorBgContainer }}>
                <Menu
                    theme="light"
                    mode="horizontal"
                    defaultSelectedKeys={['dashboard']}
                    items={headerItems}
                    style={{ flex: 1, minWidth: 0 }}
                    onClick={onHeaderClick}
                />
            </Header>
            <Layout>
                <Sider 
                    width={200} 
                    style={{ background: colorBgContainer }}
                    breakpoint="lg"
                    collapsedWidth="0"
                >
                    <Menu
                        mode="inline"
                        defaultSelectedKeys={['dashboard']}
                        style={{ height: '100%', borderRight: 0 }}
                        items={siderItems}
                        onClick={onSiderClick}
                    />
                </Sider>
                <Layout style={{ padding: '0 24px 24px' }}>
                    <Content
                        style={{
                            padding: 24,
                            margin: 0,
                            minHeight: 280,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/projects" element={<Projects />} />
                            <Route path="/analytics" element={<Analytics />} />
                            <Route path="/settings" element={<Settings />} />
                            
                            {/* Debug route to test if routing works at all */}
                            <Route path="/debug" element={
                                <div>
                                    <h2>Debug Route</h2>
                                    <p>If you see this, routing is working!</p>
                                </div>
                            } />
                            
                            {/* Project routes */}
                            <Route path="/projects/:projectId/:weekParam" element={<ProjectBoard />} />
                            <Route path="/projects/:projectId" element={<Projects />} />
                            
                            {/* Catch-all route */}
                            <Route path="*" element={
                                <div>
                                    <h2>Page Not Found</h2>
                                    <p>The current URL is: {window.location.pathname}</p>
                                    <p>Please check the URL or navigate using the menu.</p>
                                </div>
                            } />
                        </Routes>
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
}

function App() {
    return (
        <Router>
            <AppLayout />
        </Router>
    );
}

export default App;
// const [tasks, setTasks] = useState(mockTasks);
//
// // Add function to handle task movement
// const handleDragEnd = (result) => {
//   // Update tasks state based on drag result
// };