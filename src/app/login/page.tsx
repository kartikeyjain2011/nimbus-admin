"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Eye, EyeOff, KeyRound, AlertCircle, ArrowRight, CheckCircle2, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/");
        router.refresh();
      } else {
        setError(data.error || "Invalid Super Admin credentials.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAutofill = () => {
    setEmail("admin@nimbuz.cloud");
    setPassword("admin123");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col justify-between items-center p-6 font-sans">
      {/* Top Header */}
      <header className="w-full max-w-6xl flex justify-between items-center py-4 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-mono font-bold text-xs">
            N
          </div>
          <div>
            <span className="font-mono font-bold tracking-wider text-black text-sm">NIMBUS</span>
            <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-black border border-zinc-300 font-semibold">
              SUPER ADMIN
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-600">
          <ShieldCheck className="w-4 h-4 text-black" />
          <span>Encrypted Session • Cloud Gateway</span>
        </div>
      </header>

      {/* Main Login Box */}
      <main className="w-full max-w-md my-auto py-8">
        <div className="bg-white border-2 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="space-y-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-black font-mono">
              Super Admin Gateway
            </h1>
            <p className="text-xs text-zinc-600 font-mono">
              Sign in with your Super Admin credentials to access the telemetry & operations console.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-zinc-100 border-2 border-black text-black text-xs font-mono flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-black" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-black uppercase tracking-wider block">
                Super Admin Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nimbuz.cloud"
                  className="w-full bg-zinc-50 border-2 border-zinc-300 focus:border-black focus:bg-white focus:outline-none rounded-xl px-4 py-2.5 text-xs text-black font-mono transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-black uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-50 border-2 border-zinc-300 focus:border-black focus:bg-white focus:outline-none rounded-xl px-4 py-2.5 pr-10 text-xs text-black font-mono transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-black cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-black text-white hover:bg-zinc-800 text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In to Admin Dashboard"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credential Helper */}
          <div className="pt-4 border-t border-zinc-200 space-y-3">
            <button
              type="button"
              onClick={handleAutofill}
              className="w-full py-2 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-black text-xs font-mono font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Auto-fill Super Admin Credentials</span>
            </button>

            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-[11px] font-mono text-zinc-600 space-y-1">
              <div className="flex items-center gap-1.5 text-black font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                Default Test Credentials:
              </div>
              <div>• Email: <code className="bg-zinc-200 px-1 py-0.5 rounded text-black">admin@nimbuz.cloud</code></div>
              <div>• Password: <code className="bg-zinc-200 px-1 py-0.5 rounded text-black">admin123</code></div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl text-center py-4 border-t border-zinc-200 text-xs font-mono text-zinc-500">
        Nimbus Cloud Gaming Console v4.2 • High Latency AV1 Operations • Strict Security Policy
      </footer>
    </div>
  );
}
