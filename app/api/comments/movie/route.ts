import { NextRequest, NextResponse } from "next/server";
import { getMovieComments, addMovieComment } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const movieId = searchParams.get("movieId");

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
