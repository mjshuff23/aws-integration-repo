import type { FormEvent } from "react";
import { formatDate } from "@/lib/format/format-date";
import type { ProfileFormState } from "@/features/session/types/forms";
import type { User } from "@/types/user";

type AccountPanelProps = {
  isBusy: boolean;
  onDeleteAccount: () => void | Promise<void>;
  onEmailChange: (value: string) => void;
  onLogout: () => void | Promise<void>;
  onNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  profileForm: ProfileFormState;
  user: User;
};

export function AccountPanel({
  isBusy,
  onDeleteAccount,
  onEmailChange,
  onLogout,
  onNameChange,
  onPasswordChange,
  onSubmit,
  profileForm,
  user,
}: AccountPanelProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
          Logged in
        </p>
        <h3 className="mt-3 text-3xl font-semibold">
          {user.name || "Unnamed account"}
        </h3>
        <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
          <div>
            <p className="text-slate-500">Email</p>
            <p className="mt-1">{user.email}</p>
          </div>
          <div>
            <p className="text-slate-500">Created</p>
            <p className="mt-1">{formatDate(user.createdAt)}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-slate-500">Last updated</p>
            <p className="mt-1">{formatDate(user.updatedAt)}</p>
          </div>
        </div>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-200">
            <span>Name</span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              onChange={(event) => onNameChange(event.target.value)}
              value={profileForm.name}
            />
          </label>
          <label className="space-y-2 text-sm text-slate-200">
            <span>Email</span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              onChange={(event) => onEmailChange(event.target.value)}
              required
              type="email"
              value={profileForm.email}
            />
          </label>
        </div>

        <label className="space-y-2 text-sm text-slate-200">
          <span>New password</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            minLength={8}
            onChange={(event) => onPasswordChange(event.target.value)}
            placeholder="Leave blank to keep your current password"
            type="password"
            value={profileForm.password}
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            className="my-5 rounded-full bg-cyan-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isBusy}
            type="submit"
          >
            {isBusy ? "Saving..." : "Save profile"}
          </button>
          <button
            className="my-5 rounded-full border border-white/15 px-5 py-3 font-medium text-white transition hover:border-white/30 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isBusy}
            onClick={onLogout}
            type="button"
          >
            Logout
          </button>
          <button
            className="my-5 rounded-full border border-rose-400/30 px-5 py-3 font-medium text-rose-200 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isBusy}
            onClick={onDeleteAccount}
            type="button"
          >
            Delete account
          </button>
        </div>
      </form>
    </div>
  );
}
