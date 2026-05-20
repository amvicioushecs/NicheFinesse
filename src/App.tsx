import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Target,
  ArrowRight,
  BrainCircuit,
  Loader2,
  CheckCircle2,
  Lightbulb,
  Rocket,
  X,
  Zap,
  Globe,
  Lock,
  Sparkles,
  MessageSquareQuote,
  Copy,
  Moon,
  Sun
} from 'lucide-react';

/**
 * NICHE ARCHITECT - GEMINI AI EDITION
 * Integrated with Gemini 2.5 Flash for real-world market deconstruction.
 * Includes Manual Dark Mode Toggle.
 */

const App = () => {
  const [keyword, setKeyword] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState([]);
  const [results, setResults] = useState(null);
  const [selectedNiche, setSelectedNiche] = useState(null);
  const [user, setUser] = useState({ uid: 'mock-user' }); // Mocked user
  const [aiContent, setAiContent] = useState(null);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const scrollRef = useRef(null);

  // Apply dark mode class to root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const steps = [
    "Querying global search velocity for topic...",
    "Scanning competitive density for 'Authority Gaps'...",
    "Identifying high-value micro-demographics via Gemini...",
    "Synthesizing entry strategies and monetization paths..."
  ];

  const fetchWithRetry = async (url, options, retries = 5, backoff = 1000) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (err) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, backoff));
        return fetchWithRetry(url, options, retries - 1, backoff * 2);
      }
      throw err;
    }
  };

  const generateNichesWithAI = async (topic) => {
    const systemPrompt = `You are a world-class market research analyst. Your job is to take a broad industry keyword and deconstruct it into 4 highly specific, profitable, and creative micro-niches.
    Respond ONLY in valid JSON format with the following structure:
    {
      "niches": [
        {
          "name": "Full descriptive name",
          "path": "Industry > Sub-category > Micro-niche",
          "reasoning": "1-2 sentences on why this is profitable right now.",
          "verdict": "High Viability" | "Emerging" | "Over-Saturated",
          "traffic": "High" | "Medium" | "Low",
          "comp": "High" | "Medium" | "Low",
          "value": number (1-10),
          "strategy": ["Step 1", "Step 2", "Step 3"],
          "proTip": "One specific growth hack",
          "affiliatePrograms": ["Program1 - Commission rate", "Program2 - Commission rate", "Program3 - Commission rate"]
        }
      ]
    }`;

    const userQuery = `Architect 4 micro-niches for the industry: "${topic}". Focus on underserved audiences and modern trends.`;

    try {
      const result = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { responseMimeType: "application/json" }
          })
        }
      );

      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      return JSON.parse(text);
    } catch (err) {
      console.error("Gemini Error:", err);
      throw err;
    }
  };

  const generateGrowthHook = async (niche) => {
    setIsGeneratingContent(true);
    setAiContent(null);
    
    const prompt = `Generate a high-converting 'Launch Hook' and a 'Sample Social Media Ad' for this specific niche business: "${niche.name}". 
    The reasoning for this niche is: ${niche.reasoning}. 
    Focus on the target demographic's pain points. 
    Respond with the Hook and Ad Copy in plain text. Use bullet points for the ad features.`;

    try {
      const result = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );
      
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      setAiContent(text);
    } catch (err) {
      setAiContent("Failed to generate hook. Please try again.");
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!keyword.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setResults(null);
    setThinkingSteps([]);
    setSelectedNiche(null);

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setThinkingSteps(prev => [...prev, steps[stepIndex]]);
        stepIndex++;
      } else {
        clearInterval(interval);
      }
    }, 800);

    try {
      const data = await generateNichesWithAI(keyword);
      setResults({ keyword, niches: data.niches.map((n, i) => ({ ...n, id: i })) });
    } catch (err) {
      setThinkingSteps(prev => [...prev, "⚠️ Error: Market connection lost. Retrying..."]);
    } finally {
      setIsAnalyzing(false);
      clearInterval(interval);
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  };

  const copyToClipboard = (text) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  const exportNiche = (niche) => {
    const content = JSON.stringify(niche, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${niche.name.replace(/\s+/g, '_')}_blueprint.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-orange-500/30 transition-colors duration-500">
      {/* Dynamic Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.07]" 
           style={{ backgroundImage: 'radial-gradient(#f97316 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="max-w-6xl mx-auto px-4 py-8 relative">
        {/* Header Section */}
        <header className="text-center mb-16 space-y-6 relative">
          {/* Theme Toggle Button */}
          <div className="flex justify-end absolute -top-4 right-0">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-orange-500/50 transition-all flex items-center gap-2 group"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? (
                <Sun size={20} className="text-amber-400 group-hover:rotate-45 transition-transform" />
              ) : (
                <Moon size={20} className="text-slate-600 group-hover:-rotate-12 transition-transform" />
              )}
            </button>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 text-orange-600 dark:text-orange-400 text-xs font-black tracking-widest uppercase">
            <Sparkles size={14} className="fill-current" />
            Gemini AI Professional
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-slate-950 dark:text-white">
            ARCHITECT YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">PROFIT</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg md:text-xl font-medium">
            Deconstruct generic industries into high-yield, specific micro-segments using professional market intelligence.
          </p>
        </header>

        {/* Input Control */}
        <section className="max-w-3xl mx-auto mb-16">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-2 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none relative group transition-all hover:border-orange-500/50">
            <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={22} />
                <input 
                  autoFocus
                  className="w-full pl-16 pr-6 py-5 bg-transparent rounded-3xl border-none focus:ring-0 text-xl font-bold placeholder:text-slate-300 dark:placeholder:text-slate-700 outline-none"
                  placeholder="e.g. Travel, Fitness, SaaS..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              <button 
                disabled={isAnalyzing || !keyword}
                className="px-10 py-5 bg-slate-950 dark:bg-orange-600 hover:bg-orange-600 dark:hover:bg-orange-500 text-white rounded-[2rem] font-black text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-20 group/btn shadow-lg"
              >
                {isAnalyzing ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                {isAnalyzing ? 'Architecting...' : 'Architect Niche'}
              </button>
            </form>
          </div>
        </section>

        {/* Thinking Protocol */}
        {isAnalyzing && (
          <div className="max-w-2xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-4 shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Reasoning Pipeline</h3>
                <span className="text-[10px] font-bold text-orange-500 animate-pulse uppercase tracking-widest">Processing Data</span>
              </div>
              <div className="space-y-3">
                {thinkingSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                    {idx === thinkingSteps.length - 1 ? (
                      <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                    ) : (
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    )}
                    <span className={`text-sm font-bold ${idx === thinkingSteps.length - 1 ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'}`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results Grid */}
        <div ref={scrollRef} className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 scroll-mt-10">
          {results && results.niches.map((niche) => (
            <div 
              key={niche.id}
              className={`group relative bg-white dark:bg-slate-900 rounded-[2.5rem] border p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 flex flex-col ${
                niche.verdict === 'High Viability' ? 'border-emerald-500/20 shadow-emerald-500/5' : 'border-slate-100 dark:border-slate-800'
              }`}
            >
              <div className="flex justify-between items-start mb-8">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  niche.verdict === 'High Viability' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 
                  niche.verdict === 'Over-Saturated' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${niche.verdict === 'High Viability' ? 'bg-emerald-500 animate-pulse' : 'bg-current'}`} />
                  {niche.verdict}
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 opacity-50">
                  <Globe size={18} />
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-3xl font-black mb-2 leading-tight group-hover:text-orange-500 transition-colors">
                  {niche.name}
                </h2>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-tighter">
                  {niche.path}
                </div>
              </div>

              <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed mb-8 flex-grow italic">
                "{niche.reasoning}"
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="space-y-1">
                  <div className="text-[10px] font-black text-slate-400 uppercase">Traffic</div>
                  <div className="text-sm font-black text-slate-900 dark:text-white">{niche.traffic}</div>
                </div>
                <div className="space-y-1 border-x border-slate-100 dark:border-slate-800 px-4 text-center md:text-left">
                  <div className="text-[10px] font-black text-slate-400 uppercase">Comp.</div>
                  <div className="text-sm font-black text-slate-900 dark:text-white">{niche.comp}</div>
                </div>
                <div className="space-y-1 pl-4">
                  <div className="text-[10px] font-black text-slate-400 uppercase">Value</div>
                  <div className={`text-sm font-black ${niche.value > 7 ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                    {niche.value}/10
                  </div>
                </div>
              </div>

              <button 
                onClick={() => { setSelectedNiche(niche); setAiContent(null); }}
                className="group/btn w-full py-4 bg-slate-950 dark:bg-slate-800 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all flex items-center justify-center gap-3"
              >
                Strategy Breakdown
                <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!results && !isAnalyzing && (
          <div className="text-center py-32 animate-in fade-in duration-1000">
            <div className="relative inline-block mb-8">
              <Target size={120} className="text-slate-200 dark:text-slate-900 transition-colors" />
              <BrainCircuit size={48} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-300 dark:text-orange-950/50" />
            </div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-300 dark:text-slate-800">Awaiting Sector Analysis</h2>
          </div>
        )}

        {/* Strategy Modal */}
        {selectedNiche && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] p-10 shadow-3xl relative border border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-300">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500" />
              
              <button 
                onClick={() => setSelectedNiche(null)}
                className="absolute top-8 right-8 p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors group"
              >
                <X size={24} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
              </button>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10">
                <div className="p-5 bg-orange-100 dark:bg-orange-900/40 text-orange-600 rounded-3xl">
                  <Rocket size={32} className="fill-current" />
                </div>
                <div>
                  <h3 className="text-4xl font-black tracking-tight">{selectedNiche.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-black uppercase tracking-widest text-orange-500">Go-to-Market Blueprint</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 mb-8">
                {selectedNiche.strategy.map((item, i) => (
                  <div key={i} className="flex gap-6 items-start p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center text-lg font-black shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-400 text-[10px] uppercase mb-1 tracking-widest">
                        {i === 0 ? "Validation" : i === 1 ? "Acquisition" : "Monetization"}
                      </h4>
                      <p className="text-lg font-bold leading-snug">{item}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 rounded-[2rem] bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex gap-4 items-center mb-8">
                <div className="p-3 bg-emerald-500 text-white rounded-2xl">
                  <Lightbulb size={24} />
                </div>
                <div>
                  <p className="text-sm font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest mb-0.5">AI Pro-Tip</p>
                  <p className="text-base text-emerald-900 dark:text-emerald-300 font-medium italic">
                    {selectedNiche.proTip}
                  </p>
                </div>
              </div>

              {selectedNiche.affiliatePrograms && (
                <div className="mb-8 border-t border-slate-100 dark:border-slate-800 pt-8">
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Top 3 Affiliate Programs</h4>
                    <ul className="space-y-2">
                        {selectedNiche.affiliatePrograms.map((program, i) => (
                            <li key={i} className="text-sm font-medium bg-slate-100 dark:bg-slate-800 p-4 rounded-xl">{program}</li>
                        ))}
                    </ul>
                </div>
              )}

              <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-8 mt-8">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <MessageSquareQuote size={16} />
                    Launch Copy Generator
                  </h4>
                  {!aiContent && (
                    <button 
                      onClick={() => generateGrowthHook(selectedNiche)}
                      disabled={isGeneratingContent}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isGeneratingContent ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                      Generate Launch Hook
                    </button>
                  )}
                </div>

                {isGeneratingContent && (
                  <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
                    <Loader2 className="animate-spin mx-auto mb-2 text-orange-500" />
                    <p className="text-xs font-bold text-slate-400">Gemini is writing high-converting copy...</p>
                  </div>
                )}

                {aiContent && (
                  <div className="relative group p-6 bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 animate-in fade-in slide-in-from-top-2">
                    <button 
                      onClick={() => copyToClipboard(aiContent)}
                      className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy size={16} />
                    </button>
                    <pre className="text-sm font-medium whitespace-pre-wrap leading-relaxed font-sans pr-8">
                      {aiContent}
                    </pre>
                  </div>
                )}
              </div>

              <div className="mt-10 flex gap-3">
                 <button 
                  onClick={() => exportNiche(selectedNiche)}
                  className="flex-1 py-5 bg-orange-600 text-white rounded-2xl font-black text-base uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl"
                >
                  Export JSON
                </button>
                 <button 
                  onClick={() => setSelectedNiche(null)}
                  className="flex-1 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-black text-base uppercase tracking-widest hover:bg-orange-600 dark:hover:bg-orange-500 dark:hover:text-white transition-all shadow-xl"
                >
                  Close Blueprint
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
