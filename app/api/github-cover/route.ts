import { NextResponse } from "next/server";

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

type GitHubContentResponse = {
  content?: string;
  encoding?: string;
  download_url?: string | null;
  type?: string;
};

function getContentType(path: string) {
  const lowerPath = path.toLowerCase();

  if (lowerPath.endsWith(".png")) {
    return "image/png";
  }

  if (lowerPath.endsWith(".jpg") || lowerPath.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  if (lowerPath.endsWith(".webp")) {
    return "image/webp";
  }

  if (lowerPath.endsWith(".avif")) {
    return "image/avif";
  }

  if (lowerPath.endsWith(".gif")) {
    return "image/gif";
  }

  return "application/octet-stream";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner")?.trim();
  const repo = searchParams.get("repo")?.trim();
  const path = searchParams.get("path")?.trim();

  if (!owner || !repo || !path) {
    return NextResponse.json(
      { error: "Missing owner, repo, or path query parameter." },
      { status: 400 },
    );
  }

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      headers: getGitHubHeaders(),
      next: { revalidate: 3600 },
    },
  );

  if (!response.ok) {
    return new NextResponse("Cover image not found.", { status: response.status });
  }

  const payload = (await response.json()) as GitHubContentResponse;

  if (payload.type !== "file") {
    return new NextResponse("Requested path is not a file.", { status: 400 });
  }

  if (payload.encoding === "base64" && payload.content) {
    const body = Buffer.from(payload.content.replace(/\n/g, ""), "base64");

    return new NextResponse(body, {
      headers: {
        "Content-Type": getContentType(path),
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  }

  if (payload.download_url) {
    const assetResponse = await fetch(payload.download_url, {
      headers: getGitHubHeaders(),
      next: { revalidate: 3600 },
    });

    if (!assetResponse.ok) {
      return new NextResponse("Unable to fetch cover image.", {
        status: assetResponse.status,
      });
    }

    return new NextResponse(assetResponse.body, {
      headers: {
        "Content-Type":
          assetResponse.headers.get("Content-Type") ?? getContentType(path),
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  }

  return new NextResponse("Unsupported GitHub content response.", { status: 502 });
}
