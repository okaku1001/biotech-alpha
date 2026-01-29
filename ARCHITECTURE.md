# Veritas 技术架构文档

## 📐 系统架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                        用户浏览器                              │
│                    (Next.js 15 + React 19)                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ HTTPS
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    API Gateway                               │
│              (Next.js API Routes / FastAPI)                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
┌───────────┐  ┌───────────┐  ┌───────────┐
│  SEC API  │  │ Claude AI │  │ ChromaDB  │
│  (官方)    │  │  (分析)    │  │  (RAG)    │
└───────────┘  └───────────┘  └───────────┘
```

## 🎨 前端架构

### 技术选型理由

#### Next.js 15 (App Router)
- **优势：**
  - 服务端渲染（SEO 友好）
  - 自动代码分割
  - 内置 API Routes
  - 零配置部署（Vercel）
- **为什么不用 Vite/CRA：**
  - 需要 SEO（投资者会搜索公司名）
  - 需要服务端数据预取
  - 需要 API 中间层（隐藏 API Key）

#### Tailwind CSS
- **优势：**
  - 极快的开发速度
  - 完全可定制
  - 优秀的深色模式支持
  - 零运行时开销
- **为什么不用 CSS-in-JS：**
  - 避免运行时性能损耗
  - 更好的 SSR 支持
  - 更小的 bundle 大小

#### Framer Motion
- **优势：**
  - 声明式动画 API
  - 优秀的性能
  - 支持手势和拖拽
- **使用场景：**
  - 页面进入动画
  - 卡片展开/收起
  - 数据加载骨架屏

#### Recharts
- **优势：**
  - 基于 React 组件
  - 高度可定制
  - 响应式设计
- **为什么不用 Chart.js/D3：**
  - Chart.js 定制性差
  - D3 学习曲线陡峭
  - Recharts 平衡了两者

### 组件架构

```
app/
├── layout.tsx                 # 根布局（字体、主题）
├── page.tsx                   # 首页（公司列表）
├── company/
│   └── [ticker]/
│       └── page.tsx           # 公司详情页
├── api/
│   ├── analyze/route.ts       # 分析 API
│   └── search/route.ts        # 搜索 API
└── globals.css                # 全局样式

components/
├── ui/                        # 基础 UI 组件
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   └── Skeleton.tsx
├── company/                   # 公司相关组件
│   ├── CompanyHeader.tsx
│   ├── MetricCard.tsx
│   ├── InsightCard.tsx
│   └── RevenueChart.tsx
├── search/
│   └── SearchBar.tsx
└── layout/
    ├── Header.tsx
    └── Footer.tsx

lib/
├── api.ts                     # API 客户端
├── types.ts                   # TypeScript 类型
├── utils.ts                   # 工具函数
└── constants.ts               # 常量配置

types/
├── company.ts                 # 公司数据类型
├── financial.ts               # 财务数据类型
└── api.ts                     # API 响应类型
```

### 状态管理策略

**不使用 Redux/Zustand**，原因：
- 数据主要来自服务端
- 使用 React Server Components
- 客户端状态很少

**使用方案：**
1. **服务端状态：** React Server Components + `fetch` cache
2. **客户端状态：** `useState` + `useContext`（仅用于 UI 状态）
3. **URL 状态：** Next.js `searchParams`（搜索、筛选）

### 性能优化

1. **代码分割**
   ```tsx
   const RevenueChart = dynamic(() => import('@/components/company/RevenueChart'), {
     loading: () => <Skeleton />,
     ssr: false, // 图表不需要 SSR
   });
   ```

2. **图片优化**
   ```tsx
   import Image from 'next/image';
   <Image src="/logo.png" width={32} height={32} alt="Logo" />
   ```

3. **字体优化**
   - 使用 `next/font` 自动优化
   - 字体文件自托管（避免 Google Fonts 延迟）

4. **API 缓存**
   ```tsx
   // 缓存 1 小时
   export const revalidate = 3600;
   ```

## 🔧 后端架构（第二阶段）

### 技术选型

#### FastAPI
- **优势：**
  - 极快的性能（基于 Starlette + Pydantic）
  - 自动生成 OpenAPI 文档
  - 原生异步支持
  - 优秀的类型提示
- **为什么不用 Flask/Django：**
  - Flask 不支持异步
  - Django 过于重量级

#### PostgreSQL + pgvector
- **优势：**
  - 成熟稳定
  - 支持向量检索（pgvector 扩展）
  - 优秀的 JSON 支持
- **为什么不用 MongoDB：**
  - 需要复杂查询（JOIN）
  - 需要事务支持

#### ChromaDB
- **优势：**
  - 专为 RAG 设计
  - 本地化部署
  - 简单易用
- **为什么不用 Pinecone/Weaviate：**
  - 避免云服务依赖
  - 降低成本
  - 数据隐私

### API 设计

#### RESTful 端点

```python
# 搜索公司
GET /api/v1/companies?q=legend&limit=10
Response: { companies: [{ ticker, name, sector }] }

