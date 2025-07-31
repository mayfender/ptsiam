"use server";
import db from "@/app/libs/db";

export async function createTask({ task }: { task: any }) {
  try {
    let sql = `
    INSERT INTO tasks (name, status, statuses, current_step, created_at) 
    VALUES (@name, @status, @statuses, @current_step, @created_at)`;

    let stmt = db.prepare(sql);

    const now = new Date().toISOString();
    const info: any = stmt.run({
      name: task.name,
      status: task.status,
      statuses: JSON.stringify(task.statuses),
      current_step: task.current_step,
      created_at: now,
    });
    return info.lastInsertRowid;
  } catch (error: any) {
    console.log(error);
    throw error;
  }
}

/*
* Download


SELECT *
FROM lands l
JOIN task_land tl on l.id = tl.land_id
WHERE tl.task_id = 6 and l.updated_status = 0
*/

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

export async function updateData({
  taskId,
  jsonData,
  updateStatus,
  currentStep,
  updateFileName,
}: {
  taskId: any;
  jsonData: any;
  updateStatus: any;
  currentStep: any;
  updateFileName: any;
}) {
  try {
    const headerIndex = getHeaderInfo(jsonData[0], {
      id_no: true,
      deed_no: true,
    });

    let headerIndexInvert: any = {};
    for (const [key, value] of Object.entries(headerIndex)) {
      headerIndexInvert[value as number] = key;
    }

    let lData: any = [];
    let data: any;
    jsonData.slice(1).map((row: any, i: any) => {
      data = { jsonData: {}, updatedStatus: 1 };
      row.some((col: any, j: any) => {
        if (j == headerIndex.id_no) {
          data.idno = col.replace(/\D/g, "");
          if (!data.idno) return true; // Stop iterate
        } else {
          data.jsonData = {
            ...data.jsonData,
            [headerIndexInvert[j] || "column_" + j]: col,
          };
        }
        return false;
      });
      data.jsonData = [data.jsonData]; // Convert to array object

      if (data.idno) {
        const dataDup = lData.find((d: any) => d.idno === data.idno);
        if (dataDup) {
          dataDup.jsonData = [...dataDup.jsonData, data.jsonData];
        } else {
          lData.push(data);
        }
      }
    });

    lData = lData.map((d: any) => ({
      ...d,
      jsonData: JSON.stringify(d.jsonData),
    }));

    const updateLandStmt = db.prepare(
      "UPDATE lands SET json_data = :jsonData, updated_status = :updatedStatus WHERE id_no = :idno"
    );
    const updateStmt = db.prepare(
      `UPDATE tasks 
        SET 
          current_step = :currentStep,
          status = :status,
          statuses = json_set(statuses, '$."update"', :statuses),
          update_file_name = :updateFileName
        WHERE id =:taskId`
    );
    const updateMultipleRows = db.transaction((rowsToUpdate) => {
      /*
      -- Update All on taskID 
        UPDATE lands
        SET updated_status = 2 -- Set to notfound first.
        FROM task_land tl
        JOIN tasks t on tl.task_id = t.id
        WHERE lands.id = tl.land_id AND t.id = 5
      */

      for (const rowData of rowsToUpdate) {
        updateLandStmt.run(rowData);
      }

      //--------------: Update Task
      updateStmt.run({
        taskId: taskId,
        currentStep: currentStep,
        status: "completed",
        statuses: updateStatus,
        updateFileName: updateFileName,
      });
      return { status: "ok" };
    });

    const result = updateMultipleRows(lData);
    return result;
  } catch (error: any) {
    console.log(error);
    throw error;
  }
}

