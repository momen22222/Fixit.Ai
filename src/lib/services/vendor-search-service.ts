import { GoogleGenAI } from "@google/genai";
import { appConfig } from "@/lib/app-config";
import { type ExternalVendorCandidate, type VendorTrade } from "@/lib/maintenance-types";

type VendorSearchInput = {
  trade: VendorTrade;
  issueSummary: string;
  propertyAddress: string;
  city: string;
  state: string;
  postalCode: string;
};

type GeminiVendorJson = {
  vendors?: ExternalVendorCandidate[];
};

function parseVendorJson(text: string) {
  const jsonMatch = text.trim().match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    return [];
  }

  const parsed = JSON.parse(jsonMatch[0]) as GeminiVendorJson;
  return parsed.vendors ?? [];
}

async function searchWithGeminiGrounding(input: VendorSearchInput): Promise<ExternalVendorCandidate[]> {
  if (!appConfig.aiProviderApiKey) {
    return [];
  }

  const ai = new GoogleGenAI({ apiKey: appConfig.aiProviderApiKey });
  const response = await ai.models.generateContent({
    model: appConfig.aiModel,
    contents: [
      [
        "Find reliable local maintenance vendors for a property manager.",
        "Use Google Search grounding if needed.",
        "Return JSON only with key vendors: [{name, trade, source, url, phone, address, rating, reviewCount, reason}].",
        "Do not recommend booking automatically. These are candidates for manager approval only.",
        `Trade: ${input.trade}`,
        `Issue: ${input.issueSummary}`,
        `Location: ${input.propertyAddress}, ${input.city}, ${input.state} ${input.postalCode}`,
        `Search query: ${input.trade} repair contractor near ${input.postalCode}`
      ].join("\n")
    ],
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  return parseVendorJson(response.text ?? "").map((vendor) => ({
    ...vendor,
    trade: input.trade,
    source: "gemini-google-search"
  }));
}

async function searchWithTavily(input: VendorSearchInput): Promise<ExternalVendorCandidate[]> {
  if (!appConfig.tavilyApiKey) {
    return [];
  }

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${appConfig.tavilyApiKey}`
    },
    body: JSON.stringify({
      query: `${input.trade} repair contractor near ${input.postalCode} ${input.city} ${input.state}`,
      search_depth: "basic",
      max_results: 5
    })
  });

  if (!response.ok) {
    throw new Error(`Tavily search failed: ${response.status}`);
  }

  const payload = (await response.json()) as {
    results?: Array<{ title?: string; url?: string; content?: string; score?: number }>;
  };

  return (payload.results ?? []).map((result) => ({
    name: result.title ?? "Vendor candidate",
    trade: input.trade,
    source: "tavily",
    url: result.url,
    rating: result.score ? Math.round(result.score * 50) / 10 : undefined,
    reason: result.content ?? "Search result matched the needed trade and service area."
  }));
}

export async function searchExternalVendors(input: VendorSearchInput): Promise<ExternalVendorCandidate[]> {
  const [geminiResults, tavilyResults] = await Promise.allSettled([
    searchWithGeminiGrounding(input),
    searchWithTavily(input)
  ]);

  return [
    ...(geminiResults.status === "fulfilled" ? geminiResults.value : []),
    ...(tavilyResults.status === "fulfilled" ? tavilyResults.value : [])
  ].slice(0, 8);
}
