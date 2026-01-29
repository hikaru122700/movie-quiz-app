import { NextRequest, NextResponse } from "next/server";
import {
  initFictionNounsTable,
  getFictionNouns,
  getAllFictionNouns,
  upsertFictionNouns,
  deleteAllFictionNouns,
  getFictionNounsCount,
} from "@/lib/db";

// テーブル初期化
export async function PUT() {
  try {
    await initFictionNounsTable();
    return NextResponse.json({ message: "Fiction nouns table initialized" });
  } catch (error) {
    console.error("Failed to init fiction nouns table:", error);
    return NextResponse.json({ error: "Failed to initialize" }, { status: 500 });
  }
}

// 名詞取得
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const questionIndex = searchParams.get("questionIndex");
  const count = searchParams.get("count");

  try {
    // 件数のみ取得
    if (count === "true") {
      const nounsCount = await getFictionNounsCount();
      return NextResponse.json({ count: nounsCount });
    }

    // 単一問題の名詞取得
    if (questionIndex) {
      const nouns = await getFictionNouns(parseInt(questionIndex, 10));
      return NextResponse.json(nouns);
    }

    // 全問題の名詞取得
    const allNouns = await getAllFictionNouns();
    return NextResponse.json(allNouns);
  } catch (error) {
    console.error("Failed to fetch fiction nouns:", error);
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
    await initFictionNounsTable();

    const text = await file.text();
    const lines = text.trim().split("\n");

    let importedCount = 0;

    // CSVをパース（ヘッダーをスキップ）
    // フォーマット: index,type,movie_id,title,noun_count,nouns(パイプ区切り)
    // fictionの場合: index=question_index, movie_id=空
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(",");

      if (parts.length >= 6) {
        const index = parseInt(parts[0], 10);
        const type = parts[1];
        const nounsStr = parts.slice(5).join(",");
        const nouns = nounsStr.split("|").filter(n => n.trim() !== "");

        // type=fiction の行のみインポート
        if (type === "fiction" && !isNaN(index) && nouns.length > 0) {
          await upsertFictionNouns(index, nouns);
          importedCount++;
        }
      }
    }

    return NextResponse.json({
      message: "Upload successful",
      importedCount
    });
  } catch (error) {
    console.error("Failed to upload fiction nouns:", error);
    return NextResponse.json({ error: "Failed to upload" }, { status: 500 });
  }
}

// 全削除
export async function DELETE() {
  try {
    await deleteAllFictionNouns();
    return NextResponse.json({ message: "All fiction nouns deleted" });
  } catch (error) {
    console.error("Failed to delete fiction nouns:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
