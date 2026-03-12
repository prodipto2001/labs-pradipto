"use client";

import { useEffect, useState } from "react";

type ContributionDay = {
  color: string;
  contributionCount: number;
  contributionLevel: string;
  date: string;
  weekday: number;
};

type ContributionWeek = {
  firstDay: string;
  contributionDays: ContributionDay[];
};

type ContributionMonth = {
  firstDay: string;
  name: string;
  totalWeeks: number;
  year: number;
};

type ContributionSuccess = {
  ok: true;
  username: string;
  profileUrl: string;
  totalContributions: number;
  months: ContributionMonth[];
  weeks: ContributionWeek[];
  fetchedAt: string;
  range: {
    from: string;
    to: string;
  };
};

type ContributionFailure = {
  ok: false;
  error: string;
  requiresSetup?: boolean;
};

type ContributionResponse = ContributionSuccess | ContributionFailure;

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function MonthLabels({
  months,
  totalWeeks,
}: {
  months: ContributionMonth[];
  totalWeeks: number;
}) {
  const monthColumns = months.reduce<
    Array<ContributionMonth & { startColumn: number }>
  >((accumulator, month) => {
    const previousMonth = accumulator[accumulator.length - 1];
    const startColumn = previousMonth
      ? previousMonth.startColumn + previousMonth.totalWeeks
      : 1;

    accumulator.push({
      ...month,
      startColumn,
    });

    return accumulator;
  }, []);

  return (
    <div
      className="mb-3 grid gap-2 text-xs uppercase tracking-[0.2em] text-slate-400"
      style={{ gridTemplateColumns: `repeat(${totalWeeks}, minmax(0, 1fr))` }}
    >
      {monthColumns.map((month) => (
        <div
          key={`${month.year}-${month.name}`}
          className="truncate"
          style={{ gridColumn: `${month.startColumn} / span ${month.totalWeeks}` }}
          title={`${month.name} ${month.year}`}
        >
          {month.name}
        </div>
      ))}
    </div>
  );
}

export default function GitHubContributionGraph({
  username,
}: {
  username?: string;
}) {
  const [data, setData] = useState<ContributionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadGraph() {
      try {
        setIsLoading(true);

        const query = username
          ? `?username=${encodeURIComponent(username)}`
          : "";
        const response = await fetch(`/api/github-contributions${query}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const payload = (await response.json()) as ContributionResponse;

        setData(payload);
      } catch (error) {
        if (!controller.signal.aborted) {
          setData({
            ok: false,
            error: error instanceof Error ? error.message : "Unable to load GitHub activity.",
          });
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadGraph();

    return () => controller.abort();
  }, [username]);

  if (isLoading) {
    return (
      <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
        <div className="mb-4 h-4 w-40 animate-pulse rounded-full bg-slate-200" />
        <div className="grid grid-cols-12 gap-2">
          {Array.from({ length: 84 }).map((_, index) => (
            <div
              key={index}
              className="aspect-square rounded-sm bg-slate-200/80"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data || !data.ok) {
    return (
      <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-6 text-slate-700 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
          GitHub Graph Unavailable
        </p>
        <p className="mt-3 text-sm leading-6">
          {data?.error ?? "The contribution graph could not be loaded."}
        </p>
        <p className="mt-3 text-sm text-slate-500">
          Add <code>GITHUB_USERNAME</code> and <code>GITHUB_TOKEN</code> to your
          local environment and refresh the page.
        </p>
      </div>
    );
  }

  const totalWeeks = data.weeks.length;

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
            Live from GitHub
          </p>
          <h4 className="text-2xl font-bold text-slate-900">
            {data.totalContributions} contributions in the last year
          </h4>
        </div>
        <a
          className="text-sm font-medium text-slate-500 underline decoration-slate-300 underline-offset-4 hover:text-[var(--color-primary)]"
          href={data.profileUrl}
          target="_blank"
          rel="noreferrer"
        >
          @{data.username} on GitHub
        </a>
      </div>

      <MonthLabels months={data.months} totalWeeks={totalWeeks} />

      <div className="flex gap-3">
        <div className="grid grid-rows-7 gap-1.5 pt-1 text-[11px] uppercase tracking-[0.2em] text-slate-400">
          <span className="h-2.5" />
          <span>Mon</span>
          <span className="h-2.5" />
          <span>Wed</span>
          <span className="h-2.5" />
          <span>Fri</span>
          <span className="h-2.5" />
        </div>

        <div
          className="grid min-w-0 flex-1 gap-1.5"
          style={{ gridTemplateColumns: `repeat(${totalWeeks}, minmax(0, 1fr))` }}
        >
          {data.weeks.map((week) => (
            <div
              key={week.firstDay}
              className="grid grid-rows-7 justify-items-center gap-1.5"
            >
              {week.contributionDays.map((day) => (
                <div
                  key={day.date}
                  className="size-2.5 rounded-[2px] ring-1 ring-black/5 transition-transform hover:scale-125"
                  style={{ backgroundColor: day.color }}
                  title={`${day.contributionCount} contribution${
                    day.contributionCount === 1 ? "" : "s"
                  } on ${formatDate(day.date)}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span>Less</span>
        <div className="flex items-center gap-2">
          {["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"].map(
            (color) => (
              <span
                key={color}
                className="size-3 rounded-[3px] ring-1 ring-black/5"
                style={{ backgroundColor: color }}
              />
            ),
          )}
        </div>
        <span>More</span>
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Window: {formatDate(data.range.from)} to {formatDate(data.range.to)}
      </p>
    </div>
  );
}
