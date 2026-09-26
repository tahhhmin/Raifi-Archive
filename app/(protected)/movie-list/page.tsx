"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { Plus } from "lucide-react";

type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
};

type MovieRating = {
  id: string;
  movie_id: string;
  user_id: string;
  rating: number;
  created_at: string;
  updated_at: string;
};

type SavedMovie = {
  id: string;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  release_date: string | null;
  vote_average: number;
  genre_ids: number[];
  status: "want_to_watch" | "watched";
  added_by: string;
  watched_at: string | null;
  created_at: string;

  profile: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  } | null;

  ratings: MovieRating[];
};

type PopularMoviesResponse = {
  results: Movie[];
};

type Genre = {
  id: number;
  name: string;
};

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [savedMovies, setSavedMovies] = useState<SavedMovie[]>([]);
const [currentUserId, setCurrentUserId] = useState<string | null>(
  null
);

useEffect(() => {
  async function loadCurrentUser() {
    try {
      const response = await fetch("/api/auth/callback");

      if (!response.ok) {
        return;
      }

      const data: {
        user: {
          id: string;
        } | null;
      } = await response.json();

      setCurrentUserId(data.user?.id ?? null);
    } catch (error) {
      console.error("Failed to load current user:", error);
    }
  }

  loadCurrentUser();
}, []);

