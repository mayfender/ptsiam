import { NextRequest, NextResponse } from "next/server";
import { getFile } from "@/app/services/taskService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId") as number | null;
    const step = searchParams.get("step") as number | null;

    if (taskId == null || step == null) {
      throw Error("Parameter cann't be empty.");
    }

    const result = await getFile({ taskId: taskId, step: step });
    const fileName = "Download.xlsx";

    return new NextResponse(result.fileBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
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
