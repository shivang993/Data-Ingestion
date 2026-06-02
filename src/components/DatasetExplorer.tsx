import React, { useState, useEffect } from "react";
import { Database, Search, Sparkles, TrendingUp, BarChart3, AlertCircle } from "lucide-react";
import { Dataset } from "../types";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, LineChart, Line } from "recharts";

interface DatasetExplorerProps {
  onRefreshTrigger: number;
}

export function DatasetExplorer({ onRefreshTrigger }: DatasetExplorerProps) {
  const [selectedDataset, setSelectedDataset] = useState<string>("fund_master");
  const [datasetData, setDatasetData] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const datasets = [
    { id: "fund_master", label: "1. Fund Master", desc: "Schemes registry and risk indicators" },
    { id: "nav_history", label: "2. NAV History", desc: "Daily scheme historical valuations" },
    { id: "user_portfolio", label: "3. User Portfolio", desc: "Asset balances and entry buy prices" },
    { id: "scheme_details", label: "4. Scheme Details", desc: "AUM, launching, and expense coefficients" },
    { id: "transaction_log", label: "5. Transaction Log", desc: "Historically processed order logbook" },
    { id: "market_indices", label: "6. Market Indices", desc: "Nifty 50, Next 50, Midcap benchmarks" },
    { id: "fund_managers", label: "7. Fund Managers", desc: "Professional credentials and seniority list" },
    { id: "asset_allocation", label: "8. Asset Allocation", desc: "Equity/Debt/Residual percentage splits" },
    { id: "sector_holdings", label: "9. Sector Holdings", desc: "Exposure to crucial services & sectors" },
    { id: "risk_metrics", label: "10. Risk Metrics", desc: "Alpha, Sharpe coefficients and volatility" }
  ];

  useEffect(() => {
    async function loadDataset() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/data/raw/${selectedDataset}`);
        if (!response.ok) {
          throw new Error(`Pipeline data not found. Please click 'Run Ingestion Pipeline' above to generate and load the 10 raw datasets.`);
        }
        const data = await response.json();
        setDatasetData(data);
      } catch (err: any) {
        setDatasetData(null);
        setError(err.message || "Failed to parse database records.");
      } finally {
        setLoading(false);
      }
    }
    loadDataset();
  }, [selectedDataset, onRefreshTrigger]);

  // Handle estimated pandas datatypes for display matching Pandas logs
  const getPandasDtype = (header: string, val: string): string => {
    if (header.toLowerCase().includes("code") || header.toLowerCase().includes("id") || header.toLowerCase().includes("years")) {
      return "int64";
    }
    if (!isNaN(Number(val)) && val !== "") {
      return "float64";
    }
    if (header.toLowerCase().includes("date") || header.toLowerCase().includes("launch")) {
      return "datetime64[ns]";
    }
    return "object";
  };

  const filteredRows = datasetData
    ? datasetData.rows.filter((row) =>
        Object.values(row).some((val) =>
          val.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : [];

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden" id="dataset-explorer-section">
      <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-slate-700" />
          <h2 className="text-base font-semibold text-slate-900">10-Dataset Explorer Workspace</h2>
        </div>
        
        {datasetData && (
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-mono" id="dt-shape-indicator">
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
              Shape: {datasetData.shape[0]} rows x {datasetData.shape[1]} cols
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[480px]">
        {/* Sidebar Selector */}
        <div className="border-r border-slate-100 bg-slate-50/50 p-4 space-y-1.5">
          <div className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
            Available Datasets
          </div>
          {datasets.map((d) => (
            <button
              key={d.id}
              onClick={() => {
                setSelectedDataset(d.id);
                setSearchTerm("");
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition cursor-pointer flex flex-col space-y-0.5 ${
                selectedDataset === d.id
                  ? "bg-slate-950 text-white font-medium"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
              id={`dataset-tab-${d.id}`}
            >
              <span className="truncate block font-semibold">{d.label}</span>
              <span className={`text-2xs truncate block ${selectedDataset === d.id ? "text-slate-300" : "text-slate-400"}`}>
                {d.desc}
              </span>
            </button>
          ))}
        </div>

        {/* Workspace Display Grid */}
        <div className="lg:col-span-3 p-5 flex flex-col">
          {error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-lg border-slate-200" id="explorer-error-prompt">
              <AlertCircle className="w-10 h-10 text-slate-400 mb-3" />
              <h3 className="text-sm font-semibold text-slate-800 mb-1">Dataset Not Instantiated</h3>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                {error}
              </p>
              <span className="text-2xs font-mono text-slate-400 bg-slate-50 px-3 py-1 rounded">
                Required file: data/raw/{selectedDataset}.csv
              </span>
            </div>
          ) : loading ? (
            <div className="flex-1 flex items-center justify-center p-12">
              <div className="w-8 h-8 border-3 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-sm text-slate-600 font-medium">Querying pandas table contents...</span>
            </div>
          ) : datasetData ? (
            <div className="space-y-5 flex-1 flex flex-col">
              {/* Dataset Metadata Block */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 border rounded-lg bg-slate-50/50">
                  <div className="text-3xs text-slate-400 uppercase font-bold tracking-wider font-sans mb-1">
                    Dataset Storage Path
                  </div>
                  <div className="text-2xs font-mono text-slate-900 truncate">
                    {datasetData.filePath}
                  </div>
                </div>
                <div className="p-3 border rounded-lg bg-slate-50/50">
                  <div className="text-3xs text-slate-400 uppercase font-bold tracking-wider font-sans mb-1">
                    Pandas Dtypes Estimations
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {datasetData.headers.slice(0, 3).map((h) => (
                      <span key={h} className="text-3xs px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                        {h}: {getPandasDtype(h, datasetData.rows[0]?.[h] || "")}
                      </span>
                    ))}
                    {datasetData.headers.length > 3 && (
                      <span className="text-3xs text-slate-400 self-center font-mono">+ {datasetData.headers.length - 3} more</span>
                    )}
                  </div>
                </div>
                <div className="p-3 border rounded-lg bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <div className="text-3xs text-slate-400 uppercase font-bold tracking-wider font-sans mb-1">
                      ETL Status
                    </div>
                    <div className="text-2xs text-emerald-700 font-semibold flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                      Load Successful (.shape checked)
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Search and table display banner */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder={`Filter cells in ${selectedDataset}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-4 py-1.5 text-xs outline-none border border-slate-200 rounded-lg focus:border-slate-400 transition bg-slate-50/30"
                    id="table-cell-search"
                  />
                </div>
                <div className="text-2xs text-slate-500 font-medium">
                  Showing {filteredRows.length} of {datasetData.rows.length} rows
                </div>
              </div>

              {/* Data Table with Scroll container */}
              <div className="border border-slate-150 rounded-lg overflow-x-auto max-h-[300px]">
                <table className="w-full text-left text-xs text-slate-600 border-collapse">
                  <thead className="bg-slate-50 text-slate-700 font-semibold sticky top-0 border-b border-slate-150">
                    <tr>
                      {datasetData.headers.map((hdr) => (
                        <th key={hdr} className="px-4 py-2.5 font-mono text-2xs uppercase tracking-wider">
                          {hdr}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={datasetData.headers.length} className="px-4 py-8 text-center text-slate-400 text-xs text-slate-400 italic">
                          No matching records located in dataframe cells.
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className={`hover:bg-slate-50/50 transition ${
                            // Highlight index-level negative NAV anomaly
                            (selectedDataset === "nav_history" && Number(row["nav"]) < 0)
                              ? "bg-red-50/70"
                              : ""
                          }`}
                        >
                          {datasetData.headers.map((hdr) => {
                            const val = row[hdr];
                            const isNegativeNAV = selectedDataset === "nav_history" && hdr === "nav" && Number(val) < 0;
                            return (
                              <td
                                key={hdr}
                                className={`px-4 py-2 font-mono text-2xs truncate max-w-[200px] ${
                                  isNegativeNAV ? "text-red-600 font-bold bg-red-100/30 rounded px-1" : "text-slate-800"
                                }`}
                              >
                                {val}
                                {isNegativeNAV && " (Anomaly)"}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Dynamic visualizations based on the selected dataset! */}
              {selectedDataset === "asset_allocation" && (
                <div className="mt-2 p-4 border rounded-xl bg-slate-50/30 border-slate-200">
                  <div className="flex items-center space-x-1 mb-2 text-slate-800">
                    <BarChart3 className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-semibold">Equity vs. Debt Allocations Chart (Pandas Sync)</span>
                  </div>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={datasetData.rows}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="scheme_code" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#e2e8f0" />
                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} stroke="#e2e8f0" />
                        <Tooltip contentStyle={{ fontSize: 11, background: '#0f172a', color: '#fff', borderRadius: '6px' }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="equity_percent" name="Equity %" fill="#0f172a" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="debt_percent" name="Debt %" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="cash_and_others_percent" name="Cash %" fill="#94a3b8" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {selectedDataset === "risk_metrics" && (
                <div className="mt-2 p-4 border rounded-xl bg-slate-50/30 border-slate-200">
                  <div className="flex items-center space-x-1 mb-2 text-slate-800">
                    <TrendingUp className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-semibold">Volatility vs. Sharpe Coefficient Dispersion (Risk Grades)</span>
                  </div>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={datasetData.rows}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="scheme_code" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#e2e8f0" />
                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} stroke="#e2e8f0" />
                        <Tooltip contentStyle={{ fontSize: 11, background: '#0f172a', color: '#fff', borderRadius: '6px' }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="sharpe_ratio" name="Sharpe Ratio" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="alpha_percent" name="Alpha %" fill="#10b981" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {selectedDataset === "market_indices" && (
                <div className="mt-2 p-4 border rounded-xl bg-slate-50/30 border-slate-200">
                  <div className="flex items-center space-x-1 mb-2 text-slate-800">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-semibold">Nifty Index Benchmark Performance Trace</span>
                  </div>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[...datasetData.rows].reverse()}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#e2e8f0" />
                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={['dataMin - 100', 'dataMax + 100']} stroke="#e2e8f0" />
                        <Tooltip contentStyle={{ fontSize: 11, background: '#0f172a', color: '#fff', borderRadius: '6px' }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Line type="monotone" dataKey="nifty_50" name="Nifty 50" stroke="#0f172a" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
              <Database className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-xs">Select a dataset from the sidebar to visualize raw shapes and frames.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
