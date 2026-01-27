import Link from "next/link";
import { getTestQuestions } from "@/lib/data";

export default function TestPage() {
  const questions = getTestQuestions();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Test モード</h1>
      <p className="text-gray-600 mb-8">
        340問のテスト問題です。元になった2つの映画を選んでください（採点なし）。
      </p>

      <div className="mb-4 text-sm text-gray-500">
        全 {questions.length} 問
      </div>

      <div className="grid gap-2">
        {questions.map((q) => (
          <Link
            key={q.id}
            href={`/test/${q.id}`}
            className="block p-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <span className="text-sm text-gray-500">問題 {q.id}</span>
                <p className="text-gray-700 line-clamp-1 mt-1 text-sm">
                  {q.story.substring(0, 80)}...
                </p>
              </div>
              <span className="text-green-500 text-sm ml-4">回答する →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
