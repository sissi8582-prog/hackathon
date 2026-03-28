import React from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import Filters from "./pages/Filters.jsx";
import Results from "./pages/Results.jsx";
import ProgramDetail from "./pages/ProgramDetail.jsx";

function Nav() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }
  return (
    <div style={{ display: "flex", gap: 12, padding: 12, borderBottom: "1px solid #eee" }}>
      <Link to="/">Home</Link>
      <Link to="/filters">Apply</Link>
      {token ? <><Link to="/profile">Profile</Link><button onClick={logout}>Logout</button></> : <><Link to="/login">Login</Link><Link to="/register">Register</Link></>}
    </div>
  );
}

function Home() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Study in China</h1>
      <p>Guidance for Indonesian students applying to Chinese universities.</p>
      <Link to="/filters">Start Application</Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/filters" element={<Filters />} />
        <Route path="/results" element={<Results />} />
        <Route path="/programs/:id" element={<ProgramDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
