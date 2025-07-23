import React, { Suspense } from "react";
import TaskList from "./TaskList";
import { getTasks } from "@/app/services/taskService";

export default async function page() {
  console.log("TaskList Server");
  const tasks = getTasks();
  return (
    <>
      <Suspense
        fallback={
          <div className="text-center">
            <div>Loading...</div>
          </div>
        }
      >
        <TaskList allTasks={tasks} />
      </Suspense>
    </>
  );
}
