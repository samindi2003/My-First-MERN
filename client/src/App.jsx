import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./signup";
import Login from "./login";
import Landing from "./Landing";
import Dashboard from "./Dashboard";
import Profile from "./Profile";

function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <>
      <div className="video-background">
        <iframe
          src="https://www.youtube.com/embed/e1AHGiHaeJc?autoplay=1&mute=1&controls=0&loop=1&playlist=e1AHGiHaeJc"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="Background Video"
        ></iframe>
      </div>
      <button 
        onClick={toggleTheme}
        className={`btn btn-${theme === 'light' ? 'dark' : 'light'} position-fixed rounded-circle shadow`}
        style={{ top: "20px", right: "20px", width: "50px", height: "50px", zIndex: 1050 }}
        aria-label="Toggle Theme"
      >
        <i className={`bi bi-${theme === 'light' ? 'moon-fill' : 'sun-fill'}`}></i>
      </button>

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;