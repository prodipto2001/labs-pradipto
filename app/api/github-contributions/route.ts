import { NextResponse } from "next/server";

const GITHUB_CONTRIBUTIONS_QUERY = `
  query Contributions($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          months {
            firstDay
            name
            totalWeeks
            year
          }
          weeks {
            firstDay
            contributionDays {
              color
              contributionCount
              contributionLevel
              date
              weekday
            }
          }
        }
      }
    }
  }
`;

type GitHubGraphQLResponse = {
  data?: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          months: Array<{
            firstDay: string;
            name: string;
            totalWeeks: number;
            year: number;
          }>;
          weeks: Array<{
            firstDay: string;
            contributionDays: Array<{
              color: string;
              contributionCount: number;
              contributionLevel: string;
              date: string;
              weekday: number;
            }>;
          }>;
        };
      };
    } | null;
  };
  errors?: Array<{
    message: string;
  }>;
};

function getDateRange() {
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - 364);

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedUsername = searchParams.get("username")?.trim();
  const username = requestedUsername || process.env.GITHUB_USERNAME?.trim();
  const token = process.env.GITHUB_TOKEN?.trim();

  if (!username || !token) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Set GITHUB_USERNAME and GITHUB_TOKEN to enable the GitHub contributions graph.",
        requiresSetup: true,
      },
      { status: 503 },
    );
  }

  const { from, to } = getDateRange();

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "labs-pradipto",
    },
    body: JSON.stringify({
      query: GITHUB_CONTRIBUTIONS_QUERY,
      variables: {
        login: username,
        from,
        to,
      },
    }),
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `GitHub API request failed with status ${response.status}.`,
      },
      { status: response.status },
    );
  }

  const payload = (await response.json()) as GitHubGraphQLResponse;

  if (payload.errors?.length) {
    return NextResponse.json(
      {
        ok: false,
        error: payload.errors[0]?.message ?? "GitHub returned an unknown error.",
      },
      { status: 502 },
    );
  }

  const calendar = payload.data?.user?.contributionsCollection.contributionCalendar;

  if (!calendar) {
    return NextResponse.json(
      {
        ok: false,
        error: `No contribution calendar found for ${username}.`,
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    username,
    profileUrl: `https://github.com/${username}`,
    range: { from, to },
    totalContributions: calendar.totalContributions,
    months: calendar.months,
    weeks: calendar.weeks,
    fetchedAt: new Date().toISOString(),
  });
}
