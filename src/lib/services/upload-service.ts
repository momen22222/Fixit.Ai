import { appConfig, resolveDataMode } from "@/lib/app-config";
import { getSupabaseServiceClient } from "@/lib/supabase/client";
import { type UploadPhotoResult } from "@/lib/maintenance-types";

function buildMockUpload(fileName: string): UploadPhotoResult {
  return {
    fileName,
    path: `mock/${fileName}`,
    publicUrl: `https://placehold.co/720x540/e8f0f5/18324a?text=${encodeURIComponent(fileName)}`
  };
}

export async function uploadIssuePhoto(fileName: string, fileBuffer?: ArrayBuffer): Promise<UploadPhotoResult> {
  if (resolveDataMode() === "supabase") {
    const supabase = getSupabaseServiceClient();

    if (!supabase) {
      throw new Error("Supabase storage is not configured.");
    }

    const path = `issues/${Date.now()}-${fileName}`;
    const { error } = await supabase.storage.from(appConfig.storageBucket).upload(path, fileBuffer ?? new Uint8Array(), {
      contentType: "image/jpeg",
      upsert: false
    });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = supabase.storage.from(appConfig.storageBucket).getPublicUrl(path);

    return {
      fileName,
      path,
      publicUrl: data.publicUrl
    };
  }

  return buildMockUpload(fileName);
}
