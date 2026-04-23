import {
  type AITriageResult,
  type AppointmentProposal,
  type EscalationDecision,
  type MaintenanceIssue,
  type MaintenanceIssueInput,
  type ManagerDecisionInput,
  type ManagerUser,
  type NotificationEvent,
  type Property,
  type TenantUser,
  type TroubleshootingStep,
  type Unit,
  type Vendor,
  type VendorInput,
  type VendorRecommendation,
  type VendorTrade,
  type WorkOrder
} from "@/lib/maintenance-types";

const timestamp = "2026-04-18T09:00:00.000Z";

export const properties: Property[] = [
  {
    id: "prop-maple-court",
    name: "Maple Court Homes",
    address: "1248 Maple Court",
    city: "Denver",
    state: "CO",
    postalCode: "80205"
  }
];

export const units: Unit[] = [
  { id: "unit-1a", propertyId: "prop-maple-court", label: "1A", floor: "1", bedrooms: 2 },
  { id: "unit-3c", propertyId: "prop-maple-court", label: "3C", floor: "3", bedrooms: 1 }
];

export const tenants: TenantUser[] = [
  {
    id: "tenant-maya",
    name: "Maya Johnson",
    phone: "(303) 555-0192",
    email: "maya@fieldfixpm.com",
    unitId: "unit-3c"
  }
];

export const managers: ManagerUser[] = [
  {
    id: "manager-rachel",
    name: "Rachel Kim",
    phone: "(303) 555-0114",
    email: "rachel@fieldfixpm.com",
    propertyIds: ["prop-maple-court"]
  }
];

export const baseVendors: Vendor[] = [
  {
    id: "vendor-clearflow",
    companyName: "ClearFlow Plumbing",
    trades: ["plumbing", "general"],
    approved: true,
    reliabilityScore: 96,
    completionRate: 99,
    coverageAreas: [{ city: "Denver", postalCodes: ["80205", "80206", "80207"] }],
    rateCard: { tripFee: 69, hourlyRate: 115 },
    availability: { nextWindow: "Today, 2:00 PM - 4:00 PM", responseHours: 3 },
    notes: "Strong on water-heater diagnostics and same-day leak containment."
  },
  {
    id: "vendor-apex-appliance",
    companyName: "Apex Appliance Service",
    trades: ["appliance"],
    approved: true,
    reliabilityScore: 94,
    completionRate: 97,
    coverageAreas: [{ city: "Denver", postalCodes: ["80205", "80204", "80206"] }],
    rateCard: { tripFee: 79, hourlyRate: 105 },
    availability: { nextWindow: "Tomorrow, 9:00 AM - 11:00 AM", responseHours: 18 },
    notes: "Best performer for dishwashers, disposals, and stacked laundry units."
  },
  {
    id: "vendor-milehigh-hvac",
    companyName: "Mile High HVAC",
    trades: ["hvac"],
    approved: true,
    reliabilityScore: 93,
    completionRate: 96,
    coverageAreas: [{ city: "Denver", postalCodes: ["80205", "80209", "80210"] }],
    rateCard: { tripFee: 85, hourlyRate: 124 },
    availability: { nextWindow: "Today, 5:00 PM - 7:00 PM", responseHours: 6 },
    notes: "Handles heat outages and thermostat replacements."
  },
  {
    id: "vendor-safewire",
    companyName: "SafeWire Electric",
    trades: ["electrical"],
    approved: true,
    reliabilityScore: 98,
    completionRate: 99,
    coverageAreas: [{ city: "Denver", postalCodes: ["80205", "80211", "80212"] }],
    rateCard: { tripFee: 92, hourlyRate: 138 },
    availability: { nextWindow: "Today, 1:00 PM - 3:00 PM", responseHours: 2 },
    notes: "Preferred for sparks, dead outlets, and panel safety work."
  }
];

export let vendorStore = [...baseVendors];

