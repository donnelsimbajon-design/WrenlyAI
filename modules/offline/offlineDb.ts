import * as SQLite from 'expo-sqlite';

// Initialize the database asynchronously
let db: SQLite.SQLiteDatabase | null = null;

export const initDB = async () => {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('wrenly_offline.db');
  
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      title TEXT,
      content_en TEXT,
      content_tl TEXT,
      content_ceb TEXT,
      grade_level INTEGER,
      file_size INTEGER,
      downloaded_at TEXT
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      lesson_id TEXT,
      questions TEXT
    );

    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id TEXT PRIMARY KEY,
      quiz_id TEXT,
      student_id TEXT,
      score INTEGER,
      answers TEXT,
      completed_at TEXT,
      synced INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      classroom_id TEXT,
      sender_id TEXT,
      message TEXT,
      is_ai INTEGER,
      created_at TEXT,
      synced INTEGER DEFAULT 0
    );
  `);
  
  return db;
};

export const getDB = async () => {
  if (!db) return await initDB();
  return db;
};
