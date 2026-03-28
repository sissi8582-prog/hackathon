import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOptions, filterPrograms } from "../api.js";

export default function Results() {
  const [opts, setOpts] = useState({ cities: [], fields: [], sort_by: [] });
  const [cities, setCities] = useState(["ALL"]);
  const [fields, setFields] = useState(["ALL"]);
  const [sortBy, setSortBy] = useState("qs");
  const [programs, setPrograms] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    getOptions().then(o => {
      setOpts(o);
    }).catch(e => setMsg(e.message));
  }, []);
  async function search() {
    setMsg("");
    setLoading(true);
    try {
      const r = await filterPrograms({ cities, fields, sort_by: sortBy });
      setPrograms(r.programs || []);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (opts.sort_by.length > 0) {
      search();
    }
  }, [opts.sort_by]);
  return (
    <div style={{ 
      minHeight: "calc(100vh - 72px)", 
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      padding: 48
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h2 style={{ 
          fontSize: 36, 
          marginBottom: 8,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: 800
        }}>
          Find Programs
        </h2>
        <p style={{ color: "#888", marginBottom: 32 }}>Discover your perfect program at Chinese universities</p>

        <div style={{ 
          background: "white", 
          padding: 32, 
          borderRadius: 16, 
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          marginBottom: 24
        }}>
          <div style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(3, 1fr)" }}>
            <div>
              <label style={{ display: "block", marginBottom: 12, color: "#333", fontWeight: 600, fontSize: 16 }}>
                Cities
              </label>
              <select 
                multiple 
                value={cities} 
                onChange={e => setCities(Array.from(e.target.selectedOptions).map(o => o.value))} 
                style={{ 
                  width: "100%", 
                  height: 180,
                  padding: "12px 16px",
                  border: "2px solid #e0e0e0",
                  borderRadius: 8,
                  fontSize: 14,
                  boxSizing: "border-box"
                }}
              >
                <option value="ALL">ALL Cities</option>
                {opts.cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>Hold Ctrl/Cmd to select multiple</div>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 12, color: "#333", fontWeight: 600, fontSize: 16 }}>
                Fields
              </label>
              <select 
                multiple 
                value={fields} 
                onChange={e => setFields(Array.from(e.target.selectedOptions).map(o => o.value))} 
                style={{ 
                  width: "100%", 
                  height: 180,
                  padding: "12px 16px",
                  border: "2px solid #e0e0e0",
                  borderRadius: 8,
                  fontSize: 14,
                  boxSizing: "border-box"
                }}
              >
                <option value="ALL">ALL Fields</option>
                {opts.fields.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>Hold Ctrl/Cmd to select multiple</div>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 12, color: "#333", fontWeight: 600, fontSize: 16 }}>
                Sort By
              </label>
              <select 
                value={sortBy} 
                onChange={e => setSortBy(e.target.value)} 
                style={{ 
                  width: "100%", 
                  padding: "12px 16px",
                  border: "2px solid #e0e0e0",
                  borderRadius: 8,
                  fontSize: 14,
                  boxSizing: "border-box",
                  marginBottom: 16
                }}
              >
                <option value="qs">QS World Ranking</option>
                <option value="cn">China Ranking</option>
              </select>
              <button 
                onClick={search}
                disabled={loading}
                style={{
                  width: "100%",
                  background: loading ? "#ccc" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  padding: "14px",
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: loading ? "none" : "0 4px 15px rgba(102, 126, 234, 0.4)"
                }}
              >
                {loading ? "Searching..." : "Search Programs"}
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          {programs.length === 0 ? (
            <div style={{ 
              background: "white", 
              padding: 48, 
              borderRadius: 16, 
              textAlign: "center",
              color: "#888",
              fontSize: 16
            }}>
              No programs found. Try adjusting your filters.
            </div>
          ) : (
            programs.map(p => (
              <div 
                key={p.id} 
                onClick={() => navigate(`/programs/${p.id}`)} 
                style={{ 
                  padding: 24, 
                  background: "white",
                  border: "2px solid #e0e0e0",
                  borderRadius: 12, 
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#667eea";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(102, 126, 234, 0.2)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e0e0e0";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontSize: 20, 
                      fontWeight: 700, 
                      color: "#333",
                      marginBottom: 8
                    }}>
                      {p.university}
                    </h3>
                    <div style={{ 
                      fontSize: 16, 
                      color: "#667eea", 
                      fontWeight: 600,
                      marginBottom: 8
                    }}>
                      {p.name}
                    </div>
                  </div>
                  <div style={{ 
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    padding: "8px 16px",
                    borderRadius: 20,
                    fontSize: 14,
                    fontWeight: 600,
                    whiteSpace: "nowrap"
                  }}>
                    View Details
                  </div>
                </div>
                <div style={{ display: "flex", gap: 24, fontSize: 14, color: "#666", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span>📍</span>
                    <span>{p.city}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span>🏆</span>
                    <span>QS #{p.qs_rank}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span>🎯</span>
                    <span>CN #{p.cn_rank}</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {(p.fields || []).map(f => (
                    <span key={f} style={{
                      background: "#f0f0f0",
                      color: "#666",
                      padding: "4px 12px",
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 500
                    }}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {msg && <div style={{ 
          marginTop: 24, 
          padding: 16, 
          background: "#fef2f2", 
          borderRadius: 8,
          border: "1px solid #ef4444",
          color: "#ef4444",
          fontWeight: 500
        }}>{msg}</div>}
      </div>
    </div>
  );
}
