import { NextRequest, NextResponse } from "next/server";
import { getMovieComments, addMovieComment, updateMovieComment, deleteMovieComment, getMovieCommentCounts } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const movieId = searchParams.get("movieId");
  const counts = searchParams.get("counts");

  // コメント数一覧を取得
  if (counts === "true") {
    try {
      const commentCounts = await getMovieCommentCounts();
      return NextResponse.json(commentCounts);
    } catch (error) {
      console.error("Failed to fetch comment counts:", error);
      return NextResponse.json({ error: "Failed to fetch comment counts" }, { status: 500 });
    }
  }

  if (!movieId) {
    return NextResponse.json({ error: "movieId is required" }, { status: 400 });
  }

  try {
    const comments = await getMovieComments(parseInt(movieId, 10));
    return NextResponse.json(comments);
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { movieId, comment } = body;

    if (!movieId || !comment) {
      return NextResponse.json(
        { error: "movieId and comment are required" },
        { status: 400 }
      );
    }

    const result = await addMovieComment(movieId, comment);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to add comment:", error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, comment } = body;

    if (!id || !comment) {
      return NextResponse.json(
        { error: "id and comment are required" },
        { status: 400 }
      );
    }

    const result = await updateMovieComment(id, comment);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to update comment:", error);
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    await deleteMovieComment(parseInt(id, 10));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete comment:", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
