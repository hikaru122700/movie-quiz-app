import { NextRequest, NextResponse } from "next/server";
import { getPracticeAnswers, addPracticeAnswer } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const questionIndex = searchParams.get("questionIndex");

  if (!questionIndex) {
    return NextResponse.json({ error: "questionIndex is required" }, { status: 400 });
  }

  try {
    const answers = await getPracticeAnswers(parseInt(questionIndex, 10));
    return NextResponse.json(answers);
  } catch (error) {
    console.error("Failed to fetch answers:", error);
    return NextResponse.json({ error: "Failed to fetch answers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionIndex, selectedA, selectedB, isCorrect, comment } = body;

    if (questionIndex === undefined || selectedA === undefined || selectedB === undefined) {
      return NextResponse.json(
        { error: "questionIndex, selectedA, and selectedB are required" },
        { status: 400 }
      );
    }

    const result = await addPracticeAnswer(
      questionIndex,
      selectedA,
      selectedB,
      isCorrect ?? false,
      comment ?? ""
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to add answer:", error);
    return NextResponse.json({ error: "Failed to add answer" }, { status: 500 });
  }
}
