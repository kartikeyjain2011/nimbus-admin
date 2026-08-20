import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This is a single-tenant admin console, so a session with an unfinished
  // organization task still counts as signed in.
  const { userId } = await auth({ treatPendingAsSignedOut: false });

  if (!userId) {
    redirect("/login");
  }

  return (
    <div className="min-h-full flex bg-white text-zinc-900 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto bg-zinc-50/60">{children}</main>
      </div>
    </div>
  );
}
