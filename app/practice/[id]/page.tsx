import { getPracticeQuestionByIndex, getMovies } from "@/lib/data";
import { notFound } from "next/navigation";
import PracticeQuestionClient from "./client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PracticeQuestionPage({ params }: Props) {
  const { id } = await params;
  const questionIndex = parseInt(id, 10);
  const question = getPracticeQuestionByIndex(questionIndex);
  const movies = getMovies();

  if (!question) {
    notFound();
  }

  return (
    <PracticeQuestionClient
      question={question}
      movies={movies}
      totalQuestions={20}
    />
  );
}
