import type { FormEvent } from "react";
import type {
  AuthFormState,
  AuthMode,
} from "@/features/session/types/forms";

type AuthPanelProps = {
  authForm: AuthFormState;
  isBusy: boolean;
  mode: AuthMode;
  onEmailChange: (value: string) => void;
  onModeChange: (mode: AuthMode) => void;
  onNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  docsHref: string;
};

export function AuthPanel({
  authForm,
  isBusy,
  mode,
  onEmailChange,
  onModeChange,
  onNameChange,
  onPasswordChange,
  onSubmit,
  docsHref,
}: AuthPanelProps) {
  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
        <button
          className={`rounded-full px-4 py-2 text-sm transition ${
            mode === "signup"
              ? "bg-white text-slate-950"
              : "text-slate-300 hover:text-white"
          }`}
          onClick={() => onModeChange("signup")}
          type="button"
        >
          Sign up
        </button>
        <button
          className={`rounded-full px-4 py-2 text-sm transition ${
            mode === "login"
              ? "bg-white text-slate-950"
              : "text-slate-300 hover:text-white"
          }`}
          onClick={() => onModeChange("login")}
          type="button"
        >
          Log in
        </button>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        {mode === "signup" ? (
          <label className="space-y-2 text-sm text-slate-200">
            <span>Name</span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-orange-300"
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="Casey Morgan"
              value={authForm.name}
            />
          </label>
        ) : null}

        <label className="space-y-2 text-sm text-slate-200">
          <span>Email</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-orange-300"
            onChange={(event) => onEmailChange(event.target.value)}
            required
            type="email"
            value={authForm.email}
          />
        </label>

        <label className="space-y-2 text-sm text-slate-200">
          <span>Password</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-orange-300"
            minLength={8}
            onChange={(event) => onPasswordChange(event.target.value)}
            required
            type="password"
            value={authForm.password}
          />
        </label>

        <button
          className="w-full rounded-full bg-orange-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-orange-300 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isBusy}
          type="submit"
        >
          {isBusy ? "Working..." : mode === "signup" ? "Create account" : "Log in"}
        </button>
      </form>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm leading-7 text-slate-300">
        <p>
          The browser talks directly to the Nest API with{" "}
          <code className="rounded bg-white/10 px-1 py-0.5 text-slate-100">
            credentials: include
          </code>
          , while the API stores your signed JWT in an HttpOnly cookie and
          exposes Swagger at{" "}
          <a
            className="font-medium text-cyan-300 underline decoration-cyan-500/40 underline-offset-4"
            href={docsHref}
            rel="noreferrer"
            target="_blank"
          >
            /docs
          </a>
          .
        </p>
      </div>
    </div>
  );
}
