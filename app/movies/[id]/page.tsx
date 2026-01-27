import { getMovieById, getMovies } from "@/lib/data";
import { notFound } from "next/navigation";
import MovieDetailClient from "./client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MovieDetailPage({ params }: Props) {
  const { id } = await params;
  const movieId = parseInt(id, 10);
  const movie = getMovieById(movieId);
  const allMovies = getMovies();
  const totalMovies = allMovies.length;

  if (!movie) {
    notFound();
  }

  return (
    <MovieDetailClient
      movie={movie}
      totalMovies={totalMovies}
    />
  );
}
