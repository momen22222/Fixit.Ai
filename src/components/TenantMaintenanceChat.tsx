"use client";

import Link from "next/link";
import { useState } from "react";
import { type MaintenanceIssue, type MaintenanceIssueInput } from "@/lib/maintenance-types";

type TenantMaintenanceChatProps = {
  defaultUnitId: string;
  propertyName: string;
  unitLabel: string;
};

type ChatMessage = {
  id: string;
  role: "assistant" | "tenant";
  text: string;
};

function buildTenantDiagnosisMessage(issue: MaintenanceIssue) {
  if (issue.urgencyLevel === "emergency") {
    return [
      "I am really sorry you are dealing with this. This could be urgent, so your safety comes first.",
      "Please do not try to repair it yourself. I will package the photo, your note, and a clear summary for your property manager right away."
    ].join(" ");
  }

  if (!issue.aiTriage.diySteps.length) {
    return [
      "Thanks for sending that. I know maintenance problems are stressful, especially when you are not sure what is wrong.",
      `From what you shared, this looks like it may need ${issue.aiTriage.recommendedTrade} help. I will keep the next steps simple and make sure your manager has the full context.`
    ].join(" ");
  }

  return [
    "Thanks for sending that. I know this is not fun to deal with, but you are in the right place.",
    `This looks like it may be a ${issue.aiTriage.recommendedTrade} issue. I found a few safe, simple things you can try first, and if it still does not work, I will help send everything to your property manager.`
  ].join(" ");
}