export async function uploadData({
  taskId,
  jsonData,
  uploadStatus,
  currentStep,
  uploadFileName,
}: {
  taskId: any;
  jsonData: any;
  uploadStatus: any;
  currentStep: any;
  uploadFileName: any;
}) {
  // await new Promise((resolve: any) => setTimeout(resolve, 10000));
  try {
    const headerIndex = getHeaderInfo(jsonData[0], {
      name: true,
      id_no: true,
    });

    const now = new Date().toISOString();
    const lData: any = [];
    let data: any;
    jsonData.slice(1).map((row: any, i: any) => {
      data = {};
      row.map((col: any, j: any) => {
        if (j == headerIndex.name) {
          data.name = col;
        } else if (j == headerIndex.id_no) {
          data.idno = col.replace(/\D/g, "");
        }
      });
      data.createdAt = now;
      data.updatedAt = now;
      lData.push(data);
    });

    const insert = db.prepare(
      `INSERT INTO lands (name, id_no, created_at) VALUES (@name, @idno, @createdAt)
      ON CONFLICT(id_no) DO UPDATE SET
      updated_at = @updatedAt
      RETURNING id, updated_at, updated_status;`
    );
    const insertMapping = db.prepare(
      `INSERT INTO task_land (task_id, land_id, is_new) VALUES (@taskId, @landId, @isNew)`
    );
    const updateUploadStmt = db.prepare(
      `UPDATE tasks 
        SET 
          upload_info = :uploadInfo,
          current_step = :currentStep,
          statuses = json_set(statuses, '$."upload"', :statuses),
          upload_file_name = :uploadFileName
        WHERE id =:taskId`
    );
    const updateUpdateStmt = db.prepare(
      `UPDATE tasks 
        SET 
          upload_info = :uploadInfo,
          current_step = :currentStep,
          status = :status,
          statuses = json_set(statuses, '$."upload"', :statusesUpload, '$."update"', :statusesUpdate),
          upload_file_name = :uploadFileName
        WHERE id =:taskId`
    );
    const insertManyUsers = db.transaction((datas: any) => {
      let row: any,
        updatedCount = 0,
        isNew,
        readyDataCount = 0;
      for (const data of datas) {
        row = insert.get(data);

        if (row.updated_at) {
          updatedCount++;
          isNew = "N";
        } else {
          isNew = "Y";
        }

        if (row.updated_status == 1) {
          readyDataCount++;
        }

        insertMapping.run({
          taskId: taskId,
          landId: row.id,
          isNew: isNew, //-- O:OLD, N:NEW
        });
      }

      const uploadResult: any = {
        inserted: datas.length - updatedCount,
        updated: updatedCount,
        readyDataCount: readyDataCount,
      };

      //--------------: Update Task
      if (readyDataCount == datas.length) {
        updateUpdateStmt.run({
          taskId: taskId,
          uploadInfo: JSON.stringify({
            uploadInserted: uploadResult.inserted,
            uploadUpdated: uploadResult.updated,
            readyDataCount: uploadResult.readyDataCount,
          }),
          currentStep: 4,
          statusesUpload: "uploaded",
          statusesUpdate: "updated",
          status: "completed",
          uploadFileName: uploadFileName,
        });
        uploadResult.isCompleted = true;
      } else {
        updateUploadStmt.run({
          taskId: taskId,
          uploadInfo: JSON.stringify({
            uploadInserted: uploadResult.inserted,
            uploadUpdated: uploadResult.updated,
            readyDataCount: uploadResult.readyDataCount,
          }),
          currentStep: currentStep,
          statuses: uploadStatus,
          uploadFileName: uploadFileName,
        });
      }

      return uploadResult;
    });

    const result = insertManyUsers(lData);
    return result;
  } catch (error: any) {
    console.log(error);
    throw error;
  }
}

/*
export async function updateData() {
  try {
  } catch (error: any) {
    console.log(error);
    throw error;
  }
}
*/

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
    SELECT id, name, status, statuses, current_step, upload_info, created_at 
    FROM tasks 
    WHERE is_deleted = 0 
    ORDER BY created_at DESC
    LIMIT :limite OFFSET :offset`;

    const rows = db.prepare(sql).all({ limite: pageSize, offset: offset });
    return rows.map((row: any) => ({
      ...row,
      statuses: JSON.parse(row.statuses),
      uploadInfo: row.upload_info ? JSON.parse(row.upload_info) : {},
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

function getHeaderInfo(headers: any, constraint: any) {
  const headerIndex: any = { name: -1, id_no: -1, deed_no: -1 };
  headers.map((row: any, index: any) => {
    if (row.toLowerCase() == "name") {
      headerIndex.name = index;
    } else if (row.toLowerCase() == "id_no") {
      headerIndex.id_no = index;
    } else {
      headerIndex[row] = index;
    }
  });

  if (constraint) {
    for (const [key, value] of Object.entries(headerIndex)) {
      if (constraint[key]) {
        if ((value as number) < 0) throw Error(`Column Not Found [${key}]`);
      }
    }
  }
  return headerIndex;
}
