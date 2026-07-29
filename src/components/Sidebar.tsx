"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Gamepad2, 
  CreditCard, 
  Cpu, 
  Activity, 
  Users, 
  Settings, 
  ShieldCheck,
  Zap,
  Radio
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

  return (
    <aside className="w-64 bg-[#0d0f19] border-r border-[#222638] flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#222638]">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff]">
              <Zap className="w-4 h-4 text-[#00f0ff] fill-[#00f0ff]/20 animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#00f0ff] animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-wider text-[#f3f4f6] text-sm font-mono">NIMBUS</span>
                <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/30">
                  ADMIN
                </span>
              </div>
              <p className="text-[10px] text-[#8e96ab] font-mono">Cloud Gaming v4.2</p>
            </div>
          </Link>
        </div>

        {/* Live Cluster Region Info */}
        <div className="mx-4 mt-4 p-3 rounded-xl bg-[#121420] border border-[#222638] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#10b981] animate-pulse" />
            <div>
              <div className="text-[11px] font-mono font-medium text-[#f3f4f6]">Mumbai Node 01</div>
              <div className="text-[10px] text-[#8e96ab] font-mono">11ms • RTX-4090 Tier</div>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 px-3 space-y-1">
          <div className="px-3 mb-2 text-[10px] font-mono font-semibold text-[#8e96ab] uppercase tracking-wider">
            Management Console
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 font-semibold shadow-[0_0_12px_rgba(0,240,255,0.1)]"
                    : "text-[#8e96ab] hover:text-[#f3f4f6] hover:bg-[#161926]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#00f0ff]" : "text-[#8e96ab]"}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#161926] text-[#8e96ab] border border-[#222638]">
                    {item.badge}
                  </span>
                )}
                {item.status === "live" && (
                  <span className="flex items-center gap-1 text-[10px] font-mono font-semibold text-[#10b981] px-2 py-0.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
                    LIVE
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#222638] space-y-3">
        <div className="p-3 rounded-xl bg-[#121420] border border-[#222638] space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#8e96ab] font-mono">Stream Target</span>
            <span className="text-[#00f0ff] font-mono font-bold">4K / 120 FPS</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#161926] overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#00f0ff] to-[#10b981] w-[88%]" />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-[#8e96ab]">
            <span>Cap: 10 Gbps</span>
            <span>Usage: 8.8 Gbps</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#8e96ab] px-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#10b981]" />
            <span className="font-mono text-[11px]">Vercel Edge</span>
          </div>
          <Link href="/settings" className="hover:text-[#f3f4f6]">
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
