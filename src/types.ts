export interface SystemStatus {
  workspacePath: string;
  folders: string[];
  files: Record<string, string[]>;
  pythonAvailable: boolean;
  gitInitialized: boolean;
  gitHistory: string[];
  currentTime: string;
}

export interface GitCommitResponse {
  success: boolean;
  logs: string[];
  gitHistory: string[];
  message: string;
}

export interface IngestionResponse {
  success: boolean;
  logs: string;
  isSimulated: boolean;
  error?: string;
}

export interface LiveFetchResponse {
  success: boolean;
  logs: string;
  isSimulated: boolean;
  error?: string;
}

export interface Dataset {
  headers: string[];
  rows: Record<string, string>[];
  shape: [number, number];
  filePath: string;
}

export interface DataQualityReport {
  summary: string;
  anomalies: {
    source_file: string;
    severity: "CRITICAL" | "WARNING" | "INFO";
    issue_description: string;
  }[];
}

export interface GeminiResponse {
  success: boolean;
  output: string;
}
