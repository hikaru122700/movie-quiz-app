"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Movie, MovieComment } from "@/lib/types";

interface Props {
  movie: Movie;
  totalMovies: number;
}

export default function MovieDetailClient({ movie, totalMovies }: Props) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<MovieComment[]>([]);
  const [commentSaved, setCommentSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // 編集関連
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    fetchComments();
  }, [movie.id]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments/movie?movieId=${movie.id}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveComment = async () => {
    if (!comment.trim()) return;

    try {
      const res = await fetch("/api/comments/movie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: movie.id,
          comment,
        }),
      });

      if (res.ok) {
        setCommentSaved(true);
        setComment("");
        fetchComments();
        setTimeout(() => setCommentSaved(false), 2000);
      }
    } catch (error) {
      console.error("Failed to save comment:", error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("このコメントを削除しますか？")) return;
    try {
      const res = await fetch(`/api/comments/movie?id=${commentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!editText.trim()) return;
    try {
      const res = await fetch("/api/comments/movie", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: commentId, comment: editText }),
      });
      if (res.ok) {
        setEditingId(null);
        setEditText("");
        fetchComments();
      }
    } catch (error) {
      console.error("Failed to update comment:", error);
    }
  };

  const startEdit = (c: MovieComment) => {
    setEditingId(c.id);
    setEditText(c.comment);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-gray-500">{movie.id} / {totalMovies}</span>
            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
              {movie.category}
            </span>
          </div>
          <h1 className="text-2xl font-bold">{movie.title}</h1>
        </div>
        <div className="flex gap-2">
          {movie.id > 1 && (
            <Link
              href={`/movies/${movie.id - 1}`}
              className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              ← 前へ
            </Link>
          )}
          {movie.id < totalMovies && (
            <Link
              href={`/movies/${movie.id + 1}`}
              className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              次へ →
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="font-semibold mb-4">あらすじ</h2>
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
          {movie.story}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold mb-4">コメント</h2>

        <div className="mb-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="この映画についてコメントを残せます..."
            className="w-full p-3 border rounded h-24 resize-none"
          />
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleSaveComment}
              disabled={!comment.trim()}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              コメントを追加
            </button>
            {commentSaved && (
              <span className="text-green-600 text-sm">保存しました</span>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm text-gray-500 mb-3">
            過去のコメント ({comments.length}件)
          </h3>
          {loading ? (
            <p className="text-gray-400 text-sm">読み込み中...</p>
          ) : comments.length === 0 ? (
            <p className="text-gray-400 text-sm">まだコメントはありません</p>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="p-3 bg-gray-50 rounded">
                  {editingId === c.id ? (
                    <div>
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-2 border rounded h-20 resize-none"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleUpdateComment(c.id)}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                        >
                          保存
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 bg-gray-300 text-sm rounded hover:bg-gray-400"
                        >
                          キャンセル
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-700">{c.comment}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-400">
                          {new Date(c.created_at).toLocaleString("ja-JP")}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(c)}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="text-xs text-red-600 hover:underline"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
