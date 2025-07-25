import React, { Suspense } from "react";
import TaskList from "./TaskList";
import { getTasksAndCount } from "@/app/services/taskService";

export default async function page() {
  console.log("TaskList Server");
  // const tasks = getTasks({ pageSize: 5, offset: 0 });
  // const count = countTasks();
  const taskData = getTasksAndCount({ pageSize: 5, offset: 0 });
  return (
    <>
      <Suspense
        fallback={
          <div className="text-center">
            <div>Loading...</div>
          </div>
        }
      >
        <TaskList taskData={taskData} />
      </Suspense>
    </>
  );
}
