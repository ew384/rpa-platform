// rpa-platform/src/App.js - 浅色协调主题版本
import React, { useState, useEffect } from 'react';
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
  HelpCircle,
  LogOut
} from 'lucide-react';

// 登录状态管理工具
const AuthManager = {
  setLoginState: (user) => {
    const loginData = {
      user,
      timestamp: Date.now(),
      expiresIn: 24 * 60 * 60 * 1000
    };
    try {
      localStorage.setItem('rpa_platform_auth', JSON.stringify(loginData));
      console.log('[Auth] 登录状态已保存');
    } catch (error) {
      console.error('[Auth] 保存登录状态失败:', error);
    }
  },

  getLoginState: () => {
    try {
      const stored = localStorage.getItem('rpa_platform_auth');
      if (!stored) return null;

      const loginData = JSON.parse(stored);
      const now = Date.now();

      if (now - loginData.timestamp > loginData.expiresIn) {
        console.log('[Auth] 登录状态已过期');
        AuthManager.clearLoginState();
        return null;
      }

      console.log('[Auth] 恢复登录状态:', loginData.user.name);
      return loginData.user;
    } catch (error) {
      console.error('[Auth] 获取登录状态失败:', error);
      return null;
    }
  },

  clearLoginState: () => {
    try {
      localStorage.removeItem('rpa_platform_auth');
      console.log('[Auth] 登录状态已清除');
    } catch (error) {
      console.error('[Auth] 清除登录状态失败:', error);
    }
  },

  isInIframe: () => {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }
};

