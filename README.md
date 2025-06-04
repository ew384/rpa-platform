# 🐅 RPA - 电商自动化管理平台

一个现代化的RPA（机器人流程自动化）平台，专为电商场景设计，支持Amazon等主流电商平台的自动化任务管理。

![平台](https://img.shields.io/badge/龙行RPA-v1.0.0-blue.svg) ![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.0-38bdf8.svg)

## ✨ 特性

- 🎯 **Amazon工作流市场** - 预置丰富的Amazon自动化工作流模板
- 📊 **实时任务监控** - 实时查看任务执行状态和进度
- 👥 **多用户管理** - 支持不同角色的用户权限管理
- 🔧 **灵活配置** - 可视化配置工作流参数
- 📈 **数据统计** - 直观的数据仪表板
- 🔔 **智能通知** - 实时任务状态通知
- 🐳 **Docker支持** - 一键容器化部署
- 📱 **响应式设计** - 支持移动端访问

## 🛠️ 技术栈

- **前端**: React 18 + TailwindCSS + Lucide Icons
- **构建工具**: Create React App
- **容器化**: Docker + Docker Compose
- **Web服务器**: Nginx
- **开发工具**: ESLint + Prettier

## 📋 系统要求

- Node.js >= 16.0.0
- npm >= 8.0.0
- Docker (可选，用于容器化部署)

## 🚀 快速开始

### 方法一：使用启动脚本（推荐）

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd flow-rpa-platform
   ```

2. **给启动脚本执行权限**
   ```bash
   chmod +x start.sh
   ```

3. **启动开发服务器**
   ```bash
   ./start.sh dev
   ```

4. **访问应用**
   
   打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 方法二：传统方式

1. **安装依赖**
   ```bash
   npm install
   ```

2. **启动开发服务器**
   ```bash
   npm start
   ```

3. **访问应用**
   
   打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 🎮 使用说明

### 登录系统

使用以下测试账号登录：

- **管理员账号**: `admin` / `admin`
- **普通用户**: `user` / `user`

### 主要功能

#### 1. 仪表板
- 查看任务统计信息
- 监控系统整体状态
- 查看最近活动记录

#### 2. Amazon工作流市场
- 浏览预置的工作流模板
- 配置工作流参数
- 一键启动自动化任务

#### 3. 任务管理
- 创建和管理任务
- 实时监控任务状态
- 任务日志和错误排查

#### 4. 用户管理（管理员）
- 添加和管理用户
- 设置用户权限
- 查看用户活动

#### 5. 系统设置（管理员）
- 配置系统参数
- 设置通知规则
- 管理备份策略

## 📦 部署方式

### Docker部署（推荐）

1. **使用启动脚本**
   ```bash
   ./start.sh docker
   ```

2. **手动部署**
   ```bash
   docker-compose up --build -d
   ```

3. **访问应用**
   
   打开浏览器访问 [http://localhost](http://localhost)

### 生产环境部署

1. **构建生产版本**
   ```bash
   ./start.sh build
   # 或
   npm run build
   ```

2. **预览生产版本**
   ```bash
   ./start.sh preview
   # 或
   npm run preview
   ```

## 📁 项目结构

```
flow-rpa-platform/
├── public/                 # 静态资源
│   └── index.html         # HTML模板
├── src/                   # 源代码
│   ├── App.js            # 主应用组件
│   ├── index.js          # 应用入口
│   └── index.css         # 全局样式
├── docker-compose.yml    # Docker编排文件
├── Dockerfile           # Docker镜像构建文件
├── nginx.conf          # Nginx配置
├── start.sh           # 启动脚本
├── package.json       # 项目依赖
└── README.md         # 项目说明
```

## 🔧 可用脚本

### 启动脚本选项

```bash
./start.sh dev      # 启动开发服务器
./start.sh build    # 构建生产版本
./start.sh preview  # 预览生产版本
./start.sh docker   # Docker模式启动
./start.sh clean    # 清理项目文件
./start.sh help     # 显示帮助信息
```

### npm脚本

```bash
npm start           # 启动开发服务器
npm run build       # 构建生产版本
npm test            # 运行测试
npm run preview     # 预览生产版本
npm run lint        # 代码检查
npm run format      # 代码格式化
```

## 🌍 环境变量

在`.env`文件中配置以下环境变量：

```env
REACT_APP_NAME=龙行RPA平台
REACT_APP_VERSION=1.0.0
REACT_APP_API_URL=http://localhost:3001/api
NODE_ENV=production
```

## 🔒 安全说明

- 默认的测试账号仅用于演示，生产环境请修改
- 建议配置HTTPS访问
- 定期更新依赖包以修复安全漏洞
- 配置适当的访问控制和防火墙规则

## 📊 性能优化

- 使用React.memo和useMemo优化渲染性能
- 实现代码分割和懒加载
- 启用Gzip压缩
- 配置静态资源缓存
- 使用CDN加速静态资源

## 🐛 故障排除

### 常见问题

1. **端口冲突**
   ```bash
   # 检查端口占用
   lsof -i :3000
   # 或更改端口
   PORT=3001 npm start
   ```

2. **依赖安装失败**
   ```bash
   # 清理缓存
   npm cache clean --force
   # 删除node_modules重新安装
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Docker构建失败**
   ```bash
   # 清理Docker缓存
   docker system prune -f
   # 重新构建
   docker-compose up --build --force-recreate
   ```

### 调试模式

启用详细日志：

```bash
DEBUG=* npm start
```

查看Docker容器日志：

```bash
docker-compose logs -f
```

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 支持与反馈

- 🐛 **问题反馈**: 在 GitHub Issues 中提交
- 💡 **功能建议**: 通过 GitHub Discussions 讨论
- 📧 **商务合作**: contact@flow-rpa.com

## 🗺️ 开发路线图

### v1.1.0 (计划中)
- [ ] 支持更多电商平台（eBay, Shopify）
- [ ] 增加数据可视化图表
- [ ] 工作流模板市场
- [ ] API接口文档

### v1.2.0 (计划中)
- [ ] 移动端App
- [ ] 高级调度功能
- [ ] 集群部署支持
- [ ] 机器学习集成

## 🙏 致谢

感谢所有为此项目做出贡献的开发者！
