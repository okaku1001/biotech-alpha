# 🚀 Veritas 快速开始指南

## ✅ 当前状态

您现在拥有一个**完全可运行的前端 Demo**，展示了 Veritas 的核心设计理念和 UI 风格。

### 已完成的功能
- ✅ Next.js 15 + TypeScript 项目结构
- ✅ Tailwind CSS + 深色模式配置
- ✅ 三种字体组合（Inter + Crimson Pro + JetBrains Mono）
- ✅ Framer Motion 动画效果
- ✅ Recharts 图表集成
- ✅ 精美的公司分析页面（Legend Biotech 示例）
- ✅ 四个核心组件：
  - 公司概览（叙事 vs 经济身份）
  - 财务指标卡片
  - 营收增长图表
  - AI 深度洞察卡片

### 访问 Demo
```bash
# 如果服务器未运行，执行：
npm run dev

# 然后访问：
http://localhost:3000
```

## 📋 下一步行动清单

### 立即可做（1-2 天）

#### 1. 代码重构 - 提取可复用组件
```bash
mkdir -p components/ui components/company
```

创建 `components/company/MetricCard.tsx`：
```tsx
export interface MetricCardProps {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "improving" | "stable";
  description?: string;
  risk?: "high" | "medium" | "low";
}

export function MetricCard({ label, value, ... }: MetricCardProps) {
  // 从 page.tsx 移动代码到这里
}
```

#### 2. 添加 TypeScript 类型定义
创建 `types/company.ts`：
```tsx
export interface Company {
  ticker: string;
  name: string;
  narrativeIdentity: string;
  economicIdentity: string;
  realityGapScore: number;
  lastUpdated: string;
}

export interface FinancialMetrics {
  revenue: MetricData;
  netIncome: MetricData;
  cashPosition: MetricData;
  burnRate: BurnRateData;
}

export interface MetricData {
  value: string;
  change: string;
  trend: "up" | "down" | "improving" | "stable";
}

export interface AIInsight {
  type: "reality" | "survival" | "competition";
  title: string;
  content: string;
  score: number;
  label: string;
}
```

#### 3. 添加更多公司数据
创建 `lib/mock-data.ts`：
```tsx
export const companies = {
  LEGN: { /* Legend Biotech 数据 */ },
  NVDA: { /* NVIDIA 数据 */ },
  TSLA: { /* Tesla 数据 */ },
};
```

### 短期目标（1 周）

#### 4. 添加搜索功能
创建 `components/search/SearchBar.tsx`：
```tsx
"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export function SearchBar() {
  const [query, setQuery] = useState("");

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索股票代码或公司名称..."
        className="w-full pl-10 pr-4 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-white/20"
      />
    </div>
  );
}
```

#### 5. 创建公司列表页面
修改 `app/page.tsx` 为公司列表，创建 `app/company/[ticker]/page.tsx` 为详情页。

```tsx
// app/page.tsx
export default function HomePage() {
  return (
    <main>
      <SearchBar />
      <CompanyGrid companies={mockCompanies} />
    </main>
  );
}

// app/company/[ticker]/page.tsx
export default function CompanyPage({ params }: { params: { ticker: string } }) {
  const company = getCompanyData(params.ticker);
  return <CompanyDetail company={company} />;
}
```

#### 6. 添加加载状态
创建 `components/ui/Skeleton.tsx`：
```tsx
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white/5 rounded ${className}`} />
  );
}
```

### 中期目标（2-3 周）

#### 7. 搭建后端 API
```bash
mkdir backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install fastapi uvicorn sec-api anthropic python-dotenv
```

创建 `backend/main.py`：
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Veritas API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/companies/{ticker}")
async def get_company(ticker: str):
    # TODO: 实现 SEC API 调用
    return {"ticker": ticker, "name": "..."}

@app.post("/api/analyze")
async def analyze_company(ticker: str):
    # TODO: 实现 AI 分析
    return {"status": "processing", "job_id": "..."}
```

#### 8. 接入 SEC API
```python
from sec_api import QueryApi

queryApi = QueryApi(api_key=os.getenv("SEC_API_KEY"))

query = {
    "query": f"ticker:{ticker} AND formType:\"10-K\"",
    "from": "0",
    "size": "1",
    "sort": [{ "filedAt": { "order": "desc" } }]
}

filings = queryApi.get_filings(query)
```

#### 9. 集成 Claude API
```python
import anthropic

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=4096,
    messages=[{
        "role": "user",
        "content": f"{PROTOCOL_A}\n\nFiling: {filing_text}"
    }]
)

result = message.content[0].text
```

#### 10. 前端连接后端
创建 `lib/api.ts`：
```tsx
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getCompany(ticker: string) {
  const res = await fetch(`${API_BASE}/api/companies/${ticker}`);
  if (!res.ok) throw new Error("Failed to fetch company");
  return res.json();
}

export async function analyzeCompany(ticker: string) {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticker }),
  });
  return res.json();
}
```

