import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { programDetail, compareProgram } from "../api.js";

export default function ProgramDetailPage() {
  const { id } = useParams();
  const [prog, setProg] = useState(null);
  const [unmet, setUnmet] = useState([]);
  const [msg, setMsg] = useState("");
  useEffect(() => {
    programDetail(id).then(setProg).catch(e => setMsg(e.message));
  }, [id]);
  useEffect(() => {
    const profileStr = localStorage.getItem("sap_profile");
    if (profileStr && id) {
      const profile = JSON.parse(profileStr);
      const p = {
        gpa: profile.gpa ? parseFloat(profile.gpa) : null,
        toefl: profile.toefl ? parseInt(profile.toefl) : null,
        ielts: profile.ielts ? parseFloat(profile.ielts) : null,
        gre: profile.gre ? parseInt(profile.gre) : null,
        majors: profile.majors || [],
        cities: profile.cities || [],
        skills: profile.skills || []
      };
      compareProgram(id, p).then(r => setUnmet(r.unmet || [])).catch(e => setMsg(e.message));
    }
  }, [id]);
  if (!prog) {
    return <div style={{ padding: 24 }}>{msg || "Loading..."}</div>;
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, padding: 24 }}>
      <div>
        <h2>{prog.university} - {prog.name}</h2>
        <div>{prog.city}</div>
        <div>Fields: {(prog.fields || []).join(", ")}</div>
        <div>QS {prog.qs_rank} | CN {prog.cn_rank}</div>
        <h3 style={{ marginTop: 16 }}>Requirements</h3>
        <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(prog.requirements, null, 2)}</pre>
      </div>
      <div>
        <h3>Unmet Requirements</h3>
        {unmet.length === 0 ? <div>None</div> : <ul>{unmet.map((u, i) => <li key={i}>{u}</li>)}</ul>}
      </div>
    </div>
  );
}
