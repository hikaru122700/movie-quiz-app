"use client";

import { useState, useEffect, useRef } from "react";

export default function NounsUploader() {
  // 映画名詞
  const [movieNounsCount, setMovieNounsCount] = useState<number>(0);
  const [movieUploading, setMovieUploading] = useState(false);
  const [movieMessage, setMovieMessage] = useState("");
  const movieFileInputRef = useRef<HTMLInputElement>(null);

  // 融合ストーリー名詞
  const [fictionNounsCount, setFictionNounsCount] = useState<number>(0);
  const [fictionUploading, setFictionUploading] = useState(false);
  const [fictionMessage, setFictionMessage] = useState("");
  const fictionFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMovieNounsCount();
    fetchFictionNounsCount();
  }, []);

  const fetchMovieNounsCount = async () => {
    try {
      const res = await fetch("/api/nouns?count=true");
      if (res.ok) {
        const data = await res.json();
        setMovieNounsCount(data.count);
      }
    } catch (error) {
      console.error("Failed to fetch movie nouns count:", error);
    }
  };

  const fetchFictionNounsCount = async () => {
    try {
      const res = await fetch("/api/nouns/fiction?count=true");
      if (res.ok) {
        const data = await res.json();
        setFictionNounsCount(data.count);
      }
    } catch (error) {
      console.error("Failed to fetch fiction nouns count:", error);
    }
  };

  const initMovieTable = async () => {
    try {
      await fetch("/api/nouns", { method: "PUT" });
      setMovieMessage("テーブル初期化完了");
      setTimeout(() => setMovieMessage(""), 2000);
    } catch (error) {
      console.error("Failed to init table:", error);
    }
  };

  const initFictionTable = async () => {
    try {
      await fetch("/api/nouns/fiction", { method: "PUT" });
      setFictionMessage("テーブル初期化完了");
      setTimeout(() => setFictionMessage(""), 2000);
    } catch (error) {
      console.error("Failed to init table:", error);
    }
  };

  const handleMovieUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = movieFileInputRef.current?.files?.[0];
    if (!file) return;

    setMovieUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/nouns", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setMovieMessage(`アップロード成功 (${data.importedCount}件)`);
        fetchMovieNounsCount();
        if (movieFileInputRef.current) {
          movieFileInputRef.current.value = "";
        }
      } else {
        setMovieMessage("アップロード失敗");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMovieMessage("アップロードエラー");
    } finally {
      setMovieUploading(false);
      setTimeout(() => setMovieMessage(""), 3000);
    }
  };

  const handleFictionUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fictionFileInputRef.current?.files?.[0];
    if (!file) return;

    setFictionUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/nouns/fiction", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setFictionMessage(`アップロード成功 (${data.importedCount}件)`);
        fetchFictionNounsCount();
        if (fictionFileInputRef.current) {
          fictionFileInputRef.current.value = "";
        }
      } else {
        setFictionMessage("アップロード失敗");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setFictionMessage("アップロードエラー");
    } finally {
      setFictionUploading(false);
      setTimeout(() => setFictionMessage(""), 3000);
    }
  };

  const handleMovieDeleteAll = async () => {
    if (!confirm("すべての映画名詞キャッシュを削除しますか？")) return;

    try {
      const res = await fetch("/api/nouns", { method: "DELETE" });
      if (res.ok) {
        setMovieMessage("全削除完了");
        fetchMovieNounsCount();
      } else {
        setMovieMessage("削除失敗");
      }
    } catch (error) {
      console.error("Delete error:", error);
      setMovieMessage("削除エラー");
    } finally {
      setTimeout(() => setMovieMessage(""), 2000);
    }
  };

  const handleFictionDeleteAll = async () => {
    if (!confirm("すべての融合ストーリー名詞キャッシュを削除しますか？")) return;

    try {
      const res = await fetch("/api/nouns/fiction", { method: "DELETE" });
      if (res.ok) {
        setFictionMessage("全削除完了");
        fetchFictionNounsCount();
      } else {
        setFictionMessage("削除失敗");
      }
    } catch (error) {
      console.error("Delete error:", error);
      setFictionMessage("削除エラー");
    } finally {
      setTimeout(() => setFictionMessage(""), 2000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
      <h2 className="text-xl font-semibold mb-4">名詞キャッシュ管理</h2>

      {/* 映画名詞セクション */}
      <div className="mb-6 pb-6 border-b">
        <h3 className="font-medium mb-2 text-orange-700">映画名詞 (50映画)</h3>
        <p className="text-gray-600 text-sm mb-3">
          現在: <span className="font-bold">{movieNounsCount}件</span>
        </p>

        <form onSubmit={handleMovieUpload} className="flex flex-wrap gap-2 items-end mb-3">
          <div className="flex-1 min-w-40">
            <input
              type="file"
              accept=".csv"
              ref={movieFileInputRef}
              className="w-full p-2 border rounded text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={movieUploading}
            className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-gray-300 text-sm"
          >
            {movieUploading ? "..." : "アップロード"}
          </button>
        </form>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleMovieDeleteAll}
            disabled={movieNounsCount === 0}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-xs"
          >
            全削除
          </button>
          <button
            type="button"
            onClick={initMovieTable}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs"
          >
            初期化
          </button>
        </div>

        {movieMessage && (
          <p className="mt-2 text-sm text-green-600">{movieMessage}</p>
        )}
      </div>

      {/* 融合ストーリー名詞セクション */}
      <div>
        <h3 className="font-medium mb-2 text-blue-700">融合ストーリー名詞 (Practice)</h3>
        <p className="text-gray-600 text-sm mb-3">
          現在: <span className="font-bold">{fictionNounsCount}件</span>
        </p>

        <form onSubmit={handleFictionUpload} className="flex flex-wrap gap-2 items-end mb-3">
          <div className="flex-1 min-w-40">
            <input
              type="file"
              accept=".csv"
              ref={fictionFileInputRef}
              className="w-full p-2 border rounded text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={fictionUploading}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 text-sm"
          >
            {fictionUploading ? "..." : "アップロード"}
          </button>
        </form>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleFictionDeleteAll}
            disabled={fictionNounsCount === 0}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-xs"
          >
            全削除
          </button>
          <button
            type="button"
            onClick={initFictionTable}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs"
          >
            初期化
          </button>
        </div>

        {fictionMessage && (
          <p className="mt-2 text-sm text-green-600">{fictionMessage}</p>
        )}
      </div>

      <p className="mt-4 text-xs text-gray-400">
        CSVフォーマット: index,type,movie_id,title,noun_count,nouns(パイプ区切り)
      </p>
    </div>
  );
}
