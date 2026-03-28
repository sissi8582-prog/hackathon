import React, { useState } from "react";

export default function App() {
  const [text, setText] = useState("");
  const [reply, setReply] = useState("");
  async function send() {
    try {
      const r = await fetch("/api/llm/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      const data = await r.json();
      setReply(data.text || JSON.stringify(data));
    } catch (e) {
      setReply(String(e));
    }
  }
  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>Smart Admissions Pathologist</h1>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={6} style={{ width: "100%" }} />
      <button onClick={send} style={{ marginTop: 8 }}>Send</button>
      <pre style={{ whiteSpace: "pre-wrap", marginTop: 16 }}>{reply}</pre>
    </div>
  );
}
