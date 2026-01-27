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
