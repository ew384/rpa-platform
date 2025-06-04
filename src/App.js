import React, { useState, useEffect } from 'react';
import {
  User,
  Settings,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Bell,
  Menu,
  X
} from 'lucide-react';

const RPAPlatform = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPlatform, setSelectedPlatform] = useState('amazon');
  const [tasks, setTasks] = useState([]);
  const [taskStatus, setTaskStatus] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // 模拟登录
  const handleLogin = (username, password) => {
    if (username && password) {
      setCurrentUser({
        name: username,
        role: username === 'admin' ? 'admin' : 'user',
        permissions: username === 'admin' ? ['all'] : ['basic']
      });
      setIsLoggedIn(true);
      // 模拟获取任务数据
      loadTasks();
    }
  };

  // 模拟WebSocket连接
  useEffect(() => {
    if (isLoggedIn) {
      const interval = setInterval(() => {
        // 模拟任务状态更新
        setTaskStatus(prev => ({
          ...prev,
          [Math.floor(Math.random() * 5)]: {
            status: ['running', 'completed', 'failed', 'pending'][Math.floor(Math.random() * 4)],
            progress: Math.floor(Math.random() * 100),
            lastUpdate: new Date().toLocaleTimeString()
          }
        }));
      }, 30000); // 30秒更新一次

      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  const loadTasks = () => {
    const mockTasks = [
      {
        id: 1,
        name: 'Amazon产品详情抓取',
        platform: 'amazon',
        status: 'running',
        progress: 75,
        lastRun: '2025-06-04 14:30',
        nextRun: '2025-06-04 15:00'
      },
      {
        id: 2,
        name: 'Amazon库存监控',
        platform: 'amazon',
        status: 'completed',
        progress: 100,
        lastRun: '2025-06-04 14:00',
        nextRun: '2025-06-04 16:00'
      },
      {
        id: 3,
        name: 'Amazon评价自动回复',
        platform: 'amazon',
        status: 'failed',
        progress: 0,
        lastRun: '2025-06-04 13:30',
        nextRun: '2025-06-04 17:00'
      }
    ];
    setTasks(mockTasks);
  };

  // 登录组件
  const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Workflow</h1>
            <p className="text-gray-600">电商自动化管理平台</p>
          </div>

          <div>
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
                />
              </div>
              <button
                onClick={() => handleLogin(username, password)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                登录
              </button>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-gray-500">
            <p>测试账号: admin/admin 或 user/user</p>
          </div>
        </div>
      </div>
    );
  };

  // 任务状态指示器
  const StatusIndicator = ({ status, progress }) => {
    const statusConfig = {
      running: { icon: Play, color: 'text-blue-500', bg: 'bg-blue-100' },
      completed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
      failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100' },
      pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div className="flex items-center space-x-2">
        <div className={`p-1 rounded-full ${config.bg}`}>
          <Icon className={`w-4 h-4 ${config.color}`} />
        </div>
        <span className="text-sm font-medium">{status === 'running' ? `${progress}%` : status}</span>
      </div>
    );
  };

  // Amazon工作流市场组件（替换原来的配置表单）
  const AmazonMarketplace = () => {
    const [selectedCategory, setSelectedCategory] = useState('运营精选');
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const [showConfigModal, setShowConfigModal] = useState(false);

    const categories = [
      { id: '运营精选', name: '运营精选', color: 'bg-purple-600' },
      { id: '数据分析', name: '数据分析', color: 'bg-blue-600' },
      { id: '库存管理', name: '库存管理', color: 'bg-green-600' },
      { id: '客户服务', name: '客户服务', color: 'bg-orange-600' }
    ];

    const workflows = {
      '运营精选': [
        {
          id: 1,
          title: '【技术】子商品详情页明细',
          subtitle: '自动与访问量-报告asin',
          description: '历史每天报表数据、一键开通、一次性将金全部的详情页面开通或关闭、也无法开通或关闭数据、通过详情页面自动与访问量-报告asin',
          icon: '📊',
          category: '数据下载',
          popular: true
        },
        {
          id: 2,
          title: '店铺状态健康状况汇总',
          subtitle: 'Account Health',
          description: '自动检测店铺的健康状况汇总报表各项指标，政策合规性、操作中断或错误的通知可查看历史或实时，详情页面自动与访问量-报告asin',
          icon: '🏥',
          category: '数据监控',
          popular: true
        },
        {
          id: 3,
          title: 'IPI库存效率',
          subtitle: 'IPI Details',
          description: '亚马逊不会删除IPI库存效率数据下载，但使用RPA平台可以让多个人员、通过详情页面自动与访问量-报告asin',
          icon: '📦',
          category: '数据监控',
          popular: false
        },
        {
          id: 4,
          title: '亚马逊-批量上传商品表',
          subtitle: '批量上传商品表',
          description: '去现有商品表来源的方式自动上传批量上传商品表',
          icon: '⬆️',
          category: '功能操作',
          popular: false
        }
      ],
      '数据分析': [
        {
          id: 5,
          title: '买家退货',
          subtitle: 'Customer Refund',
          description: '云端自动下载买家退货数据集数据报表，高效完成数据收集，随时查看产品退货详情况',
          icon: '↩️',
          category: '数据下载',
          popular: false
        },
        {
          id: 6,
          title: '未来可用的deal信息',
          subtitle: 'Create a new deal',
          description: '自动前期取所有产品未来可用的deal详情，帮助卖家快速获取平台推荐的来源信息，及时提醒相关人员',
          icon: '💰',
          category: '数据监控',
          popular: false
        }
      ],
      '库存管理': [
        {
          id: 7,
          title: '药房市场检查询问',
          subtitle: '药房市场检查询问',
          description: '最近，您的店铺可能会受到药房的受理，本RPA解决方案能够检查店铺的药房状况，以便及时调整',
          icon: '💊',
          category: '数据监控',
          popular: false
        }
      ],
      '客户服务': [
        {
          id: 8,
          title: '亚马逊-抢夺商品表上传状态',
          subtitle: '抢夺商品表上传状态',
          description: '去现有商品表来源的方式自动获取抢夺商品表上传状态',
          icon: '📤',
          category: '功能操作',
          popular: false
        }
      ]
    };

    const WorkflowCard = ({ workflow }) => (
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 p-6 relative">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">{workflow.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{workflow.title}</h3>
              {workflow.popular && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">热门</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">{workflow.subtitle}</p>
            <p className="text-sm text-gray-500 line-clamp-3">{workflow.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                {workflow.category}
              </span>
              <button
                onClick={() => {
                  setSelectedWorkflow(workflow);
                  setShowConfigModal(true);
                }}
                className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-600 transition-colors"
              >
                运行
              </button>
            </div>
          </div>
        </div>
      </div>
    );

    const ConfigModal = () => {
      const [config, setConfig] = useState({
        apiKey: '',
        secretKey: '',
        marketplace: 'US',
        sellerID: '',
        refreshInterval: 30,
        enableAutoReply: true
      });

      if (!showConfigModal || !selectedWorkflow) return null;

      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">配置工作流参数</h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">{selectedWorkflow.title}</p>
              <p className="text-sm text-gray-600">{selectedWorkflow.subtitle}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="输入Amazon API Key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                <input
                  type="password"
                  value={config.secretKey}
                  onChange={(e) => setConfig(prev => ({ ...prev, secretKey: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="输入Secret Key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">市场</label>
                <select
                  value={config.marketplace}
                  onChange={(e) => setConfig(prev => ({ ...prev, marketplace: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="US">美国</option>
                  <option value="UK">英国</option>
                  <option value="DE">德国</option>
                  <option value="JP">日本</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">卖家ID</label>
                <input
                  type="text"
                  value={config.sellerID}
                  onChange={(e) => setConfig(prev => ({ ...prev, sellerID: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="输入卖家ID"
                />
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => {
                  // 启动工作流
                  console.log('启动工作流:', selectedWorkflow, config);
                  setShowConfigModal(false);
                  // 这里可以添加实际的工作流启动逻辑
                }}
                className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors"
              >
                启动工作流
              </button>
              <button
                onClick={() => setShowConfigModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-6">
        {/* 头部导航 */}
        <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">亚马逊 RPA 工作流市场</h2>
          <p className="text-purple-100">选择并配置您需要的自动化工作流程</p>
        </div>

        {/* 分类导航 */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex space-x-4 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category.id
                  ? `${category.color} text-white`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* 工作流列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {workflows[selectedCategory]?.map((workflow) => (
            <WorkflowCard key={workflow.id} workflow={workflow} />
          ))}
        </div>

        {/* 配置模态框 */}
        <ConfigModal />
      </div>
    );
  };

  // 任务管理表格
  const TaskTable = () => {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">任务管理</h3>
            <div className="flex space-x-2">
              <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors flex items-center">
                <Plus className="w-4 h-4 mr-1" />
                新建任务
              </button>
              <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm hover:bg-gray-200 transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">任务名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">平台</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">上次运行</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">下次运行</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{task.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Amazon
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusIndicator status={task.status} progress={task.progress} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.lastRun}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.nextRun}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Play className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 仪表板
  const Dashboard = () => {
    const stats = [
      { name: '运行中任务', value: '3', icon: Play, color: 'text-blue-600' },
      { name: '已完成任务', value: '12', icon: CheckCircle, color: 'text-green-600' },
      { name: '失败任务', value: '1', icon: XCircle, color: 'text-red-600' },
      { name: '待处理任务', value: '5', icon: Clock, color: 'text-yellow-600' }
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <TaskTable />
      </div>
    );
  };

  // 侧边栏
  const Sidebar = () => {
    const menuItems = [
      { id: 'dashboard', name: '仪表板', icon: Settings },
      { id: 'amazon', name: 'Amazon工作流', icon: Settings },
      { id: 'tasks', name: '任务管理', icon: Play },
      { id: 'users', name: '用户管理', icon: User, adminOnly: true }
    ];

    return (
      <div className={`bg-gray-900 text-white ${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 flex flex-col`}>
        <div className="p-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">W</span>
            </div>
            {sidebarOpen && <span className="font-semibold">Workflow</span>}
          </div>
        </div>

        <nav className="flex-1 px-2 space-y-1">
          {menuItems.map((item) => {
            if (item.adminOnly && currentUser?.role !== 'admin') return null;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === item.id
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
      </div>
    );
  };

  // 主内容渲染
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'amazon':
        return <AmazonMarketplace />;
      case 'tasks':
        return <TaskTable />;
      case 'users':
        return <div className="bg-white rounded-lg shadow p-6">用户管理功能开发中...</div>;
      default:
        return <Dashboard />;
    }
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
                className="text-gray-500 hover:text-gray-700"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {activeTab === 'dashboard' && '仪表板'}
                {activeTab === 'amazon' && 'Amazon工作流市场'}
                {activeTab === 'tasks' && '任务管理'}
                {activeTab === 'users' && '用户管理'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700">
                <Bell className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">欢迎, {currentUser?.name}</span>
                <button
                  onClick={() => setIsLoggedIn(false)}
                  className="text-red-600 hover:text-red-800 text-sm"
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