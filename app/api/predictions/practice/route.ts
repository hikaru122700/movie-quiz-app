import { NextRequest, NextResponse } from "next/server";
import {
  initPredictionsTable,
  getPredictionUploads,
  addPredictionUpload,
  addPrediction,
  getPredictionsForQuestion,
  deletePredictionUpload,
} from "@/lib/db";

// テーブル初期化
export async function PUT() {
  try {
    await initPredictionsTable();
    return NextResponse.json({ message: "Predictions table initialized" });
  } catch (error) {
    console.error("Failed to init predictions table:", error);
    return NextResponse.json({ error: "Failed to initialize" }, { status: 500 });
  }
}

// アップロード一覧取得 or 特定問題の予測取得
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const questionIndex = searchParams.get("questionIndex");

  try {
    if (questionIndex !== null) {
      const predictions = await getPredictionsForQuestion(parseInt(questionIndex, 10));
      return NextResponse.json(predictions);
    } else {
      const uploads = await getPredictionUploads();
      return NextResponse.json(uploads);
    }
  } catch (error) {
    console.error("Failed to fetch predictions:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// CSVアップロード
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string || file?.name || "Unnamed";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.trim().split("\n");

    // アップロードレコード作成
    const upload = await addPredictionUpload(name);

    // 各行をパース
    for (const line of lines) {
      const parts = line.split(",").map(s => s.trim());
      if (parts.length >= 3) {
        const questionIndex = parseInt(parts[0], 10);
        const selectedA = parseInt(parts[1], 10);
        const selectedB = parseInt(parts[2], 10);

        if (!isNaN(questionIndex) && !isNaN(selectedA) && !isNaN(selectedB)) {
          await addPrediction(upload.id, questionIndex, selectedA, selectedB);
        }
      }
    }

    return NextResponse.json({ message: "Upload successful", upload });
  } catch (error) {
    console.error("Failed to upload predictions:", error);
    return NextResponse.json({ error: "Failed to upload" }, { status: 500 });
  }
}

// アップロード削除
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const uploadId = searchParams.get("uploadId");

  if (!uploadId) {
    return NextResponse.json({ error: "uploadId is required" }, { status: 400 });
  }

  try {
    await deletePredictionUpload(parseInt(uploadId, 10));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete upload:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
