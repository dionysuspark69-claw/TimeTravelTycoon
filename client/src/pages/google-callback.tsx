import { useEffect } from "react";

export default function GoogleCallback() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    
    if (code) {
      try {
        if (window.opener && typeof window.opener.handleGoogleCallback === 'function') {
          window.opener.handleGoogleCallback(code);
          window.close();
        } else {
          console.error("Parent window not found or callback not available");
        }
      } catch (error) {
        console.error("Error communicating with parent window:", error);
      }
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Completing sign in...</h1>
        <p className="text-gray-400">This window will close automatically.</p>
      </div>
    </div>
  );
}
