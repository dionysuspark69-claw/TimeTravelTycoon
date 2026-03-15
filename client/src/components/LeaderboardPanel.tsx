import { useState, useEffect } from "react";
import { useAuth } from "@/lib/stores/useAuth";
import { formatChronoValue } from "@/lib/utils";
import { Trophy, Zap, Users, Star, Rocket, Globe, RefreshCw } from "lucide-react";

type Category = {
  key: string;
  label: string;
  icon: React.ReactNode;
  format: (val: any) => string;
};

const CATEGORIES: Category[] = [
  {
    key: "totalEarned",
    label: "Total Earned",
    icon: <Star className="w-4 h-4 text-yellow-400" />,
    format: (v) => formatChronoValue(parseFloat(v) || 0) + " CC",
  },
  {
    key: "prestigeLevel",
    label: "Prestige",
    icon: <Trophy className="w-4 h-4 text-purple-400" />,
    format: (v) => `Level ${v}`,
  },
  {
    key: "totalTripsCompleted",
    label: "Trips",
    icon: <Zap className="w-4 h-4 text-cyan-400" />,
    format: (v) => Number(v).toLocaleString(),
  },
  {
    key: "totalCustomersServed",
    label: "Customers",
    icon: <Users className="w-4 h-4 text-green-400" />,
    format: (v) => Number(v).toLocaleString(),
  },
  {
    key: "timeMachineCount",
    label: "Fleet",
    icon: <Rocket className="w-4 h-4 text-orange-400" />,
    format: (v) => `${v} machines`,
  },
  {
    key: "unlockedDestinationsCount",
    label: "Destinations",
    icon: <Globe className="w-4 h-4 text-blue-400" />,
    format: (v) => `${v} eras`,
  },
];

interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  totalEarned: string;
  totalTripsCompleted: number;
  totalCustomersServed: number;
  prestigeLevel: number;
  timeMachineCount: number;
  unlockedDestinationsCount: number;
  updatedAt: string;
}

const RANK_STYLES: Record<number, string> = {
  1: "text-yellow-400 font-bold",
  2: "text-gray-300 font-bold",
  3: "text-amber-600 font-bold",
};

const RANK_ICONS: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

export function LeaderboardPanel() {
  const { user, isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState("totalEarned");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myEntry, setMyEntry] = useState<LeaderboardEntry | null>(null);
  const [myRanks, setMyRanks] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchLeaderboard = async (category: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard/${category}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
        setMyEntry(data.myEntry || null);
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.error("Leaderboard fetch failed", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRanks = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch("/api/leaderboard-ranks/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setMyRanks(data.ranks || {});
      }
    } catch (e) {
      console.error("My ranks fetch failed", e);
    }
  };

  useEffect(() => {
    fetchLeaderboard(activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    if (isAuthenticated) fetchMyRanks();
  }, [isAuthenticated]);

  const activeCat = CATEGORIES.find(c => c.key === activeCategory)!;
  const isMyRankInTop = entries.some(e => e.userId === user?.id);

  return (
    <div className="space-y-3">
      {/* My Ranks Summary */}
      {isAuthenticated && Object.keys(myRanks).length > 0 && (
        <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">Your Global Rankings</p>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`text-center p-1.5 rounded-md border transition-all ${
                  activeCategory === cat.key
                    ? "border-cyan-500/60 bg-cyan-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-0.5">{cat.icon}</div>
                <div className="text-xs text-gray-400">{cat.label}</div>
                <div className={`text-sm font-bold ${myRanks[cat.key] ? "text-white" : "text-gray-600"}`}>
                  {myRanks[cat.key] ? `#${myRanks[cat.key]}` : "—"}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex gap-1 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeCategory === cat.key
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
            }`}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-black/40 border border-cyan-500/20 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            {activeCat.icon}
            <span className="text-sm font-semibold text-white">{activeCat.label} Leaderboard</span>
          </div>
          <button
            onClick={() => fetchLeaderboard(activeCategory)}
            disabled={loading}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No players yet. Be the first!
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {entries.slice(0, 10).map((entry) => {
              const isMe = entry.userId === user?.id;
              return (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
                    isMe ? "bg-cyan-500/10 border-l-2 border-cyan-500" : "hover:bg-white/5"
                  }`}
                >
                  <div className={`w-8 text-center text-sm shrink-0 ${RANK_STYLES[entry.rank] || "text-gray-500"}`}>
                    {RANK_ICONS[entry.rank] || `#${entry.rank}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate ${isMe ? "text-cyan-300" : "text-white"}`}>
                      {entry.username} {isMe && <span className="text-xs text-cyan-500">(you)</span>}
                    </div>
                  </div>
                  <div className={`text-sm font-bold shrink-0 ${RANK_STYLES[entry.rank] || "text-gray-300"}`}>
                    {activeCat.format((entry as any)[activeCategory])}
                  </div>
                </div>
              );
            })}

            {/* My entry if outside top 10 */}
            {myEntry && !isMyRankInTop && (
              <>
                <div className="px-3 py-1 text-center text-xs text-gray-600">• • •</div>
                <div className="flex items-center gap-3 px-3 py-2.5 bg-cyan-500/10 border-l-2 border-cyan-500">
                  <div className="w-8 text-center text-sm text-cyan-400 shrink-0">#{myEntry.rank}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-cyan-300 truncate">
                      {myEntry.username} <span className="text-xs text-cyan-500">(you)</span>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-gray-300 shrink-0">
                    {activeCat.format((myEntry as any)[activeCategory])}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {lastUpdated && (
        <p className="text-xs text-gray-600 text-right">
          Updated {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      {!isAuthenticated && (
        <p className="text-xs text-gray-500 text-center bg-black/30 rounded-lg p-2 border border-white/10">
          Sign in to appear on the leaderboard
        </p>
      )}
    </div>
  );
}
