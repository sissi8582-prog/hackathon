import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
    <div style={{ 
      minHeight: "calc(100vh - 72px)", 
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24
    }}>
      <div style={{ 
        maxWidth: 480, 
        width: "100%",
        background: "white",
        padding: 48,
        borderRadius: 16,
        boxShadow: "0 10px 40px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ 
          fontSize: 32, 
          marginBottom: 8,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: 800
        }}>
          Welcome Back
        </h2>
        <p style={{ color: "#888", marginBottom: 32 }}>Sign in to continue your journey</p>
        <form onSubmit={submit} style={{ display: "grid", gap: 20 }}>
          <div>
            <label style={{ display: "block", marginBottom: 8, color: "#333", fontWeight: 500 }}>Email</label>
            <input 
              placeholder="Enter your email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e0e0e0",
                borderRadius: 8,
                fontSize: 14,
                boxSizing: "border-box",
                transition: "border-color 0.2s"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 8, color: "#333", fontWeight: 500 }}>Password</label>
            <input 
              placeholder="Enter your password" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e0e0e0",
                borderRadius: 8,
                fontSize: 14,
                boxSizing: "border-box",
                transition: "border-color 0.2s"
              }}
            />
          </div>
          <button 
            type="submit" 
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              padding: "14px",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
              transition: "transform 0.2s"
            }}
          >
            Sign In
          </button>
        </form>
        {msg && <div style={{ color: "#ef4444", marginTop: 16, padding: 12, background: "#fef2f2", borderRadius: 8 }}>{msg}</div>}
        <p style={{ marginTop: 24, textAlign: "center", color: "#666" }}>
          Don't have an account? <Link to="/register" style={{ color: "#667eea", fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
