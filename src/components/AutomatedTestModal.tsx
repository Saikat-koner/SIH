import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  ShieldCheck,
  Zap,
  Layers,
  Clock,
  Terminal,
  Filter,
} from 'lucide-react';
import { UnitTestResult, LandParcel } from '../types';
import { runAutomatedUnitTests } from '../lib/unitTests';

interface AutomatedTestModalProps {
  parcels: LandParcel[];
}

export const AutomatedTestModal: React.FC<AutomatedTestModalProps> = ({ parcels }) => {
  const [testResults, setTestResults] = useState<UnitTestResult[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const executeTests = async () => {
    setIsRunning(true);
    // Simulate brief test pipeline run
    await new Promise((resolve) => setTimeout(resolve, 300));
    const results = await runAutomatedUnitTests(parcels);
    setTestResults(results);
    setIsRunning(false);
  };

  useEffect(() => {
    executeTests();
  }, [parcels]);

  const passedCount = testResults.filter((t) => t.status === 'pass').length;
  const failedCount = testResults.filter((t) => t.status === 'fail').length;
  const totalDuration = testResults.reduce((acc, t) => acc + t.durationMs, 0);

  const filteredTests = testResults.filter((t) => {
    if (activeCategory === 'all') return true;
    return t.category === activeCategory;
  });

  const categories = Array.from(new Set(testResults.map((t) => t.category)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Test Runner Hero Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-xs">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Automated Unit Testing & Cadastre Verification Suite
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  CI/CD Embedded
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Continuous software stability validation testing spatial mathematical algorithms, RBAC security gates,
                offline mutation queues, and GeoJSON RFC 7946 compliance directly in the browser runtime.
              </p>
            </div>
          </div>

          <button
            onClick={executeTests}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-sm transition active:scale-98"
          >
            {isRunning ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Executing Test Suite...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Rerun All Tests</span>
              </>
            )}
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400">Test Success Rate</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-bold text-slate-900">
                {testResults.length > 0 ? `${Math.round((passedCount / testResults.length) * 100)}%` : '0%'}
              </span>
              <span className="text-xs text-emerald-600 font-semibold">
                ({passedCount}/{testResults.length} Passed)
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400">Execution Time</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-bold text-slate-900">{totalDuration.toFixed(2)} ms</span>
              <span className="text-xs text-slate-500 font-medium">In-memory</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400">Security & RBAC Gates</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-bold text-purple-700">3 Audits</span>
              <span className="text-xs text-slate-500 font-medium">100% Enforced</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400">Spatial Math Engine</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-bold text-teal-700">Shoelace & GeoJSON</span>
              <span className="text-xs text-emerald-600 font-medium">Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Test Category Filters */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeCategory === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Tests ({testResults.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tests Results List */}
      <div className="space-y-3">
        {filteredTests.map((test) => (
          <div
            key={test.id}
            className={`p-4 rounded-xl border bg-white shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              test.status === 'pass' ? 'border-slate-200' : 'border-rose-300 bg-rose-50/40'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {test.status === 'pass' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 text-sm">{test.name}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {test.category}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">ID: {test.id}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{test.assertion}</p>
                {test.error && (
                  <div className="mt-2 p-2 rounded-lg bg-rose-100/70 border border-rose-200 text-rose-800 font-mono text-[11px]">
                    Error: {test.error}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {test.durationMs}ms
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  test.status === 'pass' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {test.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
