import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const [userName, setUserName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [todos, setTodos] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboard = async () => {
      const userStr = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!userStr || !token) {
        navigate("/login");
        return;
      }

      const user = JSON.parse(userStr);

      setUserName(user.name);
      setProfilePicture(user.profilePicture || "");

      try {
        const response = await axios.get(
          "http://localhost:5001/api/todos",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setTodos(response.data);
      } catch (error) {
        console.error(
          "Dashboard statistics error:",
          error
        );

        if (error.response?.status === 401) {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  // Calculate task statistics
  const totalTasks = todos.length;

  const completedTasks = todos.filter(
    (todo) => todo.completed
  ).length;

  const pendingTasks = totalTasks - completedTasks;

  const progress =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks / totalTasks) * 100
        );
  
  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    navigate("/");
  };

  return (
    <div className="d-flex flex-column align-items-center min-vh-100 bg-transparent text-center py-5">
      <div
        className="p-5 w-100"
        style={{ maxWidth: "600px" }}
      >
        {/* Profile Picture */}
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
              margin: "0 auto",
            }}
          >
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <i
                className="bi bi-person-circle text-secondary"
                style={{ fontSize: "5rem" }}
              ></i>
            )}
          </div>
        </div>

        <h1 className="display-4 fw-bold mb-3 text-primary">
          Welcome, {userName}!
        </h1>

        <p className="lead mb-4 text-secondary">
          You have successfully logged in to your account.
        </p>

        {/* Task Statistics */}
        <div className="row g-3 mb-4">
          <div className="col-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body text-center">
                <i className="bi bi-list-task fs-2 text-primary"></i>

                <h6 className="mt-2 mb-1">
                  Total Tasks
                </h6>

                <h3 className="fw-bold mb-0">
                  {isLoadingStats ? "..." : totalTasks}
                </h3>
              </div>
            </div>
          </div>

          <div className="col-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body text-center">
                <i className="bi bi-check-circle fs-2 text-success"></i>

                <h6 className="mt-2 mb-1">
                  Completed
                </h6>

                <h3 className="fw-bold mb-0">
                  {isLoadingStats
                    ? "..."
                    : completedTasks}
                </h3>
              </div>
            </div>
          </div>

          <div className="col-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body text-center">
                <i className="bi bi-hourglass-split fs-2 text-warning"></i>

                <h6 className="mt-2 mb-1">
                  Pending
                </h6>

                <h3 className="fw-bold mb-0">
                  {isLoadingStats ? "..." : pendingTasks}
                </h3>
              </div>
            </div>
          </div>

          <div className="col-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body text-center">
                <i className="bi bi-graph-up-arrow fs-2 text-info"></i>

                <h6 className="mt-2 mb-1">
                  Progress
                </h6>

                <h3 className="fw-bold mb-0">
                  {isLoadingStats
                    ? "..."
                    : `${progress}%`}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex flex-column gap-3 mb-5">
          <button
            onClick={() => navigate("/profile")}
            className="btn btn-primary btn-lg w-100 fw-bold shadow-sm rounded-pill"
          >
            <i className="bi bi-person me-2"></i>
            View Profile Details
          </button>

          <button
            onClick={() => navigate("/todo")}
            className="btn btn-success btn-lg w-100 fw-bold shadow-sm rounded-pill"
          >
            <i className="bi bi-check2-square me-2"></i>
            Open To-Do List
          </button>

          <button
            onClick={handleLogout}
            className="btn btn-outline-danger btn-lg w-100 fw-bold shadow-sm rounded-pill"
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;