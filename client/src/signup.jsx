import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: ""
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5001/api/auth/register", user);
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
            <input
              className="form-control"
              name="password"
              type="password"
              placeholder="Create a password"
              onChange={handleChange}
              required
            />
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