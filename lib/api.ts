// 生产环境使用 Railway 后端，开发环境使用本地
const API_BASE = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? 'https://zooming-hope-production-efcc.up.railway.app'
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');

export interface CompanyInfo {
  ticker: string;
  company_name: string;
  cik: string;
  sic: string;
  sector: string;
}

export interface AnalysisResult {
  job_id: string;
  status: 'processing' | 'completed' | 'failed';
  ticker: string;
  result?: {
    company_name: string;
    company_name_cn?: string;
    ticker: string;
    focus?: string;
    key_products?: string[];
    therapeutic_areas?: string[];
    sec_data?: any;
    analysis: {
      reality: {
        narrative_label: string;
        economic_label: string;
        reality_gap_score: number;
        key_insight?: string;
      };
      survival: {
        quarterly_revenue?: number;
        revenue_change_yoy?: string;
        net_income?: number;
        net_income_change?: string;
        cash_position?: number;
        cash_change?: string;
        runway_months: number | null;
        rd_intensity?: string;
        financial_health: string;
        key_risks: string[];
      };
      competition: {
        competitors: string[];
        kill_switch: string;
        market_dynamics: string;
        competitive_advantage?: string;
      };
      history?: {
        revenue_history: Array<{
          quarter: string;
          revenue: number;
        }>;
      };
      pipeline?: {
        pipeline: Array<{
          name: string;
          stage: string;
          indication: string;
          milestone?: string;
          partner?: string;
        }>;
        pipeline_strength?: string;
        near_term_catalysts?: string[];
        pipeline_risks?: string[];
      };
    };
  };
  error?: string;
}

export async function getCompanyInfo(ticker: string): Promise<CompanyInfo> {
  const response = await fetch(`${API_BASE}/api/companies/${ticker}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch company info: ${response.statusText}`);
  }
  return response.json();
}

export async function analyzeCompany(ticker: string): Promise<AnalysisResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 120秒超时

  try {
    const response = await fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ticker, filing_type: '10-K' }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to analyze company: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('分析请求超时，请稍后重试');
    }
    throw error;
  }
}

export async function getAnalysisResult(jobId: string): Promise<AnalysisResult> {
  const response = await fetch(`${API_BASE}/api/analyze/${jobId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch analysis result: ${response.statusText}`);
  }

  return response.json();
}
