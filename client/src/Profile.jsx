import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Profile() {
  const [user, setUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showPicMenu, setShowPicMenu] = useState(false);
  
  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const parsedUser = JSON.parse(userStr);
      setUser(parsedUser);
      if (parsedUser.profilePicture) {
        setProfilePicture(parsedUser.profilePicture);
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);



  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const base64 = await convertToBase64(file);
      
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:5001/api/auth/profile-picture",
        { profilePicture: base64 },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const updatedPicture = response.data.profilePicture;
      setProfilePicture(updatedPicture);

      // Update local storage
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const storedUser = JSON.parse(userStr);
        storedUser.profilePicture = updatedPicture;
        localStorage.setItem("user", JSON.stringify(storedUser));
        setUser(storedUser);
      }

    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("Failed to upload profile picture. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePicture = async () => {
    try {
      setIsUploading(true);
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5001/api/auth/profile-picture",
        { profilePicture: "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfilePicture("");
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const storedUser = JSON.parse(userStr);
        storedUser.profilePicture = "";
        localStorage.setItem("user", JSON.stringify(storedUser));
        setUser(storedUser);
      }
    } catch (error) {
      console.error("Error removing profile picture:", error);
      alert("Failed to remove profile picture.");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setPasswordError("New passwords do not match.");
    }

    try {
      setIsChangingPassword(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.put(
        "http://localhost:5001/api/auth/change-password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setPasswordSuccess(response.data.message);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setShowPasswordForm(false), 2000);
    } catch (error) {
      setPasswordError(error.response?.data?.message || "Failed to change password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-transparent text-center overflow-auto py-5">
      <div className="p-4 w-100 position-relative" style={{ maxWidth: "600px" }}>
        
        <button 
          onClick={() => navigate('/dashboard')} 
          className="btn btn-outline-secondary position-absolute"
          style={{ top: "0", left: "20px" }}
        >
          <i className="bi bi-arrow-left me-2"></i> Dashboard
        </button>

        <h2 className="fw-bold mb-4 mt-5 text-primary">Your Profile</h2>

        {/* Profile Picture Section */}
        <div className="mb-4 position-relative d-inline-block">
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
              position: "relative"
            }}
          >
            {isUploading ? (
               <div className="spinner-border text-primary" role="status">
                 <span className="visually-hidden">Loading...</span>
               </div>
            ) : profilePicture ? (
              <img src={profilePicture} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div className="d-flex flex-column align-items-center">
                <i className="bi bi-person-circle text-secondary" style={{ fontSize: "4rem" }}></i>
              </div>
            )}
          </div>
          
          {/* Pencil Icon Button */}
          <button
            onClick={() => setShowPicMenu(!showPicMenu)}
            className="btn btn-primary rounded-circle shadow"
            style={{
              position: "absolute",
              bottom: "5px",
              right: "5px",
              width: "40px",
              height: "40px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10,
              padding: 0
            }}
          >
            <i className="bi bi-pencil-fill"></i>
          </button>

          {/* Dropdown Menu */}
          {showPicMenu && (
            <div className="dropdown-menu show shadow p-2" style={{ position: "absolute", top: "85%", left: "70%", zIndex: 1050, minWidth: "160px", borderRadius: "10px" }}>
              <button 
                className="dropdown-item rounded d-flex align-items-center mb-1 text-primary fw-bold"
                onClick={() => {
                  setShowPicMenu(false);
                  fileInputRef.current.click();
                }}
              >
                <i className="bi bi-camera me-2 fs-5"></i> Change 
              </button>
              {profilePicture && (
                <button 
                  className="dropdown-item rounded d-flex align-items-center text-danger fw-bold"
                  onClick={() => {
                    setShowPicMenu(false);
                    handleRemovePicture();
                  }}
                >
                  <i className="bi bi-trash me-2 fs-5"></i> Remove
                </button>
              )}
            </div>
          )}

          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: "none" }} 
          />
        </div>

        {/* Profile Details */}
        <div className="card shadow-sm border mb-4 text-start">
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold">Full Name</label>
              <p className="lead fw-medium mb-0">{user.name}</p>
            </div>
            <div>
              <label className="form-label text-muted small fw-bold">Email Adress</label>
              <p className="lead fw-medium mb-0">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="card shadow-sm border mb-4 text-start">
          <div 
            className="card-header bg-transparent cursor-pointer d-flex justify-content-between align-items-center p-3"
            style={{ cursor: "pointer" }}
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          >
            <h5 className="mb-0 fw-bold">Security Settings</h5>
            <i className={`bi bi-chevron-${showPasswordForm ? 'up' : 'down'}`}></i>
          </div>
          
          {showPasswordForm && (
            <div className="card-body">
              {passwordError && <div className="alert alert-danger">{passwordError}</div>}
              {passwordSuccess && <div className="alert alert-success">{passwordSuccess}</div>}
              
              <form onSubmit={handlePasswordChange}>
                <div className="mb-3">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    required
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={isChangingPassword}>
                  {isChangingPassword ? "Updating..." : "Change Password"}
                </button>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Profile;