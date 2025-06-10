// rpa-platform/src/App.js - 精简版本
import React, { useState } from 'react';
import MultiPlatformUI from './components/MultiPlatformUI';

import {
  User,
  Settings,
  Play,
  Video,
  Bell,
  Menu,
  BarChart3,
  History,
  HelpCircle
} from 'lucide-react';

const RPAPlatform = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 模拟登录
  const handleLogin = (username, password) => {
    if (username && password) {
      setCurrentUser({
        name: username,
        role: username === 'admin' ? 'admin' : 'user',
        permissions: username === 'admin' ? ['all'] : ['basic']
      });
      setIsLoggedIn(true);
    }
  };

  // 登录组件
  const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">RPA Platform</h1>
            <p className="text-gray-600">多平台自动化发布系统</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入用户名"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入密码"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleLogin(username, password);
                  }
                }}
              />
            </div>
            <button
              onClick={() => handleLogin(username, password)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              登录
            </button>
          </div>

          <div className="mt-4 text-center text-sm text-gray-500">
            <p>测试账号: admin/admin 或 user/user</p>
          </div>
        </div>
      </div>
    );
  };

  // 仪表板组件 - 简化版
  const Dashboard = () => {
    const stats = [
      { name: '今日发布', value: '12', icon: Video, color: 'text-blue-600', bg: 'bg-blue-100' },
      { name: '成功率', value: '95%', icon: BarChart3, color: 'text-green-600', bg: 'bg-green-100' },
      { name: '活跃平台', value: '4', icon: Settings, color: 'text-purple-600', bg: 'bg-purple-100' },
      { name: '总发布量', value: '1,234', icon: History, color: 'text-orange-600', bg: 'bg-orange-100' }
    ];

    return (
      <div className="space-y-6">
        {/* 欢迎信息 */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">欢迎回来, {currentUser?.name}!</h2>
          <p className="text-blue-100">
            今天是 {new Date().toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6 border">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.bg} p-3 rounded-lg`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 快速操作 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setActiveTab('multi-platform')}
              className="p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
            >
              <Video className="w-8 h-8 text-blue-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-gray-900">多平台发布</p>
              <p className="text-xs text-gray-500 mt-1">一键发布到多个平台</p>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className="p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group"
            >
              <History className="w-8 h-8 text-green-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-gray-900">发布历史</p>
              <p className="text-xs text-gray-500 mt-1">查看历史发布记录</p>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className="p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group"
            >
              <Settings className="w-8 h-8 text-purple-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-gray-900">系统设置</p>
              <p className="text-xs text-gray-500 mt-1">配置平台和账号</p>
            </button>
          </div>
        </div>

        {/* 最近活动 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">最近活动</h3>
          <div className="space-y-3">
            {[
              { action: '发布视频到微信视频号', time: '2分钟前', status: 'success' },
              { action: '发布视频到抖音', time: '5分钟前', status: 'success' },
              { action: '发布视频到小红书', time: '8分钟前', status: 'failed' },
              { action: '发布视频到快手', time: '10分钟前', status: 'success' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${activity.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                  <span className="text-sm text-gray-900">{activity.action}</span>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 简单的历史记录组件
  const HistoryPage = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">发布历史</h2>
      <p className="text-gray-600">发布历史功能开发中...</p>
    </div>
  );

  // 简单的设置组件
  const SettingsPage = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">系统设置</h2>
      <p className="text-gray-600">系统设置功能开发中...</p>
    </div>
  );

  // 帮助页面
  const HelpPage = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">帮助中心</h2>
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-2">如何使用多平台发布？</h3>
          <p className="text-sm text-blue-800">
            1. 上传视频文件<br />
            2. 选择要发布的平台<br />
            3. 配置浏览器实例<br />
            4. 填写发布内容<br />
            5. 执行发布
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-medium text-green-900 mb-2">常见问题</h3>
          <p className="text-sm text-green-800">
            如果发布失败，请检查浏览器是否已登录对应平台账号，确认网络连接正常。
          </p>
        </div>
      </div>
    </div>
  );

  // 侧边栏
  const Sidebar = () => {
    const menuItems = [
      { id: 'dashboard', name: '仪表板', icon: BarChart3 },
      { id: 'multi-platform', name: '多平台发布', icon: Video },
      { id: 'history', name: '发布历史', icon: History },
      { id: 'settings', name: '系统设置', icon: Settings },
      { id: 'help', name: '帮助中心', icon: HelpCircle },
      { id: 'users', name: '用户管理', icon: User, adminOnly: true }
    ];

    return (
      <div className={`bg-gray-900 text-white ${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 flex flex-col`}>
        <div className="p-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">R</span>
            </div>
            {sidebarOpen && <span className="font-semibold">RPA Platform</span>}
          </div>
        </div>

        <nav className="flex-1 px-2 space-y-1">
          {menuItems.map((item) => {
            if (item.adminOnly && currentUser?.role !== 'admin') return null;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-2 py-3 text-sm font-medium rounded-md transition-colors ${activeTab === item.id
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                {sidebarOpen && <span className="ml-3">{item.name}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium">{currentUser?.name}</p>
                <p className="text-xs text-gray-400">{currentUser?.role}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 主内容渲染
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'multi-platform':
        return <MultiPlatformUI />;
      case 'history':
        return <HistoryPage />;
      case 'settings':
        return <SettingsPage />;
      case 'help':
        return <HelpPage />;
      case 'users':
        return <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">用户管理</h2>
          <p className="text-gray-600">用户管理功能开发中...</p>
        </div>;
      default:
        return <Dashboard />;
    }
  };

  // 获取页面标题
  const getPageTitle = () => {
    const titles = {
      dashboard: '仪表板',
      'multi-platform': '多平台发布',
      history: '发布历史',
      settings: '系统设置',
      help: '帮助中心',
      users: '用户管理'
    };
    return titles[activeTab] || '仪表板';
  };

  if (!isLoggedIn) {
    return <LoginForm />;
  }

  return (
    <div className="h-screen bg-gray-100 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部导航 */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {getPageTitle()}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700 transition-colors">
                <Bell className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">欢迎, {currentUser?.name}</span>
                <button
                  onClick={() => setIsLoggedIn(false)}
                  className="text-red-600 hover:text-red-800 text-sm transition-colors"
                >
                  登出
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* 主内容区域 */}
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default RPAPlatform;