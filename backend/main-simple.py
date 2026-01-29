from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv
import httpx
import uuid
from datetime import datetime
import json

# 加载环境变量
load_dotenv()

# 初始化 FastAPI
app = FastAPI(
    title="Veritas API",
    description="财报真相分析平台 API",
    version="0.1.0"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据模型
class AnalyzeRequest(BaseModel):
    ticker: str
    filing_type: str = "10-K"

# 生物医药公司数据库
BIOTECH_COMPANIES = {
    "LEGN": {
        "ticker": "LEGN",
        "company_name": "Legend Biotech Corporation",
        "company_name_cn": "传奇生物",
        "cik": "0001801198",
        "sic": "2834",
        "sector": "Biotechnology",
        "focus": "CAR-T细胞疗法",
        "key_products": ["Carvykti (cilta-cel)"],
        "therapeutic_areas": ["多发性骨髓瘤", "血液肿瘤"]
    },
    "SMMT": {
        "ticker": "SMMT",
        "company_name": "Summit Therapeutics Inc.",
        "company_name_cn": "Summit Therapeutics",
        "cik": "0001499620",
        "sic": "2834",
        "sector": "Biotechnology",
        "focus": "PD-1/VEGF双抗",
        "key_products": ["Ivonescimab (依沃西单抗)"],
        "therapeutic_areas": ["非小细胞肺癌", "实体瘤"]
    },
    "LLY": {
        "ticker": "LLY",
        "company_name": "Eli Lilly and Company",
        "company_name_cn": "礼来",
        "cik": "0000059478",
        "sic": "2834",
        "sector": "Pharmaceuticals",
        "focus": "GLP-1/糖尿病/肥胖症",
        "key_products": ["Mounjaro", "Zepbound", "Verzenio"],
        "therapeutic_areas": ["糖尿病", "肥胖症", "肿瘤"]
    },
    "MRNA": {
        "ticker": "MRNA",
        "company_name": "Moderna, Inc.",
        "company_name_cn": "Moderna",
        "cik": "0001682852",
        "sic": "2836",
        "sector": "Biotechnology",
        "focus": "mRNA技术平台",
        "key_products": ["Spikevax (COVID疫苗)"],
        "therapeutic_areas": ["传染病", "肿瘤", "罕见病"]
    },
    "REGN": {
        "ticker": "REGN",
        "company_name": "Regeneron Pharmaceuticals, Inc.",
        "company_name_cn": "再生元",
        "cik": "0000872589",
        "sic": "2834",
        "sector": "Biotechnology",
        "focus": "单克隆抗体",
        "key_products": ["Eylea", "Dupixent", "Libtayo"],
        "therapeutic_areas": ["眼科", "免疫", "肿瘤"]
    },
    "VRTX": {
        "ticker": "VRTX",
        "company_name": "Vertex Pharmaceuticals Incorporated",
        "company_name_cn": "福泰制药",
        "cik": "0000875320",
        "sic": "2834",
        "sector": "Biotechnology",
        "focus": "基因疗法/囊性纤维化",
        "key_products": ["Trikafta", "Casgevy"],
        "therapeutic_areas": ["囊性纤维化", "镰刀型细胞贫血症", "疼痛"]
    },
    "BMRN": {
        "ticker": "BMRN",
        "company_name": "BioMarin Pharmaceutical Inc.",
        "company_name_cn": "BioMarin",
        "cik": "0001048477",
        "sic": "2834",
        "sector": "Biotechnology",
        "focus": "罕见病",
        "key_products": ["Voxzogo", "Roctavian"],
        "therapeutic_areas": ["软骨发育不全", "血友病A", "罕见病"]
    },
    "ALNY": {
        "ticker": "ALNY",
        "company_name": "Alnylam Pharmaceuticals, Inc.",
        "company_name_cn": "Alnylam",
        "cik": "0001178670",
        "sic": "2834",
        "sector": "Biotechnology",
        "focus": "RNAi疗法",
        "key_products": ["Onpattro", "Amvuttra", "Givlaari"],
        "therapeutic_areas": ["罕见病", "心血管", "肝病"]
    }
}

class AnalyzeResponse(BaseModel):
    job_id: str
    status: str
    ticker: str
    message: str

class AnalysisResult(BaseModel):
    job_id: str
    status: str
    ticker: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

# 临时存储
analysis_jobs = {}

# AI Prompts - 专注生物医药/创新药领域分析
PROTOCOL_A = """
Role: 生物医药行业资深分析师
Task: 分析公司的业务实质与叙事差距

基于提供的公司信息，识别：
1. 叙事身份：公司对外宣传的定位（如"创新型生物科技公司"）
2. 经济身份：基于收入来源的实际业务本质（如"单一产品依赖的商业化阶段公司"）
3. 现实差距评分：1-10分（分数越高，叙事与现实差距越大）

注意：对于生物医药公司，重点关注：
- 是否有已上市产品 vs 纯研发阶段
- 收入来源是产品销售还是合作里程碑付款
- 技术平台的真实价值 vs 市场炒作

IMPORTANT: 用简体中文返回分析，语言要专业但通俗易懂，面向非专业的中国投资者。

Return ONLY a JSON object in this exact format:
{
  "narrative_label": "公司声称的身份（中文）",
  "economic_label": "实际经济身份（中文）",
  "reality_gap_score": 7,
  "key_insight": "一句话核心洞察（中文）"
}
"""

PROTOCOL_B = """
Role: 生物医药财务分析师
Task: 分析财务生存能力，提取关键财务指标

基于公司财务数据，提供：
1. 最新季度营收（百万美元）
2. 最新季度净利润（百万美元）
3. 现金储备（百万美元）
4. 营收同比变化（百分比）
5. 现金跑道（剩余运营月数，盈利公司填 null）
6. 研发投入占比（研发费用/总营收）
7. 关键财务风险

注意：对于生物医药公司，特别关注：
- 研发投入强度（通常占营收50%以上）
- 现金消耗率（Burn Rate）
- 是否需要近期融资
- 合作伙伴里程碑付款的可持续性

IMPORTANT: 用简体中文返回分析。使用最新可获得的财务数据。
IMPORTANT: 如果无法获取具体数字，基于公司类型和阶段给出合理估计。

Return ONLY a JSON object in this exact format:
{
  "quarterly_revenue": 150.5,
  "revenue_change_yoy": "+25%",
  "net_income": -45.2,
  "net_income_change": "-15%",
  "cash_position": 520.0,
  "cash_change": "-8%",
  "runway_months": 18,
  "rd_intensity": "65%",
  "financial_health": "财务健康状况评估（中文）",
  "key_risks": ["风险1（中文）", "风险2（中文）"]
}
"""

PROTOCOL_C = """
Role: 生物医药行业战略分析师
Task: 分析竞争格局与市场动态

识别：
1. 2-3个直接竞争对手（同靶点/同适应症）
2. "Kill Switch" - 决定公司成败的单一关键因素
3. 市场动态分析

注意：对于生物医药公司，重点分析：
- 同靶点竞品的临床进展对比
- 适应症市场规模和竞争格局
- 差异化优势（疗效、安全性、给药方式）
- 监管审批风险

IMPORTANT: 用简体中文返回分析，面向非专业投资者，避免过多专业术语。

Return ONLY a JSON object in this exact format:
{
  "competitors": ["竞争对手1", "竞争对手2"],
  "kill_switch": "决定成败的关键因素（中文）",
  "market_dynamics": "市场动态分析（中文）",
  "competitive_advantage": "核心竞争优势（中文）"
}
"""

PROTOCOL_D = """
Role: 财务数据分析师
Task: 提取历史季度营收数据用于图表展示

基于公司财务报告，提取最近6-8个季度的营收数据。

IMPORTANT: 使用SEC文件中的实际报告数据。
IMPORTANT: 按时间顺序返回（最早的在前）。
IMPORTANT: 如果无法获取实际数据，基于公司发展阶段给出合理估计。

Return ONLY a JSON object in this exact format:
{
  "revenue_history": [
    {"quarter": "2024-Q1", "revenue": 85.5},
    {"quarter": "2024-Q2", "revenue": 95.2},
    {"quarter": "2024-Q3", "revenue": 108.7},
    {"quarter": "2024-Q4", "revenue": 120.3},
    {"quarter": "2025-Q1", "revenue": 135.0},
    {"quarter": "2025-Q2", "revenue": 148.5},
    {"quarter": "2025-Q3", "revenue": 162.0}
  ]
}
"""

PROTOCOL_E = """
Role: 生物医药管线分析专家
Task: 分析公司的研发管线（Pipeline）

基于公司信息，分析其药物研发管线：
1. 核心管线产品（最重要的2-4个）
2. 各产品的研发阶段（临床前/I期/II期/III期/已上市）
3. 目标适应症
4. 预计关键里程碑时间点
5. 管线整体评估

注意：
- 临床前（Preclinical）：动物实验阶段
- I期（Phase 1）：安全性测试，通常20-80人
- II期（Phase 2）：有效性初步验证，通常100-300人
- III期（Phase 3）：大规模有效性验证，通常1000-3000人
- 上市（Approved）：已获FDA/EMA批准

IMPORTANT: 用简体中文返回，对专业术语提供简单解释，面向非专业投资者。

Return ONLY a JSON object in this exact format:
{
  "pipeline": [
    {
      "name": "药物名称",
      "stage": "III期",
      "indication": "适应症（中文）",
      "milestone": "预计2025年Q2公布III期数据",
      "partner": "合作伙伴（如有）"
    }
  ],
  "pipeline_strength": "管线整体评估（中文）",
  "near_term_catalysts": ["近期催化剂1", "近期催化剂2"],
  "pipeline_risks": ["管线风险1", "管线风险2"]
}
"""

@app.get("/")
async def root():
    """健康检查"""
    return {
        "status": "healthy",
        "service": "Veritas API",
        "version": "0.1.0"
    }

@app.get("/api/companies/{ticker}")
async def get_company(ticker: str):
    """获取公司基本信息"""
    ticker_upper = ticker.upper()
    if ticker_upper in BIOTECH_COMPANIES:
        return BIOTECH_COMPANIES[ticker_upper]
    else:
        raise HTTPException(status_code=404, detail=f"公司 {ticker} 不在支持列表中。本平台专注于美股生物医药公司。")

@app.get("/api/companies")
async def list_companies():
    """获取所有支持的生物医药公司列表"""
    return {
        "companies": list(BIOTECH_COMPANIES.values()),
        "total": len(BIOTECH_COMPANIES),
        "focus": "美股生物医药/创新药公司"
    }

@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_company(request: AnalyzeRequest):
    """分析公司财报"""
    try:
        job_id = str(uuid.uuid4())

        # 创建分析任务
        analysis_jobs[job_id] = {
            "status": "processing",
            "ticker": request.ticker.upper(),
            "created_at": datetime.now().isoformat(),
            "result": None,
            "error": None
        }

        # 执行分析
        error_msg = None
        try:
            result = await perform_analysis(request.ticker)
            analysis_jobs[job_id]["status"] = "completed"
            analysis_jobs[job_id]["result"] = result
        except Exception as e:
            analysis_jobs[job_id]["status"] = "failed"
            analysis_jobs[job_id]["error"] = str(e)
            error_msg = str(e)

        return AnalyzeResponse(
            job_id=job_id,
            status=analysis_jobs[job_id]["status"],
            ticker=request.ticker.upper(),
            message="Analysis completed" if analysis_jobs[job_id]["status"] == "completed" else f"Analysis failed: {error_msg}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analyze/{job_id}", response_model=AnalysisResult)
async def get_analysis_result(job_id: str):
    """查询分析结果"""
    if job_id not in analysis_jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    job = analysis_jobs[job_id]

    return AnalysisResult(
        job_id=job_id,
        status=job["status"],
        ticker=job["ticker"],
        result=job.get("result"),
        error=job.get("error")
    )

async def fetch_sec_filings(ticker: str, cik: str) -> Dict[str, Any]:
    """使用 SEC API 获取公司财报数据"""
    sec_api_key = os.getenv("SEC_API_KEY")
    if not sec_api_key:
        return None

    try:
        async with httpx.AsyncClient() as client:
            # 查询最新的财报文件（包括美国公司的 10-K/10-Q 和外国公司的 20-F/6-K）
            response = await client.post(
                "https://api.sec-api.io",
                headers={
                    "Authorization": sec_api_key,
                    "Content-Type": "application/json"
                },
                json={
                    "query": {
                        "query_string": {
                            "query": f"ticker:{ticker} AND (formType:\"10-K\" OR formType:\"10-Q\" OR formType:\"20-F\" OR formType:\"6-K\")"
                        }
                    },
                    "from": "0",
                    "size": "5",
                    "sort": [{"filedAt": {"order": "desc"}}]
                },
                timeout=30.0
            )

            if response.status_code == 200:
                data = response.json()
                filings = data.get("filings", [])
                # 过滤确保 ticker 匹配
                filings = [f for f in filings if f.get("ticker", "").upper() == ticker.upper()]
                if filings:
                    return {
                        "latest_filing": filings[0] if filings else None,
                        "filing_count": len(filings),
                        "filings": filings[:3]
                    }
            else:
                print(f"SEC API error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"SEC API exception: {str(e)}")

    return None

import asyncio

async def perform_analysis(ticker: str) -> Dict[str, Any]:
    """执行完整的财报分析（并行调用 Claude API 加速）"""
    # 获取公司信息
    try:
        company_info = await get_company(ticker)
    except HTTPException as e:
        raise Exception(f"Company not found: {ticker}")

    # 尝试获取 SEC 真实数据
    sec_data = await fetch_sec_filings(ticker, company_info.get("cik", ""))

    # 构建分析上下文 - 增加生物医药特有信息
    sec_context = ""
    if sec_data and sec_data.get("latest_filing"):
        filing = sec_data["latest_filing"]
        sec_context = f"""
SEC Filing Data:
- Latest Filing: {filing.get('formType', 'N/A')} filed on {filing.get('filedAt', 'N/A')[:10]}
- Company: {filing.get('companyName', company_info['company_name'])}
- CIK: {filing.get('cik', company_info.get('cik', 'N/A'))}
- Description: {filing.get('description', 'N/A')[:500]}
"""

    # 构建生物医药特有的上下文
    biotech_context = f"""
Company Profile:
- Name: {company_info['company_name']} ({company_info.get('company_name_cn', '')})
- Ticker: {ticker}
- Sector: {company_info.get('sector', 'Biotechnology')}
- Focus Area: {company_info.get('focus', 'N/A')}
- Key Products: {', '.join(company_info.get('key_products', []))}
- Therapeutic Areas: {', '.join(company_info.get('therapeutic_areas', []))}
"""

    # 调用 Claude API 进行分析
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise Exception("ANTHROPIC_API_KEY not set")

    # 并行调用 5 个 Protocol 分析（包括新增的管线分析）
    reality_task = analyze_with_claude(
        api_key,
        PROTOCOL_A,
        f"{biotech_context}\n{sec_context}\n分析这家生物医药公司的业务实质。"
    )

    survival_task = analyze_with_claude(
        api_key,
        PROTOCOL_B,
        f"{biotech_context}\n{sec_context}\n分析财务生存能力，提取最新财务指标。"
    )

    competition_task = analyze_with_claude(
        api_key,
        PROTOCOL_C,
        f"{biotech_context}\n{sec_context}\n分析竞争格局，重点关注同靶点/同适应症竞品。"
    )

    history_task = analyze_with_claude(
        api_key,
        PROTOCOL_D,
        f"{biotech_context}\n{sec_context}\n提取最近6-8个季度的营收数据。"
    )

    pipeline_task = analyze_with_claude(
        api_key,
        PROTOCOL_E,
        f"{biotech_context}\n{sec_context}\n分析公司的研发管线（Pipeline），包括各产品的临床阶段和预计里程碑。"
    )

    # 并行执行所有分析
    reality_analysis, survival_analysis, competition_analysis, history_analysis, pipeline_analysis = await asyncio.gather(
        reality_task, survival_task, competition_task, history_task, pipeline_task
    )

    return {
        "company_name": company_info["company_name"],
        "company_name_cn": company_info.get("company_name_cn", ""),
        "ticker": ticker.upper(),
        "focus": company_info.get("focus", ""),
        "key_products": company_info.get("key_products", []),
        "therapeutic_areas": company_info.get("therapeutic_areas", []),
        "sec_data": sec_data,
        "analysis": {
            "reality": reality_analysis,
            "survival": survival_analysis,
            "competition": competition_analysis,
            "history": history_analysis,
            "pipeline": pipeline_analysis
        }
    }

async def analyze_with_claude(api_key: str, protocol: str, context: str) -> Dict[str, Any]:
    """使用 Claude API 进行分析"""
    try:
        # 支持中转 API - 从环境变量读取 base URL
        base_url = os.getenv("ANTHROPIC_BASE_URL", "https://api.anthropic.com")
        api_url = f"{base_url}/v1/messages"

        # 支持自定义模型名称
        model_name = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-20250514")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                api_url,
                headers={
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json"
                },
                json={
                    "model": model_name,
                    "max_tokens": 2048,
                    "messages": [{
                        "role": "user",
                        "content": f"{protocol}\n\n{context}"
                    }]
                },
                timeout=60.0
            )

            if response.status_code != 200:
                print(f"Claude API error: {response.status_code} - {response.text}")
                # 如果 API 调用失败，返回 Mock 数据作为后备
                return get_mock_data(context, protocol)

            result = response.json()
            text = result["content"][0]["text"]

            # 尝试解析 JSON
            try:
                # 尝试从文本中提取 JSON
                import re
                json_match = re.search(r'\{[\s\S]*\}', text)
                if json_match:
                    return json.loads(json_match.group())
                return json.loads(text)
            except json.JSONDecodeError:
                print(f"Failed to parse JSON from Claude response: {text[:200]}")
                return get_mock_data(context, protocol)

    except Exception as e:
        print(f"Claude API exception: {str(e)}")
        # 如果出现异常，返回 Mock 数据作为后备
        return get_mock_data(context, protocol)


def get_mock_data(context: str, protocol: str) -> Dict[str, Any]:
    """获取 Mock 数据作为后备"""
    # 从 context 中提取公司代码
    ticker = ""
    if "LEGN" in context:
        ticker = "LEGN"
    elif "NVDA" in context:
        ticker = "NVDA"
    elif "TSLA" in context:
        ticker = "TSLA"

    # 每个公司的 Mock 数据
    mock_data = {
        "LEGN": {
            "reality": {
                "narrative_label": "创新型 CAR-T 细胞疗法生物技术公司",
                "economic_label": "单一产品商业化阶段的生物制药企业",
                "reality_gap_score": 7
            },
            "survival": {
                "runway_months": 18,
                "financial_health": "中等风险 - 需密切监控现金流",
                "key_risks": [
                    "Carvykti 市场渗透速度不及预期",
                    "竞争对手产品获批可能影响市场份额",
                    "研发管线单薄，缺乏后续产品"
                ]
            },
            "competition": {
                "competitors": ["BMS (Abecma)", "J&J (Tecvayli)"],
                "kill_switch": "FDA 对早期治疗线（二线）的批准进度",
                "market_dynamics": "CAR-T 市场快速增长，但竞争加剧。"
            }
        },
        "NVDA": {
            "reality": {
                "narrative_label": "AI 基础设施与加速计算平台公司",
                "economic_label": "数据中心 GPU 垄断供应商",
                "reality_gap_score": 3
            },
            "survival": {
                "runway_months": 999,
                "financial_health": "极度健康 - 现金流充裕",
                "key_risks": ["AI 投资周期可能放缓", "竞争对手追赶", "出口限制"]
            },
            "competition": {
                "competitors": ["AMD (MI300X)", "Intel (Gaudi)", "Google (TPU)"],
                "kill_switch": "AI 训练需求是否持续增长",
                "market_dynamics": "数据中心 GPU 市场 NVIDIA 占据 80%+ 份额。"
            }
        },
        "TSLA": {
            "reality": {
                "narrative_label": "可持续能源与自动驾驶科技公司",
                "economic_label": "电动汽车制造商",
                "reality_gap_score": 6
            },
            "survival": {
                "runway_months": 48,
                "financial_health": "稳健 - 正现金流，但利润率承压",
                "key_risks": ["价格战", "FSD 进展不及预期", "中国市场竞争"]
            },
            "competition": {
                "competitors": ["比亚迪", "大众", "Rivian"],
                "kill_switch": "FSD 能否实现 L4 级自动驾驶",
                "market_dynamics": "电动车市场增速放缓，价格战激烈。"
            }
        }
    }

    company_data = mock_data.get(ticker, mock_data["LEGN"])

    if "business identity" in protocol.lower() or "forensic" in protocol.lower():
        return company_data["reality"]
    elif "survival" in protocol.lower() or "distressed" in protocol.lower():
        return company_data["survival"]
    elif "competitive" in protocol.lower() or "strategist" in protocol.lower():
        return company_data["competition"]
    elif "historical" in protocol.lower() or "revenue data" in protocol.lower():
        # 返回历史营收数据
        return {
            "revenue_history": [
                {"quarter": "2024-Q1", "revenue": 45.2},
                {"quarter": "2024-Q2", "revenue": 58.7},
                {"quarter": "2024-Q3", "revenue": 72.4},
                {"quarter": "2024-Q4", "revenue": 85.1},
                {"quarter": "2025-Q1", "revenue": 98.6},
                {"quarter": "2025-Q2", "revenue": 112.3},
                {"quarter": "2025-Q3", "revenue": 125.8}
            ]
        }
    else:
        return {"error": "Unknown protocol type"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
