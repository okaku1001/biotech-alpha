'use client';

import { useState } from 'react';
import { analyzeCompany, getAnalysisResult, type AnalysisResult } from '@/lib/api';

export default function TestPage() {
  const [ticker, setTicker] = useState('LEGN');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // 启动分析
      const analysisJob = await analyzeCompany(ticker);
      console.log('Analysis job created:', analysisJob);

      // 获取结果
      const finalResult = await getAnalysisResult(analysisJob.job_id);
      console.log('Analysis result:', finalResult);

      setResult(finalResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API 测试页面</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              股票代码
            </label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 border rounded-lg bg-background text-foreground"
              placeholder="输入股票代码 (如 LEGN, NVDA, TSLA)"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !ticker}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
          >
            {loading ? '分析中...' : '开始分析'}
          </button>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-destructive font-medium">错误</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="p-4 bg-card border rounded-lg">
                <h2 className="text-xl font-bold mb-2">分析结果</h2>
                <p className="text-sm text-muted-foreground">
                  任务 ID: {result.job_id}
                </p>
                <p className="text-sm text-muted-foreground">
                  状态: {result.status}
                </p>
              </div>

              {result.result && (
                <div className="space-y-4">
                  <div className="p-4 bg-card border rounded-lg">
                    <h3 className="font-bold mb-2">公司信息</h3>
                    <p>{result.result.company_name} ({result.result.ticker})</p>
                  </div>

                  <div className="p-4 bg-card border rounded-lg">
                    <h3 className="font-bold mb-2">业务实质还原</h3>
                    <p className="text-sm mb-1">
                      <span className="font-medium">叙事身份:</span> {result.result.analysis.reality.narrative_label}
                    </p>
                    <p className="text-sm mb-1">
                      <span className="font-medium">经济身份:</span> {result.result.analysis.reality.economic_label}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">现实差距评分:</span> {result.result.analysis.reality.reality_gap_score}/10
                    </p>
                  </div>

                  <div className="p-4 bg-card border rounded-lg">
                    <h3 className="font-bold mb-2">财务生存透视</h3>
                    <p className="text-sm mb-1">
                      <span className="font-medium">现金跑道:</span> {result.result.analysis.survival.runway_months} 个月
                    </p>
                    <p className="text-sm mb-2">
                      <span className="font-medium">财务健康:</span> {result.result.analysis.survival.financial_health}
                    </p>
                    <div className="text-sm">
                      <span className="font-medium">关键风险:</span>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        {result.result.analysis.survival.key_risks.map((risk, i) => (
                          <li key={i}>{risk}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-card border rounded-lg">
                    <h3 className="font-bold mb-2">战场推演</h3>
                    <p className="text-sm mb-1">
                      <span className="font-medium">竞争对手:</span> {result.result.analysis.competition.competitors.join(', ')}
                    </p>
                    <p className="text-sm mb-1">
                      <span className="font-medium">Kill Switch:</span> {result.result.analysis.competition.kill_switch}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">市场动态:</span> {result.result.analysis.competition.market_dynamics}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
