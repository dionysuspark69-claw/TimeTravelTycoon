type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

export function saveDebugLog(message: string, level: LogLevel = "INFO", data?: any) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message}${data !== undefined ? ` :: ${JSON.stringify(data)}` : ""}`;
  // Also log to console for dev
  console.log(logEntry);

  // Append to file via fetch to a logging endpoint (server writes to disk)
  // For now, we can use a fire-and-forget POST to our own logger if available.
  // But since we don't have a file-writing endpoint, we'll accumulate in memory and optionally download later.
  // Alternative: use browser's console and localStorage. For this PRD, we'll assume a server endpoint exists or we'll batch later.
  // For immediate debugging, we can also store in a localStorage key and provide a "download log" button.
  // To keep things simple, we'll just console and maybe localStorage.
  try {
    const existing = localStorage.getItem("save_debug_buffer") || "";
    localStorage.setItem("save_debug_buffer", existing + logEntry + "\n");
  } catch (e) {
    // ignore
  }
}

export function getSaveDebugLog(): string {
  return localStorage.getItem("save_debug_buffer") || "";
}

export function clearSaveDebugLog() {
  localStorage.removeItem("save_debug_buffer");
}

export function downloadSaveDebugLog(filename = "save_debug.log"): void {
  const content = getSaveDebugLog();
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
