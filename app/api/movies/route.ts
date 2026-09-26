import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type AddMovieRequest = {
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  release_date: string | null;
  vote_average: number;
  genre_ids: number[];
};



export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    // Load saved movies
    const { data: movies, error: moviesError } = await supabase
      .from("movies")
      .select("*")
      .order("created_at", { ascending: false });

    if (moviesError) {
      console.error("Failed to load saved movies:", moviesError);

      return NextResponse.json(
        { error: "Failed to load saved movies." },
        { status: 500 }
      );
    }

    // Get the unique users who added movies
    const addedByIds = [
      ...new Set(movies.map((movie) => movie.added_by)),
    ];

    // Load their profiles separately
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .in("id", addedByIds);

    if (profilesError) {
      console.error("Failed to load movie profiles:", profilesError);

      return NextResponse.json(
        { error: "Failed to load movie profiles." },
        { status: 500 }
      );
    }

    // Attach the matching profile to each movie
// Load ratings for all saved movies
let ratings: {
  id: string;
  movie_id: string;
  user_id: string;
  rating: number;
  created_at: string;
  updated_at: string;
}[] = [];

if (movies.length > 0) {
  const movieIds = movies.map((movie) => movie.id);

  const { data: ratingData, error: ratingsError } = await supabase
    .from("movie_ratings")
    .select(
      "id, movie_id, user_id, rating, created_at, updated_at"
    )
    .in("movie_id", movieIds);

  if (ratingsError) {
    console.error(
      "Failed to load movie ratings:",
      ratingsError
    );

    return NextResponse.json(
      { error: "Failed to load movie ratings." },
      { status: 500 }
    );
  }

  ratings = ratingData ?? [];
}

// Attach profiles and ratings to each movie
const moviesWithProfiles = movies.map((movie) => ({
  ...movie,

  profile:
    profiles.find((profile) => profile.id === movie.added_by) ??
    null,

  ratings: ratings.filter(
    (rating) => rating.movie_id === movie.id
  ),
}));

return NextResponse.json({
  movies: moviesWithProfiles,
  currentUserId: user.id,
});
  } catch (error) {
    console.error("Get movies API error:", error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const body: {
      id: string;
      status: "want_to_watch" | "watched";
    } = await request.json();

    if (!body.id || !body.status) {
      return NextResponse.json(
        { error: "Movie ID and status are required." },
        { status: 400 }
      );
    }

    const watchedAt =
      body.status === "watched"
        ? new Date().toISOString()
        : null;

    const { data, error } = await supabase
      .from("movies")
      .update({
        status: body.status,
        watched_at: watchedAt,
      })
      .eq("id", body.id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update movie:", error);

      return NextResponse.json(
        { error: "Failed to update movie." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      movie: data,
    });
  } catch (error) {
    console.error("Update movie API error:", error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the currently authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "You must be logged in to add a movie." },
        { status: 401 }
      );
    }

    const body: AddMovieRequest = await request.json();

    if (
      !body.tmdb_id ||
      !body.title ||
      !Array.isArray(body.genre_ids)
    ) {
      return NextResponse.json(
        { error: "Invalid movie data." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("movies")
      .insert({
        tmdb_id: body.tmdb_id,
        title: body.title,
        poster_path: body.poster_path,
        release_date: body.release_date || null,
        vote_average: body.vote_average,
        genre_ids: body.genre_ids,
        added_by: user.id,
      })
      .select()
      .single();

    if (error) {
      // PostgreSQL unique violation
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "This movie is already in your shared shelf." },
          { status: 409 }
        );
      }

      console.error("Failed to add movie:", error);

      return NextResponse.json(
        { error: "Failed to add movie." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { movie: data },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add movie API error:", error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}