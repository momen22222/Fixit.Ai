const messages = [
  {
    role: "assistant",
    text: "I noticed your sleep was lower and recovery is still the main priority. Want a simplified plan for today?"
  },
  {
    role: "user",
    text: "Yes. Keep meals easy and lower the workout intensity."
  },
  {
    role: "assistant",
    text: "Done. I shifted lunch to a prep-friendly option, kept hydration reminders, and swapped the workout for a walk plus deep core reset."
  }
];

export default function CoachPage() {
  return (
    <section className="page-stack">
      <div className="page-heading">
        <p className="eyebrow">AI Coach</p>
        <h1>A coaching layer that helps women adapt instead of start over</h1>
        <p>
          This is where the app becomes truly personal: conversational guidance, rewritten plans, symptom support, and
          daily decision help.
        </p>
      </div>

      <section className="content-panel">
        <div className="panel-heading">
          <span>Conversation preview</span>
          <p>Personalization should feel calm, smart, and realistic.</p>
        </div>
        <div className="chat-shell product-chat">
          {messages.map((message) => (
            <div className={`chat-bubble ${message.role}`} key={message.text}>
              {message.text}
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
