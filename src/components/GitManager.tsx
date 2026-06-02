import React, { useState } from "react";
import { GitBranch, GitCommit, CheckCircle2, RefreshCw, Terminal, Eye } from "lucide-react";
import { SystemStatus } from "../types";

interface GitManagerProps {
  status: SystemStatus | null;
  onRefresh: () => void;
}

export function GitManager({ status, onRefresh }: GitManagerProps) {
  const [commitMessage, setCommitMessage] = useState<string>("Day 1: Data ingestion complete");
  const [running, setRunning] = useState<boolean>(false);
  const [commitLogs, setCommitLogs] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitMessage.trim()) return;

    setRunning(true);
    setSuccessMsg(null);
    setCommitLogs(["Triggering Git subsystem protocol...", "Staging code outputs for commit..."]);

    try {
      const res = await fetch("/api/git/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: commitMessage })
      });
      const data = await res.json();
      if (data.success) {
        setCommitLogs(data.logs || []);
        setSuccessMsg(data.message || "Commit completed.");
        onRefresh(); // refresh file tree status
      } else {
        setCommitLogs(prev => [...prev, `🛑 Failure: ${data.error || "Git aborted action."}`]);
      }
    } catch (err: any) {
      setCommitLogs(prev => [...prev, `🛑 Network error: ${err.message}`]);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-5 space-y-5" id="git-subsystem-section">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2">
          <GitBranch className="w-5 h-5 text-slate-800" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Git Version Control Hub</h3>
            <span className="text-4xs text-slate-400 font-mono">WORKSPACE LOCAL SYSTEM REPO</span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5" id="git-repository-badges">
          <span className={`text-4xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
            status?.gitInitialized
              ? "bg-slate-100 text-slate-700"
              : "bg-amber-100 text-amber-800"
          }`}>
            {status?.gitInitialized ? "Active Track" : "Not Initialized"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Commit trigger form */}
        <div className="space-y-4">
          <form onSubmit={handleCommit} className="space-y-3">
            <div>
              <label className="text-3xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Commit Logging Label</label>
              <input
                type="text"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Day 1: Data Ingestion Complete"
                disabled={running}
                className="w-full text-xs px-3 py-2 border outline-none border-slate-200 rounded-lg focus:border-slate-800 transition bg-slate-50/50"
                id="git-commit-message-input"
              />
            </div>

            <button
              type="submit"
              disabled={running}
              className={`w-full text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center justify-center space-x-2 transition cursor-pointer shadow-xs ${
                running
                  ? "bg-slate-100 text-slate-400 border border-slate-250"
                  : "bg-slate-950 text-white hover:bg-slate-900"
              }`}
              id="submit-git-commit"
            >
              {running ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Staging and Committing...</span>
                </>
              ) : (
                <>
                  <GitCommit className="w-3.5 h-3.5" />
                  <span>Execute Local Git Commit</span>
                </>
              )}
            </button>
          </form>

          {/* Git Log List */}
          <div className="space-y-2">
            <span className="text-3xs font-semibold text-slate-500 uppercase tracking-wider block">Commit History (Recent Logs)</span>
            {status?.gitHistory && status.gitHistory.length > 0 ? (
              <ul className="space-y-1.5 font-mono text-3xs text-slate-700">
                {status.gitHistory.map((line, idx) => (
                  <li key={idx} className="flex items-center space-x-2 py-1 px-2 border rounded border-slate-100 bg-slate-50/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block"></span>
                    <span className="text-slate-900 font-semibold">{line.slice(0, 7)}</span>
                    <span className="text-slate-500 truncate">{line.slice(7)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-2xs text-slate-400 italic">No commit history yet. Git is in pristine initialized state.</p>
            )}
          </div>
        </div>

        {/* Right: Terminal simulation */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-md flex flex-col font-mono text-2xs">
          <div className="px-4 py-2 border-b border-slate-800 bg-slate-900 flex items-center space-x-1.5">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-semibold">Local Repository Command Exec Logs</span>
          </div>

          <div className="p-4 flex-1 overflow-y-auto max-h-[220px] text-slate-350 leading-relaxed font-mono whitespace-pre-wrap select-text">
            {commitLogs.length === 0 ? (
              <span className="text-slate-500 select-none italic">[Prism shell terminal listening for git actions...]</span>
            ) : (
              commitLogs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))
            )}
            {successMsg && (
              <div className="mt-3 text-emerald-400 font-semibold flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1.5 shrink-0" />
                {successMsg}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
