import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [user, setUser] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5001/api/auth/login", user);
      console.log("Success:", response.data);
      alert("Login success!");
      
      // Save user to local storage
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.token);
      
      navigate('/dashboard');
    } catch (error) {
      console.error("Error during login:", error);
      alert(error.response?.data?.message || "Login failed!");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-transparent">
      <div className="card p-4 shadow-sm border" style={{ width: "400px" }}>
        
        <div className="text-center mb-4">
          <h3 className="fw-bold text-primary">💙 Welcome Back!</h3>
          <p className="text-muted">Sign in to access your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email Adress</label>
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
                placeholder="Enter your password"
                onChange={handleChange}
                required
              />
              <button 
                className="btn btn-outline-secondary" 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ borderColor: "#cacecf" }}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          <button className="btn btn-primary w-100 mb-3">
            Login
          </button>
        </form>

        <div className="text-center">
          <p className="mb-0 text-muted">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary text-decoration-none">
              Register here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;