function buildIssuePhoto(name: string, id: string) {
  return {
    id,
    name,
    url: `https://placehold.co/320x220/e6eef4/173042?text=${encodeURIComponent(name)}`
  };
}

function buildAssistantMessage(text: string, id: string) {
  return {
    id,
    role: "assistant" as const,
    text,
    createdAt: timestamp
  };
}

function buildTenantMessage(text: string, id: string) {
  return {
    id,
    role: "tenant" as const,
    text,
    createdAt: timestamp
  };
}

export function resolveTrade(category: string, description: string): VendorTrade {
  const haystack = `${category} ${description}`.toLowerCase();

  if (haystack.includes("dishwasher") || haystack.includes("washer") || haystack.includes("dryer")) {
    return "appliance";
  }

  if (
    haystack.includes("water heater") ||
    haystack.includes("hot water") ||
    haystack.includes("leak") ||
    haystack.includes("toilet") ||
    haystack.includes("drain")
  ) {
    return "plumbing";
  }

  if (haystack.includes("heat") || haystack.includes("furnace") || haystack.includes("ac")) {
    return "hvac";
  }

  if (haystack.includes("spark") || haystack.includes("outlet") || haystack.includes("breaker")) {
    return "electrical";
  }

  return "general";
}

function isEmergency(category: string, description: string) {
  const haystack = `${category} ${description}`.toLowerCase();
  const emergencyKeywords = [
    "gas smell",
    "flood",
    "flooding",
    "sparks",
    "sparking",
    "burning smell",
    "no heat",
    "electrical fire"
  ];

  return emergencyKeywords.some((keyword) => haystack.includes(keyword));
}

function buildSafetyInstructions(category: string, description: string) {
  const haystack = `${category} ${description}`.toLowerCase();

  if (haystack.includes("gas smell")) {
    return [
      "Your safety comes first. Leave the unit immediately if the smell is strong.",
      "Please do not use switches, flames, or appliances until the area is cleared.",
      "Call the emergency gas number and notify the property manager right away."
    ];
  }

  if (haystack.includes("flood")) {
    return [
      "If you can do it safely, shut off the nearest water supply.",
      "Move valuables and electronics away from the water.",
      "Notify the property manager immediately so you are not handling this alone."
    ];
  }

  if (haystack.includes("spark") || haystack.includes("burning smell")) {
    return [
      "Stop using the affected outlet or appliance immediately.",
      "Turn off the breaker only if it is safe and easy to identify. Do not take any risks.",
      "Notify the property manager immediately."
    ];
  }

  if (haystack.includes("no heat")) {
    return [
      "Keep interior doors closed to retain heat.",
      "If temperatures are unsafe, contact the property manager immediately.",
      "Do not attempt burner or electrical repairs."
    ];
  }

  return [
    "Use only simple visual checks and basic household tools.",
    "Stop right away if you notice water spreading, electrical risk, or gas odor.",
    "If the issue does not resolve quickly, your property manager can take it from here."
  ];
}

function buildFollowUpQuestions(category: string, description: string) {
  const haystack = `${category} ${description}`.toLowerCase();

  if (haystack.includes("dishwasher")) {
    return [
      "Is there standing water at the bottom after the cycle ends?"
    ];
  }

  if (haystack.includes("hot water") || haystack.includes("water heater")) {
    return [
      "Is there no hot water anywhere in the unit or only at one fixture?"
    ];
  }

  if (haystack.includes("outlet") || haystack.includes("breaker")) {
    return [
      "Do you smell anything burnt near the outlet or panel?"
    ];
  }

  return [
    "Is the problem constant, or does it come and go?"
  ];
}

