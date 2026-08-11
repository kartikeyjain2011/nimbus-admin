"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Gamepad2, 
  CreditCard, 
  Cpu, 
  Activity, 
  Users, 
  ShieldCheck,
  Zap,
  Radio,
  LogOut
} from "lucide-react";

const navItems = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Game Library", href: "/library", icon: Gamepad2, badge: "2,400+" },
  { name: "Subscriptions & MRR", href: "/subscriptions", icon: CreditCard, badge: "Razorpay" },
  { name: "GPU Rig Nodes", href: "/nodes", icon: Cpu, status: "live" },
  { name: "Live Telemetry", href: "/telemetry", icon: Activity },
  { name: "Active Streamers", href: "/users", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-zinc-200/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 font-sans">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-zinc-200/80">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-900 text-white shadow-xs">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-zinc-900 text-sm">NIMBUS</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-md bg-zinc-900 text-white">
                  ADMIN
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-normal">Cloud Gaming v4.2</p>
            </div>
          </Link>
        </div>

        {/* Live Cluster Region Info */}
        <div className="mx-4 mt-4 p-3 rounded-xl bg-zinc-50/80 border border-zinc-200/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <div>
              <div className="text-[11px] font-semibold text-zinc-900">Mumbai Node 01</div>
              <div className="text-[10px] text-zinc-500 font-normal">11ms • RTX-4090 Tier</div>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>

        {/* Navigation Items */}
        <nav className="mt-5 px-3 space-y-1">
          <div className="px-3 mb-2 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            Management Console
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-zinc-900 text-white font-semibold shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-zinc-400"}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                    isActive 
                      ? "bg-zinc-800 text-zinc-200 border-zinc-700" 
                      : "bg-zinc-100 text-zinc-600 border-zinc-200"
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.status === "live" && (
                  <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    isActive
                      ? "bg-zinc-800 text-white border-zinc-700"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Logout Button */}
      <div className="p-4 border-t border-zinc-200/80 space-y-3">
        <div className="p-3 rounded-xl bg-zinc-50/80 border border-zinc-200/70 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-500 font-normal">Stream Target</span>
            <span className="text-zinc-900 font-semibold">4K / 120 FPS</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-zinc-200/80 overflow-hidden">
            <div className="h-full bg-zinc-900 w-[88%]" />
          </div>
          <div className="flex justify-between text-[10px] text-zinc-400 font-normal">
            <span>Cap: 10 Gbps</span>
            <span>Usage: 8.8 Gbps</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2 text-xs text-zinc-600 px-1">
            <ShieldCheck className="w-4 h-4 text-zinc-800" />
            <span className="text-[11px] font-semibold text-zinc-800">Vercel Edge</span>
          </div>

          <button
            onClick={handleLogout}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-900 hover:text-white border border-zinc-200 text-zinc-700 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5"
            title="Sign out of Super Admin"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
