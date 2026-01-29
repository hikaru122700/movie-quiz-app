import { getMovies } from "@/lib/data";
import MoviesListClient from "./client";

export default function MoviesPage() {
  const movies = getMovies();

  return <MoviesListClient movies={movies} />;
}
