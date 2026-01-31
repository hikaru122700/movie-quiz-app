import { NextRequest, NextResponse } from "next/server";
import { getLatestPracticeAnswer } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const questionIndex = searchParams.get("questionIndex");

  if (!questionIndex) {
    return NextResponse.json(
      { error: "questionIndex is required" },
      { status: 400 }
    );
  }

  try {
    const answer = await getLatestPracticeAnswer(parseInt(questionIndex, 10));
    if (answer) {
      return NextResponse.json({
        selectedA: answer.selected_a,
        selectedB: answer.selected_b,
        submitted: true,
      });
    }
    return NextResponse.json(null);
  } catch (error) {
    console.error("Failed to get latest practice answer:", error);
    return NextResponse.json(
      { error: "Failed to get latest answer" },
      { status: 500 }
    );
  }
}
