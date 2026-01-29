import { getPracticeQuestions } from "@/lib/data";
import PracticeListClient from "./client";

export default function PracticePage() {
  const questions = getPracticeQuestions();

  return <PracticeListClient questions={questions} />;
}
