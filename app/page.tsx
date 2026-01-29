"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { BookOpen, Sparkles, Shield, Target } from "lucide-react";
import SearchBox from "./components/SearchBox";
import ThemeToggle from "./components/ThemeToggle";

const COMPANIES = [
  { ticker: "LEGN", name: "传奇生物", focus: "CAR-T细胞疗法" },
  { ticker: "SMMT", name: "Summit", focus: "PD-1/VEGF双抗" },
  { ticker: "LLY", name: "礼来", focus: "GLP-1/糖尿病" },
  { ticker: "MRNA", name: "Moderna", focus: "mRNA技术" },
  { ticker: "REGN", name: "再生元", focus: "单克隆抗体" },
  { ticker: "VRTX", name: "福泰制药", focus: "基因疗法" },
  { ticker: "BMRN", name: "BioMarin", focus: "罕见病" },
  { ticker: "ALNY", name: "Alnylam", focus: "RNAi疗法" },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: "业务实质还原",
    description: "穿透营销话术，还原公司真实的商业模式和盈利能力",
  },
  {
    icon: Shield,
    title: "财务生存透视",
    description: "分析现金流、研发投入和生存跑道，评估财务健康度",
  },
  {
    icon: Target,
    title: "竞争格局分析",
    description: "识别核心竞争对手和潜在威胁，发现 Kill Switch 风险",
  },
];

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden landing-page">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-orange-950/20 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/10 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-serif font-bold">Veritas</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight"
          >
            <span className="hero-text-gradient">看穿财报迷雾</span>
            <br />
            <span className="text-white/90">发现真实价值</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-white/60 mb-12 max-w-2xl mx-auto"
          >
            基于 SEC 官方数据的 AI 深度分析，为深度价值投资者打造
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <SearchBox />
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-3 bg-orange-500 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              三大分析协议
            </h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto">
              基于 SEC 官方数据，AI 驱动的深度财报分析
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="feature-card group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-white/50 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Companies Section */}
      <section className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              支持的生物医药公司
            </h2>
            <p className="text-xl text-white/50">
              点击任意公司开始分析
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {COMPANIES.map((company, index) => (
              <motion.button
                key={company.ticker}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={() => router.push(`/analysis/${company.ticker}`)}
                className="company-card p-6 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all duration-300 text-left"
              >
                <div className="font-mono text-2xl font-bold text-orange-500 mb-2">
                  {company.ticker}
                </div>
                <div className="text-sm font-medium mb-1">{company.name}</div>
                <div className="text-xs text-white/40">{company.focus}</div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif font-bold">Veritas</span>
          </div>
          <p className="text-sm text-white/40">
            数据来源：SEC EDGAR | 仅供研究参考，不构成投资建议
          </p>
        </div>
      </footer>
    </main>
  );
}