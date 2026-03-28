import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { extractCV, extractCVFromText, getOptions } from "../api.js";

export default function Filters() {
  const [file, setFile] = useState(null);
  const [cvText, setCvText] = useState("");
  const [profile, setProfile] = useState({ gpa: "", toefl: "", ielts: "", gre: "", majors: [], cities: [] });
  const [opts, setOpts] = useState({ cities: [], fields: [] });
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    getOptions().then(setOpts).catch(e => setMsg(e.message));
  }, []);
  async function upload() {
    if (!file) return;
    setMsg("");
    try {
      const r = await extractCV(file);
      const p = r.profile || {};
      setProfile({
        gpa: p.gpa || "",
        toefl: p.toefl || "",
        ielts: p.ielts || "",
        gre: p.gre || "",
        majors: p.majors || [],
        cities: p.cities || []
      });
    } catch (e) {
      setMsg(e.message);
    }
  }
  async function extractText() {
    if (!cvText.trim()) return;
    setMsg("");
    try {
      const r = await extractCVFromText(cvText);
      const p = r.profile || {};
      setProfile({
        gpa: p.gpa || "",
        toefl: p.toefl || "",
        ielts: p.ielts || "",
        gre: p.gre || "",
        majors: p.majors || [],
        cities: p.cities || []
      });
    } catch (e) {
      setMsg(e.message);
    }
  }
  function next() {
    localStorage.setItem("sap_profile", JSON.stringify(profile));
    navigate("/results");
  }
  return (
    <div style={{ padding: 24 }}>
      <h2>Upload CV and Select Filters</h2>
      <div style={{ display: "grid", gap: 12, maxWidth: 640 }}>
        <input type="file" onChange={e => setFile(e.target.files?.[0])} />
        <button onClick={upload}>Extract From CV</button>
        <textarea placeholder="Or paste your CV text here" value={cvText} onChange={e => setCvText(e.target.value)} rows={8} style={{ width: "100%" }} />
        <button onClick={extractText}>Extract From Text</button>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <input placeholder="GPA" value={profile.gpa} onChange={e => setProfile(p => ({ ...p, gpa: e.target.value }))} />
          <input placeholder="TOEFL" value={profile.toefl} onChange={e => setProfile(p => ({ ...p, toefl: e.target.value }))} />
          <input placeholder="IELTS" value={profile.ielts} onChange={e => setProfile(p => ({ ...p, ielts: e.target.value }))} />
          <input placeholder="GRE" value={profile.gre} onChange={e => setProfile(p => ({ ...p, gre: e.target.value }))} />
        </div>
        <div>
          <label>Preferred Cities</label>
          <select multiple value={profile.cities} onChange={e => setProfile(p => ({ ...p, cities: Array.from(e.target.selectedOptions).map(o => o.value) }))} style={{ width: "100%", height: 120 }}>
            {opts.cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label>Fields</label>
          <select multiple value={profile.majors} onChange={e => setProfile(p => ({ ...p, majors: Array.from(e.target.selectedOptions).map(o => o.value) }))} style={{ width: "100%", height: 120 }}>
            {opts.fields.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <button onClick={next}>Continue</button>
        {msg && <div style={{ color: "red" }}>{msg}</div>}
      </div>
    </div>
  );
}