// Load saved movies
useEffect(() => {
  async function loadSavedMovies() {
    try {
      const response = await fetch("/api/movies");

      if (!response.ok) {
        throw new Error("Failed to load saved movies.");
      }

     const data: {
  movies: SavedMovie[];
  currentUserId: string;
} = await response.json();

setCurrentUserId(data.currentUserId);

      setSavedMovies(data.movies);
    } catch (error) {
      console.error("Failed to load saved movies:", error);
    }
  }

  loadSavedMovies();
}, []);


  // Load popular movies
  useEffect(() => {
    async function loadPopularMovies() {
      try {
        const response = await fetch("/api/movies/popular");

        if (!response.ok) {
          throw new Error("Failed to load movies.");
        }

        const data: PopularMoviesResponse = await response.json();

        setMovies(data.results);
      } catch (error) {
        console.error("Failed to load popular movies:", error);
      }
    }

    loadPopularMovies();
  }, []);

  // Load TMDB genres
  useEffect(() => {
    async function loadGenres() {
      try {
        const response = await fetch("/api/movies/genre");

        if (!response.ok) {
          throw new Error("Failed to load genres.");
        }

        const data: { genres: Genre[] } = await response.json();

        setGenres(data.genres);
      } catch (error) {
        console.error("Failed to load movie genres:", error);
      }
    }

    loadGenres();
  }, []);

  // Search movies
  useEffect(() => {
    if (!query.trim()) {
      setSearching(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setSearching(true);

        const response = await fetch(
          `/api/movies/search?query=${encodeURIComponent(query.trim())}`
        );

        if (!response.ok) {
          throw new Error("Search failed.");
        }

        const data: PopularMoviesResponse = await response.json();

        setMovies(data.results);
      } catch (error) {
        console.error("Movie search failed:", error);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  function getGenreNames(genreIds: number[]) {
    return genreIds
      .map(
        (id) => genres.find((genre) => genre.id === id)?.name
      )
      .filter(Boolean)
      .slice(0, 2);
  }

async function rateMovie(movieId: string, rating: number) {
  try {
    const response = await fetch("/api/movies/ratings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        movie_id: movieId,
        rating,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Failed to save rating.");
      return;
    }

    setSavedMovies((currentMovies) =>
      currentMovies.map((movie) => {
        if (movie.id !== movieId) {
          return movie;
        }

        const existingRating = movie.ratings.find(
          (item) => item.user_id === data.rating.user_id
        );

        if (existingRating) {
          return {
            ...movie,
            ratings: movie.ratings.map((item) =>
              item.user_id === data.rating.user_id
                ? data.rating
                : item
            ),
          };
        }

        return {
          ...movie,
          ratings: [...movie.ratings, data.rating],
        };
      })
    );
  } catch (error) {
    console.error("Failed to rate movie:", error);
    alert("Something went wrong while saving your rating.");
  }
}

async function updateMovieStatus(
  movieId: string,
  status: "want_to_watch" | "watched"
) {
  try {
    const response = await fetch("/api/movies", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: movieId,
        status,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Failed to update movie.");
      return;
    }

    setSavedMovies((currentMovies) =>
      currentMovies.map((movie) =>
        movie.id === movieId
          ? {
              ...movie,
              status: data.movie.status,
              watched_at: data.movie.watched_at,
            }
          : movie
      )
    );
  } catch (error) {
    console.error("Failed to update movie status:", error);
    alert("Something went wrong while updating the movie.");
  }
}

  async function addMovie(movie: Movie) {
  try {
    const response = await fetch("/api/movies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tmdb_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date || null,
        vote_average: movie.vote_average,
        genre_ids: movie.genre_ids,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Failed to add movie.");
      return;
    }

    alert("Movie added to our shelf!");
  } catch (error) {
    console.error("Failed to add movie:", error);
    alert("Something went wrong while adding the movie.");
  }
}

    return (
        <main>
            <div className={styles.container}>
            <section>
                <h2>Our Saved Movies</h2>

                {savedMovies.length === 0 ? (
                <p>No movies added yet.</p>
                ) : (
                <div>
                    {savedMovies.map((movie) => (
                    <div key={movie.id}>
                        <strong>{movie.title}</strong>

                        {" — "}

                        <span>
                        {movie.status === "watched"
                            ? "Watched"
                            : "Want to Watch"}
                        </span>

                        {movie.profile && (
                        <div>
                            Added by {movie.profile.display_name}
                        </div>
                        )}

                        {/* Existing ratings */}
                        <div>
                        {movie.ratings.map((rating) => {
                            const ratedProfile =
                            rating.user_id === movie.profile?.id
                                ? movie.profile
                                : null;

                            return (
                            <div key={rating.id}>
                                {ratedProfile?.display_name ?? "User"}:{" "}
                                {"★".repeat(rating.rating)}
                                {"☆".repeat(5 - rating.rating)}
                            </div>
                            );
                        })}
                        </div>

                        {/* Current user's rating */}
                        {currentUserId && (
                        <div>
                            <span>Your rating: </span>

                            {[
                            1,
                            2,
                            3,
                            4,
                            5,
                            ].map((rating) => {
                            const currentRating =
                                movie.ratings.find(
                                (item) =>
                                    item.user_id === currentUserId
                                );

                            return (
                                <button
                                key={rating}
                                type="button"
                                onClick={() =>
                                    rateMovie(movie.id, rating)
                                }
                                >
                                {rating <=
                                (currentRating?.rating ?? 0)
                                    ? "★"
                                    : "☆"}
                                </button>
                            );
                            })}
                        </div>
                        )}

                        {/* Watch status */}
                        <div>
                        <button
                            type="button"
                            onClick={() =>
                            updateMovieStatus(
                                movie.id,
                                "want_to_watch"
                            )
                            }
                            disabled={
                            movie.status === "want_to_watch"
                            }
                        >
                            Want to Watch
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                            updateMovieStatus(
                                movie.id,
                                "watched"
                            )
                            }
                            disabled={movie.status === "watched"}
                        >
                            Watched
                        </button>
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </section>

            <header className={styles.header}>
                <h1 className={styles.title}>Our Movie Shelf</h1>

                <p className={styles.subtitle}>
                Movies we might watch, love, and eventually regret
                about.
                </p>

                <div style={{ marginTop: "24px" }}>
                <input
                    type="search"
                    placeholder="Search for a movie..."
                    value={query}
                    onChange={(event) =>
                    setQuery(event.target.value)
                    }
                    style={{
                    width: "100%",
                    maxWidth: "500px",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid #ded2c5",
                    outline: "none",
                    }}
                />
                </div>
            </header>

            {searching && <p>Searching...</p>}

            <section className={styles.movieGrid}>
                {movies.map((movie) => {
                const movieGenres = getGenreNames(
                    movie.genre_ids
                );

                return (
                    <article
                    className={styles.movieCard}
                    key={movie.id}
                    >
                    <div className={styles.posterWrapper}>
                        {movie.poster_path ? (
                        <img
                            className={styles.poster}
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            alt={movie.title}
                        />
                        ) : (
                        <div>No poster</div>
                        )}
                    </div>

                    <div className={styles.movieInfo}>
                        <h2 className={styles.movieTitle}>
                        {movie.title}
                        </h2>

                        <div className={styles.movieMeta}>
                        <span className={styles.rating}>
                            ★ {movie.vote_average.toFixed(1)}
                        </span>

                        <span>·</span>

                        <span className={styles.year}>
                            {movie.release_date
                            ? new Date(
                                movie.release_date
                                ).getFullYear()
                            : "Unknown"}
                        </span>
                        </div>

                        {movieGenres.length > 0 && (
                        <div
                            style={{
                            marginTop: "6px",
                            fontSize: "12px",
                            color: "#907c74",
                            }}
                        >
                            {movieGenres.join(" · ")}
                        </div>
                        )}

                        <button
                        type="button"
                        onClick={() => addMovie(movie)}
                        className={styles.addButton}
                        >
                            <Plus />
                            Add
                        </button>
                    </div>
                    </article>
                );
                })}
            </section>

            {!searching &&
                movies.length === 0 &&
                query.trim() && (
                <p>No movies found.</p>
                )}
            </div>
        </main>
        );

}