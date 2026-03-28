import React, { useEffect, useState } from "react";
import { getMe, updateMe } from "../api.js";

export default function Profile() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  useEffect(() => {
    getMe().then(u => {
      setEmail(u.email);
      setUsername(u.username);
    }).catch(e => setMsg(e.message));
  }, []);
  async function save() {
    setMsg("");
    try {
      const u = await updateMe({ username, password: password || undefined });
      setUsername(u.username);
      setPassword("");
      setMsg("Saved");
    } catch (e) {
      setMsg(e.message);
    }
  }
  return (
    <div style={{ padding: 24, maxWidth: 480 }}>
      <h2>Profile</h2>
      <div style={{ display: "grid", gap: 12 }}>
        <input value={email} readOnly />
        <input value={username} onChange={e => setUsername(e.target.value)} />
        <input placeholder="New Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={save}>Save</button>
      </div>
      {msg && <div style={{ color: msg === "Saved" ? "green" : "red", marginTop: 8 }}>{msg}</div>}
    </div>
  );
}
