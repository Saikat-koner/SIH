import React, { useState, useMemo } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  DollarSign,
  TrendingUp,
  Search,
  ShieldCheck,
  Building2,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Download,
  Filter,
  Sparkles,
  Zap,
  Info,
  Calendar,
  Layers,
  MapPin,
  UserCheck,
  Award,
  CreditCard,
  Printer,
  MessageSquare,
  RefreshCw,
  Send,
  Globe,
} from 'lucide-react';
import {
  INITIAL_NATIONAL_PROJECTS,
  INITIAL_TRACKING_CASES,
  NationalProject,
  EndToEndCase,
  TrackingStage,
  ProjectBottleneck,
} from '../data/lifecycleData';
import { UserRole } from '../types';
import { GovernmentPortalsHub } from './GovernmentPortalsHub';
import { useCurrency } from '../context/CurrencyContext';
import { CurrencySelector } from './CurrencySelector';

interface LifecycleMonitoringDashboardProps {
  currentRole: UserRole;
  currentLang: string;
  onSelectParcelFromTracker?: (parcelId: string) => void;
}

export const LifecycleMonitoringDashboard: React.FC<LifecycleMonitoringDashboardProps> = ({
  currentRole,
  currentLang,
  onSelectParcelFromTracker,
}) => {
  const { formatCrores, currency, currencyConfig } = useCurrency();
  // Main sub-tabs corresponding directly to the 4 user-requested pillars + Gov Portals Hub
  const [activeSubTab, setActiveSubTab] = useState<'monitoring' | 'tracking' | 'analytics' | 'transparency' | 'gov_portals'>('monitoring');

  // State for national projects and bottlenecks
  const [projects, setProjects] = useState<NationalProject[]>(INITIAL_NATIONAL_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('proj_dme_01');

  // State for End-to-End Tracking Cases
  const [cases, setCases] = useState<EndToEndCase[]>(INITIAL_TRACKING_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('TRK-2024-MH-142A');
  const [caseSearchQuery, setCaseSearchQuery] = useState<string>('');

  // State for Landowner Transparency Portal
  const [citizenQuery, setCitizenQuery] = useState<string>('142/1');
  const [searchedCitizenCase, setSearchedCitizenCase] = useState<EndToEndCase | null>(INITIAL_TRACKING_CASES[0]);
  const [hasSearched, setHasSearched] = useState<boolean>(true);
  const [grievanceText, setGrievanceText] = useState<string>('');
  const [grievanceSubmitted, setGrievanceSubmitted] = useState<boolean>(false);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);

  // Filter for Decision Support
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Selected project object
  const selectedProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || projects[0];
  }, [projects, selectedProjectId]);

  // Selected case object
  const activeCase = useMemo(() => {
    return cases.find((c) => c.id === selectedCaseId) || cases[0];
  }, [cases, selectedCaseId]);

  // Format currency in Indian numbering (Crores / Lakhs)
  const formatIndianCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} Lakh`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Resolve a bottleneck action (Decision Support)
  const handleResolveBottleneck = (projectId: string, bottleneckId: string, actionLabel: string) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        const updatedBottlenecks = proj.bottlenecks.map((b) =>
          b.id === bottleneckId ? { ...b, resolved: true } : b
        );
        const unresolvedCount = updatedBottlenecks.filter((b) => !b.resolved).length;
        const newStatus = unresolvedCount === 0 ? 'on_track' : 'needs_attention';
        return {
          ...proj,
          bottlenecks: updatedBottlenecks,
          status: newStatus,
        };
      })
    );

    setActionSuccessMsg(`Action Dispatched: "${actionLabel}" executed successfully! Administrative resolution order logged on blockchain audit registry.`);
    setTimeout(() => {
      setActionSuccessMsg(null);
    }, 6000);
  };

  // Advance / verify a stage in End-to-End Tracking
  const handleVerifyCurrentStage = (caseId: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const nextIndex = Math.min(c.currentStageIndex + 1, c.stages.length - 1);
        const updatedStages = c.stages.map((stg, idx) => {
          if (idx <= nextIndex) {
            return {
              ...stg,
              status: 'completed' as const,
              date: stg.status === 'completed' ? stg.date : new Date().toISOString().split('T')[0],
              digitalSeal: stg.digitalSeal.includes('Pending') ? `SHA256: ${Math.random().toString(36).substring(2, 12)}...verified` : stg.digitalSeal,
            };
          }
          return stg;
        });

        const allDone = nextIndex === c.stages.length - 1;
        const updatedComp = allDone
          ? { ...c.compensation, disbursementStatus: 'paid' as const, dbtReference: `PFMS-NPCI-${Date.now().toString().slice(-8)}` }
          : c.compensation;

        return {
          ...c,
          currentStageIndex: nextIndex,
          stages: updatedStages,
          compensation: updatedComp,
          delayRisk: 'low',
          delayDays: 0,
          bottleneckReason: undefined,
          lastUpdated: new Date().toISOString(),
        };
      })
    );
  };

  // Citizen search handler
  const handleCitizenSearch = (queryOverride?: string) => {
    const q = (queryOverride !== undefined ? queryOverride : citizenQuery).trim().toLowerCase();
    if (!q) return;

    const matched = cases.find(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.khasraNumber.toLowerCase().includes(q) ||
        c.landownerName.toLowerCase().includes(q) ||
        c.aadhaarMask.toLowerCase().includes(q) ||
        c.village.toLowerCase().includes(q)
    );

    setSearchedCitizenCase(matched || null);
    setHasSearched(true);
    setGrievanceSubmitted(false);
  };

  // Filtered cases for tracking tab
  const filteredCases = useMemo(() => {
    if (!caseSearchQuery.trim()) return cases;
    const q = caseSearchQuery.toLowerCase();
    return cases.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.khasraNumber.toLowerCase().includes(q) ||
        c.landownerName.toLowerCase().includes(q) ||
        c.projectName.toLowerCase().includes(q) ||
        c.taluka.toLowerCase().includes(q)
    );
  }, [cases, caseSearchQuery]);

  // Overall National KPI aggregations
  const totalParcelsAcrossProjects = projects.reduce((acc, p) => acc + p.totalParcels, 0);
  const totalSurveyedAcrossProjects = projects.reduce((acc, p) => acc + p.surveyedParcels, 0);
  const totalDemarcatedAcrossProjects = projects.reduce((acc, p) => acc + p.demarcatedParcels, 0);
  const totalAwardsAcrossProjects = projects.reduce((acc, p) => acc + p.awardsPassed, 0);
  const totalPayoutsAcrossProjects = projects.reduce((acc, p) => acc + p.payoutsCompleted, 0);
  const totalAllocatedBudgetCr = projects.reduce((acc, p) => acc + p.allocatedBudgetCr, 0);
  const totalDisbursedBudgetCr = projects.reduce((acc, p) => acc + p.disbursedBudgetCr, 0);
  const totalActiveBottlenecks = projects.reduce(
    (acc, p) => acc + p.bottlenecks.filter((b) => !b.resolved).length,
    0
  );

  return (
    <div className="flex-1 bg-slate-50 min-h-screen pb-16">
      {/* Top Banner & Tab Switcher */}
      <div className="bg-white border-b border-slate-200 shadow-xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wide">
                  DILRMP & SVAMITVA Integrated Suite
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Land Acquisition (RFCTLARR Act 2013) & Real-Time Monitoring
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
                National Projects & Compensation Lifecycle
              </h1>
            </div>

            {/* 4 Core Pillars Tabs */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 overflow-x-auto">
              <button
                onClick={() => setActiveSubTab('monitoring')}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeSubTab === 'monitoring'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>Real-Time Monitoring</span>
                {totalActiveBottlenecks > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                    {totalActiveBottlenecks}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveSubTab('tracking')}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeSubTab === 'tracking'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                <span>End-to-End Tracking</span>
              </button>

              <button
                onClick={() => setActiveSubTab('analytics')}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeSubTab === 'analytics'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>Decision Support</span>
              </button>

              <button
                onClick={() => setActiveSubTab('transparency')}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeSubTab === 'transparency'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Landowner Transparency</span>
              </button>

              <button
                onClick={() => setActiveSubTab('gov_portals')}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeSubTab === 'gov_portals'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                <span>Gov Portals & AI Intelligence</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Global Success Notification for Decision Support Actions */}
      {actionSuccessMsg && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-medium flex items-center gap-3 shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="flex-1">{actionSuccessMsg}</span>
            <button
              onClick={() => setActionSuccessMsg(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-1 rounded hover:bg-emerald-100"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 1: REAL-TIME MONITORING (Live Dashboards & Bottleneck Spotting)
         ========================================================================= */}
      {activeSubTab === 'monitoring' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6 animate-in fade-in duration-150">
          {/* Executive Overview KPI Ribbon */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>National Projects</span>
                <Building2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{projects.length} Corridors</div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <span>All telemetry active</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Parcels Tracked</span>
                <Layers className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{totalParcelsAcrossProjects.toLocaleString()}</div>
              <div className="text-[11px] text-slate-500 mt-1">
                {totalSurveyedAcrossProjects} surveyed ({Math.round((totalSurveyedAcrossProjects / totalParcelsAcrossProjects) * 100)}%)
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Awards Passed</span>
                <Award className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{totalAwardsAcrossProjects.toLocaleString()}</div>
              <div className="text-[11px] text-purple-700 font-medium mt-1">
                {Math.round((totalAwardsAcrossProjects / totalParcelsAcrossProjects) * 100)}% legally sanitized
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Compensation Disbursed</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-700 mt-1">₹{totalDisbursedBudgetCr.toFixed(0)} Cr</div>
              <div className="text-[11px] text-slate-500 mt-1">
                of ₹{totalAllocatedBudgetCr.toFixed(0)} Cr allocated ({Math.round((totalDisbursedBudgetCr / totalAllocatedBudgetCr) * 100)}%)
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Active Bottlenecks</span>
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-bold text-rose-600 mt-1">{totalActiveBottlenecks} Roadblocks</div>
              <div className="text-[11px] text-rose-500 font-medium mt-1">
                Spotting delays & action items
              </div>
            </div>
          </div>

          {/* Project Corridor Selector & Detailed Progress Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Project List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  National Infrastructure Projects
                </h2>
                <span className="text-[11px] text-slate-500">Live Telemetry</span>
              </div>

              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[500px] pr-1">
                {projects.map((proj) => {
                  const unresolved = proj.bottlenecks.filter((b) => !b.resolved).length;
                  const isSelected = proj.id === selectedProjectId;
                  const percentComplete = Math.round((proj.payoutsCompleted / proj.totalParcels) * 100);

                  return (
                    <div
                      key={proj.id}
                      onClick={() => setSelectedProjectId(proj.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-200'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                            {proj.code}
                          </span>
                          <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{proj.name}</h3>
                          <div className="text-[11px] text-slate-500 mt-0.5">{proj.executingAgency}</div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                            proj.status === 'on_track'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : proj.status === 'needs_attention'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-rose-100 text-rose-800 border-rose-300'
                          }`}
                        >
                          {proj.status === 'on_track'
                            ? 'On Track'
                            : proj.status === 'needs_attention'
                            ? `${unresolved} Bottlenecks`
                            : 'Critical Delay'}
                        </span>
                      </div>

                      {/* Mini Progress bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-medium">
                          <span>Progress: {proj.payoutsCompleted} of {proj.totalParcels} parcels</span>
                          <span className="font-bold text-slate-900">{percentComplete}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentComplete}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Selected Project Deep Dive & Stage Funnel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Detailed Project Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-bold border border-slate-200">
                        {selectedProject.code}
                      </span>
                      <span className="text-xs text-slate-500">{selectedProject.ministry}</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">{selectedProject.name}</h2>
                    <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      Corridor: {selectedProject.corridor} ({selectedProject.statesCovered.join(', ')})
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Target Completion</span>
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1 justify-end mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      {selectedProject.targetCompletionDate}
                    </span>
                  </div>
                </div>

                {/* 4-Stage Funnel Progress */}
                <div className="mt-5">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    Corridor Milestone Pipeline (Live Stage Clearance)
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-500 block">1. Surveyed</span>
                      <span className="text-base font-bold text-slate-900 mt-0.5 block">
                        {selectedProject.surveyedParcels} / {selectedProject.totalParcels}
                      </span>
                      <div className="mt-1.5 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full"
                          style={{
                            width: `${(selectedProject.surveyedParcels / selectedProject.totalParcels) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-blue-700 font-bold mt-1 block">
                        {Math.round((selectedProject.surveyedParcels / selectedProject.totalParcels) * 100)}% Cleared
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-500 block">2. Demarcated</span>
                      <span className="text-base font-bold text-slate-900 mt-0.5 block">
                        {selectedProject.demarcatedParcels} / {selectedProject.totalParcels}
                      </span>
                      <div className="mt-1.5 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full"
                          style={{
                            width: `${(selectedProject.demarcatedParcels / selectedProject.totalParcels) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-indigo-700 font-bold mt-1 block">
                        {Math.round((selectedProject.demarcatedParcels / selectedProject.totalParcels) * 100)}% Cleared
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-500 block">3. Awards Passed</span>
                      <span className="text-base font-bold text-slate-900 mt-0.5 block">
                        {selectedProject.awardsPassed} / {selectedProject.totalParcels}
                      </span>
                      <div className="mt-1.5 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-500 h-full rounded-full"
                          style={{
                            width: `${(selectedProject.awardsPassed / selectedProject.totalParcels) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-purple-700 font-bold mt-1 block">
                        {Math.round((selectedProject.awardsPassed / selectedProject.totalParcels) * 100)}% Cleared
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-500 block">4. DBT Paid</span>
                      <span className="text-base font-bold text-emerald-700 mt-0.5 block">
                        {selectedProject.payoutsCompleted} / {selectedProject.totalParcels}
                      </span>
                      <div className="mt-1.5 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{
                            width: `${(selectedProject.payoutsCompleted / selectedProject.totalParcels) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold mt-1 block">
                        {Math.round((selectedProject.payoutsCompleted / selectedProject.totalParcels) * 100)}% Cleared
                      </span>
                    </div>
                  </div>
                </div>

                {/* Financial Ledger Progress */}
                <div className="mt-5 p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-700" />
                      Land Acquisition Compensation Ledger
                    </span>
                    <div className="flex items-center gap-2">
                      <CurrencySelector variant="pill" />
                      <span className="text-xs text-slate-600 font-medium">
                        Disbursed: <strong className="text-emerald-800">{formatCrores(selectedProject.disbursedBudgetCr)}</strong> / {formatCrores(selectedProject.allocatedBudgetCr)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-600 h-full transition-all"
                      style={{
                        width: `${(selectedProject.disbursedBudgetCr / selectedProject.allocatedBudgetCr) * 100}%`,
                      }}
                      title="Disbursed directly via PFMS"
                    />
                    <div
                      className="bg-amber-400 h-full transition-all"
                      style={{
                        width: `${(selectedProject.escrowBudgetCr / selectedProject.allocatedBudgetCr) * 100}%`,
                      }}
                      title="In Statutory Escrow (pending dispute clearance)"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 flex-wrap gap-1">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> Disbursed DBT (
                      {Math.round((selectedProject.disbursedBudgetCr / selectedProject.allocatedBudgetCr) * 100)}%)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Escrow Sub-Divisional Treasury ({formatCrores(selectedProject.escrowBudgetCr)})
                    </span>
                    <span className="text-slate-600 font-medium">
                      Remaining: {formatCrores(selectedProject.allocatedBudgetCr - selectedProject.disbursedBudgetCr - selectedProject.escrowBudgetCr)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Real-Time Bottleneck Spotter for the Project */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Automated Bottleneck Spotter
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      AI & geodetic exception analytics flagging delays and administrative roadblocks
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-600">
                    {selectedProject.bottlenecks.filter((b) => !b.resolved).length} Pending
                  </span>
                </div>

                {selectedProject.bottlenecks.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    No active bottlenecks detected on this corridor. All procedural steps are within SLA limits.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedProject.bottlenecks.map((btnk) => (
                      <div
                        key={btnk.id}
                        className={`p-4 rounded-xl border transition-all ${
                          btnk.resolved
                            ? 'bg-emerald-50/40 border-emerald-200 opacity-75'
                            : btnk.severity === 'critical'
                            ? 'bg-rose-50/50 border-rose-200'
                            : 'bg-amber-50/50 border-amber-200'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            <span
                              className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                                btnk.resolved
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : btnk.severity === 'critical'
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {btnk.resolved ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <AlertTriangle className="w-4 h-4" />
                              )}
                            </span>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-900">{btnk.title}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/80 border border-slate-200 text-slate-600">
                                  Stage: {btnk.stage}
                                </span>
                                {btnk.resolved ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    Resolved
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
                                    +{btnk.estimatedDelayDays} Days Delay Risk
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 mt-1">{btnk.description}</p>
                              <div className="text-[11px] text-slate-500 mt-1">
                                Impact: <strong className="text-slate-800">{btnk.impactParcels} Land Parcels</strong> held in deadlock
                              </div>
                            </div>
                          </div>

                          {!btnk.resolved && (
                            <button
                              onClick={() =>
                                handleResolveBottleneck(selectedProject.id, btnk.id, btnk.actionLabel)
                              }
                              className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition active:scale-95 shrink-0 flex items-center gap-1"
                            >
                              <Zap className="w-3.5 h-3.5" />
                              <span>{btnk.actionLabel}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: END-TO-END TRACKING (Digital Trail: Survey to Compensation Payout)
         ========================================================================= */}
      {activeSubTab === 'tracking' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6 animate-in fade-in duration-150">
          {/* Header & Case Selector Filter */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                End-to-End Digital Audit Trail
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cryptographically sealed provenance tracking every step from the first CORS GNSS land survey to direct benefit transfer (DBT) payout
              </p>
            </div>

            {/* Search and Case Selector */}
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter Case / Khasra / Name..."
                  value={caseSearchQuery}
                  onChange={(e) => setCaseSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48 sm:w-64"
                />
              </div>

              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {filteredCases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} - Khasra #{c.khasraNumber} ({c.landownerName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Case Detail Header */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-300">
                  #{activeCase.khasraNumber}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {activeCase.id}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Project: {activeCase.projectName}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        activeCase.currentStageIndex === 5
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : activeCase.delayRisk === 'high'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {activeCase.currentStageIndex === 5
                        ? 'Acquisition & Payout Completed'
                        : `Stage ${activeCase.currentStageIndex + 1} of 6 In Progress`}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {activeCase.landownerName}{' '}
                    <span className="text-xs font-normal text-slate-500">
                      (Aadhaar: {activeCase.aadhaarMask})
                    </span>
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>Village: {activeCase.village}</span>
                    <span>•</span>
                    <span>Taluka: {activeCase.taluka}</span>
                    <span>•</span>
                    <span>District: {activeCase.district}, {activeCase.state}</span>
                  </div>
                </div>
              </div>

              {/* Compensation Summary & Action */}
              <div className="flex items-center gap-3">
                <div className="text-right p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Total Compensation Award</span>
                  <span className="text-base font-bold text-emerald-700">
                    {formatIndianCurrency(activeCase.compensation.totalPayout)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Status: <strong className="capitalize">{activeCase.compensation.disbursementStatus.replace('_', ' ')}</strong>
                  </span>
                </div>

                {activeCase.currentStageIndex < 5 && (
                  <button
                    onClick={() => handleVerifyCurrentStage(activeCase.id)}
                    className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition active:scale-95 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Advance Stage ({activeCase.currentStageIndex + 1} → {activeCase.currentStageIndex + 2})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Visual Stepper (6 Chronological Stages) */}
            <div className="mt-6">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                Official Statutory Lifecycle (RFCTLARR 2013 & Cadastre Modernization)
              </div>

              <div className="relative">
                {/* Connecting Line */}
                <div className="hidden md:block absolute top-5 left-8 right-8 h-1 bg-slate-200 -z-0" />

                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 relative z-10">
                  {activeCase.stages.map((stg, idx) => {
                    const isDone = stg.status === 'completed';
                    const isCurrent = idx === activeCase.currentStageIndex && !isDone;
                    const isPending = idx > activeCase.currentStageIndex;

                    return (
                      <div
                        key={stg.id}
                        className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                          isDone
                            ? 'bg-emerald-50/50 border-emerald-300'
                            : isCurrent
                            ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200 shadow-xs'
                            : 'bg-slate-50/60 border-slate-200 opacity-60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                                isDone
                                  ? 'bg-emerald-600 text-white'
                                  : isCurrent
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-slate-300 text-slate-600'
                              }`}
                            >
                              {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </span>
                            <span
                              className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                isDone
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isCurrent
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {isDone ? 'Cleared' : isCurrent ? 'Active' : 'Pending'}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-900 leading-snug">{stg.shortLabel}</h4>
                          <span className="text-[10px] text-slate-500 mt-1 block flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {stg.date}
                          </span>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] text-slate-600">
                          <span className="font-semibold block truncate">{stg.officer}</span>
                          <span className="text-slate-400 truncate block">{stg.designation}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Detailed Stage Audit Trails & Verified Documents */}
            <div className="mt-6 pt-5 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                Cryptographic Evidence & Certified Documents
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeCase.stages
                  .filter((s) => s.status === 'completed' || s.status === 'in_progress')
                  .map((stg) => (
                    <div key={stg.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            {stg.shortLabel}
                          </span>
                          <h5 className="text-xs font-bold text-slate-900">{stg.title}</h5>
                        </div>
                        <span className="text-[10px] text-slate-500">{stg.date}</span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1.5">{stg.remarks}</p>

                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                        <span className="font-mono text-[10px] text-slate-400 truncate max-w-[200px]">
                          {stg.digitalSeal}
                        </span>
                        {stg.documents.length > 0 && (
                          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                            <FileText className="w-3.5 h-3.5" />
                            <span>{stg.documents[0].fileName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: DECISION SUPPORT (Delay Flags, Budget Burn, Roadblock Resolver)
         ========================================================================= */}
      {activeSubTab === 'analytics' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6 animate-in fade-in duration-150">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-600" />
                Administrative Decision Support & Predictive Risk Engine
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                AI and rule-based decision modeling highlighting budget usage, delay forecasting, and fast-track mitigation interventions
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
              RFCTLARR 2013 & NITI Aayog Compliant
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Predictive Delay Warning Radar */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  Predictive Delay Radar
                </h3>
                <span className="text-[11px] text-slate-400">ML Forecast</span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-900">Taluka Haveli Succession Backlog</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-200 text-rose-900">
                      HIGH RISK
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    28 joint-family parcels have pending heirship affidavits exceeding statutory 30-day notice window.
                  </p>
                  <div className="mt-2 text-[11px] text-rose-800 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Projected Slippage: +45 Calendar Days</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900">Khasra #142/2 Bund (Medh) Dispute</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                      MEDIUM RISK
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    1.4m southern offset detected between 1942 cloth shajra and CORS RTK survey.
                  </p>
                  <div className="mt-2 text-[11px] text-amber-800 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Projected Slippage: +14 Calendar Days</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900">Khasra #142/1 Sugarcane Corridor</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                      RESOLVED
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Full DBT disbursement completed with zero pending litigation.
                  </p>
                  <div className="mt-2 text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>0 Days Delay (Ahead of SLA)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center: Budget Burn & Solatium Audit */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Budget Burn & Solatium Audit
                </h3>
                <span className="text-[11px] text-slate-400">Fiscal Health</span>
              </div>

              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Allocated Outlay (Delhi-Mumbai Pkg 4):</span>
                    <span className="font-bold text-slate-900">₹3,450.0 Cr</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 mt-1.5">
                    <span>Disbursed via PFMS:</span>
                    <span className="font-bold text-emerald-700">₹2,415.0 Cr (70%)</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 mt-1.5">
                    <span>Held in Escrow (Disputed):</span>
                    <span className="font-bold text-amber-700">₹395.0 Cr (11%)</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 mt-1.5">
                    <span>Available Treasury Balance:</span>
                    <span className="font-bold text-slate-700">₹640.0 Cr (19%)</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                    <span className="text-xs font-bold text-blue-900">100% Solatium Audit Compliance</span>
                  </div>
                  <p className="text-xs text-blue-800 mt-1">
                    Every award strictly enforces Section 30(1) 100% Solatium over base market value + rural multiplier (1.5x) to eliminate legal challenges in High Courts.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Cost Overrun Sensitivity</span>
                  <div className="text-xs text-slate-700 mt-1 flex items-center justify-between">
                    <span>Predicted variance at completion:</span>
                    <strong className="text-emerald-700 font-mono">+1.2% (Within 5% Contingency)</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Actionable Roadblock Resolver Toolkit */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-600" />
                  Roadblock Resolution Toolkit
                </h3>
                <span className="text-[11px] text-slate-400">1-Click Actions</span>
              </div>

              <p className="text-xs text-slate-500">
                Delegated administrative powers for District Collector / Competent Authority (CALA) to dissolve gridlocks:
              </p>

              <div className="space-y-2.5">
                <button
                  onClick={() =>
                    handleResolveBottleneck(
                      'proj_dme_01',
                      'btnk_01',
                      'Special Lok Adalat Camp Sanctioned (Haveli Circle)'
                    )
                  }
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-xs group"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 group-hover:text-emerald-800">
                    <span>1. Convene Fast-Track Lok Adalat</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Instantly resolves 28 pending succession disputes via judicial summary conciliation.
                  </p>
                </button>

                <button
                  onClick={() =>
                    handleResolveBottleneck(
                      'proj_dme_01',
                      'btnk_02',
                      '1.25x Rural Multiplier Applied per First Schedule'
                    )
                  }
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-xs group"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 group-hover:text-emerald-800">
                    <span>2. Apply 1.25x Rural Multiplier</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Re-calibrates outdated Ready Reckoner circle rates to avoid landowner litigation.
                  </p>
                </button>

                <button
                  onClick={() =>
                    handleResolveBottleneck(
                      'proj_dilrmp_04',
                      'btnk_04',
                      'Special SLAO Summary Court Constituted'
                    )
                  }
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-xs group"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 group-hover:text-emerald-800">
                    <span>3. Depute Special SLAO Summary Court</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Clears 82 Section 15 objection petitions within a single dedicated 14-day sitting.
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: TRANSPARENCY (Landowner Citizen Self-Service Portal)
         ========================================================================= */}
      {activeSubTab === 'transparency' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6 animate-in fade-in duration-150">
          {/* Citizen Search Hero Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md">
            <div className="max-w-3xl">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Citizen Self-Service & Anti-Corruption Portal
              </span>
              <h2 className="text-xl sm:text-3xl font-bold tracking-tight mt-2">
                Track Your Land Parcel & Compensation Payout
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed">
                Zero physical office visits. Instantly verify revenue documents, track acquisition milestones, and verify direct benefit transfer (DBT) credit directly to your Aadhaar-linked bank account.
              </p>

              {/* Search Bar */}
              <div className="mt-5 flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Enter Khasra No (e.g. 142/1), Case ID (TRK-2024-MH-142A), or Aadhaar last 4 digits..."
                    value={citizenQuery}
                    onChange={(e) => setCitizenQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCitizenSearch()}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium"
                  />
                </div>
                <button
                  onClick={() => handleCitizenSearch()}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Case</span>
                </button>
              </div>

              {/* 1-Click Demo Pills */}
              <div className="mt-3.5 flex items-center gap-2 flex-wrap text-xs text-slate-300">
                <span>Quick demo records:</span>
                <button
                  onClick={() => {
                    setCitizenQuery('142/1');
                    handleCitizenSearch('142/1');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-200 border border-white/10 font-medium"
                >
                  Khasra #142/1 (Patil - Paid ₹5.35 Cr)
                </button>
                <button
                  onClick={() => {
                    setCitizenQuery('142/2');
                    handleCitizenSearch('142/2');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-amber-200 border border-white/10 font-medium"
                >
                  Khasra #142/2 (Shinde - In Escrow)
                </button>
                <button
                  onClick={() => {
                    setCitizenQuery('89/A');
                    handleCitizenSearch('89/A');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-blue-200 border border-white/10 font-medium"
                >
                  Khasra #89/A (Suman Devi - In Progress)
                </button>
              </div>
            </div>
          </div>

          {/* Searched Case Result View */}
          {searchedCitizenCase ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              {/* Header Status Card */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                      Tracking ID: {searchedCitizenCase.id}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Khasra / Survey #{searchedCitizenCase.khasraNumber}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-1.5">
                    {searchedCitizenCase.landownerName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Village: {searchedCitizenCase.village} | Taluka: {searchedCitizenCase.taluka} | District: {searchedCitizenCase.district}, {searchedCitizenCase.state}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowCertificateModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 border border-slate-200"
                  >
                    <Printer className="w-4 h-4 text-slate-600" />
                    <span>Download Passbook (PDF)</span>
                  </button>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">DBT Payout Status</span>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border inline-block mt-0.5 ${
                        searchedCitizenCase.compensation.disbursementStatus === 'paid'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {searchedCitizenCase.compensation.disbursementStatus === 'paid'
                        ? 'Credited via PFMS (DBT)'
                        : 'In Statutory Escrow Account'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Milestones Stepper */}
              <div>
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Lifecycle Clearance Progress
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center">
                  {searchedCitizenCase.stages.map((stg, idx) => {
                    const isDone = stg.status === 'completed';
                    const isCurrent = idx === searchedCitizenCase.currentStageIndex && !isDone;
                    return (
                      <div
                        key={stg.id}
                        className={`p-3 rounded-xl border ${
                          isDone
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : isCurrent
                            ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        <div className="flex justify-center mb-1">
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-xs flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-semibold line-clamp-1">{stg.shortLabel}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{stg.date}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Transparent Compensation Calculation Breakdown */}
              <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-200/80 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-700" />
                    <h4 className="text-sm font-bold text-slate-900">
                      Transparent Compensation Breakdown (RFCTLARR Act 2013 First Schedule)
                    </h4>
                  </div>
                  <span className="text-xs text-emerald-800 font-medium">100% Solatium Certified</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Base Ready Reckoner Rate:</span>
                      <span className="font-mono font-bold text-slate-800">
                        ₹{searchedCitizenCase.compensation.baseMarketRatePerHa.toLocaleString('en-IN')}/Ha
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Acquired Cadastral Area:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {searchedCitizenCase.compensation.areaAcquiredHa} Hectares
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Market Value:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {formatIndianCurrency(searchedCitizenCase.compensation.marketValue)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Statutory Rural Multiplier:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {searchedCitizenCase.compensation.multiplierFactor}x
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Statutory 100% Solatium (Sec 30):</span>
                      <span className="font-mono font-bold text-emerald-700">
                        +{formatIndianCurrency(searchedCitizenCase.compensation.solatiumAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Standing Trees, Well & Crops Assets:</span>
                      <span className="font-mono font-bold text-slate-800">
                        +{formatIndianCurrency(searchedCitizenCase.compensation.assetsValue)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">12% Per Annum Additional Compensation:</span>
                      <span className="font-mono font-bold text-slate-800">
                        +{formatIndianCurrency(searchedCitizenCase.compensation.additionalInterest)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 bg-emerald-100/70 px-2 rounded-lg font-bold text-emerald-950">
                      <span>Total Net Payable Award:</span>
                      <span className="text-sm font-mono">
                        {formatIndianCurrency(searchedCitizenCase.compensation.totalPayout)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bank Disbursement Details */}
                <div className="mt-4 pt-3 border-t border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-700" />
                    <span>
                      Credited To: <strong>{searchedCitizenCase.compensation.bankName}</strong> (Acc: {searchedCitizenCase.compensation.bankAccountMask})
                    </span>
                  </div>
                  {searchedCitizenCase.compensation.dbtReference && (
                    <div className="font-mono text-emerald-800 font-bold">
                      PFMS Reference: {searchedCitizenCase.compensation.dbtReference}
                    </div>
                  )}
                </div>
              </div>

              {/* Online Grievance / Boundary Clarification Filing */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    Online Citizen Grievance & Demarcation Clarification
                  </h4>
                  <span className="text-[11px] text-slate-500">Tehsildar Direct Channel</span>
                </div>

                {grievanceSubmitted ? (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Your inquiry has been registered under Docket #GRV-2024-{Math.floor(Math.random() * 90000 + 10000)}. The Circle Revenue Inspector has been assigned for field re-verification.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      placeholder="Have an issue with the boundary demarcation, crop assessment, or compensation calculation? Submit your grievance here..."
                      value={grievanceText}
                      onChange={(e) => setGrievanceText(e.target.value)}
                      rows={2}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          if (!grievanceText.trim()) return;
                          setGrievanceSubmitted(true);
                          setGrievanceText('');
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit To Tehsildar Portal</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            hasSearched && (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">No Record Found for "{citizenQuery}"</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Please verify the Khasra number, Case Tracking ID, or select one of the sample records above.
                </p>
              </div>
            )
          )}
        </div>
      )}

      {/* Official Passbook & Certificate Modal */}
      {showCertificateModal && searchedCitizenCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Government of India • Ministry of Rural Development & DoLR
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Official Digital Compensation Passbook
                </h3>
              </div>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Case Tracking ID:</span>
                <span className="font-mono font-bold text-slate-900">{searchedCitizenCase.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Landowner:</span>
                <span className="font-bold text-slate-900">{searchedCitizenCase.landownerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Khasra / Survey No:</span>
                <span className="font-bold text-slate-900">{searchedCitizenCase.khasraNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Net Compensation Award:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {formatIndianCurrency(searchedCitizenCase.compensation.totalPayout)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Disbursement Channel:</span>
                <span className="font-bold text-slate-900">
                  PFMS / Direct Benefit Transfer (Aadhaar Seeded)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cryptographic Seal:</span>
                <span className="font-mono text-[10px] text-slate-400">
                  SHA256: 9b2d8e4f1a0c7b398d2eff88102a
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: OFFICIAL GOV PORTALS & AI INTELLIGENCE
         ========================================================================= */}
      {activeSubTab === 'gov_portals' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 animate-in fade-in duration-150">
          <GovernmentPortalsHub
            onSelectProject={(projId) => {
              setSelectedProjectId(projId);
              setActiveSubTab('monitoring');
            }}
          />
        </div>
      )}
    </div>
  );
};
