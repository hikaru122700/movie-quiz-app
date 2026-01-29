"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Movie } from "@/lib/types";

interface Props {
  movies: Movie[];
}

interface CommentCount {
  movie_id: number;
  count: number;
}

export default function MoviesListClient({ movies }: Props) {
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    fetchCommentCounts();
  }, []);

  const fetchCommentCounts = async () => {
    try {
      const res = await fetch("/api/comments/movie?counts=true");
      if (res.ok) {
        const data: CommentCount[] = await res.json();
        const countsMap: Record<number, number> = {};
        data.forEach((item) => {
          countsMap[item.movie_id] = Number(item.count);
        });
        setCommentCounts(countsMap);
      }
    } catch (error) {
      console.error("Failed to fetch comment counts:", error);
    }
  };

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
                  {commentCounts[movie.id] > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                      コメント {commentCounts[movie.id]}件
                    </span>
                  )}
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
