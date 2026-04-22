import { NextResponse } from "next/server";
import { uploadIssuePhoto } from "@/lib/services/upload-service";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "A file is required." }, { status: 400 });
  }

  try {
    const upload = await uploadIssuePhoto(file.name, await file.arrayBuffer());
    return NextResponse.json({ upload }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to upload photo.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
