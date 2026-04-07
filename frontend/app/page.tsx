"use client";

import { useEffect, useEffectEvent, useState, useTransition } from "react";

type User = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
};

type AuthFormState = {
  email: string;
  password: string;
  name: string;
};

type ProfileFormState = {
  email: string;
  name: string;
  password: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const text = await response.text();
  const payload = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload
        ? Array.isArray(payload.message)
          ? payload.message.join(", ")
          : String(payload.message)
        : response.status === 401
          ? "Your session is not active."
          : "Request failed.";

    throw new Error(message);
  }

  return payload as T;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function toProfileForm(user: User): ProfileFormState {
  return {
    email: user.email,
    name: user.name ?? "",
    password: "",
  };
}

export default function Home() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [user, setUser] = useState<User | null>(null);
  const [authForm, setAuthForm] = useState<AuthFormState>({
    email: "",
    password: "",
    name: "",
  });
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    email: "",
    name: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isPending, startTransition] = useTransition();

  const loadCurrentUser = useEffectEvent(async () => {
    try {
      const currentUser = await apiRequest<User>("/auth/me", {
        method: "GET",
      });

      startTransition(() => {
        setUser(currentUser);
        setProfileForm(toProfileForm(currentUser));
      });
    } catch (requestError) {
      const requestMessage = getErrorMessage(requestError);

      startTransition(() => {
        setUser(null);
        if (requestMessage !== "Your session is not active.") {
          setError(requestMessage);
        }
      });
    } finally {
      setIsBootstrapping(false);
    }
  });

  useEffect(() => {
    void loadCurrentUser();
  }, []);

  async function handleAuthSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const payload =
        mode === "signup"
          ? {
              email: authForm.email,
              password: authForm.password,
              name: authForm.name || undefined,
            }
          : {
              email: authForm.email,
              password: authForm.password,
            };

      const nextUser = await apiRequest<User>(
        mode === "signup" ? "/auth/signup" : "/auth/login",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );

      startTransition(() => {
        setUser(nextUser);
        setProfileForm(toProfileForm(nextUser));
        setAuthForm((current) => ({
          ...current,
          password: "",
        }));
        setMessage(
          mode === "signup"
            ? "Your account is ready."
            : "You are logged in.",
        );
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  async function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const nextUser = await apiRequest<User>("/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          email: profileForm.email,
          name: profileForm.name || undefined,
          password: profileForm.password || undefined,
        }),
      });

      startTransition(() => {
        setUser(nextUser);
        setProfileForm(toProfileForm(nextUser));
        setMessage("Your profile has been updated.");
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  async function handleLogout() {
    setError(null);
    setMessage(null);

    try {
      await apiRequest<{ message: string }>("/auth/logout", {
        method: "POST",
      });

      startTransition(() => {
        setUser(null);
        setProfileForm({
          email: "",
          name: "",
          password: "",
        });
        setMessage("You have been logged out.");
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Delete your account? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    setMessage(null);

    try {
      await apiRequest<User>("/users/me", {
        method: "DELETE",
      });

      startTransition(() => {
        setUser(null);
        setProfileForm({
          email: "",
          name: "",
          password: "",
        });
        setAuthForm({
          email: "",
          password: "",
          name: "",
        });
        setMessage("Your account has been deleted.");
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  const isBusy = isPending || isBootstrapping;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.18),_transparent_35%),radial-gradient(circle_at_85%_20%,_rgba(8,145,178,0.18),_transparent_30%),linear-gradient(180deg,_#fff8ef_0%,_#fffdf8_50%,_#f7fbff_100%)] px-6 py-10 text-slate-900 sm:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 lg:flex-row">
        <section className="flex flex-1 flex-col justify-between rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_20px_80px_rgba(15,23,42,0.10)] backdrop-blur xl:p-10">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-4 py-1 text-sm font-medium text-orange-700">
              Next.js + NestJS + Prisma + PostgreSQL
            </div>
            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                Ship local auth flows with a real API and a real database.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                This page is wired directly to the Nest API over cookies, backed
                by Prisma and PostgreSQL, and ready for local Docker development
                or production env overrides.
              </p>
            </div>
          </div>

          <div className="grid gap-4 pt-8 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                Frontend
              </p>
              <p className="mt-3 text-2xl font-semibold">Next 16</p>
              <p className="mt-2 text-sm text-slate-600">
                Client-side auth UI using credentials-based fetch calls.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                Backend
              </p>
              <p className="mt-3 text-2xl font-semibold">Nest + Swagger</p>
              <p className="mt-2 text-sm text-slate-600">
                JWT cookie auth, guarded profile routes, documented at{" "}
                <a
                  className="font-medium text-cyan-700 underline decoration-cyan-300 underline-offset-4"
                  href={`${API_BASE_URL}/docs`}
                  rel="noreferrer"
                  target="_blank"
                >
                  /docs
                </a>
                .
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                Database
              </p>
              <p className="mt-3 text-2xl font-semibold">PostgreSQL 18.3</p>
              <p className="mt-2 text-sm text-slate-600">
                Compose-managed database with persistent storage and Prisma
                migrations.
              </p>
            </div>
          </div>
        </section>

        <section className="w-full max-w-xl rounded-[32px] border border-slate-200/80 bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                User access
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {user ? "Your account" : "Create or access your account"}
              </h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
              API: {API_BASE_URL}
            </div>
          </div>

          {error ? (
            <div className="mb-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="mb-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {message}
            </div>
          ) : null}

          {isBootstrapping ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
              Checking your active session...
            </div>
          ) : user ? (
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

              <form className="space-y-4" onSubmit={handleProfileSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm text-slate-200">
                    <span>Name</span>
                    <input
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      value={profileForm.name}
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-200">
                    <span>Email</span>
                    <input
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
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
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    placeholder="Leave blank to keep your current password"
                    type="password"
                    value={profileForm.password}
                  />
                </label>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    className="rounded-full bg-cyan-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isBusy}
                    type="submit"
                  >
                    {isBusy ? "Saving..." : "Save profile"}
                  </button>
                  <button
                    className="rounded-full border border-white/15 px-5 py-3 font-medium text-white transition hover:border-white/30 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isBusy}
                    onClick={handleLogout}
                    type="button"
                  >
                    Logout
                  </button>
                  <button
                    className="rounded-full border border-rose-400/30 px-5 py-3 font-medium text-rose-200 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isBusy}
                    onClick={handleDeleteAccount}
                    type="button"
                  >
                    Delete account
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
                <button
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    mode === "signup"
                      ? "bg-white text-slate-950"
                      : "text-slate-300 hover:text-white"
                  }`}
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                    setMessage(null);
                  }}
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
                  onClick={() => {
                    setMode("login");
                    setError(null);
                    setMessage(null);
                  }}
                  type="button"
                >
                  Log in
                </button>
              </div>

              <form className="space-y-4" onSubmit={handleAuthSubmit}>
                {mode === "signup" ? (
                  <label className="space-y-2 text-sm text-slate-200">
                    <span>Name</span>
                    <input
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-orange-300"
                      onChange={(event) =>
                        setAuthForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Casey Morgan"
                      value={authForm.name}
                    />
                  </label>
                ) : null}

                <label className="space-y-2 text-sm text-slate-200">
                  <span>Email</span>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-orange-300"
                    onChange={(event) =>
                      setAuthForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
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
                    onChange={(event) =>
                      setAuthForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
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
                  {isBusy
                    ? "Working..."
                    : mode === "signup"
                      ? "Create account"
                      : "Log in"}
                </button>
              </form>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm leading-7 text-slate-300">
                <p>
                  The browser talks directly to the Nest API with{" "}
                  <code className="rounded bg-white/10 px-1 py-0.5 text-slate-100">
                    credentials: include
                  </code>
                  , while the API stores your signed JWT in an HttpOnly cookie.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