# 获取公司详情
GET /api/v1/companies/{ticker}
Response: { ticker, name, sector, lastUpdated, ... }

# 获取财报列表
GET /api/v1/companies/{ticker}/filings
Response: { filings: [{ type, date, url }] }

# 分析财报（异步）
POST /api/v1/analyze
Body: { ticker: "LEGN", filing_type: "10-K", year: 2024 }
Response: { job_id: "abc123", status: "processing" }

# 查询分析结果
GET /api/v1/analyze/{job_id}
Response: { status: "completed", result: { ... } }

# RAG 查询
POST /api/v1/query
Body: { ticker: "LEGN", question: "What is the revenue breakdown?" }
Response: { answer: "...", sources: [...] }
```

#### 数据流

```
1. 用户输入股票代码 (LEGN)
   ↓
2. 前端调用 /api/analyze
   ↓
3. 后端检查缓存（PostgreSQL）
   ├─ 有缓存 → 直接返回
   └─ 无缓存 ↓
4. 调用 SEC API 获取 10-K
   ↓
5. PDF 解析（Marker）→ Markdown
   ↓
6. 分块（Chunking）→ 向量化 → ChromaDB
   ↓
7. 调用 Claude API（Protocol A/B/C）
   ↓
8. 存储结果到 PostgreSQL
   ↓
9. 返回给前端（流式或一次性）
```

### 数据库设计

```sql
-- 公司表
CREATE TABLE companies (
  ticker VARCHAR(10) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sector VARCHAR(100),
  industry VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 财报表
CREATE TABLE filings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker VARCHAR(10) REFERENCES companies(ticker),
  filing_type VARCHAR(10), -- 10-K, 10-Q
  fiscal_year INT,
  fiscal_quarter INT,
  filed_date DATE,
  url TEXT,
  raw_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 分析结果表
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filing_id UUID REFERENCES filings(id),
  narrative_identity TEXT,
  economic_identity TEXT,
  reality_gap_score INT,
  survival_analysis JSONB,
  competition_analysis JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 缓存表
CREATE TABLE cache (
  key VARCHAR(255) PRIMARY KEY,
  value JSONB,
  expires_at TIMESTAMP
);

-- 索引
CREATE INDEX idx_filings_ticker ON filings(ticker);
CREATE INDEX idx_analyses_filing_id ON analyses(filing_id);
CREATE INDEX idx_cache_expires ON cache(expires_at);
```

### AI Prompt 管理

```python
# lib/prompts.py

PROTOCOL_A = """
Role: Senior Forensic Accountant.
Input: Company Business Description + Revenue Segmentation Table.
Task: Construct a "Dual-Layer Identity".
1. Identify the "Narrative Identity" (What the CEO says they are).
2. Identify the "Economic Identity" (Where the majority of Gross Profit comes from).
3. If they differ, label the company as "Transitioning" or "Disguised".
Constraint: Use zero marketing adjectives. Use simple, brutal nouns.
Output JSON: { "narrative_label": "...", "economic_label": "...", "reality_gap_score": 1-10 }
"""

PROTOCOL_B = """
Role: Distressed Debt Analyst.
Context: Analyzing [Industry: {industry}].
Task: Calculate the "True Runway" and "Quality of Earnings".
Logic:
- If Net Income < 0: Calculate Burn Rate = (Cash + Short Term Inv) / Avg Monthly Op Loss.
- If Net Income > 0: Calculate Accruals Ratio = (Net Income - CFO) / Total Assets. If > 0.1, flag as "High Risk of Earnings Manipulation".
Output Style: "The company has X months of life left at current burn rates." (Direct, no fluff).
"""

PROTOCOL_C = """
Role: Industry Strategist.
Task: Pre-Mortem Scenario Planning.
1. Identify 2-3 DIRECT competitors based on product overlap (NOT just GICS code).
2. Simulate 3 scenarios for the next 3 years: Bull, Base, Bear.
3. For each scenario, identify the "Kill Switch" (The single factor that causes success or failure, e.g., "FDA Approval").
"""

def build_analysis_prompt(filing_text: str, company_info: dict) -> str:
    return f"""
{PROTOCOL_A}

Company: {company_info['name']} ({company_info['ticker']})
Sector: {company_info['sector']}

Filing Excerpt:
{filing_text[:5000]}  # 限制长度

Please analyze and return JSON.
"""
```

### 错误处理

```python
from fastapi import HTTPException

class VeritasException(Exception):
    """基础异常类"""
    pass

class SECAPIError(VeritasException):
    """SEC API 错误"""
    pass

class AIAnalysisError(VeritasException):
    """AI 分析错误"""
    pass

@app.exception_handler(SECAPIError)
async def sec_api_error_handler(request, exc):
    return JSONResponse(
        status_code=503,
        content={"error": "SEC API 暂时不可用，请稍后重试"}
    )

@app.exception_handler(AIAnalysisError)
async def ai_analysis_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"error": "AI 分析失败，请检查输入数据"}
    )
