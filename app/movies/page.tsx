import Link from "next/link";
import { getMovies } from "@/lib/data";

export default function MoviesPage() {
  const movies = getMovies();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">映画一覧</h1>
      <p className="text-gray-600 mb-8">
        50本の映画のあらすじを確認し、コメントを残せます。
      </p>

      <div className="grid gap-4">
        {movies.map((movie) => (
          <Link
            key={movie.id}
            href={`/movies/${movie.id}`}
            className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-500">{movie.id}.</span>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                    {movie.category}
                  </span>
                </div>
                <h2 className="font-semibold text-lg">{movie.title}</h2>
                <p className="text-gray-600 text-sm line-clamp-2 mt-2">
                  {movie.story.substring(0, 150)}...
                </p>
              </div>
              <span className="text-purple-500 text-sm ml-4">詳細 →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
