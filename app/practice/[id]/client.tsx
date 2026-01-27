"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Movie, PracticeQuestion, MovieComment } from "@/lib/types";

interface Props {
  question: PracticeQuestion;
  movies: Movie[];
  totalQuestions: number;
}

export default function PracticeQuestionClient({ question, movies, totalQuestions }: Props) {
  const [selectedA, setSelectedA] = useState<number | null>(null);
  const [selectedB, setSelectedB] = useState<number | null>(null);
  const [showStoryA, setShowStoryA] = useState(false);
  const [showStoryB, setShowStoryB] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [comment, setComment] = useState("");
  const [commentSaved, setCommentSaved] = useState(false);

  // 映画コメント関連
  const [movieCommentA, setMovieCommentA] = useState("");
  const [movieCommentsA, setMovieCommentsA] = useState<MovieComment[]>([]);
  const [movieCommentB, setMovieCommentB] = useState("");
  const [movieCommentsB, setMovieCommentsB] = useState<MovieComment[]>([]);
  const [showCommentsA, setShowCommentsA] = useState(false);
  const [showCommentsB, setShowCommentsB] = useState(false);
  const [commentSavedA, setCommentSavedA] = useState(false);
  const [commentSavedB, setCommentSavedB] = useState(false);

  // 正解映画のあらすじ表示
  const [showCorrectStoryA, setShowCorrectStoryA] = useState(false);
  const [showCorrectStoryB, setShowCorrectStoryB] = useState(false);

  const movieA = movies.find(m => m.id === selectedA);
  const movieB = movies.find(m => m.id === selectedB);
  const correctMovieA = movies.find(m => m.id === question.id_a);
  const correctMovieB = movies.find(m => m.id === question.id_b);

  const isCorrect = submitted &&
    ((selectedA === question.id_a && selectedB === question.id_b) ||
     (selectedA === question.id_b && selectedB === question.id_a));

  // 映画Aのコメント取得
  useEffect(() => {
    if (selectedA) {
      fetchMovieComments(selectedA, setMovieCommentsA);
    }
  }, [selectedA]);

  // 映画Bのコメント取得
  useEffect(() => {
    if (selectedB) {
      fetchMovieComments(selectedB, setMovieCommentsB);
    }
  }, [selectedB]);

  const fetchMovieComments = async (movieId: number, setter: (comments: MovieComment[]) => void) => {
    try {
      const res = await fetch(`/api/comments/movie?movieId=${movieId}`);
      if (res.ok) {
        const data = await res.json();
        setter(data);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  const handleSubmit = async () => {
    if (selectedA === null || selectedB === null) return;
    setSubmitted(true);

    try {
      await fetch("/api/answers/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionIndex: question.index,
          selectedA,
          selectedB,
          isCorrect: (selectedA === question.id_a && selectedB === question.id_b) ||
                     (selectedA === question.id_b && selectedB === question.id_a),
          comment: "",
        }),
      });
    } catch (error) {
      console.error("Failed to save answer:", error);
    }
  };

  const handleSaveComment = async () => {
    try {
      await fetch("/api/answers/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionIndex: question.index,
          selectedA: selectedA || 0,
          selectedB: selectedB || 0,
          isCorrect,
          comment,
        }),
      });
      setCommentSaved(true);
      setTimeout(() => setCommentSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save comment:", error);
    }
  };

  const handleSaveMovieComment = async (movieId: number, commentText: string, isA: boolean) => {
    if (!commentText.trim()) return;
    try {
      const res = await fetch("/api/comments/movie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId, comment: commentText }),
      });
      if (res.ok) {
        if (isA) {
          setCommentSavedA(true);
          setMovieCommentA("");
          fetchMovieComments(movieId, setMovieCommentsA);
          setTimeout(() => setCommentSavedA(false), 2000);
        } else {
          setCommentSavedB(true);
          setMovieCommentB("");
          fetchMovieComments(movieId, setMovieCommentsB);
          setTimeout(() => setCommentSavedB(false), 2000);
        }
      }
    } catch (error) {
      console.error("Failed to save movie comment:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">問題 {question.index} / {totalQuestions}</h1>
        <div className="flex gap-2">
          {question.index > 1 && (
            <Link
              href={`/practice/${question.index - 1}`}
              className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              ← 前へ
            </Link>
          )}
          {question.index < totalQuestions && (
            <Link
              href={`/practice/${question.index + 1}`}
              className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              次へ →
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="font-semibold mb-4">合成ストーリー</h2>
        <p className="whitespace-pre-wrap leading-relaxed">
          {question.story}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* 映画1選択 */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">映画1を選択</h3>
          <select
            value={selectedA || ""}
            onChange={(e) => setSelectedA(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full p-2 border rounded mb-3"
          >
            <option value="">選択してください</option>
            {movies.map((m) => (
              <option key={m.id} value={m.id} disabled={m.id === selectedB}>
                {m.id}. {m.title}
              </option>
            ))}
          </select>
          {movieA && (
            <div className="space-y-3">
              <div>
                <button
                  onClick={() => setShowStoryA(!showStoryA)}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  {showStoryA ? "▼ あらすじを隠す" : "▶ あらすじを見る"}
                </button>
                {showStoryA && (
                  <p className="mt-2 text-sm bg-gray-50 p-3 rounded max-h-48 overflow-y-auto">
                    {movieA.story}
                  </p>
                )}
              </div>
              <div>
                <button
                  onClick={() => setShowCommentsA(!showCommentsA)}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  {showCommentsA ? "▼ コメントを隠す" : "▶ コメントを見る/編集"}
                </button>
                {showCommentsA && (
                  <div className="mt-2 bg-gray-50 p-3 rounded">
                    <textarea
                      value={movieCommentA}
                      onChange={(e) => setMovieCommentA(e.target.value)}
                      placeholder="この映画についてコメント..."
                      className="w-full p-2 border rounded h-16 resize-none text-sm"
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleSaveMovieComment(selectedA!, movieCommentA, true)}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                      >
                        追加
                      </button>
                      {commentSavedA && <span className="text-green-600 text-xs">保存しました</span>}
                    </div>
                    {movieCommentsA.length > 0 && (
                      <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                        {movieCommentsA.map((c) => (
                          <div key={c.id} className="text-sm p-2 bg-white rounded border">
                            <p>{c.comment}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(c.created_at).toLocaleString("ja-JP")}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 映画2選択 */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">映画2を選択</h3>
          <select
            value={selectedB || ""}
            onChange={(e) => setSelectedB(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full p-2 border rounded mb-3"
          >
            <option value="">選択してください</option>
            {movies.map((m) => (
              <option key={m.id} value={m.id} disabled={m.id === selectedA}>
                {m.id}. {m.title}
              </option>
            ))}
          </select>
          {movieB && (
            <div className="space-y-3">
              <div>
                <button
                  onClick={() => setShowStoryB(!showStoryB)}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  {showStoryB ? "▼ あらすじを隠す" : "▶ あらすじを見る"}
                </button>
                {showStoryB && (
                  <p className="mt-2 text-sm bg-gray-50 p-3 rounded max-h-48 overflow-y-auto">
                    {movieB.story}
                  </p>
                )}
              </div>
              <div>
                <button
                  onClick={() => setShowCommentsB(!showCommentsB)}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  {showCommentsB ? "▼ コメントを隠す" : "▶ コメントを見る/編集"}
                </button>
                {showCommentsB && (
                  <div className="mt-2 bg-gray-50 p-3 rounded">
                    <textarea
                      value={movieCommentB}
                      onChange={(e) => setMovieCommentB(e.target.value)}
                      placeholder="この映画についてコメント..."
                      className="w-full p-2 border rounded h-16 resize-none text-sm"
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleSaveMovieComment(selectedB!, movieCommentB, false)}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                      >
                        追加
                      </button>
                      {commentSavedB && <span className="text-green-600 text-xs">保存しました</span>}
                    </div>
                    {movieCommentsB.length > 0 && (
                      <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                        {movieCommentsB.map((c) => (
                          <div key={c.id} className="text-sm p-2 bg-white rounded border">
                            <p>{c.comment}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(c.created_at).toLocaleString("ja-JP")}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={selectedA === null || selectedB === null}
          className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          回答する
        </button>
      ) : (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${isCorrect ? "bg-green-100 border border-green-300" : "bg-red-100 border border-red-300"}`}>
            <p className={`font-bold text-lg ${isCorrect ? "text-green-700" : "text-red-700"}`}>
              {isCorrect ? "正解！" : "不正解"}
            </p>
            <p className="mt-2">
              正解: {question.title_a} × {question.title_b}
            </p>
          </div>

          {/* 正解映画のあらすじ */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-3">正解映画のあらすじ</h3>
            <div className="space-y-3">
              <div>
                <button
                  onClick={() => setShowCorrectStoryA(!showCorrectStoryA)}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  {showCorrectStoryA ? "▼" : "▶"} {correctMovieA?.title}
                </button>
                {showCorrectStoryA && correctMovieA && (
                  <p className="mt-2 text-sm bg-gray-50 p-3 rounded max-h-48 overflow-y-auto">
                    {correctMovieA.story}
                  </p>
                )}
              </div>
              <div>
                <button
                  onClick={() => setShowCorrectStoryB(!showCorrectStoryB)}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  {showCorrectStoryB ? "▼" : "▶"} {correctMovieB?.title}
                </button>
                {showCorrectStoryB && correctMovieB && (
                  <p className="mt-2 text-sm bg-gray-50 p-3 rounded max-h-48 overflow-y-auto">
                    {correctMovieB.story}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-3">問題へのコメント</h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="メモやコメントを残せます..."
              className="w-full p-3 border rounded h-24 resize-none"
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleSaveComment}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                保存
              </button>
              {commentSaved && (
                <span className="text-green-600 text-sm">保存しました</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
