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
      setMsg("Profile updated successfully");
    } catch (e) {
      setMsg(e.message);
    }
  }
  return (
    <div style={{ 
      minHeight: "calc(100vh - 72px)", 
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      padding: 48
    }}>
      <div style={{ 
        maxWidth: 600, 
        margin: "0 auto",
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
          My Profile
        </h2>
        <p style={{ color: "#888", marginBottom: 32 }}>Manage your account settings</p>
        <div style={{ display: "grid", gap: 20 }}>
          <div>
            <label style={{ display: "block", marginBottom: 8, color: "#333", fontWeight: 500 }}>Email</label>
            <input 
              value={email} 
              readOnly
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e0e0e0",
                borderRadius: 8,
                fontSize: 14,
                boxSizing: "border-box",
                background: "#f5f5f5",
                color: "#666"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 8, color: "#333", fontWeight: 500 }}>Username</label>
            <input 
              value={username} 
              onChange={e => setUsername(e.target.value)}
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
            <label style={{ display: "block", marginBottom: 8, color: "#333", fontWeight: 500 }}>New Password</label>
            <input 
              placeholder="Leave blank to keep current password" 
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
            onClick={save}
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
            Save Changes
          </button>
        </div>
        {msg && <div style={{ 
          color: msg.includes("successfully") ? "#10b981" : "#ef4444", 
          marginTop: 16, 
          padding: 12, 
          background: msg.includes("successfully") ? "#ecfdf5" : "#fef2f2", 
          borderRadius: 8,
          border: `1px solid ${msg.includes("successfully") ? "#10b981" : "#ef4444"}`
        }}>{msg}</div>}
      </div>
    </div>
  );
}
