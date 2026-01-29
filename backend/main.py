from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv
import anthropic
from sec_api import QueryApi
import uuid
from datetime import datetime

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

# 初始化 API 客户端
anthropic_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
sec_query_api = QueryApi(api_key=os.getenv("SEC_API_KEY"))

# 数据模型
class AnalyzeRequest(BaseModel):
    ticker: str
    filing_type: str = "10-K"
    year: Optional[int] = None

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

# 临时存储（生产环境应使用数据库）
analysis_jobs = {}

# AI Prompts
PROTOCOL_A = """
Role: Senior Forensic Accountant.
Input: Company Business Description + Revenue Segmentation.
Task: Construct a "Dual-Layer Identity".
1. Identify the "Narrative Identity" (What the CEO says they are).
2. Identify the "Economic Identity" (Where the majority of revenue comes from).
3. If they differ, calculate reality_gap_score (1-10, higher = bigger gap).
Constraint: Use zero marketing adjectives. Use simple, brutal nouns.
Output JSON format:
{
  "narrative_label": "...",
  "economic_label": "...",
  "reality_gap_score": 1-10
}
"""

PROTOCOL_B = """
Role: Distressed Debt Analyst.
Task: Calculate the "True Runway" and financial health.
Logic:
- If Net Income < 0: Calculate months of runway based on cash and burn rate.
- Identify key financial risks.
Output JSON format:
{
  "runway_months": number or null,
  "burn_rate_monthly": "...",
  "financial_health": "...",
  "key_risks": ["..."]
}
"""

PROTOCOL_C = """
Role: Industry Strategist.
Task: Identify competitors and key success factors.
1. Identify 2-3 DIRECT competitors based on product overlap.
2. Identify the "Kill Switch" - the single factor that determines success or failure.
Output JSON format:
{
  "competitors": ["...", "..."],
  "kill_switch": "...",
  "market_dynamics": "..."
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
    try:
        # 查询最新的 10-K 文件
        query = {
            "query": f"ticker:{ticker.upper()} AND formType:\"10-K\"",
            "from": "0",
            "size": "1",
            "sort": [{"filedAt": {"order": "desc"}}]
        }

        filings = sec_query_api.get_filings(query)

        if not filings or len(filings.get("filings", [])) == 0:
            raise HTTPException(status_code=404, detail=f"No filings found for {ticker}")

        filing = filings["filings"][0]

        return {
            "ticker": ticker.upper(),
            "company_name": filing.get("companyName", "Unknown"),
            "cik": filing.get("cik", ""),
            "latest_filing": {
                "type": filing.get("formType", ""),
                "date": filing.get("filedAt", ""),
                "url": filing.get("linkToFilingDetails", "")
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_company(request: AnalyzeRequest):
    """
    分析公司财报（异步任务）
    """
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

        # 在后台执行分析（简化版，实际应使用 Celery 等任务队列）
        try:
            result = await perform_analysis(request.ticker, request.filing_type)
            analysis_jobs[job_id]["status"] = "completed"
            analysis_jobs[job_id]["result"] = result
        except Exception as e:
            analysis_jobs[job_id]["status"] = "failed"
            analysis_jobs[job_id]["error"] = str(e)

        return AnalyzeResponse(
            job_id=job_id,
            status="processing",
            ticker=request.ticker.upper(),
            message="Analysis started"
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

async def perform_analysis(ticker: str, filing_type: str = "10-K") -> Dict[str, Any]:
    """
    执行完整的财报分析
    """
    # 1. 获取财报数据
    query = {
        "query": f"ticker:{ticker.upper()} AND formType:\"{filing_type}\"",
        "from": "0",
        "size": "1",
        "sort": [{"filedAt": {"order": "desc"}}]
    }

    filings = sec_query_api.get_filings(query)

    if not filings or len(filings.get("filings", [])) == 0:
        raise Exception(f"No {filing_type} filings found for {ticker}")

    filing = filings["filings"][0]

    # 2. 提取关键信息（简化版，实际应解析完整的 10-K）
    company_name = filing.get("companyName", "Unknown")
    filing_url = filing.get("linkToFilingDetails", "")

    # 3. 调用 Claude API 进行分析
    # Protocol A: 业务实质还原
    reality_analysis = await analyze_with_claude(
        PROTOCOL_A,
        f"Company: {company_name} ({ticker})\nAnalyze the business identity."
    )

    # Protocol B: 财务生存透视
    survival_analysis = await analyze_with_claude(
        PROTOCOL_B,
        f"Company: {company_name} ({ticker})\nAnalyze financial survival."
    )

    # Protocol C: 战场推演
    competition_analysis = await analyze_with_claude(
        PROTOCOL_C,
        f"Company: {company_name} ({ticker})\nAnalyze competitive landscape."
    )

    return {
        "company_name": company_name,
        "ticker": ticker.upper(),
        "filing_type": filing_type,
        "filing_date": filing.get("filedAt", ""),
        "filing_url": filing_url,
        "analysis": {
            "reality": reality_analysis,
            "survival": survival_analysis,
            "competition": competition_analysis
        }
    }

async def analyze_with_claude(protocol: str, context: str) -> str:
    """
    使用 Claude API 进行分析
    """
    try:
        message = anthropic_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2048,
            messages=[{
                "role": "user",
                "content": f"{protocol}\n\n{context}"
            }]
        )

        return message.content[0].text
    except Exception as e:
        return f"Analysis failed: {str(e)}"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
