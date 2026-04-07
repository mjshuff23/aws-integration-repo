import Link from "next/link";
import { API_BASE_URL } from "@/lib/env/api-base-url";

const requestFlow = [
  "CloudFront is the public entrypoint for browser traffic.",
  "The ALB receives the origin request and applies path-based routing.",
  "Requests for /api and /api/* go to the backend ECS service.",
  "All other paths go to the frontend ECS service.",
  "The backend reads Secrets Manager values and opens connections to RDS inside the VPC.",
];

const deployFlow = [
  "GitHub Actions builds frontend and backend images and pushes them to ECR.",
  "The workflow registers new ECS task definition revisions with updated image URIs.",
  "A one-off Fargate task runs Prisma migrations before the backend service rollout.",
  "ECS updates the backend and frontend services behind the existing ALB target groups.",
];

const keyTerraformFiles = [
  {
    file: "routing.tf",
    summary: "CloudFront, ALB, target groups, and the /api routing rule.",
  },
  {
    file: "ecs-task-definitions.tf",
    summary: "Container ports, runtime environment variables, and secret injection.",
  },
  {
    file: "ecs-services.tf",
    summary: "The ECS cluster, long-running services, and load balancer attachments.",
  },
  {
    file: "iam.tf",
    summary: "ECS task execution permissions and the GitHub OIDC deploy role.",
  },
];

export function ArchitecturePage() {
  const docsHref = `${API_BASE_URL}/docs`;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.15),_transparent_30%),radial-gradient(circle_at_85%_15%,_rgba(8,145,178,0.16),_transparent_28%),linear-gradient(180deg,_#fffbf5_0%,_#fffdf8_45%,_#f6fbff_100%)] px-6 py-10 text-slate-900 sm:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="rounded-[32px] border border-white/70 bg-white/85 p-8 shadow-[0_20px_80px_rgba(15,23,42,0.10)] backdrop-blur xl:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1 text-sm font-medium text-cyan-800">
              Terraform architecture view
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                href="/"
              >
                Home
              </Link>
              <a
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                href={docsHref}
                rel="noreferrer"
                target="_blank"
              >
                API docs
              </a>
              <a
                className="inline-flex items-center rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                href="/architecture/terraform-inframap.svg"
                rel="noreferrer"
                target="_blank"
              >
                Open raw SVG
              </a>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr,0.85fr]">
            <div className="space-y-5">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                One page for the AWS request path, service layout, and Terraform
                shape.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-slate-600">
                This route turns the current Terraform stack into a diagram you
                can browse alongside the runtime story: CloudFront to ALB, ECS
                services for frontend and backend, and the backend-only path to
                Secrets Manager and RDS.
              </p>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                    Source
                  </p>
                  <p className="mt-3 text-2xl font-semibold">Terraform state</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Generated from the current root module in{" "}
                    <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[0.85em] text-slate-800">
                      infra/terraform
                    </code>
                    .
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                    Diagram
                  </p>
                  <p className="mt-3 text-2xl font-semibold">Inframap</p>
                  <p className="mt-2 text-sm text-slate-600">
                    AWS-aware topology instead of the raw dependency graph.
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                    Refresh
                  </p>
                  <p className="mt-3 text-2xl font-semibold">One command</p>
                  <p className="mt-2 text-sm text-slate-600">
                    <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[0.85em] text-slate-800">
                      ./scripts/infra.sh diagram
                    </code>
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200/80 bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                Reading guide
              </p>
              <ol className="mt-5 space-y-4">
                <li className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  Start at CloudFront and the load balancer to understand the
                  public edge.
                </li>
                <li className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  Trace the split between the frontend and backend ECS services.
                </li>
                <li className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  Treat IAM as a documented concern in{" "}
                  <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-white">
                    iam.tf
                  </code>
                  ; the visual is strongest on network and service topology.
                </li>
              </ol>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
          <article className="rounded-[32px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                  Generated output
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Terraform infrastructure diagram
                </h2>
              </div>
              <a
                className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                href="/architecture/terraform-inframap.svg"
                rel="noreferrer"
                target="_blank"
              >
                View standalone
              </a>
            </div>
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4">
              {/* The generated SVG references sibling icon assets, so it must be served directly. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Terraform architecture diagram for the AWS learning stack"
                className="h-auto w-full"
                src="/architecture/terraform-inframap.svg"
              />
            </div>
          </article>

          <div className="grid gap-6">
            <section className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                Public request path
              </p>
              <ol className="mt-5 space-y-3">
                {requestFlow.map((step, index) => (
                  <li
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700"
                    key={step}
                  >
                    <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                Deploy loop
              </p>
              <ol className="mt-5 space-y-3">
                {deployFlow.map((step, index) => (
                  <li
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700"
                    key={step}
                  >
                    <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </section>

        <section className="rounded-[32px] border border-white/70 bg-white/85 p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur xl:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                Key Terraform files
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Where to read next
              </h2>
            </div>
            <div className="rounded-3xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-900">
              Regenerate this page asset after meaningful Terraform changes.
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {keyTerraformFiles.map((item) => (
              <article
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                key={item.file}
              >
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                  {item.file}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  {item.summary}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
