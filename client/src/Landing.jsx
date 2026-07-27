import { Link } from "react-router-dom";
import "./Landing.css";

function Landing() {
  return (
    <main className="landing-page">
      {/* Decorative background icons */}
      <div className="landing-floating-icon icon-one">⚛️</div>
      <div className="landing-floating-icon icon-two">🍃</div>
      <div className="landing-floating-icon icon-three">⚡</div>

      {/* Main Hero Section */}
      <section className="landing-hero">
        <div className="landing-rocket">🚀</div>

        <p className="landing-welcome">
          Welcome to
        </p>

        <h1 className="landing-title">
          My First MERN Project
        </h1>

        <p className="landing-tagline">
          Learn <span>•</span> Build <span>•</span> Practice
        </p>

        <p className="landing-description">
          A secure authentication and task management application
          built with MongoDB, Express, React and Node.js.
        </p>

        <Link
          to="/login"
          className="landing-start-button"
        >
          <i className="bi bi-rocket-takeoff me-2"></i>
          Get Started
        </Link>
      </section>

      {/* Feature Cards */}
      <section className="landing-features">
        <article className="landing-feature-card">
          <div className="feature-icon">
            <i className="bi bi-shield-lock-fill"></i>
          </div>

          <h3>Secure Login</h3>

          <p>
            Safe user authentication using JWT.
          </p>
        </article>

        <article className="landing-feature-card">
          <div className="feature-icon">
            <i className="bi bi-person-circle"></i>
          </div>

          <h3>User Profile</h3>

          <p>
            Easily manage your account details.
          </p>
        </article>

        <article className="landing-feature-card">
          <div className="feature-icon">
            <i className="bi bi-check2-square"></i>
          </div>

          <h3>Task Manager</h3>

          <p>
            Organize and complete your daily tasks.
          </p>
        </article>
      </section>

      {/* Technology Badges */}
      <section className="landing-technologies">
        <p className="technology-title">
          Built with the MERN Stack
        </p>

        <div className="technology-list">
          <span className="technology-badge">
            🍃 MongoDB
          </span>

          <span className="technology-badge">
            ⚡ Express.js
          </span>

          <span className="technology-badge">
            ⚛ React
          </span>

          <span className="technology-badge">
            🟢 Node.js
          </span>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>
          Built with <span className="footer-heart">⚛️</span> using MERN Stack
        </p>

        <small>
          © 2026 Samindi
        </small>
      </footer>
    </main>
  );
}

export default Landing;