import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api.js";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();
  async function submit(e) {
    e.preventDefault();
    setMsg("");
    try {
      await registerUser({ email, username, password, confirm_password: confirmPassword });
      navigate("/login");
    } catch (err) {
      setMsg(err.message);
    }
  }
  return (
    <div style={{ padding: 24, maxWidth: 480 }}>
      <h2>Register</h2>
      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <input placeholder="Confirm Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
        <button type="submit">Create Account</button>
      </form>
      {msg && <div style={{ color: "red", marginTop: 8 }}>{msg}</div>}
    </div>
  );
}
