import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL!);

// データベース初期化
export async function initDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS movie_comments (
      id SERIAL PRIMARY KEY,
      movie_id INTEGER NOT NULL,
      comment TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS practice_answers (
      id SERIAL PRIMARY KEY,
      question_index INTEGER NOT NULL,
      selected_a INTEGER NOT NULL,
      selected_b INTEGER NOT NULL,
      is_correct BOOLEAN NOT NULL,
      comment TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS test_answers (
      id SERIAL PRIMARY KEY,
      question_id INTEGER NOT NULL,
      selected_a INTEGER NOT NULL,
      selected_b INTEGER NOT NULL,
      comment TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

// 映画コメント取得
export async function getMovieComments(movieId: number) {
  const comments = await sql`
    SELECT * FROM movie_comments
    WHERE movie_id = ${movieId}
    ORDER BY created_at DESC
  `;
  return comments;
}

// 映画コメント追加
export async function addMovieComment(movieId: number, comment: string) {
  const result = await sql`
    INSERT INTO movie_comments (movie_id, comment)
    VALUES (${movieId}, ${comment})
    RETURNING *
  `;
  return result[0];
}

// Practice回答取得
export async function getPracticeAnswers(questionIndex: number) {
  const answers = await sql`
    SELECT * FROM practice_answers
    WHERE question_index = ${questionIndex}
    ORDER BY created_at DESC
  `;
  return answers;
}

// Practice回答追加
export async function addPracticeAnswer(
  questionIndex: number,
  selectedA: number,
  selectedB: number,
  isCorrect: boolean,
  comment: string
) {
  const result = await sql`
    INSERT INTO practice_answers (question_index, selected_a, selected_b, is_correct, comment)
    VALUES (${questionIndex}, ${selectedA}, ${selectedB}, ${isCorrect}, ${comment})
    RETURNING *
  `;
  return result[0];
}

// Test回答取得
export async function getTestAnswers(questionId: number) {
  const answers = await sql`
    SELECT * FROM test_answers
    WHERE question_id = ${questionId}
    ORDER BY created_at DESC
  `;
  return answers;
}

// Test回答追加
export async function addTestAnswer(
  questionId: number,
  selectedA: number,
  selectedB: number,
  comment: string
) {
  const result = await sql`
    INSERT INTO test_answers (question_id, selected_a, selected_b, comment)
    VALUES (${questionId}, ${selectedA}, ${selectedB}, ${comment})
    RETURNING *
  `;
  return result[0];
}
