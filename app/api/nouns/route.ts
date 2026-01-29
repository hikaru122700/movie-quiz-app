import { NextRequest, NextResponse } from "next/server";
import {
  initNounsTable,
  getMovieNouns,
  getAllMovieNouns,
  upsertMovieNouns,
  deleteAllMovieNouns,
  getMovieNounsCount,
} from "@/lib/db";

// テーブル初期化
export async function PUT() {
  try {
    await initNounsTable();
    return NextResponse.json({ message: "Nouns table initialized" });
  } catch (error) {
    console.error("Failed to init nouns table:", error);
    return NextResponse.json({ error: "Failed to initialize" }, { status: 500 });
  }
}

// 名詞取得
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const movieId = searchParams.get("movieId");
  const count = searchParams.get("count");

  try {
    // 件数のみ取得
    if (count === "true") {
      const nounsCount = await getMovieNounsCount();
      return NextResponse.json({ count: nounsCount });
    }

    // 単一映画の名詞取得
    if (movieId) {
      const nouns = await getMovieNouns(parseInt(movieId, 10));
      return NextResponse.json(nouns);
    }

    // 全映画の名詞取得
    const allNouns = await getAllMovieNouns();
    return NextResponse.json(allNouns);
  } catch (error) {
    console.error("Failed to fetch nouns:", error);
    return NextResponse.json({ error: "Failed to fetch nouns" }, { status: 500 });
  }
}

// CSVアップロード
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // テーブル初期化
    await initNounsTable();

    const text = await file.text();
    const lines = text.trim().split("\n");

    let importedCount = 0;

    // CSVをパース（ヘッダーをスキップ）
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // CSV形式: index,type,movie_id,title,noun_count,nouns(パイプ区切り)
      const parts = line.split(",");

      if (parts.length >= 6) {
        const movieId = parseInt(parts[2], 10);
        const nounsStr = parts.slice(5).join(","); // 名詞にカンマが含まれる場合を考慮
        const nouns = nounsStr.split("|").filter(n => n.trim() !== "");

        if (!isNaN(movieId) && movieId > 0 && nouns.length > 0) {
          await upsertMovieNouns(movieId, nouns);
          importedCount++;
        }
      }
    }

    return NextResponse.json({
      message: "Upload successful",
      importedCount
    });
  } catch (error) {
    console.error("Failed to upload nouns:", error);
    return NextResponse.json({ error: "Failed to upload" }, { status: 500 });
  }
}

// 全削除
export async function DELETE() {
  try {
    await deleteAllMovieNouns();
    return NextResponse.json({ message: "All nouns deleted" });
  } catch (error) {
    console.error("Failed to delete nouns:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