export function TenantMaintenanceChat({ defaultUnitId, propertyName, unitLabel }: TenantMaintenanceChatProps) {
  const [photoNames, setPhotoNames] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [issue, setIssue] = useState<MaintenanceIssue | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi, I am here to help. Take a picture of the problem and tell me what is happening. I will walk you through it calmly, check if there is a safe quick fix, and help get your manager involved if needed."
    }
  ]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePhotoSelection(files: File[]) {
    if (!files.length) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadedPaths = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/uploads/issue-photo", {
            method: "POST",
            body: formData
          });

          const payload = (await response.json()) as {
            upload?: { path: string; fileName: string };
            error?: string;
          };

          if (!response.ok || !payload.upload) {
            throw new Error(payload.error ?? `Unable to upload ${file.name}.`);
          }

          return payload.upload.path;
        })
      );

      setPhotoNames(uploadedPaths);
      setMessages((current) => [
        ...current,
        {
          id: `photo-${Date.now()}`,
          role: "tenant",
          text: `${files.length} photo${files.length === 1 ? "" : "s"} attached.`
        },
        {
          id: `photo-ai-${Date.now()}`,
          role: "assistant",
          text: "I got the photo. You are doing great. Add one short sentence about what you are seeing, and I will start figuring out the safest next step."
        }
      ]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "I could not upload that photo yet. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function submitToAi() {
    const tenantQuestion = description.trim();

    if (!tenantQuestion) {
      return;
    }

    if (issue) {
      const tenantMessageCount = messages.filter((message) => message.role === "tenant").length;
      const nextQuestion =
        issue.aiTriage.followUpQuestions[tenantMessageCount] ??
        "That helps. If you can, tell me whether the problem is getting worse, staying the same, or only happening sometimes.";
      const tools = issue.aiTriage.diySteps
        .flatMap((step) => step.safeTools)
        .filter((tool, index, allTools) => allTools.indexOf(tool) === index);
      const isToolQuestion = /tool|need|fix|try|myself|own/i.test(tenantQuestion);
      const isVendorQuestion = /vendor|schedule|book|manager|maintenance|repair/i.test(tenantQuestion);
      let assistantReply = nextQuestion;

      if (isToolQuestion && tools.length) {
        assistantReply = `For the safe quick check, you should only need: ${tools.join(", ")}. Please only do what feels simple and safe. If anything smells hot, sparks, leaks heavily, or requires opening panels, stop. I will help send it to your manager.`;
      }

      if (isVendorQuestion) {
        assistantReply =
          "Yes. I can prepare this for your property manager with the photo, what we discussed, and the recommended trade. You will not have to explain everything twice, and your manager approves any vendor booking before anyone is sent out.";
      }

      setMessages((current) => [
        ...current,
        {
          id: `tenant-followup-${Date.now()}`,
          role: "tenant",
          text: tenantQuestion
        },
        {
          id: `assistant-followup-${Date.now()}`,
          role: "assistant",
          text: assistantReply
        }
      ]);
      setDescription("");
      return;
    }

    setLoading(true);
    setError(null);
    setMessages((current) => [
      ...current,
      {
        id: `tenant-${Date.now()}`,
        role: "tenant",
        text: tenantQuestion
      },
      {
        id: `thinking-${Date.now()}`,
        role: "assistant",
        text: "I am reviewing the photo and your note now. I will keep this safe and simple."
      }
    ]);

    try {
      const input: MaintenanceIssueInput = {
        unitId: defaultUnitId,
        category: "Other maintenance issue",
        description: tenantQuestion,
        photos: photoNames,
        tenantAvailability: "Any time with notice",
        permissionToEnter: true
      };

      const response = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });

      const payload = (await response.json()) as { issue?: MaintenanceIssue; error?: string };

      if (!response.ok || !payload.issue) {
        throw new Error(payload.error ?? "Unable to diagnose this issue.");
      }

      const createdIssue = payload.issue;

      setIssue(createdIssue);
      setDescription("");
      setMessages((current) => [
        ...current,
        {
          id: `diagnosis-${Date.now()}`,
          role: "assistant",
          text: buildTenantDiagnosisMessage(createdIssue)
        },
        {
          id: `question-${Date.now()}`,
          role: "assistant",
          text:
            createdIssue.aiTriage.followUpQuestions[0] ??
            "I have enough information to send this to your property manager for review, so you do not have to chase it down yourself."
        }
      ]);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "I could not diagnose this yet. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="tenant-chat-screen">
      <div className="tenant-chat-header">
        <p className="mobile-label">
          {propertyName} / {unitLabel}
        </p>
        <h1>Take a picture of your problem.</h1>
        <p>We will help you understand what may be wrong and stay with you through the next step.</p>
      </div>

      <div className="tenant-chat-window">
        {messages.map((message) => (
          <div className={`chat-message ${message.role}`} key={message.id}>
            {message.text}
          </div>
        ))}

        {issue ? (
          <div className="chat-result-panel">
            <p className="mobile-label">AI diagnosis</p>
            <h2>{issue.aiTriage.recommendedTrade} help may be needed</h2>
            <div className="assistant-pills">
              <span className={`status-pill is-${issue.urgencyLevel}`}>{issue.urgencyLevel}</span>
              <span className={`status-pill is-${issue.status}`}>{issue.status}</span>
            </div>

            {issue.aiTriage.diySteps.length ? (
              <div className="chat-mini-section">
                <strong>Safe quick fix to try, only if you feel comfortable</strong>
                <ul className="assistant-list">
                  {issue.aiTriage.diySteps.slice(0, 3).map((step) => (
                    <li key={step.id}>
                      {step.title}: {step.detail} Tools: {step.safeTools.join(", ")}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>No self-repair is recommended here. That is okay. I will help send this to your property manager with the full context.</p>
            )}

            <Link className="mobile-primary-action" href={`/tenant/issues/${issue.id}`}>
              View full request
            </Link>
          </div>
        ) : null}
      </div>

      <div className="tenant-chat-composer">
        <label className="chat-photo-button">
          {uploading ? "Uploading..." : photoNames.length ? "Photo added" : "Take photo"}
          <input
            accept="image/*"
            capture="environment"
            type="file"
            onChange={(event) => {
              void handlePhotoSelection(Array.from(event.target.files ?? []));
            }}
          />
        </label>
        <textarea
          rows={2}
          placeholder="Example: The dishwasher has water sitting at the bottom."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <button className="mobile-primary-action" disabled={loading || uploading || !description.trim()} onClick={submitToAi}>
          {loading ? "Checking..." : issue ? "Send" : "Ask AI"}
        </button>
      </div>

      {error ? <p className="error-note">{error}</p> : null}
    </section>
  );
}
