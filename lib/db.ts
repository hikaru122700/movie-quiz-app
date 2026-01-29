import { neon, NeonQueryFunction } from '@neondatabase/serverless';

let sql: NeonQueryFunction<false, false> | null = null;

function getSQL() {
  if (!sql) {
    sql = neon(process.env.DATABASE_URL!);
  }
  return sql;
}

// データベース初期化
export async function initDatabase() {
  const db = getSQL();
  await db`
    CREATE TABLE IF NOT EXISTS movie_comments (
      id SERIAL PRIMARY KEY,
      movie_id INTEGER NOT NULL,
      comment TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await db`
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

  await db`
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
  const db = getSQL();
  const comments = await db`
    SELECT * FROM movie_comments
    WHERE movie_id = ${movieId}
    ORDER BY created_at DESC
  `;
  return comments;
}

// 映画コメント追加
export async function addMovieComment(movieId: number, comment: string) {
  const db = getSQL();
  const result = await db`
    INSERT INTO movie_comments (movie_id, comment)
    VALUES (${movieId}, ${comment})
    RETURNING *
  `;
  return result[0];
}

// 映画コメント更新
export async function updateMovieComment(id: number, comment: string) {
  const db = getSQL();
  const result = await db`
    UPDATE movie_comments
    SET comment = ${comment}
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0];
}

// 映画コメント削除
export async function deleteMovieComment(id: number) {
  const db = getSQL();
  await db`
    DELETE FROM movie_comments
    WHERE id = ${id}
  `;
}

// Practice回答取得
export async function getPracticeAnswers(questionIndex: number) {
  const db = getSQL();
  const answers = await db`
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
  const db = getSQL();
  const result = await db`
    INSERT INTO practice_answers (question_index, selected_a, selected_b, is_correct, comment)
    VALUES (${questionIndex}, ${selectedA}, ${selectedB}, ${isCorrect}, ${comment})
    RETURNING *
  `;
  return result[0];
}

// Test回答取得
export async function getTestAnswers(questionId: number) {
  const db = getSQL();
  const answers = await db`
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
  const db = getSQL();
  const result = await db`
    INSERT INTO test_answers (question_id, selected_a, selected_b, comment)
    VALUES (${questionId}, ${selectedA}, ${selectedB}, ${comment})
    RETURNING *
  `;
  return result[0];
}

