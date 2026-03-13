export type GitHubRepository = {
  name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  private: boolean;
  fork: boolean;
  archived: boolean;
  stargazers_count: number;
  created_at: string;
  updated_at: string;
  owner: {
    login: string;
  };
};

export type ProjectCard = {
  badge?: string;
  badgeClassName?: string;
  title: string;
  description: string;
  tag: string;
  tagClassName?: string;
  tiltClassName: string;
  href: string;
  meta: string;
  githubUrl: string;
  liveUrl?: string;
  coverImageUrl?: string;
};

export type LabLogEntry = {
  title: string;
  date: string;
  summary: string;
  borderClassName: string;
};

export type LaboratoryStatus = {
  metrics: Array<{
    label: string;
    valueLabel: string;
    widthPercent: number;
    barClassName: string;
  }>;
  note: string;
};

function getGitHubHeaders() {
  const token = process.env.GITHUB_TOKEN?.trim();
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "labs-pradipto",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function hasGitHubToken() {
  return Boolean(process.env.GITHUB_TOKEN?.trim());
}

function formatRepoDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function normalizeHomepage(homepage: string | null) {
  if (!homepage) {
    return undefined;
  }

  const trimmed = homepage.trim();

  if (!trimmed) {
    return undefined;
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function isVercelDeploymentUrl(url?: string) {
  if (!url) {
    return false;
  }

  try {
    const { hostname } = new URL(url);
    return hostname === "vercel.app" || hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

const COVER_IMAGE_CANDIDATES = [
  "public/cover.png",
  "public/cover.jpg",
  "public/cover.jpeg",
  "public/cover.webp",
  "public/cover.avif",
  "public/og-image.png",
  "public/og-image.jpg",
  "public/og-image.jpeg",
  "public/og-image.webp",
] as const;

async function findRepositoryCoverImage(
  repository: GitHubRepository,
): Promise<string | undefined> {
  const headers = getGitHubHeaders();

  for (const path of COVER_IMAGE_CANDIDATES) {
    const response = await fetch(
      `https://api.github.com/repos/${repository.owner.login}/${repository.name}/contents/${path}`,
      {
        headers,
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        continue;
      }

      break;
    }

    const params = new URLSearchParams({
      owner: repository.owner.login,
      repo: repository.name,
      path,
    });

    return `/api/github-cover?${params.toString()}`;
  }

  return undefined;
}

export async function buildProjectCards(
  repositories: GitHubRepository[],
): Promise<ProjectCard[]> {
  const coverImageUrls = await Promise.all(
    repositories.map((repository) => findRepositoryCoverImage(repository)),
  );

  return repositories.map((repository, index) => {
    let badge = "NEW";
    let badgeClassName =
      "absolute -top-4 -right-4 z-20 rotate-12 rounded bg-[var(--color-primary)] px-2 py-1 text-[10px] font-bold text-white";

    if (repository.archived) {
      badge = "ARCHIVED";
      badgeClassName =
        "absolute -top-4 left-4 z-20 -rotate-6 rounded bg-slate-500 px-2 py-1 text-[10px] font-bold text-white";
    } else if (repository.fork) {
      badge = "FORK";
      badgeClassName =
        "absolute -top-4 left-4 z-20 -rotate-6 rounded bg-slate-800 px-2 py-1 text-[10px] font-bold text-white";
    } else if (
      Date.now() - new Date(repository.created_at).getTime() >
      1000 * 60 * 60 * 24 * 90
    ) {
      badge = "ACTIVE";
    }

    const tag =
      repository.topics?.[0] ??
      repository.language?.toLowerCase().replace(/\s+/g, "_") ??
      "repository";

    return {
      badge,
      badgeClassName,
      title: repository.name
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (match) => match.toUpperCase()),
      description:
        repository.description ??
        "Project synced from GitHub. Add a repository description to improve this card.",
      tag: `#${tag}`,
      tagClassName: repository.archived ? "text-slate-400" : undefined,
      tiltClassName: index % 2 === 0 ? "tilted-left" : "tilted-right",
      href: normalizeHomepage(repository.homepage) || repository.html_url,
      meta: repository.stargazers_count
        ? `${repository.stargazers_count} star${
            repository.stargazers_count === 1 ? "" : "s"
          }`
        : `Updated ${formatRepoDate(repository.updated_at)}`,
      githubUrl: repository.html_url,
      liveUrl: normalizeHomepage(repository.homepage),
      coverImageUrl: coverImageUrls[index],
    };
  });
}

export async function getGitHubRepositories(username?: string) {
  if (!username) {
    return [];
  }

  const headers = getGitHubHeaders();
  const useAuthenticatedRepoEndpoint = hasGitHubToken();
  const repositories: GitHubRepository[] = [];
  let page = 1;

  while (true) {
    const endpoint = useAuthenticatedRepoEndpoint
      ? `https://api.github.com/user/repos?affiliation=owner&visibility=all&sort=created&direction=desc&per_page=100&page=${page}`
      : `https://api.github.com/users/${username}/repos?sort=created&direction=desc&per_page=100&page=${page}`;
    const response = await fetch(
      endpoint,
      {
        headers,
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) {
      return [];
    }

    const batch = (await response.json()) as GitHubRepository[];
    repositories.push(
      ...batch.filter((repository) =>
        useAuthenticatedRepoEndpoint ? true : !repository.private,
      ),
    );

    if (batch.length < 100) {
      break;
    }

    page += 1;
  }

  return repositories;
}

export async function getGitHubProjectCards(username?: string) {
  const repositories = await getGitHubRepositories(username);
  return await buildProjectCards(
    repositories.filter((repository) =>
      isVercelDeploymentUrl(normalizeHomepage(repository.homepage)),
    ),
  );
}

export function buildLabLogEntries(
  repositories: GitHubRepository[],
): LabLogEntry[] {
  return [...repositories]
    .sort(
      (left, right) =>
        new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime(),
    )
    .slice(0, 3)
    .map((repository, index) => {
      const title = repository.archived
        ? `Archived: ${repository.name}`
        : repository.fork
          ? `Fork Updated: ${repository.name}`
          : `Project Update: ${repository.name}`;

      const languageLabel = repository.language
        ? `${repository.language} stack`
        : "repository";
      const summary =
        repository.description ??
        `${repository.name} was updated on GitHub. Latest changes are now reflected in the archive and activity graph.`;

      return {
        title,
        date: formatRepoDate(repository.updated_at),
        summary: `${summary} ${languageLabel}.`,
        borderClassName:
          index === 0 ? "border-[var(--color-primary)]" : "border-slate-300",
      };
    });
}

export function buildLaboratoryStatus(
  repositories: GitHubRepository[],
): LaboratoryStatus {
  if (repositories.length === 0) {
    return {
      metrics: [
        {
          label: "Sync Status",
          valueLabel: "Waiting",
          widthPercent: 18,
          barClassName: "bg-slate-400",
        },
        {
          label: "Experiment Queue",
          valueLabel: "Empty",
          widthPercent: 12,
          barClassName: "bg-red-400",
        },
      ],
      note: "Waiting for GitHub data before the lab instruments wake up.",
    };
  }

  const now = Date.now();
  const activeLast30Days = repositories.filter((repository) => {
    return now - new Date(repository.updated_at).getTime() <= 1000 * 60 * 60 * 24 * 30;
  }).length;
  const withLiveLinks = repositories.filter((repository) => repository.homepage?.trim()).length;
  const archivedCount = repositories.filter((repository) => repository.archived).length;

  const activityScore = Math.min(
    100,
    Math.round((activeLast30Days / repositories.length) * 100) || 0,
  );
  const deployScore = Math.min(
    100,
    Math.round((withLiveLinks / repositories.length) * 100) || 0,
  );
  const freshnessScore = Math.max(
    8,
    100 - Math.round((archivedCount / repositories.length) * 100),
  );

  const activityLabel =
    activityScore > 66 ? "High" : activityScore > 33 ? "Steady" : "Low";
  const deployLabel =
    deployScore > 66 ? "Healthy" : deployScore > 33 ? "Growing" : "Sparse";
  const freshnessLabel =
    freshnessScore > 66 ? "Fresh" : freshnessScore > 33 ? "Stable" : "Aging";

  const mostRecentRepository = [...repositories].sort(
    (left, right) =>
      new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime(),
  )[0];

  return {
    metrics: [
      {
        label: "Repo Activity",
        valueLabel: activityLabel,
        widthPercent: activityScore,
        barClassName: "bg-[var(--color-primary)]",
      },
      {
        label: "Live Deploys",
        valueLabel: deployLabel,
        widthPercent: Math.max(10, deployScore),
        barClassName: "bg-emerald-500",
      },
      {
        label: "Freshness",
        valueLabel: freshnessLabel,
        widthPercent: freshnessScore,
        barClassName: "bg-sky-500",
      },
    ],
    note: `Latest movement came from ${mostRecentRepository.name.replace(/[-_]/g, " ")}. ${
      withLiveLinks > 0
        ? `${withLiveLinks} project${withLiveLinks === 1 ? "" : "s"} already have live links.`
        : "No live deployment links are wired yet."
    }`,
  };
}
