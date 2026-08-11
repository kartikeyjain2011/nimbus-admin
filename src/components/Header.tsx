"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { 
  Search, 
  Globe, 
  RefreshCw, 
  Wifi, 
  ExternalLink, 
  LogOut, 
  ShieldAlert, 
  Users, 
  CreditCard, 
  Gamepad2, 
  Cpu, 
  Radio, 
  X, 
  ChevronRight,
  Sparkles
} from "lucide-react";

interface UserResult {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  tier: string;
  subscriptionStatus?: string;
  currentGame?: string;
}

interface TransactionResult {
  txId: string;
  user: string;
  email: string;
  clerkId: string;
  plan: string;
  amount: string;
  method: string;
  status: string;
  subscriptionStatus?: string;
}

interface GameResult {
  id: number;
  title: string;
  publisher: string;
  genre: string;
  activePlayers: number;
  minTier: string;
}

interface NodeResult {
  id: string;
  dc: string;
  type: string;
  load: number;
  status: string;
}

interface SessionResult {
  id: string;
  user: string;
  email: string;
  game: string;
  tier: string;
  gpu: string;
}

interface SearchResultsState {
  users: UserResult[];
  transactions: TransactionResult[];
  games: GameResult[];
  nodes: NodeResult[];
  sessions: SessionResult[];
}

