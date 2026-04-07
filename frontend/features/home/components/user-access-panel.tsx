import { AuthPanel } from "@/features/auth/components/auth-panel";
import { AccountPanel } from "@/features/account/components/account-panel";
import { useUserSession } from "@/features/session/hooks/use-user-session";

type UserAccessPanelProps = {
  session: ReturnType<typeof useUserSession>;
};

export function UserAccessPanel({ session }: UserAccessPanelProps) {
  const docsHref = `${session.apiBaseUrl}/docs`;

  return (
    <section className="w-full max-w-xl rounded-[32px] border border-slate-200/80 bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            User access
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            {session.user ? "Your account" : "Create or access your account"}
          </h2>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          API: {session.apiBaseUrl}
        </div>
      </div>

      {session.error ? (
        <div className="mb-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {session.error}
        </div>
      ) : null}

      {session.message ? (
        <div className="mb-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {session.message}
        </div>
      ) : null}

      {session.isBootstrapping ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
          Checking your active session...
        </div>
      ) : session.user ? (
        <AccountPanel
          isBusy={session.isBusy}
          onDeleteAccount={session.handleDeleteAccount}
          onEmailChange={session.setProfileEmail}
          onLogout={session.handleLogout}
          onNameChange={session.setProfileName}
          onPasswordChange={session.setProfilePassword}
          onSubmit={session.handleProfileSubmit}
          profileForm={session.profileForm}
          user={session.user}
        />
      ) : (
        <AuthPanel
          authForm={session.authForm}
          docsHref={docsHref}
          isBusy={session.isBusy}
          mode={session.mode}
          onEmailChange={session.setAuthEmail}
          onModeChange={session.setMode}
          onNameChange={session.setAuthName}
          onPasswordChange={session.setAuthPassword}
          onSubmit={session.handleAuthSubmit}
        />
      )}
    </section>
  );
}
