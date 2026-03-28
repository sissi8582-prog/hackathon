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
    <nav style={{ 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center", 
      padding: "16px 32px", 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <Link to="/" style={{ 
          color: "white", 
          textDecoration: "none", 
          fontSize: 24, 
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          <span>🎓</span>
          <span>StudyInChina</span>
        </Link>
        <Link to="/filters" style={{ color: "white", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Apply</Link>
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        {token ? (
          <>
            <Link to="/profile" style={{ color: "white", textDecoration: "none", fontSize: 14 }}>Profile</Link>
            <button onClick={logout} style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "white",
              padding: "8px 16px",
              borderRadius: 20,
              cursor: "pointer",
              fontSize: 14
            }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: "white", textDecoration: "none", fontSize: 14 }}>Login</Link>
            <Link to="/register" style={{
              background: "white",
              color: "#667eea",
              textDecoration: "none",
              padding: "8px 20px",
              borderRadius: 20,
              fontSize: 14,
              fontWeight: 600
            }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function Home() {
  return (
    <div style={{ 
      minHeight: "calc(100vh - 72px)", 
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 48
    }}>
      <div style={{ 
        maxWidth: 800, 
        textAlign: "center",
        background: "white",
        padding: 64,
        borderRadius: 16,
        boxShadow: "0 10px 40px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ 
          fontSize: 48, 
          marginBottom: 16, 
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: 800
        }}>
          Study in China
        </h1>
        <p style={{ 
          fontSize: 20, 
          color: "#666", 
          marginBottom: 32,
          lineHeight: 1.6
        }}>
          Your Gateway to Chinese Universities
        </p>
        <p style={{ 
          fontSize: 16, 
          color: "#888", 
          marginBottom: 40,
          lineHeight: 1.8
        }}>
          We help Indonesian students discover and apply to top Chinese universities. 
          Upload your CV, let AI analyze your profile, and find the perfect program for you.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <Link to="/filters" style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            textDecoration: "none",
            padding: "16px 40px",
            borderRadius: 30,
            fontSize: 18,
            fontWeight: 600,
            boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
            transition: "transform 0.2s",
            cursor: "pointer"
          }}>
            Start Your Journey
          </Link>
          <Link to="/register" style={{
            background: "white",
            color: "#667eea",
            border: "2px solid #667eea",
            textDecoration: "none",
            padding: "14px 38px",
            borderRadius: 30,
            fontSize: 18,
            fontWeight: 600,
            cursor: "pointer"
          }}>
            Create Account
          </Link>
        </div>
        <div style={{ marginTop: 48, display: "flex", gap: 32, justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: "bold", color: "#667eea" }}>100+</div>
            <div style={{ fontSize: 14, color: "#888" }}>Universities</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: "bold", color: "#667eea" }}>500+</div>
            <div style={{ fontSize: 14, color: "#888" }}>Programs</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: "bold", color: "#667eea" }}>AI</div>
            <div style={{ fontSize: 14, color: "#888" }}>Powered</div>
          </div>
        </div>
      </div>
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
