import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5001/api/auth/login",
        user
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      localStorage.setItem(
        "token",
        response.data.token
      );

      alert("Login successful!");

      navigate("/dashboard");
    } catch (error) {
      console.error("Error during login:", error);

      alert(
        error.response?.data?.message ||
          "Login failed!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-page">
      <div className="white-glass-card">

        <div className="text-center mb-4">
          <div className="glass-icon mb-3">
            <i className="bi bi-person-lock"></i>
          </div>

          <h2 className="fw-bold text-primary mb-2">
             Welcome Back 💙  
          </h2>

          <p className="glass-subtitle">
            Sign in to access your account
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3 text-start">
            <label
              htmlFor="email"
              className="form-label fw-semibold"
            >
              <i className="bi bi-envelope me-2"></i>
              Email Address
            </label>

            <input
              id="email"
              className="form-control"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={user.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="mb-4 text-start">
            <label
              htmlFor="password"
              className="form-label fw-semibold"
            >
              <i className="bi bi-lock me-2"></i>
              Password
            </label>

            <div className="input-group glass-input-group">
              <input
                id="password"
                className="form-control"
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={user.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />

              <button
                className="btn glass-password-button"
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                <i
                  className={`bi ${
                    showPassword
                      ? "bi-eye-slash"
                      : "bi-eye"
                  }`}
                ></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 mb-3"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  aria-hidden="true"
                ></span>
                Logging in...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Login
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="glass-footer-text mb-0">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="text-primary fw-semibold text-decoration-none"
            >
              Register here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;