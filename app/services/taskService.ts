"use server";
import db from "@/app/libs/db";

export async function getTasksAndCount({
  pageSize,
  offset,
}: {
  pageSize: number;
  offset: number;
}) {
  try {
    return Promise.all([
      getTasks({ pageSize: pageSize, offset: offset }),
      countTasks(),
    ]);
  } catch (error: any) {
    console.log(error);
    throw error;
  }
}

interface header {
  name: number;
  idno: number;
}
export async function uploadData({ jsonData }: { jsonData: any }) {
  // await new Promise((resolve: any) => setTimeout(resolve, 10000));
  try {
    const headerIndex: header = { name: 0, idno: 0 };
    jsonData[0].map((row: any, index: any) => {
      if (row.toLowerCase() == "name") {
        headerIndex.name = index;
      } else if (row.toLowerCase() == "id_no") {
        headerIndex.idno = index;
      }
    });

    const now = new Date().toISOString();
    const lData: any = [];
    let data: any;
    jsonData.slice(1).map((col: any, i: any) => {
      data = {};
      col.map((row: any, j: any) => {
        if (j == headerIndex.name) {
          data.name = row;
        } else if (j == headerIndex.idno) {
          data.idno = row;
        }
      });
      data.createdAt = now;
      lData.push(data);
    });

    let sql = `
    INSERT INTO land_data (name, id_no, created_at) 
    VALUES (@name, @idno, @createdAt)`;

    const insert = db.prepare(sql);
    const insertManyUsers = db.transaction((datas) => {
      for (const data of datas) {
        insert.run(data);
      }
    });

    insertManyUsers(lData);
  } catch (error: any) {
    console.log(error);
    throw error;
  }
}

export async function updateData() {
  try {
  } catch (error: any) {
    console.log(error);
    throw error;
  }
}

async function getTasks({
  pageSize,
  offset,
}: {
  pageSize: number;
  offset: number;
}) {
  // await new Promise((resolve: any) => setTimeout(resolve, 1000));
  console.log("getTasks");
  try {
    let sql = `
    SELECT id, name, status, statuses, current_step, created_at 
    FROM tasks 
    WHERE is_deleted = 0 
    ORDER BY created_at DESC
    LIMIT :limite OFFSET :offset`;

    const rows = db.prepare(sql).all({ limite: pageSize, offset: offset });
    return rows.map((row: any) => ({
      ...row,
      statuses: JSON.parse(row.statuses),
    }));
  } catch (error: any) {
    console.log(error);
    throw error;
  }
}

async function countTasks() {
  // await new Promise((resolve: any) => setTimeout(resolve, 5000));
  try {
    const count: any = db
      .prepare("SELECT COUNT(*) as count FROM tasks WHERE is_deleted = 0 ")
      .get();
    return count.count;
  } catch (error: any) {
    console.log(error);
    throw error;
  }
}

////////////// Wait
export async function getPorts({ id }: { id?: any }) {
  // await new Promise((resolve: any) => setTimeout(resolve, 3000));
  console.log("getUsers Service");
  try {
    let sqlInit = "SELECT id, name, created_at FROM ports";
    let sql = "";
    if (id) {
      sql = `
        ${sqlInit} 
        WHERE id = ?`;
      const port = db.prepare(sql).get(id);
      return [port];
    } else {
      sql = `
        ${sqlInit}  
        ORDER BY name`;
      const ports = db.prepare(sql).all();
      return ports;
    }
  } catch (error: any) {
    console.log(error);
    throw error;
  }
}

export async function deletePort(id: any) {
  await new Promise((resolve: any) => setTimeout(resolve, 5000));
  console.log("deleteUser Service");

  try {
    const stmt = db.prepare("DELETE FROM ports WHERE id = @id");
    stmt.run({ id: id });
  } catch (error: any) {
    return { error: { code: error.code, message: error.message } };
  }
}

export async function addOrEditPorts(port: any) {
  try {
    const now = new Date().toISOString();
    if (port.id) {
      const stmt = db.prepare(
        `UPDATE ports SET name = @name, updated_at = @updated_at WHERE id = @id`
      );
      const updateVal: any = {
        name: port.name,
        updated_at: now,
        id: port.id,
      };
      stmt.run(updateVal);
    } else {
      const stmt = db.prepare(
        "INSERT INTO ports (name, created_at, updated_at) VALUES (?, ?, ?)"
      );
      stmt.run(port.name, now, now);
    }
  } catch (error: any) {
    return { error: { code: error.code, message: error.message } };
  }
}
