import Link from "next/link";
import { getGitHubProjectCards } from "@/lib/github";

export const metadata = {
  title: "The Archive",
  description: "Every public project synced from GitHub, with live links when available.",
};

export default async function ArchivePage() {
  const githubUsername = process.env.GITHUB_USERNAME?.trim();
  const projects = await getGitHubProjectCards(githubUsername);

  return (
    <div className="paper-texture min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-20">
        <header className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[var(--color-primary)]">
              The Archive
            </p>
            <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-slate-900 lg:text-7xl">
              Every public GitHub project, collected in one place.
            </h1>
          </div>
          <div className="max-w-xl text-sm leading-6 text-slate-500">
            New repositories appear here automatically. If a repository has a
            live deployment URL in its GitHub homepage field, the card includes
            an `Open Live` action alongside the GitHub link.
          </div>
        </header>

        <div className="mb-10 flex items-center justify-between gap-4">
          <p className="font-hand text-2xl text-slate-400">
            Synced from GitHub, refreshed hourly
          </p>
          <Link
            className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            href="/"
          >
            Back to Home
          </Link>
        </div>

        {projects.length > 0 ? (
          <section className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
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
                    <h2 className="max-w-[12rem] text-3xl font-bold text-white">
                      {project.title}
                    </h2>
                  </div>
                </div>
                <h3 className="mb-2 text-2xl font-bold">{project.title}</h3>
                <p className="mb-6 min-h-20 text-sm leading-relaxed text-slate-500">
                  {project.description}
                </p>
                <div className="mb-6 border-t border-dashed border-slate-200 pt-4">
                  <span
                    className={`font-hand text-lg ${project.tagClassName ?? "text-[var(--color-primary)]"}`}
                  >
                    {project.tag}
                  </span>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {project.meta}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View GitHub
                  </a>
                  {project.liveUrl ? (
                    <a
                      className="rounded-lg border border-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-primary)] hover:bg-[color:rgb(240_108_0_/_0.08)]"
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open Live
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="index-card-shadow rounded-sm border border-dashed border-slate-300 bg-[#fffcf7] p-8 text-slate-500">
            Connect `GITHUB_USERNAME` and a valid `GITHUB_TOKEN` to load the archive.
          </section>
        )}
      </main>
    </div>
  );
}
