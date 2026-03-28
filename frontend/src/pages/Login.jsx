import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();
  async function submit(e) {
    e.preventDefault();
    setMsg("");
    try {
      const t = await loginUser({ email, password });
      localStorage.setItem("token", t.access_token);
      navigate("/profile");
    } catch (err) {
      setMsg(err.message);
    }
  }
  return (
    <div style={{ padding: 24, maxWidth: 480 }}>
      <h2>Login</h2>
      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">Sign In</button>
      </form>
      {msg && <div style={{ color: "red", marginTop: 8 }}>{msg}</div>}
    </div>
  );
}
