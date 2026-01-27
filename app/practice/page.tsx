import Link from "next/link";
import { getPracticeQuestions } from "@/lib/data";

export default function PracticePage() {
  const questions = getPracticeQuestions();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Practice モード</h1>
      <p className="text-gray-600 mb-8">
        20問の練習問題です。元になった2つの映画を選んでください。
      </p>

      <div className="grid gap-4">
        {questions.map((q) => (
          <Link
            key={q.index}
            href={`/practice/${q.index}`}
            className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-500">問題 {q.index}</span>
                <p className="text-gray-700 line-clamp-2 mt-1">
                  {q.story.substring(0, 100)}...
                </p>
              </div>
              <span className="text-blue-500 text-sm">回答する →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
