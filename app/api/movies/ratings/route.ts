import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
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
      movie_id: string;
      rating: number;
    } = await request.json();

    if (!body.movie_id || !Number.isInteger(body.rating)) {
      return NextResponse.json(
        { error: "Movie ID and rating are required." },
        { status: 400 }
      );
    }

    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("movie_ratings")
      .upsert(
        {
          movie_id: body.movie_id,
          user_id: user.id,
          rating: body.rating,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "movie_id,user_id",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Failed to save movie rating:", error);

      return NextResponse.json(
        { error: "Failed to save movie rating." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      rating: data,
    });
  } catch (error) {
    console.error("Movie rating API error:", error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}