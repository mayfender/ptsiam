import Database from "better-sqlite3";
import path from "path";

// Connect to SQLite database
// const dbPath = "D:\\DB\\SQLite\\autodialer.db";
// const db = new Database(dbPath, {
const db = new Database(path.resolve("./db/db_1.db"), {
  verbose: console.log,
});

// Create tasks Table (if not exists)

/*
INSERT INTO tasks (name, status, statuses, current_step, is_deleted, created_at)
VALUES ("test", "a", "", 1, 0, "2025-06-19T03:04:47.502Z");
*/
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    statuses TEXT NOT NULL, -- Stores JSON object
    current_step INTEGER NOT NULL,
    upload_file_path TEXT,
    update_file_path TEXT,
    is_deleted INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT,
    created_by TEXT,
    updated_by TEXT
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS land_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    id_no TEXT UNIQUE NOT NULL,
    deed_no TEXT, -- เลขโฉนด
    survey_no TEXT, -- หน้าสำรวจ
    parcel_no TEXT, -- เลขที่ดิน
    status TEXT,
    land_office TEXT, -- สำนักงานที่ดิน
    Land_dep TEXT,  -- ที่ตั้งสำนักเขตที่ดิน
    created_at TEXT NOT NULL,
    updated_at TEXT,
    created_by TEXT,
    updated_by TEXT
  );
`);

export default db;
