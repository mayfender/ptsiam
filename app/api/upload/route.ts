import { updateData, uploadData } from "@/app/services/taskService";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx"; //SheetJS
import path from "path";
import { promises as fs } from "fs";

export async function POST(request: Request) {
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
    const workbook = XLSX.read(buffer, { type: "buffer" });

    // Convert first sheet to JSON
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
      dateNF: "dd/mm/yyyy",
      defval: "",
    });

    const paramsRaw = formData.get("params") as string | null;
    const params: any = paramsRaw ? JSON.parse(paramsRaw) : null;

    let result: any;
    if (params.uploadStatus) {
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}

const generateRandomFilename = (extension = "") => {
  const timestamp = Date.now().toString(36); // Convert timestamp to base 36 for shorter string
  const randomPart = Math.random().toString(36).slice(2, 8); // Get a random part and slice for length
  return `${timestamp}${randomPart}${extension ? `.${extension}` : ""}`;
};
