import { getSupabaseServiceClient } from "@/lib/supabase/client";
import { type MaintenanceRepository } from "@/lib/repositories/maintenance-repository";
import {
  type AppointmentProposal,
  type EscalationDecision,
  type IssueMessage,
  type IssuePhoto,
  type MaintenanceIssue,
  type MaintenanceIssueInput,
  type ManagerDecisionInput,
  type Vendor,
  type VendorRecommendation,
  type VendorTrade
} from "@/lib/maintenance-types";
import { appConfig } from "@/lib/app-config";
import { triageMaintenanceIssue } from "@/lib/maintenance-data";

function missingClient(): never {
  throw new Error("Supabase is not configured.");
}

type SupabaseVendorRow = {
  id: string;
  company_name: string;
  approved: boolean;
  reliability_score: number;
  completion_rate: number;
  notes: string | null;
  next_window: string | null;
  response_hours: number | null;
  trip_fee: number;
  hourly_rate: number;
  trades: VendorTrade[];
  coverage_postal_codes: string[];
  city: string | null;
};

type SupabaseIssueRow = {
  id: string;
  property_id: string;
  unit_id: string;
  tenant_id: string | null;
  category: string;
  description: string;
  tenant_availability: string;
  permission_to_enter: boolean;
  status: MaintenanceIssue["status"];
  urgency_level: MaintenanceIssue["urgencyLevel"];
  ai_triage: MaintenanceIssue["aiTriage"];
  escalation: EscalationDecision | null;
  vendor_recommendations: VendorRecommendation[] | null;
  appointment_proposal: AppointmentProposal | null;
  photo_paths: string[] | null;
  created_at: string;
  issue_messages?: IssueMessage[];
};

function mapVendor(row: SupabaseVendorRow): Vendor {
  return {
    id: row.id,
    companyName: row.company_name,
    trades: row.trades ?? ["general"],
    approved: row.approved,
    reliabilityScore: row.reliability_score,
    completionRate: row.completion_rate,
    coverageAreas: [
      {
        city: row.city ?? "",
        postalCodes: row.coverage_postal_codes ?? []
      }
    ],
    rateCard: {
      tripFee: row.trip_fee,
      hourlyRate: row.hourly_rate
    },
    availability: {
      nextWindow: row.next_window ?? "Next available window",
      responseHours: row.response_hours ?? 24
    },
    notes: row.notes ?? ""
  };
}

function buildPhoto(path: string, index: number): IssuePhoto {
  const supabase = getSupabaseServiceClient() ?? missingClient();
  const { data } = supabase.storage.from(appConfig.storageBucket).getPublicUrl(path);

  return {
    id: `${path}-${index}`,
    name: path.split("/").at(-1) ?? `Photo ${index + 1}`,
    url: data.publicUrl
  };
}

function mapIssue(row: SupabaseIssueRow): MaintenanceIssue {
  return {
    id: row.id,
    unitId: row.unit_id,
    category: row.category,
    description: row.description,
    photos: (row.photo_paths ?? []).map(buildPhoto),
    tenantAvailability: row.tenant_availability,
    permissionToEnter: row.permission_to_enter,
    status: row.status,
    urgencyLevel: row.urgency_level,
    tenantId: row.tenant_id ?? "supabase-tenant",
    propertyId: row.property_id,
    createdAt: row.created_at,
    aiTriage: row.ai_triage,
    messages:
      row.issue_messages?.map((message) => ({
        id: message.id,
        role: message.role,
        text: message.text,
        createdAt: message.createdAt ?? row.created_at
      })) ?? [],
    escalation: row.escalation ?? undefined,
    vendorRecommendations: row.vendor_recommendations ?? [],
    appointmentProposal: row.appointment_proposal ?? undefined
  };
}

function estimateCost(vendor: Vendor) {
  return vendor.rateCard.tripFee + vendor.rateCard.hourlyRate;
}

async function rankSupabaseVendors(propertyId: string, trade: VendorTrade) {
  const supabase = getSupabaseServiceClient() ?? missingClient();
  const [{ data: property }, { data: vendors, error }] = await Promise.all([
    supabase.from("properties").select("city, postal_code").eq("id", propertyId).maybeSingle(),
    supabase.from("vendors").select("*").eq("approved", true)
  ]);

  if (error) {
    throw new Error(error.message);
  }

  return ((vendors ?? []) as SupabaseVendorRow[])
    .map(mapVendor)
    .filter(
      (vendor) =>
        vendor.trades.includes(trade) &&
        vendor.coverageAreas.some(
          (coverage) =>
            coverage.city === property?.city && coverage.postalCodes.includes(property?.postal_code ?? "")
        )
    )
    .sort((left, right) => {
      if (right.reliabilityScore !== left.reliabilityScore) {
        return right.reliabilityScore - left.reliabilityScore;
      }

      return estimateCost(left) - estimateCost(right);
    })
    .map((vendor) => ({
      vendorId: vendor.id,
      trade,
      reliabilityScore: vendor.reliabilityScore,
      estimatedCost: estimateCost(vendor),
      proposedWindow: vendor.availability.nextWindow,
      reason: `${vendor.companyName} is approved for this property and balances reliability with cost.`
    }));
}

