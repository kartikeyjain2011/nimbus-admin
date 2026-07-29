"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, RefreshCw, CheckCircle2, ChevronRight, Gamepad2, X } from "lucide-react";

interface UserRecord {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  imageUrl?: string;
  tier: "Basic" | "Priority" | "Ultra" | "Ultimate";
  joined: string;
  totalHours: string;
  status: "Active Now" | "Idle" | "Offline";
  currentGame?: string;
  device?: string;
  gamesPurchased: string[];
  lastActive: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        if (!ignore && data.success && data.users) {
          setUsers(data.users);
        }
      } catch (err) {
        console.error("Failed to load users:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, []);

  const triggerSync = async () => {
    try {
      setSyncing(true);
      setSyncNotice(null);
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSyncNotice(`Synced with frontendnimbuz.vercel.app & Clerk (${data.counts?.users || 0} streamers updated)`);
        await fetchUsers();
      }
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdateTier = async (userId: string, newTier: UserRecord["tier"]) => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_tier", userId, tier: newTier })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, tier: newTier } : u));
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser({ ...selectedUser, tier: newTier });
        }
      }
    } catch (err) {
      console.error("Failed to update tier:", err);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.clerkId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-xl text-black font-mono">Clerk Users & Cloud Streamers Store</h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-black text-white">
              Synced with frontendnimbuz.vercel.app
            </span>
          </div>
          <p className="text-xs text-zinc-600 mt-1 font-mono">
            Centralized admin control for Clerk authenticated user profiles, subscription tier access, and purchased game licenses.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={triggerSync}
            disabled={syncing}
            className="px-4 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 border border-black shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing Clerk Data..." : "Sync Frontend Data"}
          </button>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, or Clerk ID..."
              className="w-full bg-zinc-50 border border-zinc-200 focus:border-black focus:outline-none rounded-xl pl-9 pr-4 py-2 text-xs text-black font-mono"
            />
          </div>
        </div>
      </div>

      {syncNotice && (
        <div className="p-3.5 rounded-xl bg-zinc-100 border-2 border-black text-black font-mono text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-black" />
            <span className="font-bold">{syncNotice}</span>
          </div>
          <button onClick={() => setSyncNotice(null)} className="text-black hover:text-zinc-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-black text-base">Registered Users ({filteredUsers.length})</h2>
          <span className="text-xs font-mono text-zinc-500">Click any user to view Clerk Metadata & Purchased Games</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs font-mono text-zinc-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-black" /> Fetching user accounts...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b-2 border-black text-black uppercase tracking-wider font-bold bg-zinc-50">
                  <th className="py-3 px-4">User & Clerk ID</th>
                  <th className="py-3 px-4">Subscription Tier</th>
                  <th className="py-3 px-4">Currently Playing</th>
                  <th className="py-3 px-4">Games Unlocked</th>
                  <th className="py-3 px-4">Total Play Time</th>
                  <th className="py-3 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-3.5 px-4 cursor-pointer" onClick={() => setSelectedUser(u)}>
                      <div className="font-bold text-black flex items-center gap-2">
                        {u.name}
                        {u.imageUrl && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={u.imageUrl} alt="" className="w-4 h-4 rounded-full border border-zinc-300" />
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-500">{u.email} • <span className="font-mono text-black font-bold">{u.clerkId}</span></div>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={u.tier}
                        onChange={(e) => handleUpdateTier(u.id, e.target.value as UserRecord["tier"])}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-zinc-50 border border-zinc-300 text-black cursor-pointer focus:outline-none focus:border-black font-mono"
                      >
                        <option value="Basic">BASIC (₹799)</option>
                        <option value="Priority">PRIORITY (₹1,499)</option>
                        <option value="Ultra">ULTRA (₹2,499)</option>
                        <option value="Ultimate">ULTIMATE (₹2,999)</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-black">
                      {u.currentGame || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-black">
                      <span className="px-2.5 py-0.5 rounded bg-zinc-100 border border-zinc-300 text-[10px] text-black font-bold">
                        {u.gamesPurchased?.length || 0} Titles Owned
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-black font-bold">{u.totalHours}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="px-3 py-1 rounded-lg bg-black text-white hover:bg-zinc-800 text-[10px] font-bold transition-all cursor-pointer inline-flex items-center gap-1 border border-black shadow-sm"
                      >
                        Inspect User <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-5 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative font-sans text-black">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-black cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center font-bold text-lg font-mono">
                {selectedUser.name[0]}
              </div>
              <div>
                <h3 className="font-bold text-lg text-black">{selectedUser.name}</h3>
                <p className="text-xs text-zinc-500">{selectedUser.email}</p>
                <div className="text-[10px] font-mono text-black font-bold mt-0.5">Clerk ID: {selectedUser.clerkId}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                <div className="text-zinc-500 mb-1">Active Plan Tier</div>
                <div className="font-bold text-black">{selectedUser.tier}</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                <div className="text-zinc-500 mb-1">Total Streaming Time</div>
                <div className="font-bold text-black">{selectedUser.totalHours}</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Gamepad2 className="w-4 h-4 text-black" /> Games Purchased / Storefront Licenses
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedUser.gamesPurchased && selectedUser.gamesPurchased.length > 0 ? (
                  selectedUser.gamesPurchased.map((game, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-zinc-100 border border-zinc-300 text-xs font-mono text-black font-bold">
                      🎮 {game}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-mono text-zinc-500">No paid titles bound yet</span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500">Member Since: {selectedUser.joined}</span>
              <span className="text-black font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-black animate-pulse" /> {selectedUser.status}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
