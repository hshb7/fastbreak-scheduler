'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Search, Sparkles, Terminal, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";

interface SearchResult {
    query: string;
    semanticMatches: Array<{
        query: string;
        template_type: string;
        template_name: string;
        parameters: Record<string, any>;
        similarity: number;
        parsed_constraint: string;
    }>;
    keywordMatch: {
        template: string;
        confidence: number;
        parameters: Record<string, any>;
        matchedKeywords: string[];
        parsed_constraint?: string;
    } | null;
    extractedParameters: Record<string, any>;
}

export default function ConstraintSearch() {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SearchResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    const shouldReduceMotion = useReducedMotion();

    // Effect for debounce logic
    useEffect(() => {
        if (debounceTimer) clearTimeout(debounceTimer);
        if (!query.trim()) {
            setResult(null);
            return;
        }
        const newTimer = setTimeout(() => handleSearch(), 600);
        setDebounceTimer(newTimer);
        return () => { if (newTimer) clearTimeout(newTimer); };
    }, [query]);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setError(null);
        // Don't clear result immediately to allow smooth transition/diffing

        try {
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Search failed');
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Helper for confidence badges
    const getConfidenceConfig = (confidence: number) => {
        if (confidence >= 0.8) return { label: "High Confidence", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: Sparkles };
        if (confidence >= 0.6) return { label: "Good Match", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: CheckCircle2 };
        return { label: "Weak Match", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: AlertCircle };
    };

    return (
        <div className="w-full max-w-6xl mx-auto relative cursor-default">

            {/* Header Section - Tech Vibe */}
            <div className="relative mb-10 text-center z-10">
                <h2 className="text-5xl font-bold mb-3 text-white uppercase tracking-tighter font-[family-name:var(--font-space)]">
                    Constraint Parser<span className="text-blue-500">.</span>
                </h2>
                <p className="text-xs text-blue-200/50 font-mono tracking-[0.2em] uppercase">
                    AI Powered Scheduling Logic
                </p>
            </div>

            {/* Main Input Card - Glassmorphism */}
            <div className="relative z-20 mb-8">
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden p-2 flex items-center shadow-2xl">
                    <div className="pl-4 pr-3 text-blue-400">
                        {loading ? (
                            <div className="animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full" />
                        ) : (
                            <Search className="w-5 h-5 opacity-70" />
                        )}
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Describe your scheduling constraint..."
                        className="w-full bg-transparent border-none text-lg text-white placeholder-white/20 focus:outline-none focus:ring-0 px-2 py-3 font-light font-[family-name:var(--font-space)] tracking-wide"
                        autoComplete="off"
                        spellCheck="false"
                    />
                    <div className="hidden md:flex items-center gap-2 px-4 border-l border-white/10 text-xs text-white/30 font-mono">
                        <span>AI POWERED</span>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-200">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{error}</span>
                </motion.div>
            )}

            {/* Results Section */}
            <AnimatePresence mode="wait">
                {result && ((result.semanticMatches && result.semanticMatches.length > 0) || result.keywordMatch) && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="space-y-6"
                    >
                        {/* 1. The Output Console (Parsed Result) */}
                        {(() => {
                            // PRIORITIZE KEYWORD MATCH
                            const bestMatch = result.keywordMatch
                                ? { ...result.keywordMatch, type: 'Live Analysis' }
                                : (result.semanticMatches?.[0] ? { ...result.semanticMatches[0], confidence: result.semanticMatches[0].similarity, type: 'Database Match' } : null);

                            if (!bestMatch) return null;
                            const conf = getConfidenceConfig(bestMatch.confidence);

                            return (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Left: The Terminal Output */}
                                    <div className="lg:col-span-2 relative group">
                                        <div className="relative h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
                                            {/* Terminal Header */}
                                            <div className="px-5 py-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Terminal className="w-4 h-4 text-emerald-500" />
                                                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Compiler Output</span>
                                                </div>
                                                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${conf.bg} ${conf.border} border text-[10px] uppercase font-bold tracking-wider ${conf.color}`}>
                                                    <conf.icon className="w-3 h-3" />
                                                    {conf.label}
                                                </div>
                                            </div>

                                            {/* Inner Content */}
                                            <div className="p-6 flex-1 flex flex-col justify-center">
                                                <p className="font-[family-name:var(--font-jetbrains)] text-lg md:text-xl text-emerald-100/90 leading-relaxed drop-shadow-sm">
                                                    <span className="text-emerald-500 mr-3 opacity-50">$</span>
                                                    {bestMatch.parsed_constraint}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Data Grid */}
                                    <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col">
                                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Sparkles className="w-3 h-3" />
                                            Extracted Data
                                        </h3>

                                        <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                            {bestMatch.parameters && Object.entries(bestMatch.parameters)
                                                .filter(([_, value]) => value !== null && value !== undefined && (!Array.isArray(value) || value.length > 0))
                                                .map(([key, value]) => (
                                                    <div key={key} className="group relative pl-4 border-l-2 border-white/10 hover:border-blue-500 transition-colors duration-300">
                                                        <span className="text-[10px] text-blue-300/60 uppercase tracking-wider font-semibold block mb-0.5 max-w-min bg-blue-500/5 px-1 rounded">
                                                            {key}
                                                        </span>
                                                        <div className="font-[family-name:var(--font-jetbrains)] text-sm text-white/90 whitespace-pre-wrap">
                                                            {Array.isArray(value) ? value.join(', ') : typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                        </div>
                                                    </div>
                                                ))}
                                            {(!bestMatch.parameters || Object.keys(bestMatch.parameters).length === 0) && (
                                                <div className="text-sm text-white/20 italic p-4 text-center">No parameters detected</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* 2. Similar Matches List (Restored Grid Table) */}
                        <div className="mt-8">
                            <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4 pl-1">Analysis Candidates</h3>

                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
                                {/* Table Header */}
                                <div className="grid grid-cols-[50px_1fr_200px_140px_100px] gap-4 px-4 py-3 border-b border-white/10 bg-white/5 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                    <div className="text-center">#</div>
                                    <div>Query Pattern</div>
                                    <div>Template</div>
                                    <div>Type</div>
                                    <div>Conf.</div>
                                </div>

                                {/* Table Rows */}
                                <div className="divide-y divide-white/5">
                                    {result.semanticMatches.map((match, index) => (
                                        <div key={index} className="grid grid-cols-[50px_1fr_200px_140px_100px] gap-4 px-4 py-3 items-center hover:bg-white/5 transition-colors duration-150 group">
                                            {/* Index */}
                                            <div className="flex justify-center">
                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono ${index === 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-white/30'}`}>
                                                    {index + 1}
                                                </span>
                                            </div>

                                            {/* Query */}
                                            <div className="min-w-0">
                                                <div className="text-sm text-white/90 font-[family-name:var(--font-space)] truncate" title={match.query}>
                                                    {match.query}
                                                </div>
                                                {index === 0 && (
                                                    <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mt-0.5">Best Match</div>
                                                )}
                                            </div>

                                            {/* Template */}
                                            <div className="text-xs text-white/50 font-mono truncate" title={match.template_name}>
                                                {match.template_name.split(':')[0]}
                                            </div>

                                            {/* Type */}
                                            <div>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-white/60 uppercase tracking-wider border border-white/5">
                                                    {match.template_type?.replace('_', ' ')}
                                                </span>
                                            </div>

                                            {/* Confidence */}
                                            <div>
                                                {(() => {
                                                    const conf = getConfidenceConfig(match.similarity);
                                                    return (
                                                        <div className={`flex items-center gap-1.5`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${conf.bg.replace('/10', '')}`}></div>
                                                            <span className={`text-[10px] font-bold ${conf.color}`}>{Math.round(match.similarity * 100)}%</span>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ambient decorative glow at bottom */}
            {!result && (
                <div className="absolute top-[200px] left-1/2 -translate-x-1/2 -z-10 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none opacity-50" />
            )}
        </div>
    );
}