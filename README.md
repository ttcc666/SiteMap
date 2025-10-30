<div align="center">
<img width="1200" height="475" alt="Navigation Center" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 个人导航中心

一个简洁优雅的个人网站导航管理工具，帮助您整理和快速访问常用网站。

## 功能特性

- 📁 **分类管理**: 按类别组织您的网站
- 📊 **点击统计**: 查看网站访问频率和统计数据
- 🔍 **快速搜索**: 快速找到您需要的网站
- 📱 **响应式设计**: 完美适配桌面和移动设备
- ⚡ **即时访问**: 一键打开收藏的网站

## 本地运行

**环境要求:** Node.js 18+

1. 安装依赖:
   ```bash
   npm install
   ```

2. 启动开发服务器:
   ```bash
   npm run dev
   ```

3. 打开浏览器访问 `http://localhost:3000`

## 构建部署

### 构建项目
```bash
npm run build
```

### 部署到 Cloudflare Pages

1. 将代码推送到 GitHub 仓库
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
3. 选择 "Workers & Pages" → "Create application" → "Pages"
4. 选择 "Connect to Git" 并选择您的仓库
5. 配置构建设置:
   - **构建命令**: `npm run build`
   - **构建输出目录**: `dist`
6. 点击 "Save and Deploy"

### 部署到其他平台

**Vercel:**
```bash
npm install -g vercel
vercel
```

**Netlify:**
```bash
npm run build
# 将 dist 文件夹上传到 Netlify
```

## 项目结构

```
SiteMap/
├── components/          # React 组件
│   ├── AddSiteModal.tsx    # 添加网站弹窗
│   ├── CategorySection.tsx # 分类展示组件
│   ├── SiteCard.tsx        # 网站卡片组件
│   └── StatsView.tsx       # 统计视图组件
├── hooks/              # 自定义 Hooks
│   ├── useLocalStorage.ts   # 本地存储 Hook
│   └── useSiteClicks.ts     # 点击统计 Hook
├── App.tsx             # 主应用组件
├── index.tsx           # 应用入口
├── types.ts            # TypeScript 类型定义
├── vite.config.ts      # Vite 配置
└── package.json        # 项目配置
```

## 技术栈

- **React 19** - 用户界面框架
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 快速构建工具
- **Tailwind CSS** - 实用优先的 CSS 框架
- **DuckDuckGo Icons** - 网站图标服务

## 数据存储

所有数据都存储在浏览器的 localStorage 中，包括：
- 网站收藏列表
- 点击统计数据
- 用户偏好设置

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 许可证

MIT License