function buildAppointmentProposal(recommendation: VendorRecommendation | undefined) {
  if (!recommendation) {
    return undefined;
  }

  return {
    vendorId: recommendation.vendorId,
    proposedWindow: recommendation.proposedWindow,
    estimatedCost: recommendation.estimatedCost,
    reason: recommendation.reason
  };
}

function buildEscalation(input: MaintenanceIssueInput, trade: VendorTrade, summary: string): EscalationDecision {
  return {
    requiredTrade: trade,
    reason: "Tenant-side checks were not enough to resolve the issue.",
    managerSummary: summary
  };
}

export const supabaseMaintenanceRepository: MaintenanceRepository = {
  async listIssues() {
    const supabase = getSupabaseServiceClient() ?? missingClient();
    const { data, error } = await supabase
      .from("maintenance_issues")
      .select("*, issue_messages(*)")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return ((data ?? []) as SupabaseIssueRow[]).map(mapIssue);
  },

  async getIssueById(issueId: string) {
    const supabase = getSupabaseServiceClient() ?? missingClient();
    const { data, error } = await supabase
      .from("maintenance_issues")
      .select("*, issue_messages(*)")
      .eq("id", issueId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data ? mapIssue(data as SupabaseIssueRow) : undefined;
  },

  async createIssue(input: MaintenanceIssueInput) {
    const supabase = getSupabaseServiceClient() ?? missingClient();
    const { data: unit, error: unitError } = await supabase
      .from("units")
      .select("id, property_id")
      .eq("id", input.unitId)
      .maybeSingle();

    if (unitError || !unit) {
      throw new Error(unitError?.message ?? "Unit not found for this tenant.");
    }

    const triage = triageMaintenanceIssue(input);
    const recommendations =
      triage.resolutionStatus === "resolved" ? [] : await rankSupabaseVendors(unit.property_id, triage.recommendedTrade);
    const appointmentProposal = buildAppointmentProposal(recommendations[0]);
    const escalation =
      triage.resolutionStatus === "resolved"
        ? undefined
        : buildEscalation(input, triage.recommendedTrade, triage.managerSummary);

    const payload = {
      property_id: unit.property_id,
      unit_id: input.unitId,
      category: input.category,
      description: input.description,
      tenant_availability: input.tenantAvailability,
      permission_to_enter: input.permissionToEnter,
      photo_paths: input.photos,
      status: triage.resolutionStatus === "resolved" ? "resolved" : "approval-needed",
      urgency_level: triage.urgencyLevel,
      ai_triage: triage,
      escalation: escalation ?? null,
      vendor_recommendations: recommendations,
      appointment_proposal: appointmentProposal ?? null
    };

    const { data, error } = await supabase.from("maintenance_issues").insert(payload).select("*").single();

    if (error) {
      throw new Error(error.message);
    }

    const messages = [
      {
        issue_id: data.id,
        role: "tenant",
        text: input.description
      },
      ...triage.followUpQuestions.map((question) => ({
        issue_id: data.id,
        role: "assistant",
        text: question
      }))
    ];

    const { error: messageError } = await supabase.from("issue_messages").insert(messages);

    if (messageError) {
      throw new Error(messageError.message);
    }

    return mapIssue({
      ...(data as SupabaseIssueRow),
      issue_messages: messages.map((message, index) => ({
        id: `${data.id}-message-${index + 1}`,
        role: message.role as IssueMessage["role"],
        text: message.text,
        createdAt: data.created_at
      }))
    });
  },

  async approveIssue(input: ManagerDecisionInput) {
    const supabase = getSupabaseServiceClient() ?? missingClient();
    const { data, error } = await supabase.rpc("approve_maintenance_issue", {
      p_issue_id: input.issueId,
      p_decision: input.decision,
      p_vendor_id: input.approvedVendorId,
      p_window: input.approvedWindow,
      p_notes: input.notes
    });

    if (error) {
      throw new Error(error.message);
    }

    return data as { issue: MaintenanceIssue; workOrder: unknown };
  },

  async listVendors() {
    const supabase = getSupabaseServiceClient() ?? missingClient();
    const { data, error } = await supabase.from("vendors").select("*").order("company_name");

    if (error) {
      throw new Error(error.message);
    }

    return ((data ?? []) as SupabaseVendorRow[]).map(mapVendor);
  }
};
