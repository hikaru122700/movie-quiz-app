import { NextRequest, NextResponse } from "next/server";
import { getTestAnswers, addTestAnswer } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const questionId = searchParams.get("questionId");

  if (!questionId) {
    return NextResponse.json({ error: "questionId is required" }, { status: 400 });
  }

  try {
    const answers = await getTestAnswers(parseInt(questionId, 10));
    return NextResponse.json(answers);
  } catch (error) {
    console.error("Failed to fetch answers:", error);
    return NextResponse.json({ error: "Failed to fetch answers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionId, selectedA, selectedB, comment } = body;

    if (questionId === undefined || selectedA === undefined || selectedB === undefined) {
      return NextResponse.json(
        { error: "questionId, selectedA, and selectedB are required" },
        { status: 400 }
      );
    }

    const result = await addTestAnswer(
      questionId,
      selectedA,
      selectedB,
      comment ?? ""
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to add answer:", error);
    return NextResponse.json({ error: "Failed to add answer" }, { status: 500 });
  }
}
