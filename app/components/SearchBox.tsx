"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";

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

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filteredCompanies = COMPANIES.filter(
    (company) =>
      company.ticker.toLowerCase().includes(query.toLowerCase()) ||
      company.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ticker = query.toUpperCase();
    const isValid = COMPANIES.some((c) => c.ticker === ticker);
    if (isValid) {
      router.push(`/analysis/${ticker}`);
    } else if (filteredCompanies.length > 0) {
      router.push(`/analysis/${filteredCompanies[0].ticker}`);
    }
  };

  const handleSelect = (ticker: string) => {
    setQuery(ticker);
    setShowSuggestions(false);
    router.push(`/analysis/${ticker}`);
  };

  useEffect(() => {
    setShowSuggestions(isFocused && query.length > 0);
  }, [isFocused, query]);

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div
          className={`relative flex items-center transition-all duration-300 ${
            isFocused ? "search-glow" : ""
          }`}
        >
          <div className="absolute left-5 text-muted-foreground">
            <Search className="w-5 h-5" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="输入股票代码，如 LEGN"
            className="w-full pl-14 pr-14 py-5 text-lg bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-orange-500/50 transition-all"
          />
          <button
            type="submit"
            className="absolute right-3 p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>

      <AnimatePresence>
        {showSuggestions && filteredCompanies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden z-50"
          >
            {filteredCompanies.map((company) => (
              <button
                key={company.ticker}
                onClick={() => handleSelect(company.ticker)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors text-left"
              >
                <span className="font-mono font-bold text-orange-500 w-16">
                  {company.ticker}
                </span>
                <div className="flex-1">
                  <div className="font-medium">{company.name}</div>
                  <div className="text-sm text-muted-foreground">{company.focus}</div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}