// Practice予測アップロード用テーブル作成
export async function initPredictionsTable() {
  const db = getSQL();
  await db`
    CREATE TABLE IF NOT EXISTS practice_prediction_uploads (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await db`
    CREATE TABLE IF NOT EXISTS practice_predictions (
      id SERIAL PRIMARY KEY,
      upload_id INTEGER NOT NULL REFERENCES practice_prediction_uploads(id) ON DELETE CASCADE,
      question_index INTEGER NOT NULL,
      selected_a INTEGER NOT NULL,
      selected_b INTEGER NOT NULL
    )
  `;
}

// 予測アップロード一覧取得
export async function getPredictionUploads() {
  const db = getSQL();
  const uploads = await db`
    SELECT pu.*,
      (SELECT COUNT(*) FROM practice_predictions pp WHERE pp.upload_id = pu.id) as prediction_count,
      (SELECT COUNT(*) FROM practice_predictions pp
        JOIN (SELECT index as idx, id_a, id_b FROM (VALUES
          (1,29,23),(2,3,35),(3,11,43),(4,19,5),(5,2,19),
          (6,26,19),(7,16,21),(8,24,18),(9,13,28),(10,26,30),
          (11,41,10),(12,34,8),(13,30,5),(14,40,50),(15,19,8),
          (16,32,50),(17,36,10),(18,49,48),(19,43,11),(20,8,50)
        ) AS t(index, id_a, id_b)) correct
        ON pp.question_index = correct.idx
        AND ((pp.selected_a = correct.id_a AND pp.selected_b = correct.id_b)
          OR (pp.selected_a = correct.id_b AND pp.selected_b = correct.id_a))
        WHERE pp.upload_id = pu.id
      ) as correct_count
    FROM practice_prediction_uploads pu
    ORDER BY pu.created_at DESC
  `;
  return uploads;
}

// 予測アップロード追加
export async function addPredictionUpload(name: string) {
  const db = getSQL();
  const result = await db`
    INSERT INTO practice_prediction_uploads (name)
    VALUES (${name})
    RETURNING *
  `;
  return result[0];
}

// 予測追加
export async function addPrediction(uploadId: number, questionIndex: number, selectedA: number, selectedB: number) {
  const db = getSQL();
  await db`
    INSERT INTO practice_predictions (upload_id, question_index, selected_a, selected_b)
    VALUES (${uploadId}, ${questionIndex}, ${selectedA}, ${selectedB})
  `;
}

// 特定アップロードの予測取得
export async function getPredictionsByUploadId(uploadId: number) {
  const db = getSQL();
  const predictions = await db`
    SELECT * FROM practice_predictions
    WHERE upload_id = ${uploadId}
    ORDER BY question_index
  `;
  return predictions;
}

// 特定問題の全予測取得
export async function getPredictionsForQuestion(questionIndex: number) {
  const db = getSQL();
  const predictions = await db`
    SELECT pp.*, pu.name as upload_name, pu.created_at as upload_date
    FROM practice_predictions pp
    JOIN practice_prediction_uploads pu ON pp.upload_id = pu.id
    WHERE pp.question_index = ${questionIndex}
    ORDER BY pu.created_at DESC
  `;
  return predictions;
}

// 予測アップロード削除
export async function deletePredictionUpload(uploadId: number) {
  const db = getSQL();
  await db`DELETE FROM practice_prediction_uploads WHERE id = ${uploadId}`;
}

// 全映画のコメント数取得
export async function getMovieCommentCounts() {
  const db = getSQL();
  const counts = await db`
    SELECT movie_id, COUNT(*) as count
    FROM movie_comments
    GROUP BY movie_id
  `;
  return counts;
}

// 名詞キャッシュテーブル初期化
export async function initNounsTable() {
  const db = getSQL();
  await db`
    CREATE TABLE IF NOT EXISTS movie_nouns (
      id SERIAL PRIMARY KEY,
      movie_id INTEGER NOT NULL UNIQUE,
      nouns TEXT[] NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

// 名詞キャッシュ取得（単一映画）
export async function getMovieNouns(movieId: number) {
  const db = getSQL();
  const result = await db`
    SELECT * FROM movie_nouns
    WHERE movie_id = ${movieId}
  `;
  return result[0] || null;
}

// 名詞キャッシュ取得（全映画）
export async function getAllMovieNouns() {
  const db = getSQL();
  const result = await db`
    SELECT * FROM movie_nouns
    ORDER BY movie_id
  `;
  return result;
}

// 名詞キャッシュ追加/更新
export async function upsertMovieNouns(movieId: number, nouns: string[]) {
  const db = getSQL();
  const result = await db`
    INSERT INTO movie_nouns (movie_id, nouns)
    VALUES (${movieId}, ${nouns})
    ON CONFLICT (movie_id)
    DO UPDATE SET nouns = ${nouns}, created_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  return result[0];
}

// 名詞キャッシュ全削除
export async function deleteAllMovieNouns() {
  const db = getSQL();
  await db`DELETE FROM movie_nouns`;
}

// 名詞キャッシュの件数取得
export async function getMovieNounsCount() {
  const db = getSQL();
  const result = await db`
    SELECT COUNT(*) as count FROM movie_nouns
  `;
  return parseInt(result[0].count, 10);
}

// 融合ストーリー名詞テーブル初期化
export async function initFictionNounsTable() {
  const db = getSQL();
  await db`
    CREATE TABLE IF NOT EXISTS fiction_nouns (
      id SERIAL PRIMARY KEY,
      question_index INTEGER NOT NULL UNIQUE,
      nouns TEXT[] NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

// 融合ストーリー名詞取得（単一）
export async function getFictionNouns(questionIndex: number) {
  const db = getSQL();
  const result = await db`
    SELECT * FROM fiction_nouns
    WHERE question_index = ${questionIndex}
  `;
  return result[0] || null;
}

// 融合ストーリー名詞取得（全件）
export async function getAllFictionNouns() {
  const db = getSQL();
  const result = await db`
    SELECT * FROM fiction_nouns
    ORDER BY question_index
  `;
  return result;
}

// 融合ストーリー名詞追加/更新
export async function upsertFictionNouns(questionIndex: number, nouns: string[]) {
  const db = getSQL();
  const result = await db`
    INSERT INTO fiction_nouns (question_index, nouns)
    VALUES (${questionIndex}, ${nouns})
    ON CONFLICT (question_index)
    DO UPDATE SET nouns = ${nouns}, created_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  return result[0];
}

// 融合ストーリー名詞全削除
export async function deleteAllFictionNouns() {
  const db = getSQL();
  await db`DELETE FROM fiction_nouns`;
}

// 融合ストーリー名詞の件数取得
export async function getFictionNounsCount() {
  const db = getSQL();
  const result = await db`
    SELECT COUNT(*) as count FROM fiction_nouns
  `;
  return parseInt(result[0].count, 10);
}