const RPAPlatform = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isInIframe, setIsInIframe] = useState(false);
  // 页面加载时恢复登录状态
  useEffect(() => {
    const restoreLoginState = async () => {
      console.log('[App] 应用启动，检查登录状态...');
      const inIframe = AuthManager.isInIframe();
      setIsInIframe(inIframe);

      if (inIframe) {
        console.log('[App] 检测到运行在iframe中，启用持久化登录');
        // 为iframe环境添加CSS类
        document.body.classList.add('iframe-optimized');
      }

      const savedUser = AuthManager.getLoginState();
      if (savedUser) {
        setCurrentUser(savedUser);
        setIsLoggedIn(true);
        console.log('[App] ✅ 自动登录成功:', savedUser.name);
      } else {
        console.log('[App] 未找到有效的登录状态');
      }

      setIsLoading(false);
    };

    restoreLoginState();
  }, []);

  // 🔥 新增：iframe高度自适应（精简版）
  useEffect(() => {
    if (!AuthManager.isInIframe()) return;

    console.log('[Height] 启动高度监听');

    const reportHeight = () => {
      const height = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      ) + 100;

      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'resize',
          height: height
        }, '*');
      }
    };

    // 初始报告
    setTimeout(reportHeight, 500);

    // 监听DOM变化
    const observer = new MutationObserver(() => {
      setTimeout(reportHeight, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });

    // 定时检查
    const interval = setInterval(reportHeight, 2000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, [isLoggedIn]);

  // 🔥 新增：Tab切换高度调整
  useEffect(() => {
    if (!AuthManager.isInIframe() || !isLoggedIn) return;

    setTimeout(() => {
      const height = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      ) + 100;

      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'resize',
          height: height,
          tab: activeTab
        }, '*');
      }
    }, 500);
  }, [activeTab, isLoggedIn]);

  const handleLogin = (username, password) => {
    if (username && password) {
      const user = {
        name: username,
        role: username === 'admin' ? 'admin' : 'user',
        permissions: username === 'admin' ? ['all'] : ['basic'],
        loginTime: new Date().toISOString()
      };

      setCurrentUser(user);
      setIsLoggedIn(true);
      AuthManager.setLoginState(user);

      console.log('[App] 用户登录成功:', user.name);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setActiveTab('dashboard');
    AuthManager.clearLoginState();
    console.log('[App] 用户已登出');
  };

  // 加载中组件
  const LoadingScreen = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">RPA Platform</h2>
        <p className="text-gray-600">正在加载...</p>
      </div>
    </div>
  );

  // 浅色主题登录组件
  const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      setLoginError('');

      if (!username || !password) {
        setLoginError('请输入用户名和密码');
        return;
      }

      if ((username === 'admin' && password === 'admin') ||
        (username === 'user' && password === 'user')) {
        handleLogin(username, password);
      } else {
        setLoginError('用户名或密码错误');
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">R</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">RPA Platform</h1>
            <p className="text-gray-600">多平台自动化发布系统</p>
            {AuthManager.isInIframe() && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-700">
                  🔒 已启用持久化登录，切换页面不会丢失登录状态
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入用户名"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入密码"
                autoComplete="current-password"
              />
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{loginError}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              登录
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>测试账号: admin/admin 或 user/user</p>
          </div>
        </div>
      </div>
    );
  };

  // 仪表板组件 - 浅色主题
  const Dashboard = () => {
    const stats = [
      { name: '今日发布', value: '12', icon: Video, color: 'text-blue-600', bg: 'bg-blue-50' },
      { name: '成功率', value: '95%', icon: BarChart3, color: 'text-green-600', bg: 'bg-green-50' },
      { name: '活跃平台', value: '4', icon: Settings, color: 'text-purple-600', bg: 'bg-purple-50' },
      { name: '总发布量', value: '1,234', icon: History, color: 'text-orange-600', bg: 'bg-orange-50' }
    ];

    return (
      <div className="space-y-6 pb-20">
        {/* 欢迎信息 - 浅色渐变 */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">欢迎回来, {currentUser?.name}!</h2>
          <p className="text-blue-100">
            今天是 {new Date().toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </p>
          <div className="mt-3 text-sm text-blue-100">
            <p>登录时间: {currentUser?.loginTime ? new Date(currentUser.loginTime).toLocaleString('zh-CN') : '未知'}</p>
          </div>
        </div>

        {/* 统计卡片 - 更浅的背景 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.bg} p-3 rounded-xl`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 快速操作 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">快速操作</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setActiveTab('multi-platform')}
              className="p-6 border-2 border-dashed border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all group"
            >
              <Video className="w-8 h-8 text-blue-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-gray-900 mb-1">多平台发布</p>
              <p className="text-xs text-gray-500">一键发布到多个平台</p>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className="p-6 border-2 border-dashed border-green-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all group"
            >
              <History className="w-8 h-8 text-green-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-gray-900 mb-1">发布历史</p>
              <p className="text-xs text-gray-500">查看历史发布记录</p>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className="p-6 border-2 border-dashed border-purple-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all group"
            >
              <Settings className="w-8 h-8 text-purple-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-gray-900 mb-1">系统设置</p>
              <p className="text-xs text-gray-500">配置平台和账号</p>
            </button>
          </div>
        </div>

        {/* 最近活动 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">最近活动</h3>
          <div className="space-y-3">
            {[
              { action: '发布视频到微信视频号', time: '2分钟前', status: 'success' },
              { action: '发布视频到抖音', time: '5分钟前', status: 'success' },
              { action: '发布视频到小红书', time: '8分钟前', status: 'failed' },
              { action: '发布视频到快手', time: '10分钟前', status: 'success' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
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

        {/* 新增：更多内容区域来测试滚动 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">数据趋势</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">本月发布统计</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">微信视频号</span>
                  <span className="font-medium">45 个</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">抖音</span>
                  <span className="font-medium">38 个</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">小红书</span>
                  <span className="font-medium">32 个</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">快手</span>
                  <span className="font-medium">28 个</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">平台表现</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">平均成功率</span>
                  <span className="font-medium text-green-600">95.2%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">平均发布时间</span>
                  <span className="font-medium">2.3 分钟</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">错误重试率</span>
                  <span className="font-medium">4.8%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">用户满意度</span>
                  <span className="font-medium text-green-600">4.8/5.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 新增：系统状态 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">系统状态</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">API 服务</p>
                <p className="text-xs text-green-600">正常运行</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">数据库</p>
                <p className="text-xs text-green-600">连接正常</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">存储空间</p>
                <p className="text-xs text-yellow-600">使用率 76%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 其他页面组件
  const HistoryPage = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">发布历史</h2>
      <p className="text-gray-600">发布历史功能开发中...</p>
    </div>
  );

  const SettingsPage = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">系统设置</h2>
      <p className="text-gray-600">系统设置功能开发中...</p>
    </div>
  );

  const HelpPage = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">帮助中心</h2>
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="font-medium text-blue-900 mb-2">如何使用多平台发布？</h3>
          <p className="text-sm text-blue-800">
            1. 上传视频文件<br />
            2. 选择要发布的平台<br />
            3. 配置浏览器实例<br />
            4. 填写发布内容<br />
            5. 执行发布
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
          <h3 className="font-medium text-green-900 mb-2">登录状态说明</h3>
          <p className="text-sm text-green-800">
            系统已启用持久化登录，在Electron环境中切换页面不会丢失登录状态。登录状态有效期为24小时。
          </p>
        </div>
      </div>
    </div>
  );

  // 浅色主题侧边栏 - 更窄设计
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
      <div className={`bg-white border-r border-gray-200 ${sidebarOpen ? 'w-48' : 'w-14'} transition-all duration-300 flex flex-col`}>
        {/* Logo 区域 */}
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">R</span>
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-gray-900 text-xs">RPA Platform</h1>
                <p className="text-xs text-gray-500">多平台发布</p>
              </div>
            )}
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 px-2 py-3 space-y-1">
          {menuItems.map((item) => {
            if (item.adminOnly && currentUser?.role !== 'admin') return null;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-2 py-2 text-xs font-medium rounded-lg transition-colors ${activeTab === item.id
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {sidebarOpen && <span className="ml-2 truncate">{item.name}</span>}
              </button>
            );
          })}
        </nav>

      </div>
    );
  };
  // 主内容渲染
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'multi-platform':
        return (
          <div>
            <MultiPlatformUI />
          </div>
        );
      case 'history':
        return <HistoryPage />;
      case 'settings':
        return <SettingsPage />;
      case 'help':
        return <HelpPage />;
      case 'users':
        return <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isLoggedIn) {
    return <LoginForm />;
  }

  return (
    <div className={`h-screen bg-gray-50 flex ${isInIframe ? 'iframe-optimized' : ''}`}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部导航 - 调整padding */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className={`flex items-center justify-between ${isInIframe ? 'px-4 py-3' : 'px-6 py-4'}`}>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className={`font-semibold text-gray-900 ${isInIframe ? 'text-lg' : 'text-xl'}`}>
                {getPageTitle()}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100">
                <Bell className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <span className={`text-gray-700 ${isInIframe ? 'text-xs' : 'text-sm'}`}>
                  欢迎, {currentUser?.name}
                </span>
                <button
                  onClick={handleLogout}
                  className={`text-red-600 hover:text-red-800 transition-colors rounded-lg hover:bg-red-50 ${isInIframe ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1'
                    }`}
                >
                  登出
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* 主内容区域 - 调整padding */}
        <main className={`flex-1 overflow-y-auto ${isInIframe ? 'p-4' : 'p-6'}`}>
          <div className="min-h-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default RPAPlatform;