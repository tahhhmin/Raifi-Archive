import { NextResponse } from "next/server";
import { tmdbFetch } from "@/lib/utils/tmdb";

type GenreResponse = {
  genres: {
    id: number;
    name: string;
  }[];
};

export async function GET() {
  try {
    const data = await tmdbFetch<GenreResponse>("/genre/movie/list", {
      language: "en-US",
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("TMDB genres error:", error);

    return NextResponse.json(
      { error: "Failed to load movie genres." },
      { status: 500 }
    );
  }
}