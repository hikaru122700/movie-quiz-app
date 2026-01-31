import { NextRequest, NextResponse } from "next/server";
import { getPracticeComment, upsertPracticeComment } from "@/lib/db";

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
    const comment = await getPracticeComment(parseInt(questionIndex, 10));
    return NextResponse.json(comment);
  } catch (error) {
    console.error("Failed to get practice comment:", error);
    return NextResponse.json(
      { error: "Failed to get comment" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { questionIndex, comment } = await request.json();

    if (questionIndex === undefined || comment === undefined) {
      return NextResponse.json(
        { error: "questionIndex and comment are required" },
        { status: 400 }
      );
    }

    const result = await upsertPracticeComment(questionIndex, comment);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to save practice comment:", error);
    return NextResponse.json(
      { error: "Failed to save comment" },
      { status: 500 }
    );
  }
}