function buildDiySteps(category: string, description: string): TroubleshootingStep[] {
  const haystack = `${category} ${description}`.toLowerCase();

  if (haystack.includes("dishwasher")) {
    return [
      {
        id: "step-dishwasher-1",
        title: "Run the sink disposal first",
        detail: "If your dishwasher drains through the disposal, run the disposal for a few seconds and retry drain. This is a common, low-risk thing to check.",
        safeTools: ["None"]
      },
      {
        id: "step-dishwasher-2",
        title: "Check for standing debris",
        detail: "Remove the bottom rack and look for visible food debris around the filter. Clear only what is easy to reach, and skip this if it feels messy or unsafe.",
        safeTools: ["Gloves", "Paper towels"]
      },
      {
        id: "step-dishwasher-3",
        title: "Power-cycle the appliance",
        detail: "Turn the dishwasher off for one minute, then restart a short rinse cycle.",
        safeTools: ["None"]
      }
    ];
  }

  if (haystack.includes("hot water") || haystack.includes("water heater")) {
    return [
      {
        id: "step-water-1",
        title: "Check if the issue is unit-wide",
        detail: "Test hot water at the kitchen and bathroom faucets to confirm whether it affects the whole unit.",
        safeTools: ["None"]
      },
      {
        id: "step-water-2",
        title: "Look for obvious leaks",
        detail: "Inspect the floor around the heater closet for puddles or active dripping without removing any panels. A photo of any water will help your manager respond faster.",
        safeTools: ["Flashlight"]
      },
      {
        id: "step-water-3",
        title: "Reset only the accessible switch",
        detail: "If the heater has a clear external power switch, toggle it off and on once. Do not open covers or touch wiring.",
        safeTools: ["None"]
      }
    ];
  }

  if (haystack.includes("heat") || haystack.includes("thermostat")) {
    return [
      {
        id: "step-hvac-1",
        title: "Confirm thermostat settings",
        detail: "Set the thermostat to heat and raise the target temperature 3-5 degrees above the current room temperature.",
        safeTools: ["None"]
      },
      {
        id: "step-hvac-2",
        title: "Check the air filter access point",
        detail: "If the filter is easy to access, confirm it is not visibly clogged. Do not disassemble any equipment.",
        safeTools: ["None"]
      }
    ];
  }

  return [
    {
      id: "step-general-1",
      title: "Power-cycle the affected item",
      detail: "Turn the appliance or switch off, wait one minute, and turn it back on.",
      safeTools: ["None"]
    },
    {
      id: "step-general-2",
      title: "Check for obvious obstructions",
      detail: "Look for blockages, debris, or loose connections that are visible without disassembly.",
      safeTools: ["Flashlight"]
    }
  ];
}

function estimateCost(vendor: Vendor) {
  return vendor.rateCard.tripFee + vendor.rateCard.hourlyRate;
}

function buildManagerSummary(input: MaintenanceIssueInput, triage: AITriageResult) {
  return [
    `${input.category} reported by tenant in ${input.unitId}.`,
    `Urgency: ${triage.urgencyLevel}.`,
    `Tenant availability: ${input.tenantAvailability}.`,
    triage.resolutionStatus === "resolved"
      ? "AI-guided self-service produced a likely tenant-side resolution."
      : `AI triage recommends ${triage.recommendedTrade} dispatch after safe troubleshooting.`
  ].join(" ");
}

export function triageMaintenanceIssue(input: MaintenanceIssueInput): AITriageResult {
  const recommendedTrade = resolveTrade(input.category, input.description);
  const emergency = isEmergency(input.category, input.description);
  const safetyInstructions = buildSafetyInstructions(input.category, input.description);
  const followUpQuestions = buildFollowUpQuestions(input.category, input.description);
  const diySteps = emergency ? [] : buildDiySteps(input.category, input.description);
  const resolved =
    !emergency &&
    (input.description.toLowerCase().includes("already restarted") ||
      input.description.toLowerCase().includes("came back on"));

  const triage: AITriageResult = {
    urgencyLevel: emergency ? "emergency" : recommendedTrade === "electrical" ? "priority" : "routine",
    safetyInstructions,
    followUpQuestions,
    diySteps,
    resolutionStatus: resolved ? "resolved" : "needs-review",
    recommendedTrade,
    managerSummary: ""
  };

  triage.managerSummary = buildManagerSummary(input, triage);

  return triage;
}

