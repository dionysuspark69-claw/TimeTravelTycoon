import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import "./index.css";

declare global {
  interface Window {
    handleReplitAuth: () => void;
  }
}

window.handleReplitAuth = async () => {
  try {
    const response = await fetch("/auth/replit", { method: "POST" });
    
    if (response.ok) {
      console.log("Replit Auth successful, reloading page...");
      window.location.reload();
    } else {
      const error = await response.json();
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
