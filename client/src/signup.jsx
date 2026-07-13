import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const navigate = useNavigate();

  const validatePassword = (password) => {
    if (!password) return "";
    if (password.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must contain at least one symbol.";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
    
    if (name === "password") {
      setPasswordError(validatePassword(value));
      if (user.confirmPassword && value !== user.confirmPassword) {
        setConfirmPasswordError("Passwords do not match.");
      } else {
        setConfirmPasswordError("");
      }
    }
    if (name === "confirmPassword") {
      if (value !== user.password) {
        setConfirmPasswordError("Passwords do not match.");
      } else {
        setConfirmPasswordError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordError || validatePassword(user.password)) {
      alert("Please fix the password errors before submitting.");
      return;
    }
    if (user.password !== user.confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      alert("Passwords do not match.");
      return;
    }
    try {
      const { confirmPassword, ...userData } = user;
      const response = await axios.post("http://localhost:5001/api/auth/register", userData);
      console.log("Success:", response.data);
      alert("Registration Successful!");
      navigate('/login');
    } catch (error) {
      console.error("Error during registration:", error);
      alert(error.response?.data?.message || "Registration failed!");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-transparent">
      <div className="card p-4 shadow-sm border" style={{ width: "400px" }}>

        <div className="text-center mb-4">
          <h3 className="fw-bold text-primary">Create Account</h3>
          <p className="text-muted">Sign up to get started</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              className="form-control"
              name="name"
              type="text"
              placeholder="Enter your name"
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input
              className="form-control"
              name="email"
              type="email"
              placeholder="Enter your email"
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Password</label>
            <div className="input-group">
              <input
                className="form-control"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                onChange={handleChange}
                required
              />
              <button 
                className="btn btn-outline-secondary" 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ borderColor: "#dee2e6" }}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
            {passwordError && (
              <div className="text-danger mt-1" style={{ fontSize: "0.875rem" }}>
                {passwordError}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="form-label">Confirm Password</label>
            <div className="input-group">
              <input
                className="form-control"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                onChange={handleChange}
                required
              />
              <button 
                className="btn btn-outline-secondary" 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ borderColor: "#dee2e6" }}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
            {confirmPasswordError && (
              <div className="text-danger mt-1" style={{ fontSize: "0.875rem" }}>
                {confirmPasswordError}
              </div>
            )}
          </div>

          <button className="btn btn-primary w-100 mb-3">
            Register
          </button>
        </form>

        <div className="text-center">
          <p className="mb-0 text-muted">
            Already have an account?{" "}
            <Link to="/login" className="text-primary text-decoration-none">
              Login here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Signup;