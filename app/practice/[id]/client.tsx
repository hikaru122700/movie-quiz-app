"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Movie, PracticeQuestion, MovieComment, Prediction } from "@/lib/types";

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

  // 編集関連
  const [editingIdA, setEditingIdA] = useState<number | null>(null);
  const [editingIdB, setEditingIdB] = useState<number | null>(null);
  const [editTextA, setEditTextA] = useState("");
  const [editTextB, setEditTextB] = useState("");

  // 正解映画のあらすじ表示
  const [showCorrectStoryA, setShowCorrectStoryA] = useState(false);
  const [showCorrectStoryB, setShowCorrectStoryB] = useState(false);

  // 正解映画コメント関連
  const [correctMovieCommentA, setCorrectMovieCommentA] = useState("");
  const [correctMovieCommentsA, setCorrectMovieCommentsA] = useState<MovieComment[]>([]);
  const [correctMovieCommentB, setCorrectMovieCommentB] = useState("");
  const [correctMovieCommentsB, setCorrectMovieCommentsB] = useState<MovieComment[]>([]);
  const [showCorrectCommentsA, setShowCorrectCommentsA] = useState(false);
  const [showCorrectCommentsB, setShowCorrectCommentsB] = useState(false);
  const [correctCommentSavedA, setCorrectCommentSavedA] = useState(false);
  const [correctCommentSavedB, setCorrectCommentSavedB] = useState(false);
  const [correctEditingIdA, setCorrectEditingIdA] = useState<number | null>(null);
  const [correctEditingIdB, setCorrectEditingIdB] = useState<number | null>(null);
  const [correctEditTextA, setCorrectEditTextA] = useState("");
  const [correctEditTextB, setCorrectEditTextB] = useState("");

  // 予測表示
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);

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

  // 予測取得
  useEffect(() => {
    fetchPredictions();
  }, [question.index]);

  // 正解映画Aのコメント取得
  useEffect(() => {
    if (question.id_a) {
      fetchMovieComments(question.id_a, setCorrectMovieCommentsA);
    }
  }, [question.id_a]);

  // 正解映画Bのコメント取得
  useEffect(() => {
    if (question.id_b) {
      fetchMovieComments(question.id_b, setCorrectMovieCommentsB);
    }
  }, [question.id_b]);

  // 問題切り替え時にlocalStorageから回答状況を復元 & 表示状態をリセット
  useEffect(() => {
    // localStorageから回答状況を復元
    const savedState = localStorage.getItem(`practice_answer_${question.index}`);
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setSelectedA(state.selectedA);
        setSelectedB(state.selectedB);
        setSubmitted(state.submitted);
      } catch {
        setSelectedA(null);
        setSelectedB(null);
        setSubmitted(false);
      }
    } else {
      setSelectedA(null);
      setSelectedB(null);
      setSubmitted(false);
    }

    // 表示状態をリセット
    setCommentSaved(false);
    setShowStoryA(false);
    setShowStoryB(false);
    setShowCommentsA(false);
    setShowCommentsB(false);
    setShowCorrectStoryA(false);
    setShowCorrectStoryB(false);
    setShowCorrectCommentsA(false);
    setShowCorrectCommentsB(false);
    setShowPredictions(false);
    setCorrectMovieCommentA("");
    setCorrectMovieCommentB("");
    setCorrectCommentSavedA(false);
    setCorrectCommentSavedB(false);
    setCorrectEditingIdA(null);
    setCorrectEditingIdB(null);
    setCorrectEditTextA("");
    setCorrectEditTextB("");

    // localStorageからコメント読み込み
    const savedComment = localStorage.getItem(`practice_comment_${question.index}`);
    setComment(savedComment || "");
  }, [question.index]);

  const fetchPredictions = async () => {
    try {
      const res = await fetch(`/api/predictions/practice?questionIndex=${question.index - 1}`);
      if (res.ok) {
        const data = await res.json();
        setPredictions(data);
      }
    } catch (error) {
      console.error("Failed to fetch predictions:", error);
    }
  };

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

    // 回答状況をlocalStorageに保存
    localStorage.setItem(`practice_answer_${question.index}`, JSON.stringify({
      selectedA,
      selectedB,
      submitted: true,
    }));

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

  const handleSaveComment = () => {
    localStorage.setItem(`practice_comment_${question.index}`, comment);
    setCommentSaved(true);
    setTimeout(() => setCommentSaved(false), 2000);
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

  const handleDeleteComment = async (commentId: number, movieId: number, isA: boolean) => {
    if (!confirm("このコメントを削除しますか？")) return;
    try {
      const res = await fetch(`/api/comments/movie?id=${commentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (isA) {
          fetchMovieComments(movieId, setMovieCommentsA);
        } else {
          fetchMovieComments(movieId, setMovieCommentsB);
        }
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const handleUpdateComment = async (commentId: number, newText: string, movieId: number, isA: boolean) => {
    if (!newText.trim()) return;
    try {
      const res = await fetch("/api/comments/movie", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: commentId, comment: newText }),
      });
      if (res.ok) {
        if (isA) {
          setEditingIdA(null);
          setEditTextA("");
          fetchMovieComments(movieId, setMovieCommentsA);
        } else {
          setEditingIdB(null);
          setEditTextB("");
          fetchMovieComments(movieId, setMovieCommentsB);
        }
      }
    } catch (error) {
      console.error("Failed to update comment:", error);
    }
  };

  const startEdit = (c: MovieComment, isA: boolean) => {
    if (isA) {
      setEditingIdA(c.id);
      setEditTextA(c.comment);
    } else {
      setEditingIdB(c.id);
      setEditTextB(c.comment);
    }
  };

  const cancelEdit = (isA: boolean) => {
    if (isA) {
      setEditingIdA(null);
      setEditTextA("");
    } else {
      setEditingIdB(null);
      setEditTextB("");
    }
  };

  // 正解映画のコメント保存
  const handleSaveCorrectMovieComment = async (movieId: number, commentText: string, isA: boolean) => {
    if (!commentText.trim()) return;
    try {
      const res = await fetch("/api/comments/movie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId, comment: commentText }),
      });
      if (res.ok) {
        if (isA) {
          setCorrectCommentSavedA(true);
          setCorrectMovieCommentA("");
          fetchMovieComments(movieId, setCorrectMovieCommentsA);
          setTimeout(() => setCorrectCommentSavedA(false), 2000);
        } else {
          setCorrectCommentSavedB(true);
          setCorrectMovieCommentB("");
          fetchMovieComments(movieId, setCorrectMovieCommentsB);
          setTimeout(() => setCorrectCommentSavedB(false), 2000);
        }
      }
    } catch (error) {
      console.error("Failed to save movie comment:", error);
    }
  };

  // 正解映画のコメント削除
  const handleDeleteCorrectComment = async (commentId: number, movieId: number, isA: boolean) => {
    if (!confirm("このコメントを削除しますか？")) return;
    try {
      const res = await fetch(`/api/comments/movie?id=${commentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (isA) {
          fetchMovieComments(movieId, setCorrectMovieCommentsA);
        } else {
          fetchMovieComments(movieId, setCorrectMovieCommentsB);
        }
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  // 正解映画のコメント更新
  const handleUpdateCorrectComment = async (commentId: number, newText: string, movieId: number, isA: boolean) => {
    if (!newText.trim()) return;
    try {
      const res = await fetch("/api/comments/movie", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: commentId, comment: newText }),
      });
      if (res.ok) {
        if (isA) {
          setCorrectEditingIdA(null);
          setCorrectEditTextA("");
          fetchMovieComments(movieId, setCorrectMovieCommentsA);
        } else {
          setCorrectEditingIdB(null);
          setCorrectEditTextB("");
          fetchMovieComments(movieId, setCorrectMovieCommentsB);
        }
      }
    } catch (error) {
      console.error("Failed to update comment:", error);
    }
  };

  const startCorrectEdit = (c: MovieComment, isA: boolean) => {
    if (isA) {
      setCorrectEditingIdA(c.id);
      setCorrectEditTextA(c.comment);
    } else {
      setCorrectEditingIdB(c.id);
      setCorrectEditTextB(c.comment);
    }
  };

  const cancelCorrectEdit = (isA: boolean) => {
    if (isA) {
      setCorrectEditingIdA(null);
      setCorrectEditTextA("");
    } else {
      setCorrectEditingIdB(null);
      setCorrectEditTextB("");
    }
  };

  const renderCorrectCommentItem = (c: MovieComment, movieId: number, isA: boolean) => {
    const isEditing = isA ? correctEditingIdA === c.id : correctEditingIdB === c.id;
    const editText = isA ? correctEditTextA : correctEditTextB;
    const setEditText = isA ? setCorrectEditTextA : setCorrectEditTextB;

    return (
      <div key={c.id} className="text-sm p-2 bg-white rounded border">
        {isEditing ? (
          <div>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-2 border rounded h-16 resize-none text-sm"
            />
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => handleUpdateCorrectComment(c.id, editText, movieId, isA)}
                className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
              >
                保存
              </button>
              <button
                onClick={() => cancelCorrectEdit(isA)}
                className="px-2 py-1 bg-gray-300 text-xs rounded hover:bg-gray-400"
              >
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p>{c.comment}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-400">
                {new Date(c.created_at).toLocaleString("ja-JP")}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => startCorrectEdit(c, isA)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  編集
                </button>
                <button
                  onClick={() => handleDeleteCorrectComment(c.id, movieId, isA)}
                  className="text-xs text-red-600 hover:underline"
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCommentItem = (c: MovieComment, movieId: number, isA: boolean) => {
    const isEditing = isA ? editingIdA === c.id : editingIdB === c.id;
    const editText = isA ? editTextA : editTextB;
    const setEditText = isA ? setEditTextA : setEditTextB;

    return (
      <div key={c.id} className="text-sm p-2 bg-white rounded border">
        {isEditing ? (
          <div>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-2 border rounded h-16 resize-none text-sm"
            />
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => handleUpdateComment(c.id, editText, movieId, isA)}
                className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
              >
                保存
              </button>
              <button
                onClick={() => cancelEdit(isA)}
                className="px-2 py-1 bg-gray-300 text-xs rounded hover:bg-gray-400"
              >
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p>{c.comment}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-400">
                {new Date(c.created_at).toLocaleString("ja-JP")}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(c, isA)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  編集
                </button>
                <button
                  onClick={() => handleDeleteComment(c.id, movieId, isA)}
                  className="text-xs text-red-600 hover:underline"
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
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
                      <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                        {movieCommentsA.map((c) => renderCommentItem(c, selectedA!, true))}
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
                      <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                        {movieCommentsB.map((c) => renderCommentItem(c, selectedB!, false))}
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
            <div className="space-y-4">
              {/* 正解映画A */}
              <div>
                <button
                  onClick={() => setShowCorrectStoryA(!showCorrectStoryA)}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  {showCorrectStoryA ? "▼" : "▶"} {correctMovieA?.title}
                </button>
                {showCorrectStoryA && correctMovieA && (
                  <div className="mt-2">
                    <p className="text-sm bg-gray-50 p-3 rounded max-h-48 overflow-y-auto">
                      {correctMovieA.story}
                    </p>
                    <div className="mt-2">
                      <button
                        onClick={() => setShowCorrectCommentsA(!showCorrectCommentsA)}
                        className="text-purple-600 text-sm font-medium hover:underline"
                      >
                        {showCorrectCommentsA ? "▼ コメントを隠す" : "▶ コメントを見る/編集"}
                      </button>
                      {showCorrectCommentsA && (
                        <div className="mt-2 bg-purple-50 p-3 rounded">
                          <textarea
                            value={correctMovieCommentA}
                            onChange={(e) => setCorrectMovieCommentA(e.target.value)}
                            placeholder="この映画についてコメント..."
                            className="w-full p-2 border rounded h-16 resize-none text-sm"
                          />
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => handleSaveCorrectMovieComment(question.id_a, correctMovieCommentA, true)}
                              className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
                            >
                              追加
                            </button>
                            {correctCommentSavedA && <span className="text-green-600 text-xs">保存しました</span>}
                          </div>
                          {correctMovieCommentsA.length > 0 && (
                            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                              {correctMovieCommentsA.map((c) => renderCorrectCommentItem(c, question.id_a, true))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* 正解映画B */}
              <div>
                <button
                  onClick={() => setShowCorrectStoryB(!showCorrectStoryB)}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  {showCorrectStoryB ? "▼" : "▶"} {correctMovieB?.title}
                </button>
                {showCorrectStoryB && correctMovieB && (
                  <div className="mt-2">
                    <p className="text-sm bg-gray-50 p-3 rounded max-h-48 overflow-y-auto">
                      {correctMovieB.story}
                    </p>
                    <div className="mt-2">
                      <button
                        onClick={() => setShowCorrectCommentsB(!showCorrectCommentsB)}
                        className="text-purple-600 text-sm font-medium hover:underline"
                      >
                        {showCorrectCommentsB ? "▼ コメントを隠す" : "▶ コメントを見る/編集"}
                      </button>
                      {showCorrectCommentsB && (
                        <div className="mt-2 bg-purple-50 p-3 rounded">
                          <textarea
                            value={correctMovieCommentB}
                            onChange={(e) => setCorrectMovieCommentB(e.target.value)}
                            placeholder="この映画についてコメント..."
                            className="w-full p-2 border rounded h-16 resize-none text-sm"
                          />
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => handleSaveCorrectMovieComment(question.id_b, correctMovieCommentB, false)}
                              className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
                            >
                              追加
                            </button>
                            {correctCommentSavedB && <span className="text-green-600 text-xs">保存しました</span>}
                          </div>
                          {correctMovieCommentsB.length > 0 && (
                            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                              {correctMovieCommentsB.map((c) => renderCorrectCommentItem(c, question.id_b, false))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* アップロード済み予測 */}
          {predictions.length > 0 && (
            <div className="bg-white rounded-lg shadow p-4">
              <button
                onClick={() => setShowPredictions(!showPredictions)}
                className="font-semibold text-blue-600 hover:underline"
              >
                {showPredictions ? "▼" : "▶"} アップロード済み予測 ({predictions.length}件)
              </button>
              {showPredictions && (
                <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                  {predictions.map((pred) => {
                    const predMovieA = movies.find(m => m.id === pred.selected_a);
                    const predMovieB = movies.find(m => m.id === pred.selected_b);
                    const predIsCorrect =
                      (pred.selected_a === question.id_a && pred.selected_b === question.id_b) ||
                      (pred.selected_a === question.id_b && pred.selected_b === question.id_a);
                    return (
                      <div
                        key={`${pred.upload_id}-${pred.question_index}`}
                        className={`p-3 rounded border ${predIsCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{pred.upload_name}</span>
                          <span className={`text-xs font-bold ${predIsCorrect ? "text-green-600" : "text-red-600"}`}>
                            {predIsCorrect ? "正解" : "不正解"}
                          </span>
                        </div>
                        <p className="text-sm mt-1">
                          選択: {predMovieA?.title || pred.selected_a} × {predMovieB?.title || pred.selected_b}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {pred.upload_date && new Date(pred.upload_date).toLocaleString("ja-JP")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

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
