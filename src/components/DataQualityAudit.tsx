import React, { useState, useEffect } from "react";
import { ShieldAlert, AlertTriangle, CheckCircle2, ChevronRight, Sparkles, RefreshCw, X, FileText } from "lucide-react";
import { DataQualityReport, GeminiResponse } from "../types";

interface DataQualityAuditProps {
  onRefreshTrigger: number;
}

export function DataQualityAudit({ onRefreshTrigger }: DataQualityAuditProps) {
  const [report, setReport] = useState<DataQualityReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null); // holds anomaly description currently being analyzed
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState<any | null>(null);

  const fetchQualityData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/data/processed/data_quality");
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (e) {
      console.error("No data quality assets found on server yet.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQualityData();
  }, [onRefreshTrigger]);

  const queryGeminiExplain = async (anomaly: any) => {
    setSelectedAnomaly(anomaly);
    setAiLoading(anomaly.issue_description);
    setAiResponse(null);
    try {
      const res = await fetch("/api/gemini/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codeSnippet: anomaly.issue_description,
          context: {
            sourceFile: anomaly.source_file,
            severityDeg: anomaly.severity
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setAiResponse(data.output);
      } else {
        setAiResponse(data.output || "Failed to initialize standard Gemini API endpoint.");
      }
    } catch (err: any) {
      setAiResponse(`Network error compiling insights: ${err.message}`);
    } finally {
      setAiLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center border rounded-xl bg-white">
        <RefreshCw className="w-5 h-5 animate-spin text-slate-600 mr-2" />
        <span className="text-sm font-medium text-slate-500 font-sans">Scanning dataset logs...</span>
      </div>
    );
  }

  const criticalIssues = report ? report.anomalies.filter((a) => a.severity === "CRITICAL") : [];
  const warningIssues = report ? report.anomalies.filter((a) => a.severity === "WARNING") : [];

  return (
    <div className="space-y-6" id="data-quality-audit-container">
      {/* Overview stats panel */}
      {report && report.anomalies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="dq-summary-grid">
          <div className="p-4 border rounded-xl bg-white shadow-xs border-red-100 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-red-50 text-red-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-3xs text-slate-400 font-sans uppercase font-bold tracking-wider">Critical Failures</span>
              <div className="text-xl font-bold font-mono text-red-600" id="critical-anomaly-count">
                {criticalIssues.length} Detected
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-xl bg-white shadow-xs border-amber-100 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-3xs text-slate-400 font-sans uppercase font-bold tracking-wider">Warning Drifts</span>
              <div className="text-xl font-bold font-mono text-amber-600" id="warning-anomaly-count">
                {warningIssues.length} Traceable
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-xl bg-white shadow-xs border-emerald-100 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-3xs text-slate-400 font-sans uppercase font-bold tracking-wider">Audit Integrity</span>
              <div className="text-xl font-bold font-mono text-emerald-600">
                {report.anomalies.length === 0 ? "100.00% Clean" : "Data Audit Logs Recorded"}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audit reports lists */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-5 flex flex-col space-y-4" id="report-items-list">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-slate-800" />
            <h3 className="text-sm font-semibold text-slate-900">AMFI Code Validation & Anomalies</h3>
          </div>

          {!report || report.anomalies.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg" id="no-dq-results-prompt">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
              <h4 className="text-xs font-semibold text-slate-800 mb-1">Pipeline is Unscanned</h4>
              <p className="text-3xs text-slate-500 max-w-sm mb-1">
                Please trigger the Pandas Data Ingestion Pipeline to scan raw files, explore categories, and construct your audit reports.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {report.anomalies.map((anom, idx) => (
                <div
                  key={idx}
                  className={`p-3 border rounded-lg transition hover:shadow-xs flex flex-col space-y-2.5 ${
                    anom.severity === "CRITICAL"
                      ? "border-red-100 bg-red-50/20"
                      : "border-amber-100 bg-amber-50/20"
                  }`}
                  id={`anomaly-item-${idx}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {anom.severity === "CRITICAL" ? (
                        <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      )}
                      <span className="text-4xs font-mono font-bold uppercase py-0.5 px-1.5 rounded bg-white border border-slate-200 text-slate-700">
                        File: {anom.source_file}
                      </span>
                    </div>

                    <span className={`text-5xs font-bold uppercase px-1.5 py-0.5 rounded-full ${
                      anom.severity === "CRITICAL" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {anom.severity}
                    </span>
                  </div>

                  <p className="text-2xs text-slate-700 italic leading-snug">
                    "{anom.issue_description}"
                  </p>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => queryGeminiExplain(anom)}
                      disabled={aiLoading === anom.issue_description}
                      className="text-4xs font-semibold text-indigo-700 hover:text-indigo-800 bg-white border border-indigo-200 hover:border-indigo-300 px-2.5 py-1 rounded flex items-center space-x-1 transition cursor-pointer"
                    >
                      {aiLoading === anom.issue_description ? (
                        <>
                          <RefreshCw className="w-2.5 h-2.5 animate-spin text-indigo-600" />
                          <span>Gemini Auditing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-2.5 h-2.5 text-indigo-600 fill-indigo-100" />
                          <span>Ask Gemini Consultation</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gemini Explanation box */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-md overflow-hidden flex flex-col" id="gemini-audit-panel">
          <div className="px-5 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-400 fill-indigo-950/20" />
              <h3 className="text-xs font-semibold text-white">AI Data-Quality Consultant</h3>
            </div>
            {aiResponse && (
              <button
                onClick={() => {
                  setAiResponse(null);
                  setSelectedAnomaly(null);
                }}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
            {aiLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8" id="ai-loading-container">
                <div className="relative">
                  <div className="w-10 h-10 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                  <Sparkles className="w-4 h-4 text-indigo-400 absolute top-3 left-3 animate-pulse" />
                </div>
                <h4 className="text-xs font-semibold text-slate-200 mt-4 mb-1">Compiling AI Diagnosis</h4>
                <p className="text-3xs text-slate-400 max-w-xs italic font-serif">
                  Analyzing risks of code validation faults against AMFI index frameworks...
                </p>
              </div>
            ) : aiResponse ? (
              <div className="space-y-4 flex flex-col flex-1" id="ai-response-container">
                <div className="border-l-2 border-indigo-500 pl-3 py-1 bg-indigo-950/20 rounded-r-lg">
                  <span className="text-4xs uppercase tracking-wider text-indigo-400 font-bold block mb-0.5">TARGET AUDIT FILE</span>
                  <span className="text-2xs font-semibold text-white block">{selectedAnomaly?.source_file}</span>
                </div>
                
                <div className="text-xs text-slate-300 leading-relaxed max-h-[240px] overflow-y-auto space-y-2 pr-1 font-sans">
                  {aiResponse.split("\n\n").map((para, i) => {
                    if (para.startsWith("#") || para.startsWith("##") || para.startsWith("###")) {
                      return <h4 key={i} className="text-xs font-bold text-white mt-3 border-b border-slate-800 pb-1">{para.replace(/#+\s*/g, "")}</h4>;
                    }
                    if (para.startsWith("-") || para.startsWith("*")) {
                      return (
                        <ul key={i} className="list-disc pl-4 space-y-1 my-1">
                          {para.split("\n").map((li, lIdx) => (
                            <li key={lIdx} className="text-3xs text-slate-350">{li.replace(/^[\s-*]+\s*/g, "")}</li>
                          ))}
                        </ul>
                      );
                    }
                    return <p key={i} className="text-3xs leading-relaxed text-slate-400">{para}</p>;
                  })}
                </div>
                <div className="text-4xs text-slate-500 italic mt-auto text-right">
                  Insights compiled by Gemini 2.5 • Verified server-side API Route security
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-800 rounded-lg text-slate-500 bg-slate-950/20" id="ai-blank-state">
                <Sparkles className="w-8 h-8 text-slate-700 fill-slate-900/60 mb-2" />
                <h4 className="text-xs font-semibold text-slate-400 mb-1">Ready for Deep Audits</h4>
                <p className="text-3xs text-slate-500 max-w-xs">
                  Click <strong className="text-indigo-400">Ask Gemini Consultation</strong> next to any row to compile an advanced trace and resolution guide using the LLM system.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