export default function Header() {
  const router = useRouter();
  const [selectedRegion, setSelectedRegion] = useState("Mumbai (Primary)");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Universal Search State
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultsState>({
    users: [],
    transactions: [],
    games: [],
    nodes: [],
    sessions: []
  });
  const [totalCount, setTotalCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"all" | "users" | "transactions" | "games" | "nodes">("all");
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut (Cmd+K / '/' to focus, Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch search results from API
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;

    let ignore = false;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (!ignore && data.success && data.results) {
          setResults(data.results);
          setTotalCount(data.totalCount || 0);
        }
      } catch (err) {
        console.error("Global search error:", err);
      } finally {
        if (!ignore) setIsSearching(false);
      }
    }, 180);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [query]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetch("/api/sync", { method: "POST" });
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const navigateToResult = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    // Default navigate to users or sub page with search parameter
    router.push(`/users?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-zinc-200/80 px-6 flex items-center justify-between sticky top-0 z-40 font-sans">
      {/* Search Input Container */}
      <div className="flex items-center gap-4 flex-1 max-w-lg relative">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              setIsOpen(true);
              if (!val.trim()) {
                setResults({ users: [], transactions: [], games: [], nodes: [], sessions: [] });
                setTotalCount(0);
                setIsSearching(false);
              }
            }}
            placeholder="Search user ID, email, transaction ID, games, nodes... (Ctrl+K)"
            className="w-full bg-zinc-50/80 border border-zinc-200/80 focus:border-zinc-400 focus:bg-white focus:outline-none rounded-xl pl-9 pr-14 py-2 text-xs text-zinc-900 placeholder-zinc-400 transition-all font-normal shadow-xs"
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setResults({ users: [], transactions: [], games: [], nodes: [], sessions: [] });
                  setTotalCount(0);
                }}
                className="hover:text-zinc-700 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="bg-zinc-200/70 border border-zinc-300/60 rounded px-1.5 py-0.5 text-zinc-500 font-medium">
                ⌘K
              </span>
            )}
          </div>
        </form>

        {/* Dynamic Search Results Dropdown Overlay */}
        {isOpen && query.trim().length > 0 && (
          <div 
            ref={dropdownRef}
            className="absolute top-12 left-0 right-0 bg-white rounded-2xl border border-zinc-200 shadow-2xl z-50 max-h-[75vh] overflow-y-auto font-sans animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Search Header & Category Filter Tabs */}
            <div className="p-3 bg-zinc-50/80 border-b border-zinc-200/80 sticky top-0 backdrop-blur-md z-10 flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
                <button
                  onClick={() => setActiveCategory("all")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    activeCategory === "all" ? "bg-zinc-900 text-white font-semibold shadow-xs" : "text-zinc-600 hover:bg-zinc-200/70"
                  }`}
                >
                  All ({totalCount})
                </button>
                <button
                  onClick={() => setActiveCategory("users")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                    activeCategory === "users" ? "bg-zinc-900 text-white font-semibold shadow-xs" : "text-zinc-600 hover:bg-zinc-200/70"
                  }`}
                >
                  <Users className="w-3 h-3" /> Users ({results.users.length})
                </button>
                <button
                  onClick={() => setActiveCategory("transactions")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                    activeCategory === "transactions" ? "bg-zinc-900 text-white font-semibold shadow-xs" : "text-zinc-600 hover:bg-zinc-200/70"
                  }`}
                >
                  <CreditCard className="w-3 h-3" /> Txns ({results.transactions.length})
                </button>
                <button
                  onClick={() => setActiveCategory("games")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                    activeCategory === "games" ? "bg-zinc-900 text-white font-semibold shadow-xs" : "text-zinc-600 hover:bg-zinc-200/70"
                  }`}
                >
                  <Gamepad2 className="w-3 h-3" /> Games ({results.games.length})
                </button>
                <button
                  onClick={() => setActiveCategory("nodes")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                    activeCategory === "nodes" ? "bg-zinc-900 text-white font-semibold shadow-xs" : "text-zinc-600 hover:bg-zinc-200/70"
                  }`}
                >
                  <Cpu className="w-3 h-3" /> Racks ({results.nodes.length + results.sessions.length})
                </button>
              </div>

              {isSearching && (
                <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                  <RefreshCw className="w-3 h-3 animate-spin text-zinc-700" /> Searching...
                </div>
              )}
            </div>

            {/* Results Content Body */}
            <div className="p-2 divide-y divide-zinc-100">
              {totalCount === 0 && !isSearching ? (
                <div className="p-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-zinc-800">No results found for &ldquo;{query}&rdquo;</div>
                  <p className="text-[11px] text-zinc-400">Try searching for user emails, Clerk IDs, transaction IDs (e.g. pay_Razorpay), game titles, or GPU nodes.</p>
                </div>
              ) : null}

              {/* 1. STREAMERS / USERS CATEGORY */}
              {(activeCategory === "all" || activeCategory === "users") && results.users.length > 0 && (
                <div className="py-2 space-y-1">
                  <div className="px-3 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Users className="w-3 h-3 text-zinc-500" /> Streamers & User Accounts
                  </div>
                  {results.users.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => navigateToResult(`/users?search=${encodeURIComponent(u.email || u.name || u.id)}`)}
                      className="px-3 py-2 rounded-xl hover:bg-zinc-50 flex items-center justify-between cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {u.name[0]}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-zinc-900 group-hover:text-zinc-950 flex items-center gap-1.5">
                            <span>{u.name}</span>
                            <span className="text-[10px] font-normal px-2 py-0.2 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                              {u.tier} Tier
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-400 font-mono">
                            {u.email} • ID: <strong className="text-zinc-600 font-semibold">{u.id}</strong> ({u.clerkId || "Clerk"})
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-700 transition-colors" />
                    </div>
                  ))}
                </div>
              )}

              {/* 2. TRANSACTIONS CATEGORY */}
              {(activeCategory === "all" || activeCategory === "transactions") && results.transactions.length > 0 && (
                <div className="py-2 space-y-1">
                  <div className="px-3 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-zinc-500" /> Razorpay Transactions & Payments
                  </div>
                  {results.transactions.map((tx) => (
                    <div
                      key={tx.txId}
                      onClick={() => navigateToResult(`/subscriptions?search=${encodeURIComponent(tx.txId)}`)}
                      className="px-3 py-2 rounded-xl hover:bg-zinc-50 flex items-center justify-between cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-xs font-bold shrink-0">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-zinc-900 flex items-center gap-2">
                            <span className="font-mono text-zinc-900 font-bold">{tx.txId}</span>
                            <span className="text-[10px] font-medium px-2 py-0.2 rounded-md bg-zinc-100 text-zinc-800">
                              {tx.plan} ({tx.amount})
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            {tx.user} ({tx.email}) • Method: {tx.method}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          (tx.subscriptionStatus || tx.status) === "Active" || (tx.subscriptionStatus || tx.status) === "Success"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}>
                          {tx.subscriptionStatus || tx.status}
                        </span>
                        <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-700 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 3. GAMES CATALOG CATEGORY */}
              {(activeCategory === "all" || activeCategory === "games") && results.games.length > 0 && (
                <div className="py-2 space-y-1">
                  <div className="px-3 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Gamepad2 className="w-3 h-3 text-zinc-500" /> Cloud Game Catalog
                  </div>
                  {results.games.map((g) => (
                    <div
                      key={g.id}
                      onClick={() => navigateToResult(`/library?search=${encodeURIComponent(g.title)}`)}
                      className="px-3 py-2 rounded-xl hover:bg-zinc-50 flex items-center justify-between cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0">
                          🎮
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-zinc-900 group-hover:text-zinc-950 flex items-center gap-2">
                            <span>{g.title}</span>
                            <span className="text-[10px] font-medium px-2 py-0.2 rounded-md bg-zinc-100 text-zinc-700">
                              {g.genre}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            Publisher: {g.publisher} • Min Plan: {g.minTier}
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-700 transition-colors" />
                    </div>
                  ))}
                </div>
              )}

              {/* 4. NODES & SESSIONS CATEGORY */}
              {(activeCategory === "all" || activeCategory === "nodes") && (results.nodes.length > 0 || results.sessions.length > 0) && (
                <div className="py-2 space-y-1">
                  <div className="px-3 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-zinc-500" /> GPU Nodes & Live Sessions
                  </div>

                  {results.nodes.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => navigateToResult(`/nodes?search=${encodeURIComponent(n.id)}`)}
                      className="px-3 py-2 rounded-xl hover:bg-zinc-50 flex items-center justify-between cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-800 flex items-center justify-center shrink-0">
                          <Cpu className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold font-mono text-zinc-900">{n.id}</div>
                          <div className="text-[11px] text-zinc-400">{n.dc} • Hardware: {n.type}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-700 transition-colors" />
                    </div>
                  ))}

                  {results.sessions.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => navigateToResult(`/?search=${encodeURIComponent(s.id)}`)}
                      className="px-3 py-2 rounded-xl hover:bg-zinc-50 flex items-center justify-between cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                          <Radio className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-zinc-900">
                            Stream Session <span className="font-mono font-bold">{s.id}</span>
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            User: {s.user} ({s.email}) • Playing: {s.game}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-700 transition-colors" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dropdown Footer */}
            <div className="p-3 bg-zinc-50 border-t border-zinc-200/80 text-[11px] text-zinc-500 flex items-center justify-between">
              <span className="flex items-center gap-1 text-zinc-600">
                <Sparkles className="w-3 h-3 text-amber-500" /> Multi-entity live search active
              </span>
              <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-zinc-300 rounded text-[10px]">Enter</kbd> to search</span>
            </div>
          </div>
        )}
      </div>

      {/* Control Actions & Status */}
      <div className="flex items-center gap-3">
        {/* Frontend site link */}
        <a
          href="https://frontendnimbuz.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100/80 border border-zinc-200/80 text-xs font-medium text-zinc-800 hover:bg-zinc-900 hover:text-white transition-all"
        >
          <span>frontendnimbuz.vercel.app</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Region Switcher Dropdown */}
        <div className="flex items-center gap-2 bg-zinc-50/80 border border-zinc-200/80 rounded-xl px-3 py-1.5 text-xs text-zinc-800">
          <Globe className="w-3.5 h-3.5 text-zinc-600" />
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-transparent border-none text-xs text-zinc-800 focus:outline-none cursor-pointer font-medium"
          >
            <option value="Mumbai (Primary)">Mumbai (11ms)</option>
            <option value="Delhi Node">Delhi (18ms)</option>
            <option value="Bangalore Node">Bangalore (14ms)</option>
            <option value="Singapore Hub">Singapore (35ms)</option>
          </select>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
          <Wifi className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
          <span>AV1 Stream: Live</span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          className="p-2 rounded-xl bg-zinc-50/80 border border-zinc-200/80 hover:border-zinc-400 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
          title="Sync Telemetry & Data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-zinc-900" : ""}`} />
        </button>

        {/* Admin Profile & Clerk UserButton */}
        <HeaderAdminProfile handleLogout={handleLogout} />
      </div>
    </header>
  );
}

function HeaderAdminProfile({ handleLogout }: { handleLogout: () => void }) {
  const { isSignedIn, user } = useUser();

  if (isSignedIn && user) {
    const name = user.fullName || user.firstName || user.username || "Super Admin";
    const primaryEmail = user.primaryEmailAddress?.emailAddress || "admin@nimbuz.cloud";

    return (
      <div className="flex items-center gap-3 pl-3 border-l border-zinc-200/80">
        <UserButton 
          appearance={{
            elements: {
              userButtonAvatarBox: "w-8 h-8 rounded-xl border border-zinc-200 shadow-xs",
            }
          }}
        />
        <div className="hidden md:block font-sans">
          <div className="text-xs font-semibold text-zinc-900 flex items-center gap-1">
            {name} <ShieldAlert className="w-3 h-3 text-emerald-600" />
          </div>
          <div className="text-[10px] text-zinc-400 font-normal">{primaryEmail}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 pl-3 border-l border-zinc-200/80">
      <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
        SA
      </div>
      <div className="hidden md:block">
        <div className="text-xs font-semibold text-zinc-900 flex items-center gap-1">
          Super Admin <ShieldAlert className="w-3 h-3 text-zinc-700" />
        </div>
        <div className="text-[10px] text-zinc-400 font-normal">admin@nimbuz.cloud</div>
      </div>

      <button
        onClick={handleLogout}
        className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-900 hover:text-white border border-zinc-200 text-zinc-700 transition-colors cursor-pointer ml-1"
        title="Sign Out"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