在组件中使用：
```tsx
"use client";

import { useEffect, useState } from "react";
import { getCompany } from "@/lib/api";

export default function CompanyPage({ params }) {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCompany(params.ticker)
      .then(setCompany)
      .finally(() => setLoading(false));
  }, [params.ticker]);

  if (loading) return <Skeleton />;
  return <CompanyDetail company={company} />;
}
```

### 长期目标（1-2 个月）

#### 11. 实现 RAG 系统
```python
import chromadb

client = chromadb.Client()
collection = client.create_collection("filings")

# 存储文档
collection.add(
    documents=[chunk1, chunk2, ...],
    metadatas=[{"ticker": "LEGN", "section": "MD&A"}],
    ids=["id1", "id2", ...]
)

# 检索
results = collection.query(
    query_texts=["What is the revenue breakdown?"],
    n_results=5
)
```

#### 12. 添加用户认证
使用 Clerk 或 NextAuth.js：
```bash
npm install @clerk/nextjs
```

```tsx
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="zh-CN">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

#### 13. 部署到生产环境

**前端（Vercel）：**
```bash
npm install -g vercel
vercel login
vercel --prod
```

**后端（Railway）：**
1. 访问 railway.app
2. 连接 GitHub 仓库
3. 选择 `backend` 目录
4. 添加环境变量
5. 自动部署

## 🎯 关键决策点

### 何时添加数据库？
**信号：** 当你需要存储用户数据或缓存分析结果时。

**推荐方案：**
- Supabase（PostgreSQL + 向量扩展）
- 或 Railway 自带的 PostgreSQL

### 何时添加认证？
**信号：** 当你需要限制 API 使用或保存用户偏好时。

**推荐方案：**
- Clerk（最简单，免费层慷慨）
- NextAuth.js（开源，完全控制）

### 何时优化性能？
**信号：** 当页面加载时间 > 3 秒或 Lighthouse 分数 < 90 时。

**优化清单：**
- [ ] 启用 Next.js 图片优化
- [ ] 添加 API 响应缓存
- [ ] 使用 React.memo 优化组件
- [ ] 代码分割（dynamic import）

## 🐛 常见问题

### Q: 如何添加新的公司数据？
A: 编辑 `lib/mock-data.ts`，复制 Legend Biotech 的数据结构。

### Q: 如何修改配色方案？
A: 编辑 `app/globals.css` 中的 CSS 变量。

### Q: 如何添加新的 AI 洞察类型？
A: 在 `types/company.ts` 中添加新的 `type`，然后在 `InsightCard` 组件中添加对应的图标和颜色。

### Q: 如何测试 API 集成？
A: 使用 Postman 或 curl 测试后端 API，然后在前端使用 `console.log` 调试。

## 📚 学习资源

### Next.js
- [官方文档](https://nextjs.org/docs)
- [App Router 教程](https://nextjs.org/learn)

### Tailwind CSS
- [官方文档](https://tailwindcss.com/docs)
- [Tailwind UI](https://tailwindui.com/)（付费但值得）

### FastAPI
- [官方文档](https://fastapi.tiangolo.com/)
- [教程](https://fastapi.tiangolo.com/tutorial/)

### Claude API
- [Anthropic 文档](https://docs.anthropic.com/)
- [Prompt 工程指南](https://docs.anthropic.com/claude/docs/prompt-engineering)

## 💡 最后的建议

### 开发节奏
1. **第 1 周：** 完善前端（组件化、类型定义、多公司数据）
2. **第 2-3 周：** 搭建后端（FastAPI + SEC API + Claude）
3. **第 4 周：** 前后端集成 + 测试
4. **第 5-6 周：** RAG 系统 + 性能优化
5. **第 7-8 周：** 部署 + 抛光

### 避免的陷阱
- ❌ 不要过早优化（先让功能跑起来）
- ❌ 不要添加不必要的依赖（能自己写就自己写）
- ❌ 不要忽视错误处理（用户体验很重要）
- ❌ 不要跳过类型定义（TypeScript 是你的朋友）

### 保持动力
- 每完成一个功能，立即部署到 Vercel 预览
- 分享给朋友获取反馈
- 记录开发日志（写博客或推文）
- 加入相关社区（Next.js Discord、FastAPI Discord）

---

**记住：** 你现在拥有的不仅是代码，更是一个**完整的愿景**。

每一行代码都应该服务于那个愿景：
- 反平庸
- 数据洁癖
- 智性奢华

当你感到疲惫或迷茫时，回到 Demo 页面，看看那个深色的界面、优雅的字体、微妙的动画。

**这就是你要打造的东西。**

祝你的代码像你的思考一样深邃。🚀
