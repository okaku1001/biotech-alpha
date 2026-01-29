"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, AlertCircle, Clock, BookOpen, Pen, Loader2, ChevronDown, Search, ArrowLeft } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { analyzeCompany, getAnalysisResult, type AnalysisResult } from "@/lib/api";
import ThemeToggle from "../../components/ThemeToggle";

// 支持的生物医药公司列表
const COMPANIES = [
  { ticker: "LEGN", name: "传奇生物", nameEn: "Legend Biotech", focus: "CAR-T细胞疗法" },
  { ticker: "SMMT", name: "Summit", nameEn: "Summit Therapeutics", focus: "PD-1/VEGF双抗" },
  { ticker: "LLY", name: "礼来", nameEn: "Eli Lilly", focus: "GLP-1/糖尿病" },
  { ticker: "MRNA", name: "Moderna", nameEn: "Moderna", focus: "mRNA技术" },
  { ticker: "REGN", name: "再生元", nameEn: "Regeneron", focus: "单克隆抗体" },
  { ticker: "VRTX", name: "福泰制药", nameEn: "Vertex", focus: "基因疗法" },
  { ticker: "BMRN", name: "BioMarin", nameEn: "BioMarin", focus: "罕见病" },
  { ticker: "ALNY", name: "Alnylam", nameEn: "Alnylam", focus: "RNAi疗法" },
];

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const ticker = (params.ticker as string)?.toUpperCase() || "LEGN";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        setLoading(true);
        setError(null);

        // 启动分析
        const job = await analyzeCompany(ticker);

        // 获取分析结果
        const result = await getAnalysisResult(job.job_id);

        if (result.status === "failed") {
          setError(result.error || "分析失败");
        } else {
          setAnalysisData(result);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载数据失败");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalysis();
  }, [ticker]);

  // 切换公司
  const handleCompanyChange = (newTicker: string) => {
    setShowSelector(false);
    router.push(`/analysis/${newTicker}`);
  };

  // 加载状态
  if (loading) {
    return (
      <main className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 dark:from-background dark:to-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">正在分析 {ticker} 的财报数据...</p>
        </div>
      </main>
    );
  }

  // 错误状态
  if (error || !analysisData?.result) {
    return (
      <main className="min-h-screen relative flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">加载失败</h2>
          <p className="text-muted-foreground mb-4">{error || "无法获取分析数据"}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors"
            >
              返回首页
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              重新加载
            </button>
          </div>
        </div>
      </main>
    );
  }

  // 从 API 数据中提取信息
  const { result } = analysisData;

  // 从 SEC 数据中提取最新财报日期
  const getLastUpdated = () => {
    if (result.sec_data?.latest_filing?.filedAt) {
      const date = new Date(result.sec_data.latest_filing.filedAt);
      const year = date.getFullYear();
      const quarter = Math.ceil((date.getMonth() + 1) / 3);
      return `${year}-Q${quarter}`;
    }
    return "最新";
  };

  const companyData = {
    ticker: result.ticker,
    name: result.company_name,
    nameCn: result.company_name_cn || "",
    focus: result.focus || "",
    keyProducts: result.key_products || [],
    therapeuticAreas: result.therapeutic_areas || [],
    narrativeIdentity: result.analysis.reality.narrative_label,
    economicIdentity: result.analysis.reality.economic_label,
    realityGapScore: result.analysis.reality.reality_gap_score,
    keyInsight: result.analysis.reality.key_insight || "",
    lastUpdated: getLastUpdated(),
  };

  const financialMetrics = {
    revenue: {
      value: result.analysis.survival.quarterly_revenue
        ? `$${result.analysis.survival.quarterly_revenue.toFixed(1)}M`
        : "N/A",
      change: result.analysis.survival.revenue_change_yoy || "N/A",
      trend: result.analysis.survival.revenue_change_yoy?.startsWith("+") ? "up" : "stable"
    },
    netIncome: {
      value: result.analysis.survival.net_income !== undefined
        ? `$${result.analysis.survival.net_income.toFixed(1)}M`
        : "N/A",
      change: result.analysis.survival.net_income_change || "N/A",
      trend: result.analysis.survival.net_income !== undefined && result.analysis.survival.net_income > 0 ? "up" : "improving"
    },
    cashPosition: {
      value: result.analysis.survival.cash_position
        ? `$${result.analysis.survival.cash_position.toFixed(1)}M`
        : "N/A",
      change: result.analysis.survival.cash_change || "N/A",
      trend: "stable"
    },
    burnRate: {
      value: result.analysis.survival.runway_months
        ? `${result.analysis.survival.runway_months}个月`
        : "充裕",
      description: result.analysis.survival.financial_health,
      risk: result.analysis.survival.runway_months && result.analysis.survival.runway_months < 24 ? "medium" : "low",
    },
  };

  // 使用真实的历史营收数据，如果没有则使用空数组
  const revenueData = result.analysis.history?.revenue_history || [];

  const aiInsights = [
    {
      type: "reality",
      title: "业务实质还原",
      content: `${result.company_name} 的叙事身份是"${result.analysis.reality.narrative_label}"，但经济实质是"${result.analysis.reality.economic_label}"。现实差距评分为 ${result.analysis.reality.reality_gap_score}/10。`,
      score: result.analysis.reality.reality_gap_score,
      label: result.analysis.reality.reality_gap_score >= 7 ? "叙事与现实存在显著差距" : "叙事与现实基本一致",
    },
    {
      type: "survival",
      title: "财务生存透视",
      content: result.analysis.survival.runway_months
        ? `公司拥有约 ${result.analysis.survival.runway_months} 个月的现金跑道。${result.analysis.survival.rd_intensity ? `研发投入强度：${result.analysis.survival.rd_intensity}。` : ""}${result.analysis.survival.financial_health}。关键风险包括：${result.analysis.survival.key_risks.slice(0, 3).join("、")}。`
        : `${result.analysis.survival.rd_intensity ? `研发投入强度：${result.analysis.survival.rd_intensity}。` : ""}${result.analysis.survival.financial_health}。关键风险包括：${result.analysis.survival.key_risks.slice(0, 3).join("、")}。`,
      score: result.analysis.survival.runway_months
        ? (result.analysis.survival.runway_months >= 18 ? 6 : 8)
        : 4,
      label: result.analysis.survival.financial_health?.slice(0, 30) + "...",
    },
    {
      type: "competition",
      title: "竞争格局分析",
      content: `直接竞争对手：${result.analysis.competition.competitors.join("、")}。${result.analysis.competition.competitive_advantage ? `核心优势：${result.analysis.competition.competitive_advantage}。` : ""}Kill Switch：${result.analysis.competition.kill_switch}。`,
      score: 7,
      label: result.analysis.competition.kill_switch?.slice(0, 30) + "...",
    },
  ];

  return (
    <main className="min-h-screen relative">
      {/* Header */}
      <header className="glass-effect border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-serif font-bold gradient-text">Veritas</h1>
          </div>

          {/* Company Selector */}
          <div className="relative">
            <button
              onClick={() => setShowSelector(!showSelector)}
              className="flex items-center gap-3 px-4 py-2 bg-muted/50 hover:bg-muted rounded-lg border border-border transition-colors"
            >
              <Search className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono text-sm">{ticker}</span>
              <span className="text-muted-foreground text-sm hidden sm:inline">
                {COMPANIES.find(c => c.ticker === ticker)?.name}
              </span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showSelector ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showSelector && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50"
                >
                  <div className="p-2">
                    <div className="text-xs text-muted-foreground px-3 py-2">选择生物医药公司</div>
                    {COMPANIES.map((company) => (
                      <button
                        key={company.ticker}
                        onClick={() => handleCompanyChange(company.ticker)}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                          ticker === company.ticker
                            ? 'bg-orange-100 text-orange-700'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <span className="font-mono font-bold w-14">{company.ticker}</span>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium">{company.name}</div>
                          <div className="text-xs text-muted-foreground">{company.focus}</div>
                        </div>
                        {ticker === company.ticker && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full pulse-dot" />
              美股生物医药分析
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Company Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="bookmark-tab text-xs font-mono text-muted-foreground">
                  {companyData.ticker}
                </span>
                <span className="px-3 py-1 text-xs bg-accent/10 text-accent rounded-full border border-accent/20">
                  {companyData.lastUpdated}
                </span>
                {companyData.focus && (
                  <span className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-full border border-primary/20">
                    {companyData.focus}
                  </span>
                )}
              </div>
              <h2 className="text-5xl font-serif font-bold mb-2 leading-tight">
                {companyData.nameCn || companyData.name}
              </h2>
              <p className="text-lg text-muted-foreground mb-4">{companyData.name}</p>
              {companyData.therapeuticAreas.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {companyData.therapeuticAreas.map((area, idx) => (
                    <span key={idx} className="px-2 py-1 text-xs bg-muted rounded-md text-muted-foreground">
                      {area}
                    </span>
                  ))}
                </div>
              )}
              <div className="space-y-3 text-lg">
                <div className="flex items-start gap-3">
                  <span className="text-muted-foreground min-w-[100px]">叙事身份</span>
                  <span className="text-foreground/80">{companyData.narrativeIdentity}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-muted-foreground min-w-[100px]">经济身份</span>
                  <span className="text-foreground font-medium">{companyData.economicIdentity}</span>
                </div>
                {companyData.keyInsight && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-lg">
                    <span className="text-amber-700 dark:text-amber-400 text-sm">{companyData.keyInsight}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right ancient-border p-6 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-orange-200 dark:border-orange-800/30">
              <div className="text-sm text-muted-foreground mb-2">现实差距评分</div>
              <div className="text-6xl font-bold font-mono gradient-text mb-2">
                {companyData.realityGapScore}
              </div>
              <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                {companyData.realityGapScore >= 7 ? "需要警惕" : companyData.realityGapScore >= 4 ? "适度关注" : "基本一致"}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Financial Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          <MetricCard
            label="季度营收"
            value={financialMetrics.revenue.value}
            change={financialMetrics.revenue.change}
            trend={financialMetrics.revenue.trend}
            delay={0.2}
          />
          <MetricCard
            label="净利润"
            value={financialMetrics.netIncome.value}
            change={financialMetrics.netIncome.change}
            trend={financialMetrics.netIncome.trend}
            delay={0.3}
          />
          <MetricCard
            label="现金储备"
            value={financialMetrics.cashPosition.value}
            change={financialMetrics.cashPosition.change}
            trend={financialMetrics.cashPosition.trend}
            delay={0.4}
          />
          <MetricCard
            label="现金跑道"
            value={financialMetrics.burnRate.value}
            description={financialMetrics.burnRate.description}
            risk={financialMetrics.burnRate.risk}
            delay={0.5}
          />
        </motion.div>

        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="ancient-border rounded-xl p-8 mb-12 bg-white/50 dark:bg-card/50 hover-lift"
        >
          <h3 className="text-xl font-serif font-semibold mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-orange-500 rounded-full" />
            营收增长轨迹
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis
                dataKey="quarter"
                stroke="#6b7280"
                style={{ fontSize: '13px', fontFamily: 'var(--font-jetbrains)' }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: '13px', fontFamily: 'var(--font-jetbrains)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '8px',
                  color: '#78350f',
                  fontFamily: 'var(--font-jetbrains)',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#f97316"
                strokeWidth={3}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pipeline Analysis */}
        {result.analysis.pipeline && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="ancient-border rounded-xl p-8 mb-12 bg-white/50 dark:bg-card/50"
          >
            <h3 className="text-xl font-serif font-semibold mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-500 rounded-full" />
              研发管线 Pipeline
            </h3>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">药物名称</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">研发阶段</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">适应症</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">预计里程碑</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">合作伙伴</th>
                  </tr>
                </thead>
                <tbody>
                  {result.analysis.pipeline.pipeline?.map((drug, idx) => (
                    <tr key={idx} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-medium">{drug.name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          drug.stage === "已上市" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                          drug.stage === "III期" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                          drug.stage === "II期" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                          "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400"
                        }`}>{drug.stage}</span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{drug.indication}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{drug.milestone || "-"}</td>
                      <td className="py-3 px-4 text-muted-foreground">{drug.partner || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="space-y-6"
        >
          <h3 className="text-3xl font-serif font-bold mb-8 flex items-center gap-3">
            <Pen className="w-7 h-7 text-orange-500" />
            AI 深度洞察
          </h3>
          {aiInsights.map((insight, index) => (
            <InsightCard key={index} insight={insight} delay={0.8 + index * 0.1} />
          ))}
        </motion.div>
      </div>
    </main>
  );
}

// Metric Card Component
function MetricCard({
  label, value, change, trend, description, risk, delay,
}: {
  label: string; value: string; change?: string; trend?: string;
  description?: string; risk?: string; delay: number;
}) {
  const getTrendIcon = () => {
    if (trend === "up" || trend === "improving") {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    }
    return <Clock className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className="ancient-border rounded-xl p-6 bg-white/60 dark:bg-card/60 hover-lift ink-spread"
    >
      <div className="text-sm text-muted-foreground mb-3">{label}</div>
      <div className="text-3xl font-bold font-mono mb-3 data-highlight">{value}</div>
      {change && (
        <div className="flex items-center gap-2 text-sm">
          {getTrendIcon()}
          <span className={trend === "up" || trend === "improving" ? "text-green-600" : "text-muted-foreground"}>
            {change}
          </span>
        </div>
      )}
      {description && <div className="text-xs text-muted-foreground mt-3 leading-relaxed">{description}</div>}
      {risk && (
        <div className={`text-xs mt-3 font-medium ${risk === "high" ? "text-red-600" : risk === "medium" ? "text-amber-600" : "text-green-600"}`}>
          {risk === "low" && "✓ 低风险"}
        </div>
      )}
    </motion.div>
  );
}

// Insight Card Component
function InsightCard({ insight, delay }: { insight: any; delay: number }) {
  const getIcon = () => {
    if (insight.type === "reality") return <AlertCircle className="w-6 h-6 text-orange-500" />;
    if (insight.type === "survival") return <Clock className="w-6 h-6 text-blue-500" />;
    return <TrendingUp className="w-6 h-6 text-green-500" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay }}
      className="annotation ancient-border rounded-xl p-8 bg-white/60 dark:bg-card/60 hover-lift"
    >
      <div className="flex items-start gap-5">
        <div className="mt-1">{getIcon()}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-2xl font-serif font-semibold">{insight.title}</h4>
            <span className={`text-lg font-mono font-bold ${insight.score >= 7 ? "text-orange-600" : "text-blue-600"}`}>
              {insight.score}/10
            </span>
          </div>
          <p className="text-foreground/80 leading-relaxed mb-4 text-lg">{insight.content}</p>
          <div className="text-sm text-orange-600 italic font-medium">{insight.label}</div>
        </div>
      </div>
    </motion.div>
  );
}
