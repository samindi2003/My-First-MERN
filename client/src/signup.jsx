import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const validatePassword = (password) => {
    if (!password) return "";

    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }

    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }

    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter.";
    }

    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number.";
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Password must contain at least one symbol.";
    }

    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedUser = {
      ...user,
      [name]: value,
    };

    setUser(updatedUser);

    if (name === "password") {
      setPasswordError(validatePassword(value));

      if (
        updatedUser.confirmPassword &&
        value !== updatedUser.confirmPassword
      ) {
        setConfirmPasswordError("Passwords do not match.");
      } else {
        setConfirmPasswordError("");
      }
    }

    if (name === "confirmPassword") {
      if (value !== updatedUser.password) {
        setConfirmPasswordError("Passwords do not match.");
      } else {
        setConfirmPasswordError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentPasswordError = validatePassword(user.password);

    if (currentPasswordError) {
      setPasswordError(currentPasswordError);
      alert("Please fix the password errors before submitting.");
      return;
    }

    if (user.password !== user.confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      alert("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const { confirmPassword, ...userData } = user;

      const response = await axios.post(
        "http://localhost:5001/api/auth/register",
        userData
      );

      console.log("Success:", response.data);

      alert("Registration successful!");

      navigate("/login");
    } catch (error) {
      console.error("Error during registration:", error);

      alert(
        error.response?.data?.message ||
          "Registration failed!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-page">
      <div className="white-glass-card signup-glass-card">

        <div className="text-center mb-4">
          <div className="glass-icon mb-3">
            <i className="bi bi-person-plus"></i>
          </div>

          <h2 className="fw-bold text-primary mb-2">
            Create Account
          </h2>

          <p className="glass-subtitle">
            Sign up to get started
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="mb-3 text-start">
            <label
              htmlFor="name"
              className="form-label fw-semibold"
            >
              <i className="bi bi-person me-2"></i>
              Full Name
            </label>

            <input
              id="name"
              className="form-control"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={user.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

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

          <div className="mb-3 text-start">
            <label
              htmlFor="phone"
              className="form-label fw-semibold"
            >
              <i className="bi bi-telephone me-2"></i>
              Phone Number
            </label>

            <input
              id="phone"
              className="form-control"
              name="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={user.phone}
              onChange={handleChange}
              autoComplete="tel"
              required
            />
          </div>

          <div className="mb-3 text-start">
            <label
              htmlFor="gender"
              className="form-label fw-semibold"
            >
              <i className="bi bi-people me-2"></i>
              Gender
            </label>

            <select
              id="gender"
              className="form-select"
              name="gender"
              value={user.gender}
              onChange={handleChange}
              required
            >
              <option value="">
                Select gender
              </option>

              <option value="Male">
                Male
              </option>

              <option value="Female">
                Female
              </option>

              <option value="Other">
                Other
              </option>
            </select>
          </div>

          <div className="mb-3 text-start">
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
                className={`form-control ${
                  passwordError ? "is-invalid" : ""
                }`}
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Create a password"
                value={user.password}
                onChange={handleChange}
                autoComplete="new-password"
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

            {passwordError && (
              <div className="glass-error-message mt-2">
                <i className="bi bi-exclamation-circle me-1"></i>
                {passwordError}
              </div>
            )}

            {!passwordError && user.password && (
              <div className="glass-success-message mt-2">
                <i className="bi bi-check-circle me-1"></i>
                Password meets all requirements.
              </div>
            )}
          </div>

          <div className="mb-4 text-start">
            <label
              htmlFor="confirmPassword"
              className="form-label fw-semibold"
            >
              <i className="bi bi-shield-lock me-2"></i>
              Confirm Password
            </label>

            <div className="input-group glass-input-group">
              <input
                id="confirmPassword"
                className={`form-control ${
                  confirmPasswordError
                    ? "is-invalid"
                    : ""
                }`}
                name="confirmPassword"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm your password"
                value={user.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />

              <button
                className="btn glass-password-button"
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                <i
                  className={`bi ${
                    showConfirmPassword
                      ? "bi-eye-slash"
                      : "bi-eye"
                  }`}
                ></i>
              </button>
            </div>

            {confirmPasswordError && (
              <div className="glass-error-message mt-2">
                <i className="bi bi-exclamation-circle me-1"></i>
                {confirmPasswordError}
              </div>
            )}

            {!confirmPasswordError &&
              user.confirmPassword && (
                <div className="glass-success-message mt-2">
                  <i className="bi bi-check-circle me-1"></i>
                  Passwords match.
                </div>
              )}
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
                Creating account...
              </>
            ) : (
              <>
                <i className="bi bi-person-plus me-2"></i>
                Register
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="glass-footer-text mb-0">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary fw-semibold text-decoration-none"
            >
              Login here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Signup;