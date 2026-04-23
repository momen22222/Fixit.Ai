export type VendorTrade = "plumbing" | "appliance" | "electrical" | "hvac" | "general";

export type UrgencyLevel = "routine" | "priority" | "emergency";

export type ResolutionStatus = "needs-review" | "resolved";

export type IssueStatus =
  | "new"
  | "triaged"
  | "resolved"
  | "approval-needed"
  | "scheduled"
  | "completed";

export type RecipientType = "tenant" | "manager" | "vendor";

export type NotificationChannel = "in-app" | "sms" | "email";
export type AppDataMode = "mock" | "supabase";
export type AiMode = "rules" | "provider";
export type UserRole = "tenant" | "manager";

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface Unit {
  id: string;
  propertyId: string;
  label: string;
  floor: string;
  bedrooms: number;
}

export interface TenantUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  unitId: string;
  propertyId?: string;
}

export interface ManagerUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  propertyIds: string[];
}

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  propertyId?: string;
  unitId?: string;
}

export interface IssuePhoto {
  id: string;
  name: string;
  url: string;
}

export interface IssueMessage {
  id: string;
  role: "assistant" | "tenant" | "manager";
  text: string;
  createdAt: string;
}

export interface TroubleshootingStep {
  id: string;
  title: string;
  detail: string;
  safeTools: string[];
}

export interface EscalationDecision {
  requiredTrade: VendorTrade;
  reason: string;
  managerSummary: string;
}

export interface VendorCoverageArea {
  city: string;
  postalCodes: string[];
}

export interface VendorRateCard {
  tripFee: number;
  hourlyRate: number;
}

export interface VendorAvailability {
  nextWindow: string;
  responseHours: number;
}

export interface Vendor {
  id: string;
  companyName: string;
  trades: VendorTrade[];
  approved: boolean;
  reliabilityScore: number;
  completionRate: number;
  coverageAreas: VendorCoverageArea[];
  rateCard: VendorRateCard;
  availability: VendorAvailability;
  notes: string;
}

export interface AppointmentProposal {
  vendorId: string;
  proposedWindow: string;
  estimatedCost: number;
  reason: string;
}

export interface ManagerApproval {
  issueId: string;
  decision: "approved" | "rejected" | "modified";
  approvedVendorId: string;
  approvedWindow: string;
  notes: string;
  approvedAt: string;
}

export interface WorkOrder {
  id: string;
  issueId: string;
  vendorId: string;
  trade: VendorTrade;
  scheduledWindow: string;
  estimatedCost: number;
  status: "pending" | "scheduled" | "completed";
}

export interface NotificationEvent {
  id: string;
  recipientType: RecipientType;
  channel: NotificationChannel;
  templateKey: string;
  issueId?: string;
  workOrderId?: string;
  messageSummary: string;
  createdAt: string;
}

export interface MaintenanceIssueInput {
  unitId: string;
  category: string;
  description: string;
  photos: string[];
  tenantAvailability: string;
  permissionToEnter: boolean;
}

export interface AITriageResult {
  urgencyLevel: UrgencyLevel;
  safetyInstructions: string[];
  followUpQuestions: string[];
  diySteps: TroubleshootingStep[];
  resolutionStatus: ResolutionStatus;
  recommendedTrade: VendorTrade;
  managerSummary: string;
}

export interface VendorRecommendation {
  vendorId: string;
  trade: VendorTrade;
  reliabilityScore: number;
  estimatedCost: number;
  proposedWindow: string;
  reason: string;
  source?: "approved-directory" | "external-search";
  requiresManagerApproval?: boolean;
}

export interface ExternalVendorCandidate {
  name: string;
  trade: VendorTrade;
  source: "gemini-google-search" | "tavily" | "google-places" | "yelp" | "manual";
  url?: string;
  phone?: string;
  address?: string;
  rating?: number;
  reviewCount?: number;
  reason: string;
}

export interface VendorRecommendationPlan {
  strategy: "approved-first" | "external-backup-needed";
  approvedRecommendations: VendorRecommendation[];
  externalCandidates: ExternalVendorCandidate[];
  note: string;
}

export interface ManagerDecisionInput {
  issueId: string;
  decision: "approved" | "rejected" | "modified";
  approvedVendorId: string;
  approvedWindow: string;
  notes: string;
}

export interface AuthInviteInput {
  email: string;
  role: UserRole;
  propertyId: string;
  unitId?: string;
  invitedBy: string;
}

export interface MagicLinkInput {
  email: string;
  redirectTo?: string;
}

export interface CompleteProfileInput {
  role: UserRole;
  fullName: string;
  phoneNumber: string;
  email: string;
  preferredContact: string;
  emergencyContact?: string;
  inviteCode: string;
  accessToken?: string;
}

export interface UploadPhotoResult {
  fileName: string;
  path: string;
  publicUrl: string;
}

export interface TriageEnvelope {
  triage: AITriageResult;
  mode: AiMode;
}

export interface MaintenanceIssue {
  id: string;
  unitId: string;
  category: string;
  description: string;
  photos: IssuePhoto[];
  tenantAvailability: string;
  permissionToEnter: boolean;
  status: IssueStatus;
  urgencyLevel: UrgencyLevel;
  tenantId: string;
  propertyId: string;
  createdAt: string;
  aiTriage: AITriageResult;
  messages: IssueMessage[];
  escalation?: EscalationDecision;
  vendorRecommendations: VendorRecommendation[];
  appointmentProposal?: AppointmentProposal;
  managerApproval?: ManagerApproval;
}