export function rankVendors(propertyId: string, trade: VendorTrade): VendorRecommendation[] {
  const property = properties.find((item) => item.id === propertyId);

  return vendorStore
    .filter(
      (vendor) =>
        vendor.approved &&
        vendor.trades.includes(trade) &&
        vendor.coverageAreas.some(
          (coverage) =>
            coverage.city === property?.city && coverage.postalCodes.includes(property?.postalCode ?? "")
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
      reason: `${vendor.companyName} is approved, covers the property, and balances top reliability with a competitive rate.`,
      source: "approved-directory" as const,
      requiresManagerApproval: true
    }));
}

function buildAppointmentProposal(recommendation: VendorRecommendation): AppointmentProposal {
  return {
    vendorId: recommendation.vendorId,
    proposedWindow: recommendation.proposedWindow,
    estimatedCost: recommendation.estimatedCost,
    reason: recommendation.reason
  };
}

function buildEscalation(input: MaintenanceIssueInput, triage: AITriageResult): EscalationDecision {
  return {
    requiredTrade: triage.recommendedTrade,
    reason: triage.urgencyLevel === "emergency" ? "Emergency bypass engaged." : "Self-service steps did not resolve the issue.",
    managerSummary: buildManagerSummary(input, triage)
  };
}

const issueSeedInput: MaintenanceIssueInput = {
  unitId: "unit-3c",
  category: "Dishwasher not draining",
  description: "Dishwasher finished the cycle but there is standing water at the bottom and it still will not drain.",
  photos: ["dishwasher-bottom.jpg"],
  tenantAvailability: "Weekdays after 3 PM",
  permissionToEnter: true
};

const issueSeedTriage = triageMaintenanceIssue(issueSeedInput);
const issueSeedRecommendations = rankVendors("prop-maple-court", issueSeedTriage.recommendedTrade);

export const seedIssues: MaintenanceIssue[] = [
  {
    id: "issue-1001",
    unitId: "unit-3c",
    category: issueSeedInput.category,
    description: issueSeedInput.description,
    photos: [buildIssuePhoto("Dishwasher standing water", "photo-1001")],
    tenantAvailability: issueSeedInput.tenantAvailability,
    permissionToEnter: true,
    status: "approval-needed",
    urgencyLevel: issueSeedTriage.urgencyLevel,
    tenantId: "tenant-maya",
    propertyId: "prop-maple-court",
    createdAt: timestamp,
    aiTriage: issueSeedTriage,
    messages: [
      buildAssistantMessage("I can help you try a safe reset before we schedule anyone.", "msg-1001a"),
      buildTenantMessage(issueSeedInput.description, "msg-1001b")
    ],
    escalation: buildEscalation(issueSeedInput, issueSeedTriage),
    vendorRecommendations: issueSeedRecommendations,
    appointmentProposal: buildAppointmentProposal(issueSeedRecommendations[0])
  },
  {
    id: "issue-1002",
    unitId: "unit-1a",
    category: "Hot water heater issue",
    description: "There is no hot water in the unit and the water heater closet has a small puddle.",
    photos: [buildIssuePhoto("Water heater closet", "photo-1002")],
    tenantAvailability: "Any time today",
    permissionToEnter: true,
    status: "scheduled",
    urgencyLevel: "priority",
    tenantId: "tenant-maya",
    propertyId: "prop-maple-court",
    createdAt: timestamp,
    aiTriage: triageMaintenanceIssue({
      unitId: "unit-1a",
      category: "Hot water heater issue",
      description: "There is no hot water in the unit and the water heater closet has a small puddle.",
      photos: ["water-heater.jpg"],
      tenantAvailability: "Any time today",
      permissionToEnter: true
    }),
    messages: [
      buildTenantMessage("There is no hot water and I see water near the heater.", "msg-1002a"),
      buildAssistantMessage("I am escalating this for plumber review and manager approval.", "msg-1002b")
    ],
    escalation: {
      requiredTrade: "plumbing",
      reason: "Visible leak near heater plus loss of hot water.",
      managerSummary:
        "Hot water is out at unit 1A and the tenant reported a visible puddle near the heater. Plumbing dispatch is recommended."
    },
    vendorRecommendations: rankVendors("prop-maple-court", "plumbing"),
    appointmentProposal: {
      vendorId: "vendor-clearflow",
      proposedWindow: "Today, 2:00 PM - 4:00 PM",
      estimatedCost: 184,
      reason: "Top-rated approved plumber with same-day availability."
    },
    managerApproval: {
      issueId: "issue-1002",
      decision: "approved",
      approvedVendorId: "vendor-clearflow",
      approvedWindow: "Today, 2:00 PM - 4:00 PM",
      notes: "Proceed as same-day priority.",
      approvedAt: timestamp
    }
  }
];

