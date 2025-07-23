"use server";
import db from "@/app/libs/db";

export async function getTasks() {
  await new Promise((resolve: any) => setTimeout(resolve, 3000));
  console.log("getTasks");
  try {
    let sql = `
    SELECT id, name, status, statuses, current_step, created_at FROM tasks 
    WHERE is_deleted = 0 
    ORDER BY created_at DESC`;
    return db.prepare(sql).all();
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
