import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import GoogleCallback from "./pages/google-callback";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />
    </Routes>
  </BrowserRouter>
);
