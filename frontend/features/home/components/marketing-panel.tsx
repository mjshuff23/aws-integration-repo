import Link from "next/link";
import { API_BASE_URL } from "@/lib/env/api-base-url";

export function MarketingPanel() {
  return (
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
            This page is wired directly to the Nest API over cookies, backed by
            Prisma and PostgreSQL, and ready for local Docker runs or an ECS +
            RDS deployment behind a single `/api` origin.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              href="/architecture"
            >
              View architecture
            </Link>
            <a
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
              href={`${API_BASE_URL}/docs`}
              rel="noreferrer"
              target="_blank"
            >
              Open API docs
            </a>
          </div>
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
            Local Compose in development, Amazon RDS in production, both
            accessed through the same Prisma schema and migrations.
          </p>
        </div>
      </div>
    </section>
  );
}