export let issueStore = [...seedIssues];
export let workOrderStore: WorkOrder[] = [
  {
    id: "wo-1002",
    issueId: "issue-1002",
    vendorId: "vendor-clearflow",
    trade: "plumbing",
    scheduledWindow: "Today, 2:00 PM - 4:00 PM",
    estimatedCost: 184,
    status: "scheduled"
  }
];
export let notificationStore: NotificationEvent[] = [
  {
    id: "note-1001",
    recipientType: "manager",
    channel: "in-app",
    templateKey: "approval-needed",
    issueId: "issue-1001",
    messageSummary: "Dishwasher issue is ready for manager approval.",
    createdAt: timestamp
  }
];

function nextId(prefix: string, count: number) {
  return `${prefix}-${1000 + count + 1}`;
}

export function listIssues() {
  return issueStore;
}

export function listVendors() {
  return vendorStore;
}

function vendorFromInput(input: VendorInput): Vendor {
  return {
    id: input.id ?? nextId("vendor", vendorStore.length).toLowerCase(),
    companyName: input.companyName,
    trades: input.trades.length ? input.trades : ["general"],
    approved: input.approved,
    reliabilityScore: input.reliabilityScore,
    completionRate: input.completionRate,
    coverageAreas: [{ city: input.city, postalCodes: input.postalCodes }],
    rateCard: { tripFee: input.tripFee, hourlyRate: input.hourlyRate },
    availability: { nextWindow: input.nextWindow, responseHours: input.responseHours },
    notes: input.notes
  };
}

export function upsertVendor(input: VendorInput) {
  const vendor = vendorFromInput(input);
  const existingIndex = vendorStore.findIndex((item) => item.id === vendor.id);

  if (existingIndex >= 0) {
    vendorStore = vendorStore.map((item) => (item.id === vendor.id ? vendor : item));
    return vendor;
  }

  vendorStore = [vendor, ...vendorStore];
  return vendor;
}

export function getIssueById(issueId: string) {
  return issueStore.find((issue) => issue.id === issueId);
}

export function getVendorById(vendorId: string) {
  return vendorStore.find((vendor) => vendor.id === vendorId);
}

