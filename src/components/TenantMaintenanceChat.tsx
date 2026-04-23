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

function textAnswersQuestion(question: string, tenantText: string) {
  const questionText = question.toLowerCase();
  const answerText = tenantText.toLowerCase();

  const checks = [
    {
      question: ["standing water", "draining"],
      answer: ["standing water", "water sitting", "bottom", "not draining", "won't drain", "wont drain", "drain"]
    },
    {
      question: ["hear", "running"],
      answer: ["hear", "sound", "running", "humming", "quiet", "noise"]
    },
    {
      question: ["disposal"],
      answer: ["disposal", "garbage disposal", "sink"]
    },
    {
      question: ["anywhere", "one fixture"],
      answer: ["everywhere", "anywhere", "whole unit", "all faucets", "one faucet", "bathroom", "kitchen"]
    },
    {
      question: ["suddenly", "gradually"],
      answer: ["sudden", "suddenly", "gradual", "today", "yesterday", "this morning", "last night", "started"]
    },
    {
      question: ["water under", "heater closet"],
      answer: ["leak", "puddle", "water under", "water around", "heater closet", "dripping"]
    },
    {
      question: ["one outlet", "entire room"],
      answer: ["one outlet", "room", "entire room", "whole room", "outlet"]
    },
    {
      question: ["breaker"],
      answer: ["breaker", "tripped", "panel"]
    },
    {
      question: ["burnt"],
      answer: ["burnt", "burning", "smell", "hot", "smoke"]
    },
    {
      question: ["first notice"],
      answer: ["today", "yesterday", "this morning", "last night", "week", "noticed", "started"]
    },
    {
      question: ["constant", "come and go"],
      answer: ["constant", "always", "intermittent", "sometimes", "comes and goes", "come and go"]
    },
    {
      question: ["reset", "power cycle"],
      answer: ["reset", "restarted", "power cycle", "turned off", "turned it off", "unplugged"]
    }
  ];

  return checks.some(
    (check) =>
      check.question.some((keyword) => questionText.includes(keyword)) &&
      check.answer.some((keyword) => answerText.includes(keyword))
  );
}

function getMeaningfulTenantMessages(messages: ChatMessage[]) {
  return messages
    .filter((message) => message.role === "tenant")
    .map((message) => message.text)
    .filter((text) => !/photo[s]? attached/i.test(text));
}

function getSmartFollowUpQuestion(issue: MaintenanceIssue, messages: ChatMessage[], latestTenantText = "") {
  if (issue.urgencyLevel === "emergency") {
    return null;
  }

  const tenantTexts = [...getMeaningfulTenantMessages(messages), latestTenantText].join(" ");
  const askedAssistantText = messages
    .filter((message) => message.role === "assistant")
    .map((message) => message.text.toLowerCase())
    .join(" ");
  const meaningfulTenantCount = getMeaningfulTenantMessages(messages).length + (latestTenantText ? 1 : 0);

  if (meaningfulTenantCount >= 2) {
    return null;
  }

  return (
    issue.aiTriage.followUpQuestions.find(
      (question) => !askedAssistantText.includes(question.toLowerCase()) && !textAnswersQuestion(question, tenantTexts)
    ) ?? null
  );
}

function buildNextActionMessage(issue: MaintenanceIssue) {
  if (issue.urgencyLevel === "emergency") {
    return "I have enough to escalate this. Please focus on safety first, and your manager will get the full summary.";
  }

  if (issue.aiTriage.diySteps.length) {
    return "I have enough to give you a safe first step. Try only the quick check below if you feel comfortable. If it does not work, I can help send this to your manager with the full context.";
  }

  return "I have enough information to send this to your property manager for review, so you do not have to explain everything twice.";
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
      const nextQuestion = getSmartFollowUpQuestion(issue, messages, tenantQuestion);
      const tools = issue.aiTriage.diySteps
        .flatMap((step) => step.safeTools)
        .filter((tool, index, allTools) => allTools.indexOf(tool) === index);
      const isToolQuestion = /tool|need|fix|try|myself|own/i.test(tenantQuestion);
      const isVendorQuestion = /vendor|schedule|book|manager|maintenance|repair/i.test(tenantQuestion);
      const isResolvedMessage = /worked|fixed|resolved|it works|all good|came back/i.test(tenantQuestion);
      const isStillBrokenMessage = /still|not working|didn't work|didnt work|same|worse|no change/i.test(tenantQuestion);
      let assistantReply = nextQuestion ?? buildNextActionMessage(issue);

      if (isResolvedMessage) {
        assistantReply =
          "That is a relief. I am glad it is working again. I will keep the request details here in case it comes back, but you do not need to do anything else right now.";
      }

      if (isStillBrokenMessage) {
        assistantReply =
          "Thanks for trying that. Since it is still happening, I would not keep troubleshooting. I can package the photo, what you tried, and the likely trade for your property manager.";
      }

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
          text: getSmartFollowUpQuestion(createdIssue, current, tenantQuestion) ?? buildNextActionMessage(createdIssue)
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
