import Link from "next/link";
import NounsUploader from "./home-client";

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">映画原作クイズ</h1>
      <p className="text-gray-600 text-center mb-12">
        合成ストーリーを読んで、元になった2つの映画を当てよう
      </p>

      <div className="grid gap-6">
        <Link
          href="/practice"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-blue-500"
        >
          <h2 className="text-xl font-semibold mb-2">Practice モード</h2>
          <p className="text-gray-600 mb-2">20問の練習問題に挑戦</p>
          <ul className="text-sm text-gray-500 list-disc list-inside">
            <li>正解・不正解がすぐにわかる</li>
            <li>問題ごとにコメントを残せる</li>
          </ul>
        </Link>

        <Link
          href="/test"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-green-500"
        >
          <h2 className="text-xl font-semibold mb-2">Test モード</h2>
          <p className="text-gray-600 mb-2">340問のテスト問題に挑戦</p>
          <ul className="text-sm text-gray-500 list-disc list-inside">
            <li>採点機能なし（正解ラベルなし）</li>
            <li>問題ごとにコメントを残せる</li>
          </ul>
        </Link>

        <Link
          href="/movies"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-purple-500"
        >
          <h2 className="text-xl font-semibold mb-2">映画一覧</h2>
          <p className="text-gray-600 mb-2">50本の映画を確認</p>
          <ul className="text-sm text-gray-500 list-disc list-inside">
            <li>各映画のあらすじを確認</li>
            <li>映画ごとにコメントを残せる</li>
          </ul>
        </Link>

        <NounsUploader />
      </div>
    </div>
  );
}
