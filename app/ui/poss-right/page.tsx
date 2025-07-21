"use client";
import React, { useState } from "react";
import {
  Upload,
  Download,
  FileSpreadsheet,
  Plus,
  Check,
  Clock,
  AlertCircle,
  ArrowLeft,
  Trash2,
  Eye,
  Calendar,
  FolderOpen,
  House,
} from "lucide-react";
import Link from "next/link";

const TaskExcelManager = () => {
  const [currentView, setCurrentView] = useState("list"); // 'list' or 'detail'
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: "Q1 Sales Report Processing",
      createdAt: new Date("2025-01-15"),
      status: "completed",
      currentStep: 4,
      files: { original: "sales_q1.xlsx", updated: "sales_q1_updated.xlsx" },
      statuses: {
        task: "created",
        upload: "uploaded",
        update: "updated",
        download: "ready",
      },
    },
    {
      id: 2,
      name: "Employee Data Migration",
      createdAt: new Date("2025-01-20"),
      status: "in_progress",
      currentStep: 2,
      files: { original: "employees.xlsx", updated: null },
      statuses: {
        task: "created",
        upload: "uploaded",
        update: "idle",
        download: "idle",
      },
    },
  ]);

  // New task form state
  const [newTaskName, setNewTaskName] = useState("");
  const [taskFormStatus, setTaskFormStatus] = useState("idle");

  // Task detail states
  const [taskDetailStates, setTaskDetailStates] = useState<any>({});

  const getTaskDetailState = (taskId: any) => {
    return (
      taskDetailStates[taskId] || {
        uploadStatus: "idle",
        updateStatus: "idle",
        downloadStatus: "idle",
        files: { original: null, updated: null },
      }
    );
  };

  const updateTaskDetailState = (taskId: any, updates: any) => {
    setTaskDetailStates((prev: any) => ({
      ...prev,
      [taskId]: { ...getTaskDetailState(taskId), ...updates },
    }));
  };

  const StatusIcon = ({ status }: { status: any }) => {
    switch (status) {
      case "creating":
      case "uploading":
      case "updating":
      case "downloading":
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case "created":
      case "uploaded":
      case "updated":
      case "ready":
      case "completed":
        return <Check className="w-4 h-4 text-green-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return (
          <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
        );
    }
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

    setTaskFormStatus("creating");

    // Simulate API call
    setTimeout(() => {
      const newTask: any = {
        id: tasks.length + 1,
        name: newTaskName,
        createdAt: new Date(),
        status: "in_progress",
        currentStep: 1,
        files: { original: null, updated: null },
        statuses: {
          task: "created",
          upload: "idle",
          update: "idle",
          download: "idle",
        },
      };

      setTasks((prev: any) => [...prev, newTask]);
      setNewTaskName("");
      setTaskFormStatus("idle");

      // Auto-navigate to the new task
      setSelectedTask(newTask);
      setCurrentView("detail");
    }, 1500);
  };

  const handleDeleteTask = (taskId: any) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    if (selectedTask?.id === taskId) {
      setCurrentView("list");
      setSelectedTask(null);
    }
  };

  const handleViewTask = (task: any) => {
    setSelectedTask(task);
    setCurrentView("detail");
  };

  const handleFileUpload = async (event: any, isUpdate = false) => {
    const file = event.target.files[0];
    if (!file || !selectedTask) return;

    const taskId = selectedTask.id;
    const currentState = getTaskDetailState(taskId);

    if (isUpdate) {
      updateTaskDetailState(taskId, { updateStatus: "updating" });
    } else {
      updateTaskDetailState(taskId, { uploadStatus: "uploading" });
    }

    // Simulate file upload
    setTimeout(() => {
      if (isUpdate) {
        updateTaskDetailState(taskId, {
          updateStatus: "updated",
          files: { ...currentState.files, updated: file },
        });

        // Update main task status
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  currentStep: 4,
                  statuses: { ...task.statuses, update: "updated" },
                }
              : task
          )
        );
      } else {
        updateTaskDetailState(taskId, {
          uploadStatus: "uploaded",
          files: { ...currentState.files, original: file },
        });

        // Update main task status
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  currentStep: 3,
                  statuses: { ...task.statuses, upload: "uploaded" },
                }
              : task
          )
        );
      }
    }, 2000);
  };

  const handleDownload = async () => {
    if (!selectedTask) return;

    const taskId = selectedTask.id;
    updateTaskDetailState(taskId, { downloadStatus: "downloading" });

    setTimeout(() => {
      updateTaskDetailState(taskId, { downloadStatus: "ready" });

      // Update main task to completed
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: "completed",
                statuses: { ...task.statuses, download: "ready" },
              }
            : task
        )
      );

      // Simulate download
      const blob = new Blob(["Sample Excel data"], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedTask.name.replace(/\s+/g, "_")}_processed.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    }, 1000);
  };

  // Task List View
  if (currentView === "list") {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-white min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <div className="flex mb-2">
            <h1 className="text-3xl font-bold text-gray-900 grow">
              Task Excel Manager
            </h1>
            <div className="grow flex justify-end items-center">
              <House className="w-5 h-5 mr-2" strokeWidth={1.5} />
              <Link href="/">หน้าหลัก</Link>
            </div>
          </div>
          <p className="text-gray-600">
            Manage multiple Excel processing tasks
          </p>
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
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FolderOpen className="w-5 h-5 mr-2" />
            Your Tasks ({tasks.length})
          </h2>

          {tasks.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FileSpreadsheet className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">
                No tasks yet. Create your first task above!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tasks.map((task: any) => (
                <div
                  key={task.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-gray-900 truncate pr-2">
                      {task.name}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {getStatusText(task.status)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Created: {task.createdAt.toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Step: {task.currentStep}/4
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{Math.round((task.currentStep / 4) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${(task.currentStep / 4) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewTask(task)}
                      className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="px-3 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Task Detail View
  const currentState = getTaskDetailState(selectedTask.id);
  const steps = [
    { id: 1, title: "Task Created", status: selectedTask.statuses.task },
    { id: 2, title: "Upload Excel", status: selectedTask.statuses.upload },
    { id: 3, title: "Update Excel", status: selectedTask.statuses.update },
    { id: 4, title: "Download Result", status: selectedTask.statuses.download },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <button
            onClick={() => setCurrentView("list")}
            className="flex items-center text-blue-500 hover:text-blue-600 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Task List
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedTask.name}
          </h1>
          <p className="text-gray-600">
            Created on {selectedTask.createdAt.toLocaleDateString()}
          </p>
        </div>
        <span
          className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
            selectedTask.status
          )}`}
        >
          {getStatusText(selectedTask.status)}
        </span>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  selectedTask.currentStep > step.id
                    ? "bg-green-500 border-green-500 text-white"
                    : selectedTask.currentStep === step.id
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "bg-white border-gray-300 text-gray-500"
                }`}
              >
                {selectedTask.currentStep > step.id ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 w-24 ml-4 transition-all ${
                    selectedTask.currentStep > step.id
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          {steps.map((step) => (
            <span key={step.id} className="w-32 text-center">
              {step.title}
            </span>
          ))}
        </div>
      </div>

      {/* Step 2: Upload Excel */}
      <div
        className={`mb-6 p-6 rounded-lg border-l-4 transition-all ${
          selectedTask.currentStep >= 2
            ? "bg-gray-50 border-blue-500"
            : "bg-gray-100 border-gray-300 opacity-50"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Step 2: Upload Excel File
          </h2>
          <div className="flex items-center space-x-2">
            <StatusIcon
              status={currentState.uploadStatus || selectedTask.statuses.upload}
            />
            <span className="text-sm text-gray-600">
              {getStatusText(
                currentState.uploadStatus || selectedTask.statuses.upload,
                "uploading"
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <label
            className={`flex-1 ${
              selectedTask.currentStep >= 2
                ? "cursor-pointer"
                : "cursor-not-allowed"
            }`}
          >
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => handleFileUpload(e, false)}
              disabled={
                selectedTask.currentStep < 2 ||
                selectedTask.statuses.upload === "uploaded"
              }
              className="hidden"
            />
            <div
              className={`p-4 border-2 border-dashed rounded-md text-center transition-all ${
                selectedTask.currentStep >= 2
                  ? selectedTask.statuses.upload === "uploaded"
                    ? "border-green-300 bg-green-50"
                    : "border-blue-300 bg-blue-50 hover:border-blue-400"
                  : "border-gray-300 bg-gray-100"
              }`}
            >
              <FileSpreadsheet
                className={`w-8 h-8 mx-auto mb-2 ${
                  selectedTask.statuses.upload === "uploaded"
                    ? "text-green-500"
                    : "text-blue-500"
                }`}
              />
              <p className="text-sm text-gray-600">
                {currentState.files?.original?.name ||
                selectedTask.files?.original
                  ? `Selected: ${
                      currentState.files?.original?.name ||
                      selectedTask.files.original
                    }`
                  : selectedTask.currentStep >= 2
                  ? "Click to select Excel file or drag and drop"
                  : "Task must be created first"}
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Step 3: Update Excel */}
      <div
        className={`mb-6 p-6 rounded-lg border-l-4 transition-all ${
          selectedTask.currentStep >= 3
            ? "bg-gray-50 border-blue-500"
            : "bg-gray-100 border-gray-300 opacity-50"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Step 3: Upload Updated Excel File
          </h2>
          <div className="flex items-center space-x-2">
            <StatusIcon
              status={currentState.updateStatus || selectedTask.statuses.update}
            />
            <span className="text-sm text-gray-600">
              {getStatusText(
                currentState.updateStatus || selectedTask.statuses.update,
                "updating"
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <label
            className={`flex-1 ${
              selectedTask.currentStep >= 3
                ? "cursor-pointer"
                : "cursor-not-allowed"
            }`}
          >
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => handleFileUpload(e, true)}
              disabled={
                selectedTask.currentStep < 3 ||
                selectedTask.statuses.update === "updated"
              }
              className="hidden"
            />
            <div
              className={`p-4 border-2 border-dashed rounded-md text-center transition-all ${
                selectedTask.currentStep >= 3
                  ? selectedTask.statuses.update === "updated"
                    ? "border-green-300 bg-green-50"
                    : "border-orange-300 bg-orange-50 hover:border-orange-400"
                  : "border-gray-300 bg-gray-100"
              }`}
            >
              <FileSpreadsheet
                className={`w-8 h-8 mx-auto mb-2 ${
                  selectedTask.statuses.update === "updated"
                    ? "text-green-500"
                    : "text-orange-500"
                }`}
              />
              <p className="text-sm text-gray-600">
                {currentState.files?.updated?.name ||
                selectedTask.files?.updated
                  ? `Selected: ${
                      currentState.files?.updated?.name ||
                      selectedTask.files.updated
                    }`
                  : selectedTask.currentStep >= 3
                  ? "Click to select updated Excel file"
                  : "Complete step 2 first"}
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Step 4: Download */}
      <div
        className={`mb-6 p-6 rounded-lg border-l-4 transition-all ${
          selectedTask.currentStep >= 4
            ? "bg-gray-50 border-green-500"
            : "bg-gray-100 border-gray-300 opacity-50"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Download className="w-5 h-5 mr-2" />
            Step 4: Download Result
          </h2>
          <div className="flex items-center space-x-2">
            <StatusIcon
              status={
                currentState.downloadStatus || selectedTask.statuses.download
              }
            />
            <span className="text-sm text-gray-600">
              {getStatusText(
                currentState.downloadStatus || selectedTask.statuses.download,
                "preparing"
              )}
            </span>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={
            selectedTask.currentStep < 4 ||
            currentState.downloadStatus === "downloading"
          }
          className={`w-full py-3 px-6 rounded-md transition-colors flex items-center justify-center space-x-2 ${
            selectedTask.currentStep >= 4
              ? "bg-green-500 text-white hover:bg-green-600 disabled:bg-green-400"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <Download className="w-5 h-5" />
          <span>
            {currentState.downloadStatus === "downloading"
              ? "Preparing Download..."
              : "Download Processed Excel File"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default TaskExcelManager;
