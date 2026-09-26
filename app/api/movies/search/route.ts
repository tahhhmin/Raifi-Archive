import { NextRequest, NextResponse } from "next/server";
import { tmdbFetch } from "@/lib/utils/tmdb";

type MovieSearchResponse = {
  results: {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: string;
    vote_average: number;
  }[];
};

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");

  if (!query?.trim()) {
    return NextResponse.json(
      { error: "Search query is required." },
      { status: 400 }
    );
  }

  try {
    const data = await tmdbFetch<MovieSearchResponse>("/search/movie", {
      query: query.trim(),
      language: "en-US",
      page: "1",
      include_adult: "false",
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("TMDB movie search error:", error);

    return NextResponse.json(
      { error: "Failed to search movies." },
      { status: 500 }
    );
  }
}