import { useAuth } from "@/lib/stores/useAuth";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { LogOut, User } from "lucide-react";

export function AuthDisplay() {
  const { user, isAuthenticated, loading, logout } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return (
      <Card className="bg-black/80 backdrop-blur-sm border-cyan-500/30 p-2 px-3 min-h-[44px] flex items-center gap-2">
        <Button
          onClick={() => window.location.href = "/auth/google"}
          variant="default"
          size="sm"
          className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30"
        >
          Sign in with Google
        </Button>
        <Button
          onClick={() => useAuth.getState().loginWithReplit()}
          variant="default"
          size="sm"
          className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30"
        >
          Sign in with Replit
        </Button>
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
