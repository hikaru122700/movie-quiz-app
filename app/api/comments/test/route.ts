import { NextRequest, NextResponse } from "next/server";
import { getTestComment, upsertTestComment } from "@/lib/db";

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
    const comment = await getTestComment(parseInt(questionId, 10));
    return NextResponse.json(comment);
  } catch (error) {
    console.error("Failed to get test comment:", error);
    return NextResponse.json(
      { error: "Failed to get comment" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { questionId, comment } = await request.json();

    if (questionId === undefined || comment === undefined) {
      return NextResponse.json(
        { error: "questionId and comment are required" },
        { status: 400 }
      );
    }

    const result = await upsertTestComment(questionId, comment);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to save test comment:", error);
    return NextResponse.json(
      { error: "Failed to save comment" },
      { status: 500 }
    );
  }
}
