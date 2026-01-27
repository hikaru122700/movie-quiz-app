import { getTestQuestionById, getMovies, getTestQuestions } from "@/lib/data";
import { notFound } from "next/navigation";
import TestQuestionClient from "./client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TestQuestionPage({ params }: Props) {
  const { id } = await params;
  const questionId = parseInt(id, 10);
  const question = getTestQuestionById(questionId);
  const movies = getMovies();
  const allQuestions = getTestQuestions();
  const totalQuestions = allQuestions.length;

  if (!question) {
    notFound();
  }

  return (
    <TestQuestionClient
      question={question}
      movies={movies}
      totalQuestions={totalQuestions}
    />
  );
}
