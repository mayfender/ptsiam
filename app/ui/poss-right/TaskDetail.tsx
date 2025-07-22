import {
  AlertCircle,
  ArrowLeft,
  Check,
  Clock,
  Download,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import React, { useState } from "react";

export default function TaskDetail({
  setTasks,
  selectedTask,
  setCurrentView,
  getStatusText,
  getStatusColor,
}: {
  setTasks: any;
  selectedTask: any;
  setCurrentView: any;
  getStatusText: any;
  getStatusColor: any;
}) {
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

  // Task Detail View
  const currentState = getTaskDetailState(selectedTask.id);
  const steps = [
    { id: 1, title: "Task Created", status: selectedTask.statuses.task },
    { id: 2, title: "Upload Excel", status: selectedTask.statuses.upload },
    { id: 3, title: "Update Excel", status: selectedTask.statuses.update },
    { id: 4, title: "Download Result", status: selectedTask.statuses.download },
  ];

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
        setTasks((prev: any) =>
          prev.map((task: any) =>
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
        setTasks((prev: any) =>
          prev.map((task: any) =>
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
      setTasks((prev: any) =>
        prev.map((task: any) =>
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

  const updateTaskDetailState = (taskId: any, updates: any) => {
    setTaskDetailStates((prev: any) => ({
      ...prev,
      [taskId]: { ...getTaskDetailState(taskId), ...updates },
    }));
  };

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
}
