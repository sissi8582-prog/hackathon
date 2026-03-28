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
  const navigate = useNavigate();
  useEffect(() => {
    getOptions().then(o => {
      setOpts(o);
    }).catch(e => setMsg(e.message));
  }, []);
  async function search() {
    setMsg("");
    try {
      const r = await filterPrograms({ cities, fields, sort_by: sortBy });
      setPrograms(r.programs || []);
    } catch (e) {
      setMsg(e.message);
    }
  }
  useEffect(() => {
    search();
  }, [opts.sort_by]);
  return (
    <div style={{ padding: 24 }}>
      <h2>Find Programs</h2>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr 1fr" }}>
        <div>
          <label>Cities</label>
          <select multiple value={cities} onChange={e => setCities(Array.from(e.target.selectedOptions).map(o => o.value))} style={{ width: "100%", height: 160 }}>
            <option value="ALL">ALL</option>
            {opts.cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label>Fields</label>
          <select multiple value={fields} onChange={e => setFields(Array.from(e.target.selectedOptions).map(o => o.value))} style={{ width: "100%", height: 160 }}>
            <option value="ALL">ALL</option>
            {opts.fields.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label>Sort</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: "100%" }}>
            <option value="qs">QS</option>
            <option value="cn">China</option>
          </select>
          <button onClick={search} style={{ marginTop: 8 }}>Search</button>
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        {programs.map(p => (
          <div key={p.id} onClick={() => navigate(`/programs/${p.id}`)} style={{ padding: 12, border: "1px solid #eee", marginBottom: 8, cursor: "pointer" }}>
            <div style={{ fontWeight: 600 }}>{p.university} - {p.name}</div>
            <div>{p.city} | QS {p.qs_rank} | CN {p.cn_rank}</div>
            <div>{(p.fields || []).join(", ")}</div>
          </div>
        ))}
      </div>
      {msg && <div style={{ color: "red" }}>{msg}</div>}
    </div>
  );
}
