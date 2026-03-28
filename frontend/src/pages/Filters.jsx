import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { extractCV, extractCVFromText, getOptions } from "../api.js";

export default function Filters() {
  const [file, setFile] = useState(null);
  const [cvText, setCvText] = useState("");
  const [profile, setProfile] = useState({ gpa: "", toefl: "", ielts: "", hsk: "", majors: [], cities: [] });
  const [opts, setOpts] = useState({ cities: [], fields: [] });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    getOptions().then(setOpts).catch(e => setMsg(e.message));
  }, []);
  async function upload() {
    if (!file) return;
    setMsg("");
    setLoading(true);
    try {
      const r = await extractCV(file);
      const p = r.profile || {};
      setProfile({
        gpa: p.gpa || "",
        toefl: p.toefl || "",
        ielts: p.ielts || "",
        hsk: p.hsk || "",
        majors: p.majors || [],
        cities: p.cities || []
      });
      setMsg("CV extracted successfully!");
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }
  async function extractText() {
    if (!cvText.trim()) return;
    setMsg("");
    setLoading(true);
    try {
      const r = await extractCVFromText(cvText);
      const p = r.profile || {};
      setProfile({
        gpa: p.gpa || "",
        toefl: p.toefl || "",
        ielts: p.ielts || "",
        hsk: p.hsk || "",
        majors: p.majors || [],
        cities: p.cities || []
      });
      setMsg("Text extracted successfully!");
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }
  function next() {
    localStorage.setItem("sap_profile", JSON.stringify(profile));
    navigate("/results");
  }
  return (
    <div style={{ 
      minHeight: "calc(100vh - 72px)", 
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      padding: 48
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ 
          fontSize: 36, 
          marginBottom: 8,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: 800
        }}>
          Upload Your CV
        </h2>
        <p style={{ color: "#888", marginBottom: 32 }}>Let AI analyze your profile and find the best programs for you</p>
        
        <div style={{ 
          background: "white", 
          padding: 32, 
          borderRadius: 16, 
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          marginBottom: 24
        }}>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", marginBottom: 12, color: "#333", fontWeight: 600, fontSize: 16 }}>
              Upload CV File (PDF/TXT)
            </label>
            <div style={{ 
              border: "2px dashed #667eea", 
              borderRadius: 12, 
              padding: 32, 
              textAlign: "center",
              background: "#f8f9ff",
              cursor: "pointer",
              transition: "background 0.2s"
            }}>
              <input 
                type="file" 
                onChange={e => setFile(e.target.files?.[0])}
                accept=".pdf,.txt"
                style={{ display: "none" }}
                id="cv-upload"
              />
              <label htmlFor="cv-upload" style={{ cursor: "pointer" }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>📄</div>
                <div style={{ color: "#667eea", fontWeight: 600, marginBottom: 4 }}>
                  {file ? file.name : "Click to upload or drag and drop"}
                </div>
                <div style={{ color: "#888", fontSize: 14 }}>PDF or TXT files only</div>
              </label>
            </div>
            <button 
              onClick={upload}
              disabled={!file || loading}
              style={{
                width: "100%",
                background: file && !loading ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "#ccc",
                color: "white",
                border: "none",
                padding: "14px",
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: file && !loading ? "pointer" : "not-allowed",
                marginTop: 16,
                boxShadow: file && !loading ? "0 4px 15px rgba(102, 126, 234, 0.4)" : "none"
              }}
            >
              {loading ? "Extracting..." : "Extract Information from CV"}
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", margin: "24px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#e0e0e0" }}></div>
            <span style={{ padding: "0 16px", color: "#888", fontSize: 14 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "#e0e0e0" }}></div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 12, color: "#333", fontWeight: 600, fontSize: 16 }}>
              Paste Your CV Text
            </label>
            <textarea 
              placeholder="Paste your CV content here..." 
              value={cvText} 
              onChange={e => setCvText(e.target.value)} 
              rows={6} 
              style={{ 
                width: "100%", 
                padding: "12px 16px",
                border: "2px solid #e0e0e0",
                borderRadius: 8,
                fontSize: 14,
                boxSizing: "border-box",
                resize: "vertical",
                fontFamily: "inherit"
              }}
            />
            <button 
              onClick={extractText}
              disabled={!cvText.trim() || loading}
              style={{
                width: "100%",
                background: cvText.trim() && !loading ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "#ccc",
                color: "white",
                border: "none",
                padding: "14px",
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: cvText.trim() && !loading ? "pointer" : "not-allowed",
                marginTop: 16,
                boxShadow: cvText.trim() && !loading ? "0 4px 15px rgba(102, 126, 234, 0.4)" : "none"
              }}
            >
              {loading ? "Extracting..." : "Extract Information from Text"}
            </button>
          </div>
        </div>

        <div style={{ 
          background: "white", 
          padding: 32, 
          borderRadius: 16, 
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ 
            fontSize: 24, 
            marginBottom: 24,
            color: "#333",
            fontWeight: 700
          }}>
            Your Profile
          </h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20, marginBottom: 24 }}>
            <div>
              <label style={{ display: "block", marginBottom: 8, color: "#333", fontWeight: 500 }}>GPA</label>
              <input 
                placeholder="e.g., 3.5" 
                value={profile.gpa} 
                onChange={e => setProfile(p => ({ ...p, gpa: e.target.value }))}
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
              <label style={{ display: "block", marginBottom: 8, color: "#333", fontWeight: 500 }}>TOEFL Score</label>
              <input 
                placeholder="e.g., 90" 
                value={profile.toefl} 
                onChange={e => setProfile(p => ({ ...p, toefl: e.target.value }))}
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
              <label style={{ display: "block", marginBottom: 8, color: "#333", fontWeight: 500 }}>IELTS Score</label>
              <input 
                placeholder="e.g., 6.5" 
                value={profile.ielts} 
                onChange={e => setProfile(p => ({ ...p, ielts: e.target.value }))}
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
              <label style={{ display: "block", marginBottom: 8, color: "#333", fontWeight: 500 }}>HSK Score</label>
              <input 
                placeholder="e.g., 5" 
                value={profile.hsk} 
                onChange={e => setProfile(p => ({ ...p, hsk: e.target.value }))}
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
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", marginBottom: 8, color: "#333", fontWeight: 500 }}>Preferred Cities</label>
            <select 
              multiple 
              value={profile.cities} 
              onChange={e => setProfile(p => ({ ...p, cities: Array.from(e.target.selectedOptions).map(o => o.value) }))} 
              style={{ 
                width: "100%", 
                height: 160,
                padding: "12px 16px",
                border: "2px solid #e0e0e0",
                borderRadius: 8,
                fontSize: 14,
                boxSizing: "border-box"
              }}
            >
              {opts.cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>Hold Ctrl/Cmd to select multiple cities</div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", marginBottom: 8, color: "#333", fontWeight: 500 }}>Fields of Interest</label>
            <select 
              multiple 
              value={profile.majors} 
              onChange={e => setProfile(p => ({ ...p, majors: Array.from(e.target.selectedOptions).map(o => o.value) }))} 
              style={{ 
                width: "100%", 
                height: 160,
                padding: "12px 16px",
                border: "2px solid #e0e0e0",
                borderRadius: 8,
                fontSize: 14,
                boxSizing: "border-box"
              }}
            >
              {opts.fields.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>Hold Ctrl/Cmd to select multiple fields</div>
          </div>

          <button 
            onClick={next}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              padding: "16px",
              borderRadius: 8,
              fontSize: 18,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
              transition: "transform 0.2s"
            }}
          >
            Continue to Find Programs
          </button>
        </div>

        {msg && <div style={{ 
          marginTop: 24, 
          padding: 16, 
          background: msg.includes("successfully") ? "#ecfdf5" : "#fef2f2", 
          borderRadius: 8,
          border: `1px solid ${msg.includes("successfully") ? "#10b981" : "#ef4444"}`,
          color: msg.includes("successfully") ? "#10b981" : "#ef4444",
          fontWeight: 500
        }}>{msg}</div>}
      </div>
    </div>
  );
}
