import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserName(user.name);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate('/login');
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-transparent text-center">
      <div className="p-5" style={{ maxWidth: "600px" }}>
        <h1 className="display-4 fw-bold mb-3 text-primary">
          Welcome, {userName}!
        </h1>
        <p className="lead mb-5 text-secondary">
          You have successfully logged in to your account.
        </p>
        <button
          onClick={handleLogout}
          className="btn btn-outline-primary px-5 py-2 fw-bold shadow-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;