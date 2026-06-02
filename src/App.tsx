import React, { useState, useEffect } from "react";
import { FolderStructureView } from "./components/FolderStructureView";
import { DatasetExplorer } from "./components/DatasetExplorer";
import { LiveNavFeeds } from "./components/LiveNavFeeds";
import { DataQualityAudit } from "./components/DataQualityAudit";
import { GitManager } from "./components/GitManager";
import { SystemStatus } from "./types";
import { Play, PlayCircle, Library, Database, CloudLightning, Activity, Cpu, Sparkles, Terminal, FileCode2, CheckSquare, RefreshCw } from "lucide-react";

export default function App() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [activeTab, setActiveTab] = useState<string>("datasets");
  const [ingestionRunning, setIngestionRunning] = useState<boolean>(false);
  const [ingestionLogs, setIngestionLogs] = useState<string>("");
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [systemIsSimulated, setSystemIsSimulated] = useState<boolean>(false);

  // Load backend ecosystem specifications on component mount
  const scanSystemStatus = async () => {
    try {
      const res = await fetch("/api/system-status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (e) {
      console.error("System scan failed to establish a network handshake.");
    }
  };

  useEffect(() => {
    scanSystemStatus();
  }, [refreshTrigger]);

  const triggerIngestionPipeline = async () => {
    setIngestionRunning(true);
    setIngestionLogs("Starting data engineering ingestion pipeline...\nExecuting python3 data_ingestion.py...\n");
    try {
      const res = await fetch("/api/run/ingestion", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setIngestionLogs(prev => prev + data.logs + "\n\n✅ Data ingestion processing flow finished successfully.");
        setSystemIsSimulated(!!data.isSimulated);
        setRefreshTrigger(prev => prev + 1); // trigger state propagation
      } else {
        setIngestionLogs(prev => prev + `\n🛑 Process terminated with error: ${data.error || "Execution timeout."}\nLogs:\n${data.logs}`);
      }
    } catch (err: any) {
      setIngestionLogs(prev => prev + `\n🛑 Process halted unexpectedly during network transmission: ${err.message}`);
    } finally {
      setIngestionRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-12" id="app-workspace-root">
      {/* Top micro status bar */}
      <div className="bg-slate-900 text-white py-1 px-5 flex items-center justify-between text-4xs font-mono">
        <div className="flex items-center space-x-3">
          <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span>AMFI DATA PIPELINE ENVIRONMENT • SERVICE: RUNNING</span>
        </div>
        <div>
          <span>TIME: 2026-06-02 10:14:47 UTC</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 pt-6 space-y-6">
        {/* Executive Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between md:border-b border-slate-200/60 pb-5 gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-slate-800" />
              <span className="text-4xs font-mono font-bold uppercase py-0.5 px-2 bg-slate-200/75 rounded text-slate-700">Day 1 Deliverables</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center">
              AMFI Mutual Fund Analytics Ingestion Workbench
            </h1>
            <p className="text-xs text-slate-500 max-w-xl">
              An interactive operational workbench to ingest, parse, validate, and track 10 raw datasets and real-time NAV APIs.
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start md:self-center" id="quick-env-indicators">
            <div className="bg-white border rounded-lg px-3 py-1.5 text-right shadow-2xs">
              <span className="text-4xs text-slate-400 font-sans uppercase font-bold block">Python Runtime</span>
              <span className={`text-2xs font-bold ${status?.pythonAvailable ? "text-emerald-600" : "text-amber-600"}`} id="python-runtime-badge">
                {status?.pythonAvailable ? "● sys.v3 (OK)" : "Fallback (JS Sync)"}
              </span>
            </div>
            <div className="bg-white border rounded-lg px-3 py-1.5 text-right shadow-2xs">
              <span className="text-4xs text-slate-400 font-sans uppercase font-bold block">Loaded Datasets</span>
              <span className="text-2xs font-bold text-slate-900 font-mono">
                {status ? (Object.values(status.files).flat().filter((f: any) => typeof f === "string" && f.endsWith(".csv")).length) : 0} / 10 CSVs
              </span>
            </div>
          </div>
        </div>

        {/* Global Pipeline Activator Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4" id="pipeline-orchestrator">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center space-x-1.5">
                <PlayCircle className="w-4 h-4 text-emerald-600" />
                <span>Pandas Processing Core (Task 3 & 6)</span>
              </h3>
              <p className="text-2xs text-slate-500">
                Instantiate, structure directories, load 10 CSV datasets, extract categories, audit code validation rules, and output text anomalies summaries.
              </p>
            </div>

            <button
              onClick={triggerIngestionPipeline}
              disabled={ingestionRunning}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center space-x-2 transition shadow-sm cursor-pointer ${
                ingestionRunning
                  ? "bg-slate-100 border border-slate-200 text-slate-400"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
              id="run-ingestion-control-btn"
            >
              {ingestionRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Ingesting Datasets...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Data Ingestion Pipeline</span>
                </>
              )}
            </button>
          </div>

          {/* Ingestion logs output console (Dynamic streaming) */}
          {ingestionLogs && (
            <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden font-mono text-xs" id="ingestion-cli-output">
              <div className="px-4 py-1.5 border-b border-slate-800 bg-slate-900/65 flex items-center justify-between text-slate-400">
                <span className="text-3xs font-semibold font-mono">Terminal Output: data_ingestion.py</span>
                {systemIsSimulated && (
                  <span className="text-5xs bg-amber-500/10 text-amber-500 border border-amber-500/35 px-1 py-0.5 rounded font-bold font-sans">
                    Failsafe JS Engine Active
                  </span>
                )}
              </div>
              <pre className="p-4 overflow-y-auto max-h-[190px] text-slate-350 leading-relaxed font-mono text-2xs select-text whitespace-pre-wrap">
                {ingestionLogs}
              </pre>
            </div>
          )}
        </div>

        {/* Dynamic Tab Layout Options */}
        <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-px" id="workbench-tabs">
          <button
            onClick={() => setActiveTab("datasets")}
            className={`px-4 py-2 text-xs font-semibold select-none cursor-pointer border-b-2 transition whitespace-nowrap ${
              activeTab === "datasets"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
            id="tab-btn-datasets"
          >
            10-Dataset Explorer
          </button>
          <button
            onClick={() => setActiveTab("nav")}
            className={`px-4 py-2 text-xs font-semibold select-none cursor-pointer border-b-2 transition whitespace-nowrap ${
              activeTab === "nav"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
            id="tab-btn-nav"
          >
            Live NAV Feeds (Task 4 & 5)
          </button>
          <button
            onClick={() => setActiveTab("quality")}
            className={`px-4 py-2 text-xs font-semibold select-none cursor-pointer border-b-2 transition whitespace-nowrap ${
              activeTab === "quality"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
            id="tab-btn-quality"
          >
            Data Quality Audit (Task 7)
          </button>
          <button
            onClick={() => setActiveTab("git")}
            className={`px-4 py-2 text-xs font-semibold select-none cursor-pointer border-b-2 transition whitespace-nowrap ${
              activeTab === "git"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
            id="tab-btn-git"
          >
            Git Commit Versioning (Task 8)
          </button>
        </div>

        {/* Tab contents panel */}
        <div className="min-h-[400px]">
          {activeTab === "datasets" && <DatasetExplorer onRefreshTrigger={refreshTrigger} />}
          {activeTab === "nav" && (
            <LiveNavFeeds
              onTriggerRefresh={() => setRefreshTrigger(prev => prev + 1)}
              onRefreshTrigger={refreshTrigger}
            />
          )}
          {activeTab === "quality" && <DataQualityAudit onRefreshTrigger={refreshTrigger} />}
          {activeTab === "git" && <GitManager status={status} onRefresh={scanSystemStatus} />}
        </div>

        {/* Real-time Local Folder file tree viewport */}
        <FolderStructureView status={status} onRefresh={scanSystemStatus} />
      </div>
    </div>
  );
}
