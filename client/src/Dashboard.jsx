import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [userName, setUserName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserName(user.name);
      if (user.profilePicture) {
        setProfilePicture(user.profilePicture);
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate('/');
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-transparent text-center py-5">
      <div className="p-5 w-100" style={{ maxWidth: "600px" }}>
        
        {/* Profile Picture Display (Read-Only) */}
        <div className="mb-4">
          <div 
            style={{ 
              width: "150px", 
              height: "150px", 
              borderRadius: "50%", 
              overflow: "hidden", 
              border: "4px solid var(--bs-primary)",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "var(--bs-light)",
              margin: "0 auto"
            }}
          >
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <i className="bi bi-person-circle text-secondary" style={{ fontSize: "5rem" }}></i>
            )}
          </div>
        </div>

        <h1 className="display-4 fw-bold mb-3 text-primary">
          Welcome, {userName}!
        </h1>
        <p className="lead mb-4 text-secondary">
          You have successfully logged in to your account.
        </p>

        {/* Action Buttons */}
        <div className="d-flex flex-column gap-3 mb-5">
          <button
            onClick={() => navigate('/profile')}
            className="btn btn-primary px-5 py-3 fw-bold shadow-sm rounded-pill"
          >
            View Profile Details
          </button>
          <button
  className="btn btn-success w-100 mt-3"
  onClick={() => navigate("/todo")}
>
  <i className="bi bi-check2-square me-2"></i>
  Open To-Do List
</button>
          <button
            onClick={handleLogout}
            className="btn btn-outline-danger px-5 py-2 fw-bold shadow-sm rounded-pill"
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;