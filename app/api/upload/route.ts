import { updateData, uploadData } from "@/app/services/taskService";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import * as XlsxPopulate from "xlsx-populate";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to ArrayBuffer
    const buffer = Buffer.from(await file.arrayBuffer());

    const nameParts = file.name.split(".");
    const extension = nameParts.pop();
    const fileName =
      nameParts.join(".") + "_" + generateRandomFilename(extension);

    // Save Excel file to disk
    //D:\Workspace\vscode\group-2\ptsiam\uploads
    // const uploadDir = path.join(process.cwd(), "uploads");
    const uploadDir = process.env.UPLOAD_FILE_PATH as string;
    await fs.mkdir(uploadDir, { recursive: true }); // make sure folder exists
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    // Read Excel file
    const workbook = await XlsxPopulate.fromDataAsync(buffer);
    const sheet = workbook.sheet(0);
    const jsonData = sheet.usedRange().value();

    if (!jsonData || jsonData.length === 0) {
      return NextResponse.json({ error: "jsonData is EMPTY" }, { status: 400 });
    }

    const paramsRaw = formData.get("params") as string | null;
    const params: any = paramsRaw ? JSON.parse(paramsRaw) : null;

    let result: any;
    if (params?.uploadStatus) {
      result = await uploadData({
        taskId: params.taskId,
        jsonData: jsonData,
        uploadStatus: params.uploadStatus,
        currentStep: params.currentStep,
        uploadFileName: fileName,
      });
    } else {
      result = await updateData({
        taskId: params.taskId,
        jsonData: jsonData,
        updateStatus: params.updateStatus,
        currentStep: params.currentStep,
        updateFileName: fileName,
      });
    }

    return NextResponse.json({ data: result });
  } catch (err: unknown) {
    let errMsg;
    if (err instanceof Error) {
      errMsg = err.message;
    } else {
      errMsg = err;
    }
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

const generateRandomFilename = (extension = "") => {
  const timestamp = Date.now().toString(36); // Convert timestamp to base 36 for shorter string
  const randomPart = Math.random().toString(36).slice(2, 8); // Get a random part and slice for length
  return `${timestamp}${randomPart}${extension ? `.${extension}` : ""}`;
};
