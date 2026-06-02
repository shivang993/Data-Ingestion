import React from "react";
import { Folder, FileSpreadsheet, FileText, FileCode, HardDrive } from "lucide-react";
import { SystemStatus } from "../types";

interface FolderStructureViewProps {
  status: SystemStatus | null;
  onRefresh: () => void;
}

export function FolderStructureView({ status, onRefresh }: FolderStructureViewProps) {
  if (!status) {
    return (
      <div className="flex items-center justify-center p-8 border rounded-xl bg-slate-50 border-slate-200">
        <div className="w-6 h-6 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-sm text-slate-500 font-medium">Scanning workspace system...</span>
      </div>
    );
  }

  // Get icons based on extension
  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith(".csv")) {
      return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
    }
    if (fileName.endsWith(".txt") || fileName.endsWith(".md")) {
      return <FileText className="w-4 h-4 text-sky-600" />;
    }
    return <FileCode className="w-4 h-4 text-amber-600" />;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden" id="folder-structure-container">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <HardDrive className="w-5 h-5 text-slate-700" />
          <h2 className="text-base font-semibold text-slate-900">Project Directory Sandbox</h2>
        </div>
        <button
          onClick={onRefresh}
          className="px-3 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-md bg-slate-50 transition cursor-pointer"
          id="refresh-folder-btn"
        >
          Refresh Scan
        </button>
      </div>

      <div className="p-5 font-mono text-xs text-slate-700">
        <div className="mb-3 text-slate-500 font-mono text-2xs truncate">
          ROOT: {status.workspacePath}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {status.folders.map((folder) => {
            const files = status.files[folder] || [];
            return (
              <div
                key={folder}
                className="p-4 border rounded-lg bg-slate-50/50 border-slate-100 hover:border-slate-200 transition"
                id={`folder-card-${folder.replace('/', '_')}`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Folder className="w-4 h-4 text-slate-500 fill-slate-100" />
                  <span className="font-semibold text-slate-900">{folder}/</span>
                  <span className="text-2xs px-1.5 py-0.5 rounded-full bg-slate-200/60 text-slate-600 font-bold">
                    {files.length}
                  </span>
                </div>

                {files.length === 0 ? (
                  <div className="text-slate-400 pl-6 italic text-2xs py-1">
                    [Empty directory]
                  </div>
                ) : (
                  <ul className="space-y-1.5 pl-4 border-l border-slate-200/60 ml-2 py-1">
                    {files.map((file) => (
                      <li key={file} className="flex items-center space-x-2 py-0.5" id={`file-node-${file.replace('.', '_')}`}>
                        {getFileIcon(file)}
                        <span className="text-slate-700 text-2xs hover:underline cursor-pointer truncate">
                          {file}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
