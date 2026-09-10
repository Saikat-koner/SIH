import React, { useState, useMemo } from 'react';
import {
  Globe,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Search,
  BookOpen,
  Calculator,
  Compass,
  Train,
  ArrowUpRight,
  Sparkles,
  HelpCircle,
  FileCheck,
  AlertCircle,
  ChevronDown,
  Building,
  Activity,
  Layers,
  Award,
} from 'lucide-react';
import {
  OFFICIAL_GOV_PORTALS,
  ALL_NATIONAL_PROJECTS,
  GOV_KNOWLEDGE_BASE,
  GovPortal,
  NationalInfrastructureProject,
  GovKnowledgeTopic,
} from '../data/governmentPortalsData';
import { useCurrency } from '../context/CurrencyContext';
import { CurrencySelector } from './CurrencySelector';

interface GovernmentPortalsHubProps {
  onSelectProject?: (projectId: string) => void;
}

export const GovernmentPortalsHub: React.FC<GovernmentPortalsHubProps> = ({
  onSelectProject,
}) => {
  const { formatCrores, formatRawINR, currency, currencyConfig } = useCurrency();
  const [activeTab, setActiveTab] = useState<'portals' | 'projects' | 'knowledge' | 'calculator'>('portals');
  const [portalCategoryFilter, setPortalCategoryFilter] = useState<string>('all');
  const [projectSearchQuery, setProjectSearchQuery] = useState<string>('');
  const [knowledgeSearchQuery, setKnowledgeSearchQuery] = useState<string>('');
  const [selectedKnowledgeTopic, setSelectedKnowledgeTopic] = useState<GovKnowledgeTopic>(GOV_KNOWLEDGE_BASE[0]);
  const [expandedPortalId, setExpandedPortalId] = useState<string | null>(null);

  // Interactive Calculator State based on RFCTLARR 2013 First Schedule
  const [calcMarketValue, setCalcMarketValue] = useState<number>(2500000); // Base value in INR
  const [calcMultiplier, setCalcMultiplier] = useState<number>(1.5); // Rural multiplier (1.25 - 2.0)
  const [calcAssetsValue, setCalcAssetsValue] = useState<number>(350000); // Trees/wells/structures
  const [calcMonthsElapsed, setCalcMonthsElapsed] = useState<number>(12); // Months since Section 3A / 11

  // Calculator computations
  const multipliedLandValue = calcMarketValue * calcMultiplier;
  const totalWithAssets = multipliedLandValue + calcAssetsValue;
  const solatium100 = totalWithAssets * 1.0; // 100% Solatium
  const interest12Pct = (calcMarketValue * 0.12 * calcMonthsElapsed) / 12; // 12% p.a.
  const grandTotalCompensation = totalWithAssets + solatium100 + interest12Pct;

  // Filtered Portals
  const filteredPortals = useMemo(() => {
    if (portalCategoryFilter === 'all') return OFFICIAL_GOV_PORTALS;
    return OFFICIAL_GOV_PORTALS.filter((p) => p.category === portalCategoryFilter);
  }, [portalCategoryFilter]);

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return ALL_NATIONAL_PROJECTS.filter((proj) => {
      const matchQuery =
        proj.name.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
        proj.code.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
        proj.corridor.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
        proj.statesCovered.some((s) => s.toLowerCase().includes(projectSearchQuery.toLowerCase()));
      return matchQuery;
    });
  }, [projectSearchQuery]);

  // Filtered Knowledge Base
  const filteredKnowledge = useMemo(() => {
    if (!knowledgeSearchQuery.trim()) return GOV_KNOWLEDGE_BASE;
    const q = knowledgeSearchQuery.toLowerCase();
    return GOV_KNOWLEDGE_BASE.filter(
      (topic) =>
        topic.question.toLowerCase().includes(q) ||
        topic.summary.toLowerCase().includes(q) ||
        topic.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        topic.detailedAnswer.toLowerCase().includes(q)
    );
  }, [knowledgeSearchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 text-white rounded-2xl p-5 md:p-6 shadow-xl border border-teal-800/40 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                Live Portals & Pre-Trained Intelligence
              </span>
              <span className="text-xs text-slate-300 hidden sm:inline">
                National Data Backbone for DILRMP, SVAMITVA, Bhuvan, Bhoomi Rashi & Gati Shakti
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-emerald-300">6 Central Portals Synced</span>
            </div>
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
            Official Government Portals & National Cadastral Knowledge Base
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-4xl leading-relaxed">
            Direct real-world telemetry integrated from Department of Land Resources (DoLR), Survey of India,
            ISRO NRSC Bhuvan, MoRTH Bhoomi Rashi, and PM Gati Shakti. Pre-trained with official statutory compensation rules,
            RFCTLARR Act 2013, ULPIN Bhu-Aadhaar schemas, and CORS geodetic baselines.
          </p>
        </div>
      </div>

      {/* Sub-Navigation Buttons */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('portals')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'portals'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Official Gov Portals ({OFFICIAL_GOV_PORTALS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'projects'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>All National Mega Projects ({ALL_NATIONAL_PROJECTS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('knowledge')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'knowledge'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Trained Legal & Cadastre Assistant</span>
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'calculator'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>RFCTLARR Statutory Calculator</span>
        </button>
      </div>

      {/* TAB 1: OFFICIAL GOV PORTALS MATRIX */}
      {activeTab === 'portals' && (
        <div className="space-y-4">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium mr-2">Filter by Sector:</span>
            {[
              { id: 'all', label: 'All Portals' },
              { id: 'satellite_gis', label: 'Satellite GIS (ISRO)' },
              { id: 'drone_mapping', label: 'Drone Mapping (SVAMITVA)' },
              { id: 'cadastre_records', label: 'Land Records (DILRMP)' },
              { id: 'highway_acquisition', label: 'Highways & Payouts (MoRTH)' },
              { id: 'multi_modal', label: 'PM Gati Shakti NMP' },
              { id: 'railway_freight', label: 'Railway DFC' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setPortalCategoryFilter(cat.id)}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  portalCategoryFilter === cat.id
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Portals Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPortals.map((portal) => {
              const isExpanded = expandedPortalId === portal.id;
              return (
                <div
                  key={portal.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {portal.badge}
                        </span>
                        <h3 className="font-bold text-slate-900 text-base mt-1.5 leading-snug">
                          {portal.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium">{portal.ministry}</p>
                      </div>
                      <a
                        href={portal.officialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 transition shrink-0"
                        title="Visit Official Portal"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {portal.description}
                    </p>

                    {/* Live Telemetry Metrics */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                      {portal.liveMetrics.map((metric, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                          <p className="text-[10px] text-slate-500 font-medium truncate">{metric.label}</p>
                          <p className="text-xs font-bold text-slate-900 mt-0.5">{metric.value}</p>
                          <p className="text-[9px] text-emerald-600 font-semibold">{metric.trend}</p>
                        </div>
                      ))}
                    </div>

                    {/* Core Features */}
                    {isExpanded && (
                      <div className="space-y-2 pt-2 border-t border-slate-100 animate-in fade-in duration-200">
                        <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          Core Digital Architecture:
                        </p>
                        <ul className="space-y-1">
                          {portal.coreFeatures.map((feat, fIdx) => (
                            <li key={fIdx} className="text-xs text-slate-600 flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="pt-2">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Standards Compliance:
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {portal.standardsCompliance.map((std, sIdx) => (
                              <span
                                key={sIdx}
                                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                              >
                                {std}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Action */}
                  <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => setExpandedPortalId(isExpanded ? null : portal.id)}
                      className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Show Less' : 'View Architecture'}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    <a
                      href={portal.officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-500 hover:text-slate-900 font-medium flex items-center gap-1"
                    >
                      <span>{portal.officialUrl.replace('https://', '')}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ALL NATIONAL PROJECTS CORRIDORS */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search projects by name, corridor, state (e.g. Maharashtra, Bullet Train, DME)..."
                value={projectSearchQuery}
                onChange={(e) => setProjectSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 text-xs border border-slate-200 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-900">{filteredProjects.length}</span> of {ALL_NATIONAL_PROJECTS.length} mega corridors
            </div>
          </div>

          {/* Projects Table / Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.map((proj) => {
              const payoutPercent = Math.round((proj.payoutsCompleted / proj.totalParcels) * 100);
              const budgetPercent = Math.round((proj.disbursedBudgetCr / proj.allocatedBudgetCr) * 100);

              return (
                <div
                  key={proj.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3 hover:border-emerald-300 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {proj.code}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            proj.status === 'on_schedule'
                              ? 'bg-emerald-100 text-emerald-800'
                              : proj.status === 'minor_delay'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {proj.status === 'on_schedule'
                            ? 'On Schedule'
                            : proj.status === 'minor_delay'
                            ? 'Minor Bottlenecks'
                            : 'Critical Action Needed'}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1.5">{proj.name}</h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">{proj.corridor}</p>
                    </div>

                    {proj.totalLengthKm && (
                      <span className="px-2 py-1 rounded bg-teal-50 text-teal-800 text-xs font-bold shrink-0 border border-teal-200">
                        {proj.totalLengthKm} km
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>

                  {/* Progress Stats */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Cadastral Parcels Demarcated & Paid:</span>
                      <span className="font-bold text-slate-900">
                        {proj.payoutsCompleted} / {proj.totalParcels} ({payoutPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${payoutPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Statutory Budget Disbursed (PFMS):</span>
                      <span className="font-bold text-slate-900">
                        {formatCrores(proj.disbursedBudgetCr)} / {formatCrores(proj.allocatedBudgetCr)} ({budgetPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-teal-500 h-2 rounded-full transition-all"
                        style={{ width: `${budgetPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* States and Gazette */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-slate-500 font-medium">States:</span>
                      {proj.statesCovered.map((st, sIdx) => (
                        <span key={sIdx} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {st}
                        </span>
                      ))}
                    </div>
                    <span className="text-slate-500 font-mono text-[10px]">
                      Gazette: {proj.gazetteNotificationRef}
                    </span>
                  </div>

                  {/* Milestones Preview */}
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Key Statutory Milestones:
                    </p>
                    {proj.keyMilestones.slice(0, 3).map((m, mIdx) => (
                      <div key={mIdx} className="flex items-start justify-between text-[11px] gap-2">
                        <span className="text-slate-700 font-medium truncate">• {m.stage}</span>
                        <span
                          className={`text-[10px] font-semibold shrink-0 ${
                            m.status === 'completed'
                              ? 'text-emerald-700'
                              : m.status === 'in_progress'
                              ? 'text-amber-700'
                              : 'text-slate-400'
                          }`}
                        >
                          {m.status === 'completed' ? '✓ Done' : m.status === 'in_progress' ? '⚡ In Progress' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {onSelectProject && (
                    <button
                      onClick={() => onSelectProject(proj.id)}
                      className="w-full mt-2 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Inspect Live Cadastral Cases in Tracker</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PRE-TRAINED CADASTRE LEGAL KNOWLEDGE BASE */}
      {activeTab === 'knowledge' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Topics List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ask or search cadastral rules, formulas, RFCTLARR..."
                value={knowledgeSearchQuery}
                onChange={(e) => setKnowledgeSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white text-xs border border-slate-200 focus:outline-hidden focus:border-emerald-500 shadow-2xs"
              />
            </div>

            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {filteredKnowledge.map((topic) => {
                const isSelected = selectedKnowledgeTopic.id === topic.id;
                return (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedKnowledgeTopic(topic)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-400 shadow-xs ring-1 ring-emerald-300'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {topic.category.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs leading-snug">{topic.question}</h4>
                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">{topic.summary}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {topic.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Verified Answer */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Verified Government Cadastral Directive
                </span>
                <span className="text-[10px] text-slate-400">Pre-trained on Gazette laws</span>
              </div>
              <h3 className="text-base md:text-lg font-black text-slate-900 mt-1 leading-snug">
                {selectedKnowledgeTopic.question}
              </h3>
            </div>

            {/* Quick Executive Summary */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Statutory Summary:
              </p>
              <p className="text-xs font-semibold text-emerald-950 leading-relaxed">
                {selectedKnowledgeTopic.summary}
              </p>
            </div>

            {/* Detailed Body */}
            <div className="text-xs text-slate-700 space-y-2 whitespace-pre-line leading-relaxed">
              {selectedKnowledgeTopic.detailedAnswer}
            </div>

            {/* Mathematical Formula if applicable */}
            {selectedKnowledgeTopic.formula && (
              <div className="bg-emerald-950 text-emerald-200 rounded-xl p-3.5 font-mono text-xs border border-emerald-800/60">
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1 font-sans">
                  Official Calculation Formula:
                </p>
                <p className="font-bold text-white">{selectedKnowledgeTopic.formula}</p>
                {selectedKnowledgeTopic.exampleCalculation && (
                  <p className="text-[11px] text-emerald-300 font-sans mt-2 pt-2 border-t border-emerald-800/60">
                    <span className="font-bold text-white">Live Example: </span>
                    {selectedKnowledgeTopic.exampleCalculation}
                  </p>
                )}
              </div>
            )}

            {/* Official Legal Citations */}
            <div className="pt-3 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Official Statutory Citations:
              </p>
              <div className="space-y-1.5">
                {selectedKnowledgeTopic.officialReferences.map((ref, rIdx) => (
                  <div
                    key={rIdx}
                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-200"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{ref.title}</span>
                      <span className="text-slate-500 ml-2">({ref.sectionOrClause})</span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                      {ref.portalOrAct}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STATUTORY RFCTLARR 2013 CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5 max-w-4xl mx-auto">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900 text-base md:text-lg">
                  RFCTLARR Act 2013 Statutory Compensation Calculator
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Implements First Schedule calculation with 100% Solatium (Sec 30(1)), rural multiplier (1.25x - 2.0x),
                standing assets (Sec 29), and 12% p.a. additional interest (Sec 30(3)).
              </p>
            </div>
            <div className="shrink-0">
              <CurrencySelector variant="pill" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Input Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Base Market / Circle Rate Value (₹ INR)
                </label>
                <input
                  type="number"
                  value={calcMarketValue}
                  onChange={(e) => setCalcMarketValue(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900"
                  step="100000"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Determined under Section 26 from 3-year registered sale deeds or collector guidance rate.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Location Multiplier Factor ({calcMultiplier}x)
                </label>
                <input
                  type="range"
                  min="1.0"
                  max="2.0"
                  step="0.05"
                  value={calcMultiplier}
                  onChange={(e) => setCalcMultiplier(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5 font-mono">
                  <span>1.0x (Urban)</span>
                  <span>1.25x - 1.5x (Semi-Rural)</span>
                  <span>2.0x (Deep Rural)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Standing Assets Valuation (₹ INR)
                </label>
                <input
                  type="number"
                  value={calcAssetsValue}
                  onChange={(e) => setCalcAssetsValue(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900"
                  step="50000"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Wells, irrigation pipelines, fruit trees, and farm structures (Section 29).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Months Elapsed Since Section 3A / 11 Notification ({calcMonthsElapsed} months)
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={calcMonthsElapsed}
                  onChange={(e) => setCalcMonthsElapsed(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Accrues 12% per annum simple interest under Section 30(3).
                </p>
              </div>
            </div>

            {/* Calculation Breakdown Result */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Compensation Award Breakdown:
                </p>

                <div className="flex justify-between text-xs py-1 border-b border-slate-200">
                  <span className="text-slate-600">Base Land Value × {calcMultiplier}x:</span>
                  <span className="font-bold text-slate-900">{formatRawINR(multipliedLandValue)}</span>
                </div>

                <div className="flex justify-between text-xs py-1 border-b border-slate-200">
                  <span className="text-slate-600">+ Standing Assets (Sec 29):</span>
                  <span className="font-bold text-slate-900">{formatRawINR(calcAssetsValue)}</span>
                </div>

                <div className="flex justify-between text-xs py-1 border-b border-slate-200">
                  <span className="text-emerald-800 font-medium">+ 100% Solatium (Sec 30(1)):</span>
                  <span className="font-bold text-emerald-800">{formatRawINR(solatium100)}</span>
                </div>

                <div className="flex justify-between text-xs py-1 border-b border-slate-200">
                  <span className="text-teal-800 font-medium">+ 12% p.a. Additional Interest (Sec 30(3)):</span>
                  <span className="font-bold text-teal-800">{formatRawINR(Math.round(interest12Pct))}</span>
                </div>
              </div>

              {/* Grand Total Award */}
              <div className="bg-emerald-900 text-white rounded-xl p-4 shadow-md mt-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-emerald-200 uppercase tracking-wider font-bold">
                    Total Legally Mandated Award:
                  </p>
                  {currency !== 'INR' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-800 text-emerald-200 font-mono">
                      In {currencyConfig.code}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-black mt-1">
                  {formatRawINR(grandTotalCompensation)}
                </p>
                {currency !== 'INR' && (
                  <p className="text-xs text-emerald-200/80 font-mono mt-0.5">
                    Statutory Base: ₹{Math.round(grandTotalCompensation).toLocaleString('en-IN')} INR
                  </p>
                )}
                <p className="text-[10px] text-emerald-200 mt-1">
                  Disbursed via direct PFMS DBT to the verified bank account with zero intermediary commission.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
