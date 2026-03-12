import Image from "next/image";
import Link from "next/link";
import GitHubContributionGraph from "./GitHubContributionGraph";
import DropNoteDialog from "./DropNoteDialog";
import {
  buildLabLogEntries,
  buildLaboratoryStatus,
  getGitHubProjectCards,
  getGitHubRepositories,
} from "@/lib/github";

type IconName =
  | "science"
  | "arrow-down"
  | "folder"
  | "arrow-right"
  | "history"
  | "pin"
  | "status"
  | "email"
  | "share";

function Icon({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  const base = "inline-block shrink-0";

  switch (name) {
    case "science":
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={`${base} ${className}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 2v5l-5.5 9.5A3 3 0 0 0 7.1 21h9.8a3 3 0 0 0 2.6-4.5L14 7V2" />
          <path d="M8.5 12h7" />
        </svg>
      );
    case "arrow-down":
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={`${base} ${className}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14" />
          <path d="m6 13 6 6 6-6" />
        </svg>
      );
    case "folder":
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={`${base} ${className}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z" />
        </svg>
      );
    case "arrow-right":
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={`${base} ${className}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );
    case "history":
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={`${base} ${className}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v4h4" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "pin":
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={`${base} ${className}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m14 9 6-6" />
          <path d="m8 15-4 4" />
          <path d="m10 14 6-6" />
          <path d="m8.5 6.5 9 9" />
        </svg>
      );
    case "status":
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={`${base} ${className}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="4" y="6" width="6" height="5" rx="1" />
          <rect x="14" y="6" width="6" height="5" rx="1" />
          <rect x="9" y="13" width="6" height="5" rx="1" />
          <path d="M10 8.5h4" />
          <path d="M12 11v2" />
        </svg>
      );
    case "email":
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={`${base} ${className}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 6h16v12H4z" />
          <path d="m5 7 7 6 7-6" />
        </svg>
      );
    case "share":
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={`${base} ${className}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="18" cy="5" r="2.5" />
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="18" cy="19" r="2.5" />
          <path d="m8.3 10.9 7.3-4.1" />
          <path d="m8.3 13.1 7.3 4.1" />
        </svg>
      );
  }
}

export default async function Home() {
  const githubUsername = process.env.GITHUB_USERNAME?.trim();
  const contactEmail = process.env.CONTACT_EMAIL?.trim();
  const profileHref = githubUsername
    ? `https://github.com/${githubUsername}`
    : "#github-graph";
  const repositories = await getGitHubRepositories(githubUsername);
  const recentProjects = (await getGitHubProjectCards(githubUsername)).slice(0, 3);
  const logEntries = buildLabLogEntries(repositories);
  const laboratoryStatus = buildLaboratoryStatus(repositories);

  return (
    <div className="paper-texture min-h-screen bg-background text-foreground">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        <div className="flex min-h-screen flex-col">
          <header className="flex items-center justify-between px-6 py-6 lg:px-20">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg border border-[color:rgb(240_108_0_/_0.2)] bg-[color:rgb(240_108_0_/_0.1)]">
                <Icon name="science" className="size-5 text-[var(--color-primary)]" />
              </div>
              <h1 className="font-hand text-4xl tracking-tight text-[var(--color-primary)]">
                Labs
              </h1>
            </div>
            <nav className="hidden items-center gap-10 md:flex">
              <Link className="text-sm font-medium text-slate-600 hover:text-[var(--color-primary)]" href="/archive">
                The Archive
              </Link>
              <a className="text-sm font-medium text-slate-600 hover:text-[var(--color-primary)]" href="#lab-log">
                Lab Log
              </a>
              <a className="text-sm font-medium text-slate-600 hover:text-[var(--color-primary)]" href="#github-graph">
                GitHub Graph
              </a>
              <DropNoteDialog recipientEmail={contactEmail} />
            </nav>
          </header>

          <main className="mx-auto flex-1 w-full max-w-7xl px-6 py-12 lg:px-20">
            <section className="relative mb-24">
              <div className="flex flex-col items-center gap-12 lg:flex-row">
                <div className="z-10 flex-1 space-y-6">
                  <div className="inline-block rounded-full border border-[color:rgb(240_108_0_/_0.2)] bg-[color:rgb(240_108_0_/_0.1)] px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-[var(--color-primary)]">
                    Currently Testing
                  </div>
                  <h2 className="max-w-4xl text-5xl leading-[1.1] font-bold tracking-tight text-slate-900 lg:text-7xl">
                    Labs: A personal workshop by{" "}
                    <span className="font-hand italic text-[var(--color-primary)]">
                      Pradipto
                    </span>
                    .
                  </h2>
                  <p className="max-w-xl text-xl leading-relaxed text-slate-500">
                    Where I test my wilder ideas with{" "}
                    <span className="font-bold text-slate-800 underline decoration-[color:rgb(240_108_0_/_0.4)]">
                      Vibecode
                    </span>
                    . A living repository of digital experiments and unfinished thoughts.
                  </p>
                  <div className="flex gap-4">
                    <Link className="flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-4 font-bold text-white hover:bg-slate-800" href="/archive">
                      Browse the Vault
                      <Icon name="arrow-down" className="size-5" />
                    </Link>
                  </div>
                </div>

                <div className="relative flex-1">
                  <div className="tilted-right relative aspect-square w-full overflow-hidden rounded-sm border-8 border-white bg-white shadow-xl">
                    <Image
                      fill
                      className="h-full w-full object-cover grayscale-[0.3] duration-700 hover:grayscale-0"
                      alt="Close up of a messy wooden workbench with electronic parts"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-c3cg6x-sE9mXuw8-Qm6Nig8gYqxphmEfwRRJIyTAeuhX3OAQ50_HTbckUoPA-eNdfZFmeanEASdGOc1CgjALe4ngvZzHbSjqcPJ1Mdg159rOiwl0HQavyRG-kBjMBngf0ZTuyD48SUjs-cXxcSlGOE7KeP0BoqZoq2a9kqZoX1Db46zGlEHiY25t0xFPNGT8fZAWpk2sSk7vSdtkdymTEGQpq9WQnVDYY1ogsmkQ_-K-XoexspmPyhmP423uqsLDNdl0ZveM6DXd"
                      sizes="(min-width: 1024px) 40vw, 100vw"
                    />
                    <div className="font-hand absolute right-4 bottom-4 rounded border border-slate-100 bg-white/90 px-4 py-2 text-xl text-slate-800 backdrop-blur">
                      &quot;Mid-process chaos&quot;
                    </div>
                  </div>
                  <div className="absolute -top-6 -left-6 -z-10 h-32 w-32 rounded-full bg-[color:rgb(240_108_0_/_0.1)] blur-3xl" />
                </div>
              </div>
            </section>

            <section id="archive" className="mb-24 scroll-mt-24">
              <div className="mb-12 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-2xl font-bold">
                  <Icon name="folder" className="size-6 text-[var(--color-primary)]" />
                  Recent Projects
                </h3>
                <div className="mx-8 hidden h-px flex-1 bg-slate-200 md:block" />
                <p className="font-hand text-xl text-slate-400">Latest from GitHub</p>
              </div>

              {recentProjects.length > 0 ? (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {recentProjects.map((project) => (
                    <article
                      key={project.githubUrl}
                      className={`${project.tiltClassName} index-card-shadow relative rounded-sm border border-slate-200 bg-[#fffcf7] p-6`}
                    >
                      {project.badge && project.badgeClassName ? (
                        <div className={project.badgeClassName}>{project.badge}</div>
                      ) : null}
                      <div className="relative mb-6 flex aspect-[4/3] w-full items-end overflow-hidden rounded-sm border border-slate-100 bg-[linear-gradient(135deg,#23180f_0%,#4a3422_45%,#f06c00_100%)] p-5">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.24),transparent_36%)]" />
                        <div className="relative z-10">
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/70">
                            GitHub Repository
                          </p>
                          <h4 className="max-w-[12rem] text-3xl font-bold text-white">
                            {project.title}
                          </h4>
                        </div>
                      </div>
                      <h4 className="mb-2 text-2xl font-bold">{project.title}</h4>
                      <p className="mb-6 text-sm leading-relaxed text-slate-500">
                        {project.description}
                      </p>
                      <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-4">
                        <div>
                          <span
                            className={`font-hand text-lg ${project.tagClassName ?? "text-[var(--color-primary)]"}`}
                          >
                            {project.tag}
                          </span>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                            {project.meta}
                          </p>
                        </div>
                        <a
                          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                          href={project.href}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="index-card-shadow rounded-sm border border-dashed border-slate-300 bg-[#fffcf7] p-8 text-slate-500">
                  Connect `GITHUB_USERNAME` and a valid `GITHUB_TOKEN` to load recent repositories here.
                </div>
              )}

            </section>

            <section id="github-graph" className="mb-24 scroll-mt-24">
              <div className="mb-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-[var(--color-primary)]">
                    Live Repository Signal
                  </p>
                  <h3 className="text-3xl font-bold text-slate-900">
                    GitHub activity, rendered on the site
                  </h3>
                </div>
                <p className="max-w-xl text-sm leading-6 text-slate-500">
                  This graph fetches the last year of contribution data from GitHub through a server-side API route, so the token never reaches the browser.
                </p>
              </div>

              <div className="mb-8 flex items-center justify-between rounded-[1.5rem] border border-slate-200 bg-white/80 p-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                    Current Snapshot
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {repositories.length} public repositories
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Browse the full archive for every project and live deployment link.
                  </p>
                </div>
                <Link
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                  href="/archive"
                >
                  Open The Archives
                  <Icon name="arrow-right" className="size-5" />
                </Link>
              </div>

              <GitHubContributionGraph username={githubUsername} />
            </section>

            <section id="lab-log" className="grid grid-cols-1 items-start gap-12 scroll-mt-24 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <h3 className="mb-8 flex items-center gap-2 text-2xl font-bold">
                  <Icon name="history" className="size-6 text-[var(--color-primary)]" />
                  Lab Log
                </h3>
                <div className="space-y-4">
                  {logEntries.length > 0 ? (
                    logEntries.map((entry) => (
                      <article
                        key={`${entry.title}-${entry.date}`}
                        className={`border-l-4 ${entry.borderClassName} bg-white p-6 shadow-sm hover:shadow-md`}
                      >
                        <div className="mb-2 flex items-start justify-between gap-4">
                          <h5 className="text-lg font-bold">{entry.title}</h5>
                          <span className="text-xs font-bold uppercase text-slate-400">
                            {entry.date}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{entry.summary}</p>
                      </article>
                    ))
                  ) : (
                    <article className="border-l-4 border-slate-300 bg-white p-6 shadow-sm">
                      <div className="mb-2 flex items-start justify-between gap-4">
                        <h5 className="text-lg font-bold">Log Awaiting Sync</h5>
                        <span className="text-xs font-bold uppercase text-slate-400">
                          Pending
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        Connect `GITHUB_USERNAME` and a valid `GITHUB_TOKEN` to
                        generate live lab log entries from recent repository activity.
                      </p>
                    </article>
                  )}
                </div>
              </div>

              <aside className="relative overflow-hidden rounded-lg border border-[#dfd6c0] bg-[#efeadf] p-8 shadow-inner">
                <div className="absolute top-2 right-2 rotate-12 text-slate-300">
                  <Icon name="pin" className="size-16 opacity-20" />
                </div>
                <h3 className="mb-6 flex items-center gap-2 text-xl font-bold">
                  <Icon name="status" className="size-4 text-[var(--color-primary)]" />
                  Laboratory Status
                </h3>
                <div className="relative space-y-6">
                  {laboratoryStatus.metrics.map((metric) => (
                    <div key={metric.label} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase text-slate-500">
                        <span>{metric.label}</span>
                        <span>{metric.valueLabel}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full ${metric.barClassName}`}
                          style={{ width: `${metric.widthPercent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="mt-6 border-t border-slate-300/50 pt-4">
                    <p className="font-hand text-2xl leading-tight text-slate-700">
                      &quot;{laboratoryStatus.note}&quot;
                    </p>
                  </div>
                </div>
              </aside>
            </section>
          </main>

          <footer id="contact" className="mt-20 scroll-mt-24 border-t border-slate-200 px-6 py-12 lg:px-20">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
              <div className="max-w-md">
                <p className="font-hand mb-2 text-2xl italic text-slate-400">
                  A simple note on the process:
                </p>
                <p className="text-sm leading-relaxed text-slate-500">
                  These labs represent the messy, unpolished, and honest exploration of what&apos;s possible when we stop worrying about &quot;production-ready&quot; and start focusing on &quot;human-ready&quot;. Everything here is a work in progress, much like the person who built it.
                </p>
              </div>
              <div className="flex items-center gap-6">
                <a
                  className="flex size-10 items-center justify-center rounded-full border border-slate-100 bg-white shadow-sm hover:text-[var(--color-primary)]"
                  href="mailto:?subject=Drop%20a%20Note&body=I%20was%20looking%20through%20the%20Labs%20site..."
                >
                  <Icon name="email" className="size-5" />
                </a>
                <a
                  className="flex size-10 items-center justify-center rounded-full border border-slate-100 bg-white shadow-sm hover:text-[var(--color-primary)]"
                  href={profileHref}
                  target={profileHref.startsWith("http") ? "_blank" : undefined}
                  rel={profileHref.startsWith("http") ? "noreferrer" : undefined}
                >
                  <Icon name="share" className="size-5" />
                </a>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                    Handcrafted in
                  </p>
                  <p className="font-hand text-xl text-[var(--color-primary)]">
                    The Workshop, 2026
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