export function createIssue(input: MaintenanceIssueInput) {
  const unit = units.find((item) => item.id === input.unitId) ?? units[0];
  const triage = triageMaintenanceIssue(input);
  const recommendations =
    triage.resolutionStatus === "resolved" ? [] : rankVendors(unit.propertyId, triage.recommendedTrade);
  const appointmentProposal = recommendations[0] ? buildAppointmentProposal(recommendations[0]) : undefined;
  const issueId = nextId("issue", issueStore.length);

  const issue: MaintenanceIssue = {
    id: issueId,
    unitId: input.unitId,
    category: input.category,
    description: input.description,
    photos: input.photos.map((name, index) => buildIssuePhoto(name, `${issueId}-photo-${index + 1}`)),
    tenantAvailability: input.tenantAvailability,
    permissionToEnter: input.permissionToEnter,
    status:
      triage.resolutionStatus === "resolved"
        ? "resolved"
        : triage.urgencyLevel === "emergency"
          ? "approval-needed"
          : "approval-needed",
    urgencyLevel: triage.urgencyLevel,
    tenantId: "tenant-maya",
    propertyId: unit.propertyId,
    createdAt: new Date().toISOString(),
    aiTriage: triage,
    messages: [
      buildTenantMessage(input.description, `${issueId}-tenant`),
      ...triage.followUpQuestions.map((question, index) =>
        buildAssistantMessage(question, `${issueId}-assistant-${index + 1}`)
      )
    ],
    escalation:
      triage.resolutionStatus === "resolved" ? undefined : buildEscalation(input, triage),
    vendorRecommendations: recommendations,
    appointmentProposal
  };

  issueStore = [issue, ...issueStore];

  if (triage.resolutionStatus !== "resolved") {
    notificationStore = [
      {
        id: nextId("note", notificationStore.length),
        recipientType: "manager",
        channel: "in-app",
        templateKey: triage.urgencyLevel === "emergency" ? "urgent-issue" : "approval-needed",
        issueId,
        messageSummary: triage.managerSummary,
        createdAt: new Date().toISOString()
      },
      ...notificationStore
    ];
  }

  return issue;
}

export function approveIssue(input: ManagerDecisionInput) {
  const issue = getIssueById(input.issueId);

  if (!issue) {
    throw new Error("Issue not found.");
  }

  const recommendation =
    issue.vendorRecommendations.find((vendor) => vendor.vendorId === input.approvedVendorId) ??
    issue.vendorRecommendations[0];

  if (!recommendation) {
    throw new Error("No vendor recommendation available.");
  }

  issue.status = input.decision === "rejected" ? "triaged" : "scheduled";
  issue.managerApproval = {
    issueId: issue.id,
    decision: input.decision,
    approvedVendorId: input.approvedVendorId,
    approvedWindow: input.approvedWindow,
    notes: input.notes,
    approvedAt: new Date().toISOString()
  };

  const workOrder: WorkOrder = {
    id: nextId("wo", workOrderStore.length),
    issueId: issue.id,
    vendorId: input.approvedVendorId,
    trade: recommendation.trade,
    scheduledWindow: input.approvedWindow,
    estimatedCost: recommendation.estimatedCost,
    status: input.decision === "rejected" ? "pending" : "scheduled"
  };

  workOrderStore = [workOrder, ...workOrderStore];
  notificationStore = [
    {
      id: nextId("note", notificationStore.length),
      recipientType: "tenant",
      channel: "sms",
      templateKey: "appointment-confirmed",
      issueId: issue.id,
      workOrderId: workOrder.id,
      messageSummary: "Your maintenance visit is booked and awaiting technician arrival.",
      createdAt: new Date().toISOString()
    },
    {
      id: nextId("note", notificationStore.length + 1),
      recipientType: "vendor",
      channel: "email",
      templateKey: "dispatch-approved",
      issueId: issue.id,
      workOrderId: workOrder.id,
      messageSummary: "A new approved work order is ready for dispatch.",
      createdAt: new Date().toISOString()
    },
    ...notificationStore
  ];

  return { issue, workOrder };
}

export function createVendor(vendor: Vendor) {
  vendorStore = [vendor, ...vendorStore];
  return vendor;
}

export function updateVendor(vendorId: string, updates: Partial<Vendor>) {
  let updatedVendor: Vendor | undefined;

  vendorStore = vendorStore.map((vendor) => {
    if (vendor.id !== vendorId) {
      return vendor;
    }

    updatedVendor = { ...vendor, ...updates };
    return updatedVendor;
  });

  return updatedVendor;
}

export function deleteVendor(vendorId: string) {
  const exists = vendorStore.some((vendor) => vendor.id === vendorId);
  vendorStore = vendorStore.filter((vendor) => vendor.id !== vendorId);
  return exists;
}
