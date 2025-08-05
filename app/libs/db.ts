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
    upload_info TEXT,
    upload_file_name TEXT,
    update_file_name TEXT,
    is_deleted INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT,
    created_by TEXT,
    updated_by TEXT
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS lands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    id_no TEXT UNIQUE NOT NULL,
    deed_no TEXT, -- เลขโฉนด
    survey_no TEXT, -- หน้าสำรวจ
    parcel_no TEXT, -- เลขที่ดิน
    status TEXT,
    updated_status INTEGER NOT NULL DEFAULT 0, -- 0:init, 1:found, 2:notfound
    land_office TEXT, -- สำนักงานที่ดิน
    Land_dep TEXT,  -- ที่ตั้งสำนักเขตที่ดิน
    json_data TEXT,
    data_date TEXT,  -- วันที่ข้อมูล
    created_at TEXT NOT NULL,
    updated_at TEXT,
    created_by TEXT,
    updated_by TEXT
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS task_land (
    task_id INTEGER NOT NULL,
    land_id INTEGER NOT NULL,
    is_new TEXT NOT NULL, -- N:old, Y:new
    PRIMARY KEY (task_id, land_id), -- Ensures a unique combination of task_id and land_id
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (land_id) REFERENCES lands(id) ON DELETE CASCADE
  );
`);

export default db;
