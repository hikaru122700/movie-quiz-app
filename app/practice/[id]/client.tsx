"use client";

import { useState } from "react";
import Link from "next/link";
import { Movie, PracticeQuestion } from "@/lib/types";

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

  const movieA = movies.find(m => m.id === selectedA);
  const movieB = movies.find(m => m.id === selectedB);

  const isCorrect = submitted &&
    ((selectedA === question.id_a && selectedB === question.id_b) ||
     (selectedA === question.id_b && selectedB === question.id_a));

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
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
          {question.story}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">映画1を選択</h3>
          <select
            value={selectedA || ""}
            onChange={(e) => setSelectedA(e.target.value ? parseInt(e.target.value) : null)}
            disabled={submitted}
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
            <div>
              <button
                onClick={() => setShowStoryA(!showStoryA)}
                className="text-blue-500 text-sm hover:underline"
              >
                {showStoryA ? "あらすじを隠す" : "あらすじを見る"}
              </button>
              {showStoryA && (
                <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded max-h-48 overflow-y-auto">
                  {movieA.story}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">映画2を選択</h3>
          <select
            value={selectedB || ""}
            onChange={(e) => setSelectedB(e.target.value ? parseInt(e.target.value) : null)}
            disabled={submitted}
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
            <div>
              <button
                onClick={() => setShowStoryB(!showStoryB)}
                className="text-blue-500 text-sm hover:underline"
              >
                {showStoryB ? "あらすじを隠す" : "あらすじを見る"}
              </button>
              {showStoryB && (
                <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded max-h-48 overflow-y-auto">
                  {movieB.story}
                </p>
              )}
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
            <p className="text-gray-700 mt-2">
              正解: {question.title_a} × {question.title_b}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-3">コメント</h3>
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
