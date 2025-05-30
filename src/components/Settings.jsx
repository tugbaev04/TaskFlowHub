import React, { useState } from 'react';
import { Card, Form, Input, Button, Switch, Select, Divider, Typography, Tabs, Avatar, Upload, message } from 'antd';
import { UserOutlined, LockOutlined, BellOutlined, SettingOutlined, UploadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const Settings = () => {
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        taskReminders: true,
        weeklyDigest: false,
        projectUpdates: true
    });

    const [themeSettings, setThemeSettings] = useState({
        darkMode: false,
        compactMode: false,
        colorTheme: 'blue'
    });

    const handleProfileSubmit = (values) => {
        console.log('Profile updated:', values);
        message.success('Profile updated successfully');
    };

    const handlePasswordSubmit = (values) => {
        console.log('Password updated');
        passwordForm.resetFields();
        message.success('Password updated successfully');
    };

    const handleNotificationChange = (key, value) => {
        setNotificationSettings({
            ...notificationSettings,
            [key]: value
        });
        message.success('Notification settings updated');
    };

    const handleThemeChange = (key, value) => {
        setThemeSettings({
            ...themeSettings,
            [key]: value
        });
        message.success('Theme settings updated');
    };

    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG files!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must be smaller than 2MB!');
        }
        return isJpgOrPng && isLt2M;
    };

    const handleUploadChange = (info) => {
        if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    };

    return (
        <div className="settings-page">
            <Title level={2}>Settings</Title>

            <Tabs defaultActiveKey="1">
                <TabPane 
                    tab={
                        <span>
                            <UserOutlined />
                            Profile
                        </span>
                    } 
                    key="1"
                >
                    <Card title="User Profile" className="settings-card">
                        <div className="profile-header">
                            <Avatar size={100} icon={<UserOutlined />} />
                            <Upload
                                name="avatar"
                                listType="picture-card"
                                className="avatar-uploader"
                                showUploadList={false}
                                action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                                beforeUpload={beforeUpload}
                                onChange={handleUploadChange}
                            >
                                <Button icon={<UploadOutlined />}>Change Photo</Button>
                            </Upload>
                        </div>

                        <Form
                            form={form}
                            layout="vertical"
                            initialValues={{
                                name: 'John Doe',
                                email: 'john.doe@example.com',
                                jobTitle: 'Project Manager',
                                department: 'Engineering'
                            }}
                            onFinish={handleProfileSubmit}
                        >
                            <Form.Item
                                name="name"
                                label="Full Name"
                                rules={[{ required: true, message: 'Please enter your name' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Please enter your email' },
                                    { type: 'email', message: 'Please enter a valid email' }
                                ]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name="jobTitle"
                                label="Job Title"
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name="department"
                                label="Department"
                            >
                                <Select>
                                    <Option value="Engineering">Engineering</Option>
                                    <Option value="Marketing">Marketing</Option>
                                    <Option value="Sales">Sales</Option>
                                    <Option value="HR">HR</Option>
                                    <Option value="Finance">Finance</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    Save Changes
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </TabPane>

                <TabPane 
                    tab={
                        <span>
                            <LockOutlined />
                            Security
                        </span>
                    } 
                    key="2"
                >
                    <Card title="Change Password" className="settings-card">
                        <Form
                            form={passwordForm}
                            layout="vertical"
                            onFinish={handlePasswordSubmit}
                        >
                            <Form.Item
                                name="currentPassword"
                                label="Current Password"
                                rules={[{ required: true, message: 'Please enter your current password' }]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item
                                name="newPassword"
                                label="New Password"
                                rules={[
                                    { required: true, message: 'Please enter your new password' },
                                    { min: 8, message: 'Password must be at least 8 characters' }
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item
                                name="confirmPassword"
                                label="Confirm New Password"
                                dependencies={['newPassword']}
                                rules={[
                                    { required: true, message: 'Please confirm your new password' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('newPassword') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('The two passwords do not match'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    Update Password
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>

                    <Card title="Two-Factor Authentication" className="settings-card">
                        <div className="setting-row">
                            <div>
                                <Text strong>Enable Two-Factor Authentication</Text>
                                <Text type="secondary" style={{ display: 'block' }}>
                                    Add an extra layer of security to your account
                                </Text>
                            </div>
                            <Switch defaultChecked={false} />
                        </div>
                    </Card>
                </TabPane>

                <TabPane 
                    tab={
                        <span>
                            <BellOutlined />
                            Notifications
                        </span>
                    } 
                    key="3"
                >
                    <Card title="Notification Preferences" className="settings-card">
                        <div className="setting-row">
                            <div>
                                <Text strong>Email Notifications</Text>
                                <Text type="secondary" style={{ display: 'block' }}>
                                    Receive notifications via email
                                </Text>
                            </div>
                            <Switch 
                                checked={notificationSettings.emailNotifications} 
                                onChange={(checked) => handleNotificationChange('emailNotifications', checked)} 
                            />
                        </div>

                        <Divider />

                        <div className="setting-row">
                            <div>
                                <Text strong>Task Reminders</Text>
                                <Text type="secondary" style={{ display: 'block' }}>
                                    Get reminders for upcoming and overdue tasks
                                </Text>
                            </div>
                            <Switch 
                                checked={notificationSettings.taskReminders} 
                                onChange={(checked) => handleNotificationChange('taskReminders', checked)} 
                            />
                        </div>

                        <Divider />

                        <div className="setting-row">
                            <div>
                                <Text strong>Weekly Digest</Text>
                                <Text type="secondary" style={{ display: 'block' }}>
                                    Receive a summary of your weekly activity
                                </Text>
                            </div>
                            <Switch 
                                checked={notificationSettings.weeklyDigest} 
                                onChange={(checked) => handleNotificationChange('weeklyDigest', checked)} 
                            />
                        </div>

                        <Divider />

                        <div className="setting-row">
                            <div>
                                <Text strong>Project Updates</Text>
                                <Text type="secondary" style={{ display: 'block' }}>
                                    Get notified when changes are made to your projects
                                </Text>
                            </div>
                            <Switch 
                                checked={notificationSettings.projectUpdates} 
                                onChange={(checked) => handleNotificationChange('projectUpdates', checked)} 
                            />
                        </div>
                    </Card>
                </TabPane>

                <TabPane 
                    tab={
                        <span>
                            <SettingOutlined />
                            Appearance
                        </span>
                    } 
                    key="4"
                >
                    <Card title="Theme Settings" className="settings-card">
                        <div className="setting-row">
                            <div>
                                <Text strong>Dark Mode</Text>
                                <Text type="secondary" style={{ display: 'block' }}>
                                    Switch between light and dark theme
                                </Text>
                            </div>
                            <Switch 
                                checked={themeSettings.darkMode} 
                                onChange={(checked) => handleThemeChange('darkMode', checked)} 
                            />
                        </div>

                        <Divider />

                        <div className="setting-row">
                            <div>
                                <Text strong>Compact Mode</Text>
                                <Text type="secondary" style={{ display: 'block' }}>
                                    Reduce spacing for a more compact view
                                </Text>
                            </div>
                            <Switch 
                                checked={themeSettings.compactMode} 
                                onChange={(checked) => handleThemeChange('compactMode', checked)} 
                            />
                        </div>

                        <Divider />

                        <div className="setting-row">
                            <div>
                                <Text strong>Color Theme</Text>
                                <Text type="secondary" style={{ display: 'block' }}>
                                    Choose your preferred color theme
                                </Text>
                            </div>
                            <Select 
                                value={themeSettings.colorTheme} 
                                style={{ width: 120 }} 
                                onChange={(value) => handleThemeChange('colorTheme', value)}
                            >
                                <Option value="blue">Blue</Option>
                                <Option value="green">Green</Option>
                                <Option value="purple">Purple</Option>
                                <Option value="orange">Orange</Option>
                            </Select>
                        </div>
                    </Card>
                </TabPane>
            </Tabs>

            <style jsx>{`
                .settings-card {
                    margin-bottom: 20px;
                }
                .setting-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 0;
                }
                .profile-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 24px;
                    gap: 16px;
                }
                .avatar-uploader {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
            `}</style>
        </div>
    );
};

export default Settings;
