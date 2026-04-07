"use client";

import { MarketingPanel } from "@/features/home/components/marketing-panel";
import { UserAccessPanel } from "@/features/home/components/user-access-panel";
import { useUserSession } from "@/features/session/hooks/use-user-session";

export function HomePage() {
  const session = useUserSession();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.18),_transparent_35%),radial-gradient(circle_at_85%_20%,_rgba(8,145,178,0.18),_transparent_30%),linear-gradient(180deg,_#fff8ef_0%,_#fffdf8_50%,_#f7fbff_100%)] px-6 py-10 text-slate-900 sm:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 lg:flex-row">
        <MarketingPanel />
        <UserAccessPanel session={session} />
      </div>
    </main>
  );
}
