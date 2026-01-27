import { readFileSync } from 'fs';
import { join } from 'path';
import { Movie, PracticeQuestion, TestQuestion } from './types';

// データディレクトリへのパス
const DATA_DIR = join(process.cwd(), 'data');

// TSVファイルをパース
function parseTsv<T>(content: string, mapper: (row: string[]) => T): T[] {
  const lines = content.trim().split('\n');
  const headers = lines[0].split('\t');
  const data: T[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\t');
    if (values.length >= headers.length) {
      data.push(mapper(values));
    }
  }

  return data;
}

// 映画データ読み込み
export function getMovies(): Movie[] {
  const content = readFileSync(join(DATA_DIR, 'base_stories.tsv'), 'utf-8');
  return parseTsv(content, (row) => ({
    id: parseInt(row[0], 10),
    category: row[1],
    title: row[2],
    story: row[3],
  }));
}

// 映画を1件取得
export function getMovieById(id: number): Movie | undefined {
  const movies = getMovies();
  return movies.find(m => m.id === id);
}

// Practice問題読み込み
export function getPracticeQuestions(): PracticeQuestion[] {
  const content = readFileSync(join(DATA_DIR, 'fiction_stories_practice.tsv'), 'utf-8');
  let index = 0;
  return parseTsv(content, (row) => {
    index++;
    return {
      id_a: parseInt(row[0], 10),
      id_b: parseInt(row[1], 10),
      title_a: row[2],
      title_b: row[3],
      story: row[4],
      index,
    };
  });
}

// Practice問題を1件取得
export function getPracticeQuestionByIndex(index: number): PracticeQuestion | undefined {
  const questions = getPracticeQuestions();
  return questions.find(q => q.index === index);
}

// Test問題読み込み
export function getTestQuestions(): TestQuestion[] {
  const content = readFileSync(join(DATA_DIR, 'fiction_stories_test.tsv'), 'utf-8');
  return parseTsv(content, (row) => ({
    id: parseInt(row[0], 10),
    story: row[1],
  }));
}

// Test問題を1件取得
export function getTestQuestionById(id: number): TestQuestion | undefined {
  const questions = getTestQuestions();
  return questions.find(q => q.id === id);
}
