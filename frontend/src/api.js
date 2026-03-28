const API = "http://localhost:8000";

function token() {
  return localStorage.getItem("token") || "";
}

async function request(path, opts = {}) {
  const headers = opts.headers || {};
  if (!headers["Content-Type"] && !(opts.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const t = token();
  if (t) headers["Authorization"] = `Bearer ${t}`;
  const res = await fetch(API + path, { ...opts, headers });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || res.statusText);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

export async function registerUser({ email, username, password, confirm_password }) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, username, password, confirm_password })
  });
}

export async function loginUser({ email, password }) {
  const body = new URLSearchParams();
  body.append("username", email);
  body.append("password", password);
  return request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
}

export async function getMe() {
  return request("/users/me");
}

export async function updateMe({ username, password }) {
  return request("/users/me", { method: "PATCH", body: JSON.stringify({ username, password }) });
}

export async function getOptions() {
  return request("/api/options");
}

export async function filterPrograms({ cities, fields, sort_by }) {
  return request("/api/programs/filter", { method: "POST", body: JSON.stringify({ cities, fields, sort_by }) });
}

export async function programDetail(id) {
  return request(`/api/programs/${id}`);
}

export async function compareProgram(id, profile) {
  return request(`/api/programs/${id}/compare`, { method: "POST", body: JSON.stringify(profile) });
}

export async function extractCV(file) {
  const fd = new FormData();
  fd.append("file", file);
  return request("/api/cv/extract", { method: "POST", body: fd });
}

export async function extractCVFromText(text) {
  return request("/api/cv/extract_text", { method: "POST", body: JSON.stringify({ text }) });
}
