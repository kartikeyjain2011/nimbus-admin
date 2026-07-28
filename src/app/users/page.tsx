import { AlertTriangle } from "lucide-react";
import { getClerkUsers } from "@/lib/clerk";
import UsersTable from "./UsersTable";

// Server component: fetches real Clerk users at request time so the admin
// console always reflects the live frontendnimbuz.vercel.app user base.
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const { users, totalCount, error } = await getClerkUsers(100);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="card-panel rounded-2xl p-6 flex items-start gap-4 border border-[#f59e0b]/30">
          <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/30 flex items-center justify-center text-[#f59e0b] shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-[#f3f4f6]">Unable to load Clerk users</h1>
            <p className="text-xs text-[#8e96ab] mt-1 font-mono">{error}</p>
            <p className="text-xs text-[#8e96ab] mt-3">
              Add <code className="text-[#00f0ff]">CLERK_SECRET_KEY</code> to <code className="text-[#00f0ff]">.env.local</code>{" "}
              (must belong to the same Clerk application used by{" "}
              <a
                href="https://frontendnimbuz.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="text-[#00f0ff] underline"
              >
                frontendnimbuz.vercel.app
              </a>
              ), then restart the dev server.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-mono text-[#8e96ab] px-1">
        Showing {users.length} of {totalCount} total registered users (live Clerk Backend API data).
      </p>
      <UsersTable users={users} />
    </div>
  );
}
