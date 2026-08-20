import { redirect } from "next/navigation";
import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { ShieldCheck } from "lucide-react";

export default async function LoginPage() {
  const { userId } = await auth({ treatPendingAsSignedOut: false });

  if (userId) {
    redirect("/");
  }

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
          <span>Encrypted Clerk Auth • Cloud Gateway</span>
        </div>
      </header>

      {/* Main Login Box */}
      <main className="w-full max-w-md my-auto py-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-black font-mono">
            Super Admin Gateway
          </h1>
          <p className="text-xs text-zinc-600 font-mono">
            Sign in with your Clerk account to access the telemetry &amp; operations console.
          </p>
        </div>

        <div className="flex justify-center border-2 border-black rounded-2xl p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
          <SignIn routing="hash" forceRedirectUrl="/" fallbackRedirectUrl="/" />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl text-center py-4 border-t border-zinc-200 text-xs font-mono text-zinc-500">
        Nimbus Cloud Gaming Console v4.2 • High Latency AV1 Operations • Strict Security Policy
      </footer>
    </div>
  );
}
