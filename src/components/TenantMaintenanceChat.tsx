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

export function TenantMaintenanceChat({ defaultUnitId, propertyName, unitLabel }: TenantMaintenanceChatProps) {
  const [photoNames, setPhotoNames] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [issue, setIssue] = useState<MaintenanceIssue | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Take a picture of your problem and tell me what is going on. I will help you understand it and see if there is a safe quick fix."
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
          text: "Photo received. Add one sentence about what you are seeing, and I will start diagnosing it."
        }
      ]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload photos.");
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
        "If you can, tell me whether the problem is getting worse, staying the same, or only happening sometimes.";
      const tools = issue.aiTriage.diySteps
        .flatMap((step) => step.safeTools)
        .filter((tool, index, allTools) => allTools.indexOf(tool) === index);
      const isToolQuestion = /tool|need|fix|try|myself|own/i.test(tenantQuestion);
      const isVendorQuestion = /vendor|schedule|book|manager|maintenance|repair/i.test(tenantQuestion);
      let assistantReply = nextQuestion;

      if (isToolQuestion && tools.length) {
        assistantReply = `For the safe quick check, you should only need: ${tools.join(", ")}. If anything smells hot, sparks, leaks heavily, or requires opening panels, stop and I will send it to your manager.`;
      }

      if (isVendorQuestion) {
        assistantReply =
          "I can prepare this for your property manager with the photo, diagnosis, and recommended trade. They approve any vendor booking before anyone is sent out.";
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
        text: "I am reviewing the photo and your note now..."
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
          text: createdIssue.aiTriage.managerSummary
        },
        {
          id: `question-${Date.now()}`,
          role: "assistant",
          text:
            createdIssue.aiTriage.followUpQuestions[0] ??
            "I have enough information to send this to your property manager for review."
        }
      ]);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to diagnose this issue.");
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
        <p>We will help you understand what may be wrong and what to do next.</p>
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
                <strong>Safe quick fix to try</strong>
                <ul className="assistant-list">
                  {issue.aiTriage.diySteps.slice(0, 3).map((step) => (
                    <li key={step.id}>
                      {step.title}: {step.detail} Tools: {step.safeTools.join(", ")}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>No self-repair is recommended. I will help send this to your property manager.</p>
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
