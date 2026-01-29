"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { PracticeQuestion, PredictionUpload } from "@/lib/types";

interface Props {
  questions: PracticeQuestion[];
}

export default function PracticeListClient({ questions }: Props) {
  const [uploads, setUploads] = useState<PredictionUpload[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      const res = await fetch("/api/predictions/practice");
      if (res.ok) {
        const data = await res.json();
        setUploads(data);
      }
    } catch (error) {
      console.error("Failed to fetch uploads:", error);
    }
  };

  const initTable = async () => {
    try {
      await fetch("/api/predictions/practice", { method: "PUT" });
      setMessage("テーブル初期化完了");
      setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      console.error("Failed to init table:", error);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name);

      const res = await fetch("/api/predictions/practice", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setMessage("アップロード成功");
        fetchUploads();
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setMessage("アップロード失敗");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("アップロードエラー");
    } finally {
      setUploading(false);
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const handleDelete = async (uploadId: number) => {
    if (!confirm("この予測を削除しますか？")) return;
    try {
      const res = await fetch(`/api/predictions/practice?uploadId=${uploadId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchUploads();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Practice モード</h1>
      <p className="text-gray-600 mb-8">
        20問の練習問題です。元になった2つの映画を選んでください。
      </p>

      {/* CSVアップロードセクション */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="font-semibold mb-4">予測CSVアップロード</h2>
        <form onSubmit={handleUpload} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-sm text-gray-600 mb-1">CSVファイル</label>
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              className="w-full p-2 border rounded text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            {uploading ? "アップロード中..." : "アップロード"}
          </button>
          <button
            type="button"
            onClick={initTable}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
          >
            テーブル初期化
          </button>
        </form>
        {message && (
          <p className="mt-2 text-sm text-green-600">{message}</p>
        )}

        {/* アップロード済み予測一覧 */}
        {uploads.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">アップロード済み予測</h3>
            <div className="space-y-2">
              {uploads.map((upload) => (
                <div
                  key={upload.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                >
                  <div>
                    <p className="font-medium text-sm">{upload.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(upload.created_at).toLocaleString("ja-JP")}
                      {" | "}
                      正解数: {upload.correct_count}/{upload.prediction_count}
                      {" "}
                      ({upload.prediction_count > 0
                        ? Math.round((upload.correct_count / upload.prediction_count) * 100)
                        : 0}%)
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(upload.id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 問題一覧 */}
      <div className="grid gap-4">
        {questions.map((q) => (
          <Link
            key={q.index}
            href={`/practice/${q.index}`}
            className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-500">問題 {q.index}</span>
                <p className="text-gray-700 line-clamp-2 mt-1">
                  {q.story.substring(0, 100)}...
                </p>
              </div>
              <span className="text-blue-500 text-sm">回答する →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