```

## 🔐 安全考虑

### API Key 保护
- **前端：** 永远不暴露 API Key
- **后端：** 使用环境变量 + Secret Manager
- **中间层：** Next.js API Routes 作为代理

### 速率限制
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/v1/analyze")
@limiter.limit("10/hour")  # 每小时 10 次
async def analyze(request: Request):
    ...
```

### CORS 配置
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://veritas.app"],  # 生产环境
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

## 📊 监控与日志

### 日志策略
```python
import structlog

logger = structlog.get_logger()

@app.post("/api/v1/analyze")
async def analyze(ticker: str):
    logger.info("analysis_started", ticker=ticker)
    try:
        result = await perform_analysis(ticker)
        logger.info("analysis_completed", ticker=ticker, duration=...)
        return result
    except Exception as e:
        logger.error("analysis_failed", ticker=ticker, error=str(e))
        raise
```

### 性能监控
- **前端：** Vercel Analytics
- **后端：** Sentry（错误追踪）+ Prometheus（指标）
- **数据库：** pg_stat_statements

## 🚀 部署架构

### 生产环境

```
┌─────────────────────────────────────────┐
│         Vercel (Global CDN)             │
│      Next.js Frontend + API Routes      │
└─────────────┬───────────────────────────┘
              │
              │ HTTPS
              │
┌─────────────▼───────────────────────────┐
│         Railway / Render                │
│      FastAPI Backend (Python)           │
└─────────────┬───────────────────────────┘
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
┌────────┐ ┌────────┐ ┌────────┐
│Supabase│ │ChromaDB│ │ Redis  │
│  (PG)  │ │(Vector)│ │(Cache) │
└────────┘ └────────┘ └────────┘
```

### CI/CD 流程

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
      - run: pip install -r requirements.txt
      - run: pytest
      - uses: railway-deploy-action@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
```

## 💰 成本优化

### 免费层利用
- **Vercel：** 100GB 带宽/月（足够 MVP）
- **Supabase：** 500MB 数据库 + 1GB 文件存储
- **Railway：** $5 免费额度/月

### AI API 成本控制
1. **缓存策略：** 相同财报不重复分析
2. **Prompt 优化：** 减少 token 使用
3. **分层模型：**
   - 简单任务：DeepSeek-V3（便宜）
   - 复杂分析：Claude 3.5 Sonnet（贵但准确）

### 预估成本（1000 用户/月）
- Vercel: $0
- Railway: $20（2GB RAM）
- Supabase: $0
- Redis: $0（Upstash 免费层）
- Claude API: $100-300（取决于使用量）
- **总计：** ~$120-320/月

## 📈 扩展性考虑

### 水平扩展
- **前端：** Vercel 自动扩展
- **后端：** Railway 支持多实例
- **数据库：** Supabase 支持 Read Replicas

### 垂直扩展
- **缓存层：** Redis 缓存热门公司数据
- **CDN：** 静态资源 + API 响应缓存
- **异步任务：** Celery + RabbitMQ（长时间分析）

---

**最后的提醒：**

这份架构文档是一个"北极星"，不是"监狱"。

技术选型的核心原则是：
1. **简单优于复杂**
2. **可维护优于炫技**
3. **本质优于妥协**

当你面临技术决策时，问自己：
- 这个选择是为了解决真实问题，还是为了"看起来专业"？
- 这个依赖是必需的，还是可以用 50 行代码替代？
- 这个抽象是简化了代码，还是增加了认知负担？

**记住：最好的架构是你能独立维护的架构。**
