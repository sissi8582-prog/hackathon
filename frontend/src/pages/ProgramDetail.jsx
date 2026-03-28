import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { programDetail, compareProgram } from "../api.js";

export default function ProgramDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prog, setProg] = useState(null);
  const [unmet, setUnmet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  useEffect(() => {
    setLoading(true);
    programDetail(id).then(setProg).catch(e => {
      setMsg(e.message);
      setLoading(false);
    }).finally(() => setLoading(false));
  }, [id]);
  useEffect(() => {
    const profileStr = localStorage.getItem("sap_profile");
    if (profileStr && id) {
      const profile = JSON.parse(profileStr);
      const p = {
        gpa: profile.gpa ? parseFloat(profile.gpa) : null,
        toefl: profile.toefl ? parseInt(profile.toefl) : null,
        ielts: profile.ielts ? parseFloat(profile.ielts) : null,
        hsk: profile.hsk ? parseInt(profile.hsk) : null,
        majors: profile.majors || [],
        cities: profile.cities || [],
        skills: profile.skills || []
      };
      compareProgram(id, p).then(r => setUnmet(r.unmet || [])).catch(e => setMsg(e.message));
    }
  }, [id]);
  if (loading) {
    return (
      <div style={{ 
        minHeight: "calc(100vh - 72px)", 
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        color: "#666"
      }}>
        Loading...
      </div>
    );
  }
  if (!prog) {
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
          background: "white", 
          padding: 48, 
          borderRadius: 16, 
          textAlign: "center",
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>😕</div>
          <h2 style={{ fontSize: 24, marginBottom: 8, color: "#333" }}>Program Not Found</h2>
          <p style={{ color: "#888", marginBottom: 24 }}>{msg || "The program you're looking for doesn't exist."}</p>
          <button 
            onClick={() => navigate("/results")}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              padding: "14px 32px",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)"
            }}
          >
            Back to Programs
          </button>
        </div>
      </div>
    );
  }
  const req = prog.requirements || {};
  return (
    <div style={{ 
      minHeight: "calc(100vh - 72px)", 
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      padding: 48
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <button 
          onClick={() => navigate("/results")}
          style={{
            background: "white",
            color: "#667eea",
            border: "2px solid #667eea",
            padding: "10px 24px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
          }}
        >
          ← Back to Programs
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
          <div>
            <div style={{ 
              background: "white", 
              padding: 32, 
              borderRadius: 16, 
              boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
              marginBottom: 24
            }}>
              <h1 style={{ 
                fontSize: 32, 
                marginBottom: 8,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 800
              }}>
                {prog.university}
              </h1>
              <h2 style={{ 
                fontSize: 24, 
                color: "#667eea", 
                fontWeight: 700,
                marginBottom: 16
              }}>
                {prog.name}
              </h2>
              <div style={{ display: "flex", gap: 24, fontSize: 14, color: "#666", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 18 }}>📍</span>
                  <span style={{ fontWeight: 600 }}>{prog.city}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 18 }}>🏆</span>
                  <span>QS Rank: <strong>{prog.qs_rank}</strong></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 18 }}>🎯</span>
                  <span>China Rank: <strong>{prog.cn_rank}</strong></span>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(prog.fields || []).map(f => (
                  <span key={f} style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    padding: "6px 16px",
                    borderRadius: 16,
                    fontSize: 13,
                    fontWeight: 600
                  }}>
                    {f}
                  </span>
                ))}
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
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 8
              }}>
                <span>📋</span>
                <span>Requirements</span>
              </h3>
              <div style={{ display: "grid", gap: 16 }}>
                {req.gpa_min !== undefined && (
                  <div style={{ 
                    padding: 16, 
                    background: "#f8f9ff", 
                    borderRadius: 8,
                    borderLeft: "4px solid #667eea"
                  }}>
                    <div style={{ fontSize: 12, color: "#888", marginBottom: 4, fontWeight: 600 }}>GPA</div>
                    <div style={{ fontSize: 18, color: "#333", fontWeight: 700 }}>Minimum {req.gpa_min}</div>
                  </div>
                )}
                {req.toefl_min !== undefined && (
                  <div style={{ 
                    padding: 16, 
                    background: "#f8f9ff", 
                    borderRadius: 8,
                    borderLeft: "4px solid #667eea"
                  }}>
                    <div style={{ fontSize: 12, color: "#888", marginBottom: 4, fontWeight: 600 }}>TOEFL</div>
                    <div style={{ fontSize: 18, color: "#333", fontWeight: 700 }}>Minimum {req.toefl_min}</div>
                  </div>
                )}
                {req.ielts_min !== undefined && (
                  <div style={{ 
                    padding: 16, 
                    background: "#f8f9ff", 
                    borderRadius: 8,
                    borderLeft: "4px solid #667eea"
                  }}>
                    <div style={{ fontSize: 12, color: "#888", marginBottom: 4, fontWeight: 600 }}>IELTS</div>
                    <div style={{ fontSize: 18, color: "#333", fontWeight: 700 }}>Minimum {req.ielts_min}</div>
                  </div>
                )}
                {req.hsk_required && (
                  <div style={{ 
                    padding: 16, 
                    background: "#f8f9ff", 
                    borderRadius: 8,
                    borderLeft: "4px solid #667eea"
                  }}>
                    <div style={{ fontSize: 12, color: "#888", marginBottom: 4, fontWeight: 600 }}>HSK</div>
                    <div style={{ fontSize: 18, color: "#333", fontWeight: 700 }}>Required</div>
                  </div>
                )}
                {req.description && (
                  <div style={{ 
                    padding: 16, 
                    background: "#f8f9ff", 
                    borderRadius: 8,
                    borderLeft: "4px solid #667eea"
                  }}>
                    <div style={{ fontSize: 12, color: "#888", marginBottom: 4, fontWeight: 600 }}>Additional Information</div>
                    <div style={{ fontSize: 14, color: "#333", lineHeight: 1.6 }}>{req.description}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <div style={{ 
              background: "white", 
              padding: 32, 
              borderRadius: 16, 
              boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
              position: "sticky",
              top: 24
            }}>
              <h3 style={{ 
                fontSize: 20, 
                marginBottom: 20,
                color: "#333",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 8
              }}>
                <span>⚠️</span>
                <span>Unmet Requirements</span>
              </h3>
              {unmet.length === 0 ? (
                <div style={{ 
                  padding: 24, 
                  background: "#ecfdf5", 
                  borderRadius: 8,
                  border: "2px solid #10b981",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
                  <div style={{ fontSize: 16, color: "#10b981", fontWeight: 700, marginBottom: 4 }}>
                    All Requirements Met!
                  </div>
                  <div style={{ fontSize: 14, color: "#059669" }}>
                    You meet all the requirements for this program.
                  </div>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {unmet.map((u, i) => (
                    <div key={i} style={{ 
                      padding: 16, 
                      background: "#fef2f2", 
                      borderRadius: 8,
                      borderLeft: "4px solid #ef4444",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12
                    }}>
                      <span style={{ fontSize: 20 }}>❌</span>
                      <div>
                        <div style={{ fontSize: 14, color: "#ef4444", fontWeight: 600 }}>
                          {u}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div style={{ 
                    padding: 16, 
                    background: "#fffbeb", 
                    borderRadius: 8,
                    border: "1px solid #f59e0b",
                    marginTop: 16
                  }}>
                    <div style={{ fontSize: 14, color: "#92400e", lineHeight: 1.6 }}>
                      <strong>💡 Tip:</strong> Consider improving your scores or exploring other programs that better match your profile.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
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
