# Veritas - 财报真相分析平台

> 为深度价值投资者打造的智性奢华财报分析工具

## 🎯 项目概述

Veritas 是一个基于 AI 的财报深度分析平台，专注于撕开企业"愿景叙事"的包装，直击商业本质。

**核心哲学：** 反平庸、数据洁癖、智性奢华

**设计理念：** 深夜图书馆 —— 安静、专注、充满智性的氛围

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

## 🛠 技术栈

### 前端
- **框架：** Next.js 15 (App Router)
- **语言：** TypeScript
- **样式：** Tailwind CSS
- **动画：** Framer Motion
- **图表：** Recharts
- **图标：** Lucide React
- **字体：**
  - Inter (无衬线 - 主要文本)
  - Crimson Pro (衬线 - 标题)
  - JetBrains Mono (等宽 - 数据)

### 设计系统
- **配色方案：** 深色模式为主，极低对比度边框 (border-white/5)
- **UI 风格：** Stripe Dashboard 风格 - 优雅、数据可视化强
- **动效：** 渐进式加载，微妙的悬停效果

## 📁 项目结构

```
veritas-demo/
├── app/
│   ├── layout.tsx          # 根布局（字体配置）
│   ├── page.tsx            # 主页面（Demo）
│   └── globals.css         # 全局样式
├── components/             # 可复用组件（待创建）
├── lib/                    # 工具函数（待创建）
├── public/                 # 静态资源
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.ts
```

## 🎨 当前 Demo 功能

### 1. 公司概览
- 股票代码和公司名称
- 叙事身份 vs 经济身份对比
- 现实差距评分（1-10）

### 2. 财务指标卡片
- 季度营收（含增长率）
- 净利润（含变化趋势）
- 现金储备
- 现金跑道（生存时间）

### 3. 营收增长图表
- 使用 Recharts 的 AreaChart
- 渐变填充效果
- 极简网格线设计

### 4. AI 深度洞察
- **业务实质还原：** 撕开愿景看收入
- **财务生存透视：** 计算真实跑道
- **战场推演：** 竞争对手分析

## 🔮 后续开发路线图

### 第二阶段：管道打通（3-4 周）

#### 后端开发
1. **创建 FastAPI 后端**
   ```bash
   mkdir backend
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install fastapi uvicorn sec-api anthropic chromadb
   ```

2. **核心 API 端点**
   - `POST /api/analyze` - 分析指定公司
   - `GET /api/company/:ticker` - 获取公司数据
   - `GET /api/filings/:ticker` - 获取财报列表

3. **数据源集成**
   - 接入 SEC API（`sec-api` Python 库）
   - 实现 PDF 解析（Marker 或 PyMuPDF）
   - 配置 Claude API 调用

4. **RAG 系统**
   - 使用 ChromaDB 存储财报向量
   - 实现语义检索
   - 鼠标悬停显示原文引用

#### 前端增强
1. **搜索功能**
   - 股票代码搜索
   - 自动补全
   - 最近查看历史

2. **数据加载状态**
   - Skeleton 加载动画
   - 流式 AI 响应显示
   - 错误处理

3. **交互增强**
   - 点击数字显示财报原文
   - 图表交互（缩放、筛选）
   - 导出 PDF 报告

### 第三阶段：深度与艺术（3 周）

1. **战场地图可视化**
   - 时间轴组件
   - 竞争对手对比图
   - 里程碑标记

2. **移动端适配**
   - 响应式布局优化
   - 触摸手势支持

3. **性能优化**
   - API 响应缓存
   - 图片懒加载
   - 代码分割

4. **UI 抛光**
   - 微调字间距
   - 优化颜色对比度
   - 页面切换动画

## 🔑 环境变量配置

创建 `.env.local` 文件：

```env
# Anthropic API
ANTHROPIC_API_KEY=your_api_key_here

# SEC API (可选)
SEC_API_KEY=your_sec_api_key

# 数据库（后续）
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

## 📊 核心 AI Prompts

### Protocol A: 业务实质还原
```
Role: Senior Forensic Accountant
Task: Construct a "Dual-Layer Identity"
1. Identify "Narrative Identity" (CEO's vision)
2. Identify "Economic Identity" (Revenue source)
3. Calculate reality gap score (1-10)
```

### Protocol B: 财务生存透视
```
Role: Distressed Debt Analyst
Task: Calculate "True Runway"
- If Net Income < 0: Burn Rate = Cash / Monthly Loss
- If Net Income > 0: Accruals Ratio check
```

### Protocol C: 战场推演
```
Role: Industry Strategist
Task: Pre-Mortem Scenario Planning
- Identify 2-3 direct competitors
- Simulate Bull/Base/Bear scenarios
- Find the "Kill Switch" factor
```

## 🎯 设计原则

### 1. 数据洁癖
- 只使用官方数据源（SEC、HKEX）
- 拒绝新闻、社交媒体噪音
- 每个数字都可追溯到原文

### 2. 反黑话
- 禁用词汇：赋能、生态、闭环、降本增效
- 使用简单、直接的名词
- 避免营销形容词

### 3. 智性奢华
- 极简但不简陋
- 微妙的边框和阴影
- 优雅的字体组合
- 克制的动画

## 🚧 已知限制（当前 Demo）

- 数据为硬编码（仅展示 Legend Biotech）
- 无后端 API
- 无用户认证
- 无数据持久化
- 无搜索功能

## 📝 开发建议

### 技术债务管理
1. 将硬编码数据移至 `lib/mock-data.ts`
2. 创建 TypeScript 类型定义 (`types/company.ts`)
3. 抽取可复用组件到 `components/` 目录
4. 添加单元测试（Vitest）

### 部署方案
- **前端：** Vercel（零配置，自动 HTTPS）
- **后端：** Railway 或 Render
- **数据库：** Supabase（PostgreSQL + 向量扩展）
- **缓存：** Upstash Redis

### 成本估算（月度）
- Vercel: $0（Hobby 计划）
- Railway: ~$5（后端服务）
- Supabase: $0（免费层）
- Anthropic API: ~$50-200（取决于使用量）
- **总计：** ~$55-205/月

## 🤝 贡献指南

这是一个个人项目，但欢迎提出建议：

1. 保持代码简洁（避免过度工程）
2. 遵循设计原则（反平庸、数据洁癖）
3. 每个 PR 必须包含类型定义
4. 禁止添加不必要的依赖

## 📄 许可证

MIT License

---

**记住：** Veritas 最大的敌人不是技术难度，而是"妥协"。

在每一个微小的决定上，都选择那条更难、更孤独、但更本质的路。
