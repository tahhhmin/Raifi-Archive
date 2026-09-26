import { NextResponse } from "next/server";
import { tmdbFetch } from "@/lib/utils/tmdb";

type PopularMoviesResponse = {
  results: {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: string;
    vote_average: number;
  }[];
};

export async function GET() {
  try {
    const data = await tmdbFetch<PopularMoviesResponse>("/movie/popular", {
      language: "en-US",
      page: "1",
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("TMDB popular movies error:", error);

    return NextResponse.json(
      { error: "Failed to load popular movies." },
      { status: 500 }
    );
  }
}