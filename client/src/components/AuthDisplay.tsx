import { useState } from "react";
import { useAuth } from "@/lib/stores/useAuth";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { LogOut, User, LogIn } from "lucide-react";

export function AuthDisplay() {
  const { user, isAuthenticated, loading, loginWithUsername, logout } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    if (!password) {
      setError("Please enter a password");
      return;
    }

    setLoggingIn(true);
    setError("");
    
    const result = await loginWithUsername(username, password);
    
    if (result.success) {
      setUsername("");
      setPassword("");
    } else {
      setError(result.error || "Login failed");
    }
    
    setLoggingIn(false);
  };

  if (loading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return (
      <Card className="bg-black/80 backdrop-blur-sm border-cyan-500/30 p-3 min-h-[44px]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              disabled={loggingIn}
              className="h-8 bg-black/50 border-cyan-500/30 text-white placeholder:text-gray-500 text-sm flex-1"
            />
            <Input
              type="password"
              placeholder="Password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              disabled={loggingIn}
              className="h-8 bg-black/50 border-cyan-500/30 text-white placeholder:text-gray-500 text-sm flex-1"
            />
            <Button
              onClick={handleLogin}
              disabled={loggingIn || !username.trim() || !password}
              size="sm"
              className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 h-8"
            >
              <LogIn className="w-4 h-4 mr-1" />
              {loggingIn ? "..." : "Login"}
            </Button>
          </div>
          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-black/80 backdrop-blur-sm border-cyan-500/30 p-2 px-3 min-h-[44px] flex items-center gap-2">
      <div className="flex items-center gap-2">
        <User className="w-3 h-3 text-cyan-400" />
        <span className="text-xs text-white font-medium">{user.username}</span>
      </div>
      <Button
        onClick={logout}
        variant="ghost"
        size="icon"
        className="h-6 w-6 hover:bg-red-500/20 hover:text-red-400"
        title="Sign out"
      >
        <LogOut className="w-3 h-3" />
      </Button>
    </Card>
  );
}
