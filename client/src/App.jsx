import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Signup from "./signup";
import Login from "./login";
import Landing from "./Landing";
import Dashboard from "./Dashboard";
import Profile from "./Profile";
import Todo from "./Todo";

function App() {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  // Apply selected theme
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-bs-theme",
      theme
    );

    localStorage.setItem("theme", theme);
  }, [theme]);

  // Change light and dark mode
  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "light"
        ? "dark"
        : "light"
    );
  };

  return (
    <BrowserRouter>
      {/* Background Video */}
      <div className="video-background">
        <iframe
          src="https://www.youtube.com/embed/e1AHGiHaeJc?autoplay=1&mute=1&controls=0&loop=1&playlist=e1AHGiHaeJc"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="Background Video"
        ></iframe>
      </div>

      {/* Theme Toggle Button */}
      <button
        type="button"
        onClick={toggleTheme}
        className={`btn ${
          theme === "light"
            ? "btn-dark"
            : "btn-light"
        } position-fixed rounded-circle shadow theme-toggle-button`}
        style={{
          top: "20px",
          right: "20px",
          width: "50px",
          height: "50px",
          zIndex: 1050,
        }}
        aria-label={
          theme === "light"
            ? "Switch to dark mode"
            : "Switch to light mode"
        }
        title={
          theme === "light"
            ? "Dark mode"
            : "Light mode"
        }
      >
        <i
          className={`bi ${
            theme === "light"
              ? "bi-moon-fill"
              : "bi-sun-fill"
          }`}
        ></i>
      </button>

      {/* Application Routes */}
      <Routes>
        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/register"
          element={<Signup />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/todo"
          element={<Todo />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;