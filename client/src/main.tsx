import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import "./index.css";

declare global {
  interface Window {
    handleReplitAuth: () => void;
  }
}

// The Replit auth iframe re-fires this callback on every page load when the
// user is signed into Replit. Without a guard, the unconditional
// window.location.reload() below creates an infinite reload loop — page stays
// blank, tab keeps spinning. Incognito has no Replit cookie so the callback
// never fires, which is why "only works in incognito" was the visible symptom.
// Gate on sessionStorage so each tab POSTs + reloads at most once.
window.handleReplitAuth = async () => {
  try {
    if (sessionStorage.getItem("replit_auth_done")) return;
    sessionStorage.setItem("replit_auth_done", "1");
  } catch {}
  try {
    const response = await fetch("/auth/replit", { method: "POST" });
    if (response.ok) {
      console.log("Replit Auth successful, reloading page...");
      window.location.reload();
    } else {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      console.error("Replit Auth backend error:", error.message);
    }
  } catch (error) {
    console.error("Error calling Replit Auth backend:", error);
  }
};

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
    </Routes>
  </BrowserRouter>
);
