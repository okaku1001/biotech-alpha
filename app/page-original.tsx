"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// 硬编码的示例数据 - Legend Biotech (LEGN)
const companyData = {
  ticker: "LEGN",
  name: "Legend Biotech Corporation",
  narrativeIdentity: "创新型 CAR-T 细胞疗法生物技术公司",
  economicIdentity: "单一产品商业化阶段的生物制药企业",
  realityGapScore: 7,
  lastUpdated: "2024-Q3",
};

const financialMetrics = {
  revenue: { value: "$234.5M", change: "+156%", trend: "up" },
  netIncome: { value: "-$89.2M", change: "-12%", trend: "improving" },
  cashPosition: { value: "$521.3M", change: "-8%", trend: "stable" },
  burnRate: { value: "18个月", description: "按当前运营亏损计算的现金跑道", risk: "medium" },
};

const revenueData = [
  { quarter: "2023-Q1", revenue: 28 },
  { quarter: "2023-Q2", revenue: 45 },
  { quarter: "2023-Q3", revenue: 67 },
  { quarter: "2023-Q4", revenue: 91 },
  { quarter: "2024-Q1", revenue: 134 },
  { quarter: "2024-Q2", revenue: 187 },
  { quarter: "2024-Q3", revenue: 234 },
];

const aiInsights = [
  {
    type: "reality",
    title: "业务实质还原",
    content: "Legend Biotech 对外宣称是'创新型 CAR-T 细胞疗法生物技术公司'，但其 98% 的收入来自单一产品 Carvykti（用于治疗多发性骨髓瘤）。经济实质上，这是一家'单一产品商业化阶段的生物制药企业'，而非多管线研发公司。",
    score: 7,
    label: "叙事与现实存在显著差距",
  },
  {
    type: "survival",
    title: "财务生存透视",
    content: "公司当前现金及短期投资为 $521.3M，季度平均运营亏损约 $29M。按此速率，公司拥有约 18 个月的现金跑道。关键风险：Carvykti 的市场渗透速度是否能在现金耗尽前实现盈亏平衡。",
    score: 6,
    label: "中等风险 - 需密切监控现金流",
  },
  {
    type: "competition",
    title: "战场推演",
    content: "直接竞争对手：BMS 的 Abecma（同为 BCMA 靶向 CAR-T）、J&J 的 Tecvayli（双特异性抗体）。关键变量：FDA 对早期治疗线的批准进度。基准情景：如果 Carvykti 获批二线治疗，市场规模将扩大 3-5 倍。",
    score: 8,
    label: "高度依赖监管里程碑",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-[#0a0a0a]/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
            <h1 className="text-xl font-serif font-semibold tracking-tight">Veritas</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-white/60">
            <span>深夜图书馆模式</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Company Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-mono text-white/40">{companyData.ticker}</span>
                <span className="px-2 py-0.5 text-xs bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">
                  {companyData.lastUpdated}
                </span>
              </div>
              <h2 className="text-4xl font-serif font-bold mb-3">{companyData.name}</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white/60">
                  <span className="text-sm">叙事身份：</span>
                  <span className="text-white/90">{companyData.narrativeIdentity}</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <span className="text-sm">经济身份：</span>
                  <span className="text-white/90 font-medium">{companyData.economicIdentity}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/40 mb-1">现实差距评分</div>
              <div className="text-5xl font-bold font-mono">{companyData.realityGapScore}</div>
              <div className="text-xs text-orange-400 mt-1">需要警惕</div>
            </div>
          </div>
        </motion.div>

        {/* Financial Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          <MetricCard
            label="季度营收"
            value={financialMetrics.revenue.value}
            change={financialMetrics.revenue.change}
            trend={financialMetrics.revenue.trend}
          />
          <MetricCard
            label="净利润"
            value={financialMetrics.netIncome.value}
            change={financialMetrics.netIncome.change}
            trend={financialMetrics.netIncome.trend}
          />
          <MetricCard
            label="现金储备"
            value={financialMetrics.cashPosition.value}
            change={financialMetrics.cashPosition.change}
            trend={financialMetrics.cashPosition.trend}
          />
          <MetricCard
            label="现金跑道"
            value={financialMetrics.burnRate.value}
            description={financialMetrics.burnRate.description}
            risk={financialMetrics.burnRate.risk}
          />
        </motion.div>

        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/[0.02] border border-white/5 rounded-xl p-6 mb-12"
        >
          <h3 className="text-lg font-serif font-semibold mb-6">营收增长轨迹</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="quarter" stroke="#ffffff40" style={{ fontSize: '12px' }} />
              <YAxis stroke="#ffffff40" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #ffffff20',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-6"
        >
          <h3 className="text-2xl font-serif font-semibold mb-6">AI 深度洞察</h3>
          {aiInsights.map((insight, index) => (
            <InsightCard key={index} insight={insight} delay={0.4 + index * 0.1} />
          ))}
        </motion.div>
      </div>
    </main>
  );
}

// Metric Card Component
function MetricCard({
  label,
  value,
  change,
  trend,
  description,
  risk,
}: {
  label: string;
  value: string;
  change?: string;
  trend?: string;
  description?: string;
  risk?: string;
}) {
  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend === "improving") return <TrendingUp className="w-4 h-4 text-blue-400" />;
    return <Clock className="w-4 h-4 text-white/40" />;
  };

  const getRiskColor = () => {
    if (risk === "high") return "text-red-400";
    if (risk === "medium") return "text-orange-400";
    return "text-green-400";
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
      <div className="text-sm text-white/40 mb-2">{label}</div>
      <div className="text-2xl font-bold font-mono mb-2">{value}</div>
      {change && (
        <div className="flex items-center gap-2 text-sm">
          {getTrendIcon()}
          <span className={trend === "up" || trend === "improving" ? "text-green-400" : "text-white/60"}>
            {change}
          </span>
        </div>
      )}
      {description && (
        <div className="text-xs text-white/40 mt-2">{description}</div>
      )}
      {risk && (
        <div className={`text-xs mt-2 ${getRiskColor()}`}>
          {risk === "high" && "⚠️ 高风险"}
          {risk === "medium" && "⚡ 中等风险"}
          {risk === "low" && "✓ 低风险"}
        </div>
      )}
    </div>
  );
}

// Insight Card Component
function InsightCard({ insight, delay }: { insight: any; delay: number }) {
  const getIcon = () => {
    if (insight.type === "reality") return <AlertCircle className="w-5 h-5" />;
    if (insight.type === "survival") return <Clock className="w-5 h-5" />;
    return <CheckCircle2 className="w-5 h-5" />;
  };

  const getColor = () => {
    if (insight.score >= 7) return "border-orange-500/20 bg-orange-500/5";
    if (insight.score >= 5) return "border-yellow-500/20 bg-yellow-500/5";
    return "border-blue-500/20 bg-blue-500/5";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`border rounded-xl p-6 ${getColor()}`}
    >
      <div className="flex items-start gap-4">
        <div className="mt-1">{getIcon()}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-serif font-semibold">{insight.title}</h4>
            <span className="text-xs px-2 py-1 bg-white/5 rounded border border-white/10">
              评分: {insight.score}/10
            </span>
          </div>
          <p className="text-white/70 leading-relaxed mb-3">{insight.content}</p>
          <div className="text-sm text-white/50 italic">{insight.label}</div>
        </div>
      </div>
    </motion.div>
  );
}
