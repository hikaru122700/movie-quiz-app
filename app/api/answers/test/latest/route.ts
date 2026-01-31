import { NextRequest, NextResponse } from "next/server";
import { getLatestTestAnswer } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const questionId = searchParams.get("questionId");

  if (!questionId) {
    return NextResponse.json(
      { error: "questionId is required" },
      { status: 400 }
    );
  }

  try {
    const answer = await getLatestTestAnswer(parseInt(questionId, 10));
    if (answer) {
      return NextResponse.json({
        selectedA: answer.selected_a,
        selectedB: answer.selected_b,
        submitted: true,
      });
    }
    return NextResponse.json(null);
  } catch (error) {
    console.error("Failed to get latest test answer:", error);
    return NextResponse.json(
      { error: "Failed to get latest answer" },
      { status: 500 }
    );
  }
}
