// 基本映画データ
export interface Movie {
  id: number;
  category: string;
  title: string;
  story: string;
}

// Practice問題
export interface PracticeQuestion {
  id_a: number;
  id_b: number;
  title_a: string;
  title_b: string;
  story: string;
  index: number; // 問題番号 (1-20)
}

// Test問題
export interface TestQuestion {
  id: number;
  story: string;
}

// 映画コメント
export interface MovieComment {
  id: number;
  movie_id: number;
  comment: string;
  created_at: string;
}

// Practice回答
export interface PracticeAnswer {
  id: number;
  question_index: number;
  selected_a: number;
  selected_b: number;
  is_correct: boolean;
  comment: string;
  created_at: string;
}

// Test回答
export interface TestAnswer {
  id: number;
  question_id: number;
  selected_a: number;
  selected_b: number;
  comment: string;
  created_at: string;
}

// 予測アップロード
export interface PredictionUpload {
  id: number;
  name: string;
  created_at: string;
  prediction_count: number;
  correct_count: number;
}

// 予測
export interface Prediction {
  id: number;
  upload_id: number;
  question_index: number;
  selected_a: number;
  selected_b: number;
  upload_name?: string;
  upload_date?: string;
}

// 映画名詞キャッシュ
export interface MovieNouns {
  id: number;
  movie_id: number;
  nouns: string[];
  created_at: string;
}

// 融合ストーリー名詞キャッシュ
export interface FictionNouns {
  id: number;
  question_index: number;
  nouns: string[];
  created_at: string;
}
