import React, { useState, useEffect } from "react";
import { RefreshCw, Play, FileCheck2, ShieldAlert, CheckCircle2, DollarSign, Activity } from "lucide-react";
import { Dataset } from "../types";

interface LiveNavFeedsProps {
  onTriggerRefresh: () => void;
  onRefreshTrigger: number;
}

export function LiveNavFeeds({ onTriggerRefresh, onRefreshTrigger }: LiveNavFeedsProps) {
  const [running, setRunning] = useState<boolean>(false);
  const [logs, setLogs] = useState<string>("");
  const [liveData, setLiveData] = useState<Dataset | null>(null);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);

  // Load the current data/raw/live_nav_fetch.csv content
  const loadLiveData = async () => {
    try {
      const res = await fetch("/api/data/raw/live_nav_fetch");
      if (res.ok) {
        const parsed = await res.json();
        setLiveData(parsed);
      }
    } catch (e) {
      console.log("No live nav file found on storage yet.");
    }
  };

  useEffect(() => {
    loadLiveData();
  }, [onRefreshTrigger]);

  const executeLiveFetch = async () => {
    setRunning(true);
    setLogs("Initiating live NAV retrieval process...\nSpawning child process for live_nav_fetch.py...\n");
    try {
      const res = await fetch("/api/run/live-fetch", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setLogs(prev => prev + data.logs + "\n\n✅ Live NAV integration executed successfully.");
        setIsSimulated(!!data.isSimulated);
        onTriggerRefresh(); // refresh main context
        await loadLiveData();
      } else {
        setLogs(prev => prev + `\n🛑 Process terminated with error: ${data.error || "Execution timeout."}\nError details:\n${data.logs}`);
      }
    } catch (err: any) {
      setLogs(prev => prev + `\n🛑 Request transport failed: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  // Extract color based on mutual fund scheme name or code
  const getSchemeColor = (code: string) => {
    switch (code) {
      case "125497": return { border: "border-slate-800", bg: "bg-slate-50", text: "text-slate-900" };
      case "119551": return { border: "border-indigo-100", bg: "bg-indigo-50/20", text: "text-indigo-900" };
      case "120503": return { border: "border-orange-100", bg: "bg-orange-50/20", text: "text-orange-900" };
      case "118632": return { border: "border-blue-100", bg: "bg-blue-50/20", text: "text-blue-900" };
      case "119092": return { border: "border-purple-100", bg: "bg-purple-50/20", text: "text-purple-900" };
      case "120841": return { border: "border-yellow-150", bg: "bg-yellow-50/20", text: "text-yellow-900" };
      default: return { border: "border-slate-100", bg: "bg-slate-50/20", text: "text-slate-900" };
    }
  };

  return (
    <div className="space-y-6" id="live-nav-workspace-section">
      {/* Head section Control bar */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${running ? "bg-amber-400" : "bg-emerald-400"}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${running ? "bg-amber-500" : "bg-emerald-500"}`}></span>
            </span>
            <h2 className="text-base font-semibold text-slate-900">Live NAV Retrieval Pipeline</h2>
          </div>
          <p className="text-xs text-slate-500">
            Triggers <code className="font-mono bg-slate-50 px-1 py-0.5 rounded">live_nav_fetch.py</code> which pulls live prices from MF API for 6 key Mutual Fund schemes.
          </p>
        </div>

        <button
          onClick={executeLiveFetch}
          disabled={running}
          className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center space-x-2 transition shadow-sm cursor-pointer ${
            running
              ? "bg-slate-100 border border-slate-200 text-slate-400"
              : "bg-slate-950 text-white hover:bg-slate-900"
          }`}
          id="trigger-fetch-btn"
        >
          {running ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Executing fetch.py...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Fetch Live NAV Prices</span>
            </>
          )}
        </button>
      </div>

      {/* Grid of latest quotations */}
      {liveData && liveData.rows.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="quotes-board">
          {liveData.rows.map((row) => {
            const codingScheme = getSchemeColor(row["scheme_code"] || "");
            const isFallback = row["status"] === "FALLBACK_CACHED";
            
            return (
              <div
                key={row["scheme_code"]}
                className={`border rounded-xl p-4 flex flex-col justify-between shadow-xs transition relative overflow-hidden bg-white ${codingScheme.border}`}
                id={`quote-card-${row["scheme_code"]}`}
              >
                {/* Background decorative indicator */}
                <div className={`absolute -right-6 -bottom-6 w-20 h-20 rounded-full opacity-5 ${codingScheme.bg}`}></div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-3xs font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      AMFI Code: {row["scheme_code"]}
                    </span>
                    <span className={`text-4xs px-1.5 py-0.5 rounded-full font-bold flex items-center ${
                      isFallback
                        ? "bg-amber-50 text-amber-600 border border-amber-100"
                        : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    }`}>
                      <span className={`w-1 h-1 rounded-full mr-1 ${isFallback ? "bg-amber-400" : "bg-emerald-400"}`}></span>
                      {isFallback ? "Cached" : "Live (OK)"}
                    </span>
                  </div>

                  <div>
                    <h3 className={`text-xs font-semibold truncate ${codingScheme.text}`} title={row["scheme_name"]}>
                      {row["scheme_name"]}
                    </h3>
                    <p className="text-4xs text-slate-400 font-sans truncate uppercase tracking-widest mt-0.5">
                      {row["fund_house"]}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-baseline justify-between pt-3 border-t border-slate-50">
                  <div>
                    <span className="text-2xs text-slate-400 font-sans font-medium">NAV Price</span>
                    <div className="text-base font-mono font-bold text-slate-900">
                      ₹{parseFloat(row["live_nav"] || "0").toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xs text-slate-400 font-sans block">Effective Date</span>
                    <span className="text-2xs font-mono font-semibold text-slate-700">
                      {row["price_date"]}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Terminal Log Console */}
      {logs && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg font-mono text-xs" id="fetch-logs-console">
          <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-slate-400 text-3xs font-semibold ml-1">Bash Console: live_nav_fetch.py</span>
            </div>
            {isSimulated && (
              <span className="text-4xs font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                JS Mock Fallback Active
              </span>
            )}
          </div>
          <pre className="p-4 overflow-y-auto max-h-[220px] text-slate-350 leading-relaxed font-mono text-2xs select-text whitespace-pre-wrap">
            {logs}
          </pre>
        </div>
      )}
    </div>
  );
}
