import Link from "next/link";
import { getGitHubProjectCards } from "@/lib/github";

export const metadata = {
  title: "The Archive",
  description: "Projects synced from GitHub that include a deployed Vercel link.",
};

export default async function ArchivePage() {
  const githubUsername = process.env.GITHUB_USERNAME?.trim();
  const projects = await getGitHubProjectCards(githubUsername);

  return (
    <div className="paper-texture min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-20 lg:py-12">
        <header className="mb-12 flex flex-col gap-6 lg:mb-16 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[var(--color-primary)]">
              The Archive
            </p>
            <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-7xl">
              GitHub projects with deployed Vercel links, collected in one place.
            </h1>
          </div>
          <div className="max-w-xl text-sm leading-6 text-slate-500">
            Repositories appear here automatically when their GitHub homepage
            field points to a deployed Vercel URL. Each card keeps both the
            GitHub source and the live deployment link.
          </div>
        </header>

        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-hand text-xl text-slate-400 sm:text-2xl">
            Synced from GitHub, refreshed hourly
          </p>
          <Link
            className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] sm:w-auto sm:py-2"
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
                className={`${project.tiltClassName} index-card-shadow relative rounded-sm border border-slate-200 bg-[#fffcf7] p-5 sm:p-6`}
              >
                {project.badge && project.badgeClassName ? (
                  <div className={project.badgeClassName}>{project.badge}</div>
                ) : null}
                <div className="relative mb-6 flex aspect-[4/3] w-full items-end overflow-hidden rounded-sm border border-slate-100 bg-[linear-gradient(135deg,#23180f_0%,#4a3422_45%,#f06c00_100%)] p-5">
                  {project.coverImageUrl ? (
                    <>
                      <img
                        className="absolute inset-0 h-full w-full object-cover"
                        alt={`${project.title} cover image`}
                        src={project.coverImageUrl}
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.7))]" />
                    </>
                  ) : null}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.24),transparent_36%)]" />
                  <div className="relative z-10">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/70">
                      GitHub Repository
                    </p>
                    <h2 className="max-w-[12rem] text-2xl font-bold text-white sm:text-3xl">
                      {project.title}
                    </h2>
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-bold sm:text-2xl">{project.title}</h3>
                <p className="mb-6 text-sm leading-relaxed text-slate-500 sm:min-h-20">
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
            Connect `GITHUB_USERNAME` and a valid `GITHUB_TOKEN`, then add a
            Vercel deployment URL to a repository homepage to show it here.
          </section>
        )}
      </main>
    </div>
  );
}
