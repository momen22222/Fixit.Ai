import { GoogleGenAI } from "@google/genai";
import { appConfig, isSupabaseConfigured } from "@/lib/app-config";
import { getSupabaseServiceClient } from "@/lib/supabase/client";
import {
  type AITriageResult,
  type MaintenanceIssueInput,
  type TroubleshootingStep,
  type UrgencyLevel,
  type VendorTrade
} from "@/lib/maintenance-types";

type GeminiTriageJson = {
  urgencyLevel?: UrgencyLevel;
  safetyInstructions?: string[];
  followUpQuestions?: string[];
  diySteps?: Array<{
    title?: string;
    detail?: string;
    safeTools?: string[];
  }>;
  resolutionStatus?: "needs-review" | "resolved";
  recommendedTrade?: VendorTrade;
  managerSummary?: string;
};

function getPhotoUrl(pathOrUrl: string) {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  if (!isSupabaseConfigured()) {
    return undefined;
  }

  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return undefined;
  }

  const { data } = supabase.storage.from(appConfig.storageBucket).getPublicUrl(pathOrUrl);
  return data.publicUrl;
}

async function urlToInlinePart(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Unable to read uploaded photo: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "image/jpeg";
  const buffer = Buffer.from(await response.arrayBuffer());

  return {
    inlineData: {
      mimeType: contentType,
      data: buffer.toString("base64")
    }
  };
}

function normalizeGeminiResult(input: MaintenanceIssueInput, result: GeminiTriageJson): AITriageResult {
  const urgencyLevel = result.urgencyLevel ?? "routine";
  const recommendedTrade = result.recommendedTrade ?? "general";
  const diySteps: TroubleshootingStep[] = (result.diySteps ?? []).slice(0, 4).map((step, index) => ({
    id: `gemini-step-${index + 1}`,
    title: step.title ?? "Safe visual check",
    detail: step.detail ?? "Do only a low-risk visual check and stop if anything feels unsafe.",
    safeTools: step.safeTools?.length ? step.safeTools : ["None"]
  }));

  return {
    urgencyLevel,
    safetyInstructions: result.safetyInstructions?.length
      ? result.safetyInstructions.slice(0, 5)
      : ["Your safety comes first. Do not attempt repairs involving gas, live electricity, flooding, or disassembly."],
    followUpQuestions: result.followUpQuestions?.length
      ? result.followUpQuestions.slice(0, 4)
      : ["When did you first notice the issue? No rush, a rough estimate is okay."],
    diySteps: urgencyLevel === "emergency" ? [] : diySteps,
    resolutionStatus: result.resolutionStatus ?? "needs-review",
    recommendedTrade,
    managerSummary:
      result.managerSummary ??
      `${input.category} reported by tenant. AI recommends ${recommendedTrade} review after safe triage. Tenant should not attempt unsafe repair work.`
  };
}

function parseJsonResponse(text: string) {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("Gemini did not return structured JSON.");
  }

  return JSON.parse(jsonMatch[0]) as GeminiTriageJson;
}

export async function triageWithGemini(input: MaintenanceIssueInput): Promise<AITriageResult> {
  if (!appConfig.aiProviderApiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey: appConfig.aiProviderApiKey });
  const photoParts = await Promise.all(
    input.photos
      .map(getPhotoUrl)
      .filter((url): url is string => Boolean(url))
      .slice(0, 3)
      .map(urlToInlinePart)
  );

  const prompt = [
    "You are a cautious, compassionate property maintenance triage assistant helping a tenant during an inconvenient or stressful home problem.",
    "Assess the tenant's maintenance issue using the photo(s), category, and description.",
    "Return JSON only. Do not include markdown.",
    "Tone: calm, kind, reassuring, plain-spoken, and never dismissive. Make the tenant feel taken care of without overpromising.",
    "Use tenant-facing language in safetyInstructions, followUpQuestions, and diySteps. Prefer phrases like 'only if it feels safe', 'no pressure', and 'your safety comes first'.",
    "Keep managerSummary factual and manager-readable, but include enough context that the tenant does not need to repeat themselves.",
    "Never provide dangerous repair instructions. Do not tell tenants to open panels, touch wiring, repair gas lines, or perform skilled trade work.",
    "If the issue may involve gas smell, active flooding, sparks, burning smell, no heat in unsafe weather, sewage, structural damage, or electrical hazards, mark urgencyLevel as emergency and provide only safety instructions.",
    "Use one of these trades exactly: plumbing, appliance, electrical, hvac, general.",
    "JSON keys: urgencyLevel, safetyInstructions, followUpQuestions, diySteps, resolutionStatus, recommendedTrade, managerSummary.",
    `Category: ${input.category}`,
    `Description: ${input.description}`,
    `Tenant availability: ${input.tenantAvailability}`,
    `Permission to enter: ${input.permissionToEnter ? "yes" : "no"}`
  ].join("\n");

  const response = await ai.models.generateContent({
    model: appConfig.aiModel,
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }, ...photoParts]
      }
    ]
  });

  return normalizeGeminiResult(input, parseJsonResponse(response.text ?? ""));
}
