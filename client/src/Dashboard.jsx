import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const [userName, setUserName] = useState("");
  const [profilePicture, setProfilePicture] =
    useState("");
  const [todos, setTodos] = useState([]);
  const [isLoadingStats, setIsLoadingStats] =
    useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboard = async () => {
      const userStr = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!userStr || !token) {
        navigate("/login");
        return;
      }

      try {
        const user = JSON.parse(userStr);

        setUserName(user.name || "");
        setProfilePicture(
          user.profilePicture || ""
        );

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
          "Dashboard loading error:",
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

  const pendingTasks =
    totalTasks - completedTasks;

  const progress =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks / totalTasks) * 100
        );

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    navigate("/");
  };

  return (
    <div className="glass-page dashboard-glass-page">
      <div className="white-glass-card large dashboard-glass-card">

        {/* Profile Picture */}
        <div className="text-center mb-4">
          <div
            className="mx-auto"
            style={{
              width: "130px",
              height: "130px",
              borderRadius: "50%",
              overflow: "hidden",
              border:
                "4px solid var(--bs-primary)",
              boxShadow:
                "0 8px 25px rgba(0, 0, 0, 0.15)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor:
                "rgba(255, 255, 255, 0.6)",
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

        {/* Welcome Section */}
        <div className="text-center mb-4">
          <h2 className="fw-bold text-primary">
            👋 Welcome, {userName}
          </h2>

          <p className="text-muted mb-0">
            Manage your profile and daily tasks
          </p>
        </div>

        {/* Dashboard Statistics */}
        <div className="row g-3 mb-4">

          {/* Total Tasks */}
          <div className="col-6 col-md-3">
            <div className="glass-inner-card text-center h-100">
              <i className="bi bi-list-task fs-2 text-primary"></i>

              <h3 className="text-primary fw-bold mt-2">
                {isLoadingStats
                  ? "..."
                  : totalTasks}
              </h3>

              <p className="text-muted mb-0">
                Total Tasks
              </p>
            </div>
          </div>

          {/* Completed Tasks */}
          <div className="col-6 col-md-3">
            <div className="glass-inner-card text-center h-100">
              <i className="bi bi-check-circle-fill fs-2 text-success"></i>

              <h3 className="text-success fw-bold mt-2">
                {isLoadingStats
                  ? "..."
                  : completedTasks}
              </h3>

              <p className="text-muted mb-0">
                Completed
              </p>
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="col-6 col-md-3">
            <div className="glass-inner-card text-center h-100">
              <i className="bi bi-hourglass-split fs-2 text-warning"></i>

              <h3 className="text-warning fw-bold mt-2">
                {isLoadingStats
                  ? "..."
                  : pendingTasks}
              </h3>

              <p className="text-muted mb-0">
                Pending
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="col-6 col-md-3">
            <div className="glass-inner-card text-center h-100">
              <i className="bi bi-graph-up-arrow fs-2 text-info"></i>

              <h3 className="text-info fw-bold mt-2">
                {isLoadingStats
                  ? "..."
                  : `${progress}%`}
              </h3>

              <p className="text-muted mb-0">
                Progress
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="glass-inner-card mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-semibold">
              Task Progress
            </span>

            <span className="text-primary fw-bold">
              {isLoadingStats
                ? "..."
                : `${progress}%`}
            </span>
          </div>

          <div
            className="progress"
            style={{ height: "12px" }}
          >
            <div
              className="progress-bar progress-bar-striped progress-bar-animated"
              role="progressbar"
              style={{
                width: `${progress}%`,
              }}
              aria-valuenow={progress}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex flex-column gap-3">

          <button
            type="button"
            onClick={() =>
              navigate("/profile")
            }
            className="btn btn-primary btn-lg w-100 fw-bold shadow-sm rounded-pill"
          >
            <i className="bi bi-person me-2"></i>
            View Profile Details
          </button>

          <button
            type="button"
            onClick={() => navigate("/todo")}
            className="btn btn-success btn-lg w-100 fw-bold shadow-sm rounded-pill"
          >
            <i className="bi bi-check2-square me-2"></i>
            Open To-Do List
          </button>

          <button
            type="button"
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