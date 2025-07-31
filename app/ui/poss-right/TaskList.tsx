"use client";
import React, { use, useEffect, useState } from "react";
import {
  FileSpreadsheet,
  Plus,
  Clock,
  Trash2,
  Eye,
  Calendar,
  FolderOpen,
  House,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import TaskDetail from "./TaskDetail";
import { formatInTimeZone } from "date-fns-tz";
import { datas } from "./data";
import { createTask, getTasksAndCount } from "@/app/services/taskService";
import Toastify from "@/app/libs/Toastify";
import { toast } from "react-toastify";

const TaskList = ({ taskData }: { taskData: Promise<any> }) => {
  console.log("TaskList Client");
  const taskDataUse = use(taskData);
  const [currentView, setCurrentView] = useState("list"); // 'list' or 'detail'
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const [tasks, setTasks] = useState(taskDataUse[0]);
  const [countTasks, setCountTasks] = useState(taskDataUse[1]);

  // New task form state
  const [newTaskName, setNewTaskName] = useState("");
  const [taskFormStatus, setTaskFormStatus] = useState("idle");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [startIndex, setStartIndex] = useState<number>(0);
  const [endIndex, setEndIndex] = useState<number>(0);

  const paginationData = ({
    count,
    page,
    itemsPerPage,
  }: {
    count: any;
    page: any;
    itemsPerPage: any;
  }) => {
    setTotalItems(count);
    setTotalPages(Math.ceil(count / itemsPerPage));
    let start = (page - 1) * itemsPerPage;
    setStartIndex(start);
    setEndIndex(start + itemsPerPage);
  };

  const updateTask = async ({
    page,
    pageSize,
  }: {
    page: number;
    pageSize: number;
  }) => {
    const offset = (page - 1) * pageSize;
    const taskData: any = await getTasksAndCount({
      pageSize: pageSize,
      offset: offset,
    });
    setTasks(taskData[0]);
    setCountTasks(taskData[1]);

    paginationData({ count: taskData[1], page: page, itemsPerPage: pageSize });
  };

  const getStatusText = (status: any, action?: any) => {
    const statusMap: any = {
      creating: "Creating task...",
      uploading: "Uploading file...",
      updating: "Updating file...",
      downloading: "Preparing download...",
      created: "Task created successfully",
      uploaded: "File uploaded successfully",
      updated: "File updated successfully",
      ready: "Ready to download",
      completed: "Completed",
      error: `Error ${action}`,
      in_progress: "In Progress",
      idle: "Ready",
    };
    return statusMap[status] || "Ready";
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCreateNewTask = async () => {
    if (!newTaskName.trim()) return;

    try {
      setTaskFormStatus("creating");
      const newTask: any = {
        // id: tasks.length + 1,
        name: newTaskName,
        created_at: new Date(),
        status: "in_progress",
        // currentStep: 1,
        current_step: 2,
        files: { original: null, updated: null },
        statuses: {
          task: "created",
          upload: "idle",
          update: "idle",
          download: "idle",
        },
      };
      const newTaskId = await createTask({
        task: newTask,
      });

      newTask.id = newTaskId;
      setTasks((prev: any) => [newTask, ...prev]);
      setNewTaskName("");
      setTaskFormStatus("idle");

      // Auto-navigate to the new task
      setSelectedTask(newTask);
      setCurrentView("detail");
    } catch (error: any) {
      toast.error(error.message, {
        autoClose: 10000,
        progress: undefined,
      });
      console.error(error);
    }
  };

  const handleDeleteTask = (taskId: any) => {
    setTasks((prev: any) => prev.filter((task: any) => task.id !== taskId));
    if (selectedTask?.id === taskId) {
      setCurrentView("list");
      setSelectedTask(null);
    }
  };

  const handleViewTask = (task: any) => {
    setSelectedTask(task);
    setCurrentView("detail");
  };

  const handlePageChange = (page: any) => {
    setCurrentPage(page);
    updateTask({ page: page, pageSize: itemsPerPage });
  };

  const handleItemsPerPageChange = (newItemsPerPage: any) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
    updateTask({ page: 1, pageSize: newItemsPerPage });
  };

  useEffect(() => {
    paginationData({ count: countTasks, page: 1, itemsPerPage: itemsPerPage });
  }, []);

  // Task List View
  if (currentView === "list") {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-white min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <div className="flex mb-2">
            <h1 className="text-3xl font-bold text-gray-900 grow">
              คัดข้อมูลที่ดิน
            </h1>
            <div className="grow flex justify-end items-center">
              <ArrowLeft className="w-4 h-4 mr-1" />
              <Link href="/">Back Main Menu</Link>
            </div>
          </div>
          <p className="text-gray-600">Possessor Right</p>
        </div>

        {/* New Task Form */}
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Create New Task
          </h2>
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Enter task name..."
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              disabled={taskFormStatus === "creating"}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed bg-white"
            />
            <button
              onClick={handleCreateNewTask}
              disabled={!newTaskName.trim() || taskFormStatus === "creating"}
              className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {taskFormStatus === "creating" ? (
                <Clock className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>
                {taskFormStatus === "creating" ? "Creating..." : "Create Task"}
              </span>
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FolderOpen className="w-5 h-5 mr-2" />
              Your Tasks ({totalItems})
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) =>
                    handleItemsPerPageChange(Number(e.target.value))
                  }
                  className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-600">per page</span>
              </div>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FileSpreadsheet className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">
                No tasks yet. Create your first task above!
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Task Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tasks.map((task: any, index: any) => (
                      <tr
                        key={task.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex justify-center items-center w-12 mr-2">
                              <span className="grow">
                                {1 + index + startIndex}.
                              </span>
                              <FileSpreadsheet className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {task.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {/* <p>(500 | เจอ 300/100 | ส่ง 100/50)</p> */}
                                <p>
                                  (Upload : ข้อมูลใหม่ :{" "}
                                  {task.uploadInfo?.uploadInserted}, เจอในระบบ :{" "}
                                  {task.uploadInfo?.uploadUpdated})
                                </p>
                              </div>
                              {/* <div className="text-xs text-gray-500">
                                <p>Import 500 รายการ</p>
                                <p>เจอ 300 รายการ</p>
                                <p>ใหม่ 100 รายการ</p>
                              </div> */}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              task.status
                            )}`}
                          >
                            {getStatusText(task.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className="w-full bg-gray-200 rounded-full h-2 mr-3"
                              style={{ width: "100px" }}
                            >
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{
                                  width: `${(task.current_step / 4) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 min-w-0">
                              {task.current_step}/4 (
                              {Math.round((task.current_step / 4) * 100)}%)
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatInTimeZone(
                              task.created_at,
                              "Asia/Bangkok",
                              "dd/MM/yyyy HH:mm"
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleViewTask(task)}
                              className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 text-sm rounded-md hover:bg-blue-200 transition-colors"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-md hover:bg-red-200 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white px-6 py-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center text-sm text-gray-500">
                    Showing {startIndex + 1} to {Math.min(endIndex, totalItems)}{" "}
                    of {totalItems} results
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </button>

                    <div className="flex space-x-1">
                      {/* First page */}
                      {currentPage > 3 && (
                        <>
                          <button
                            onClick={() => handlePageChange(1)}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            1
                          </button>
                          {currentPage > 4 && (
                            <span className="px-3 py-2 text-sm text-gray-500">
                              ...
                            </span>
                          )}
                        </>
                      )}

                      {/* Current page and neighbors */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (page) =>
                            page === currentPage ||
                            page === currentPage - 1 ||
                            page === currentPage + 1 ||
                            (currentPage <= 2 && page <= 3) ||
                            (currentPage >= totalPages - 1 &&
                              page >= totalPages - 2)
                        )
                        .map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                              currentPage === page
                                ? "bg-blue-500 text-white border border-blue-500"
                                : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        ))}

                      {/* Last page */}
                      {currentPage < totalPages - 2 && (
                        <>
                          {currentPage < totalPages - 3 && (
                            <span className="px-3 py-2 text-sm text-gray-500">
                              ...
                            </span>
                          )}
                          <button
                            onClick={() => handlePageChange(totalPages)}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <Toastify position="bottom-right" />
      </div>
    );
  }
  return (
    <TaskDetail
      setTasks={setTasks}
      selectedTask={selectedTask}
      setSelectedTask={setSelectedTask}
      setCurrentView={setCurrentView}
      getStatusText={getStatusText}
      getStatusColor={getStatusColor}
    />
  );
};

export default TaskList;
