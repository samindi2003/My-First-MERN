import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Profile() {
  const [user, setUser] = useState(null);

  const [profilePicture, setProfilePicture] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showPicMenu, setShowPicMenu] = useState(false);

  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);

  const [editData, setEditData] = useState({
    name: "",
     phone: "",
    gender: "",
  });
   

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const fileInputRef = useRef(null);

  const navigate = useNavigate();


  // GET USER FROM LOCAL STORAGE
  useEffect(() => {
    const userStr = localStorage.getItem("user");

    if (userStr) {
      const parsedUser = JSON.parse(userStr);

      setUser(parsedUser);

      if (parsedUser.profilePicture) {
        setProfilePicture(parsedUser.profilePicture);
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);


  // CONVERT IMAGE TO BASE64
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


  // CHANGE PROFILE PICTURE
  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      setIsUploading(true);

      const base64 = await convertToBase64(file);

      const token = localStorage.getItem("token");

      const response = await axios.put(
        "http://localhost:5001/api/auth/profile-picture",
        {
          profilePicture: base64,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedPicture = response.data.profilePicture;

      setProfilePicture(updatedPicture);

      const userStr = localStorage.getItem("user");

      if (userStr) {
        const storedUser = JSON.parse(userStr);

        storedUser.profilePicture = updatedPicture;

        localStorage.setItem(
          "user",
          JSON.stringify(storedUser)
        );

        setUser(storedUser);
      }
    } catch (error) {
      console.error(
        "Error uploading profile picture:",
        error
      );

      alert(
        "Failed to upload profile picture. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };


  // REMOVE PROFILE PICTURE
  const handleRemovePicture = async () => {
    try {
      setIsUploading(true);

      const token = localStorage.getItem("token");

      await axios.put(
        "http://localhost:5001/api/auth/profile-picture",
        {
          profilePicture: "",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfilePicture("");

      const userStr = localStorage.getItem("user");

      if (userStr) {
        const storedUser = JSON.parse(userStr);

        storedUser.profilePicture = "";

        localStorage.setItem(
          "user",
          JSON.stringify(storedUser)
        );

        setUser(storedUser);
      }
    } catch (error) {
      console.error(
        "Error removing profile picture:",
        error
      );

      alert("Failed to remove profile picture.");
    } finally {
      setIsUploading(false);
    }
  };
  
   // FORMAT ACCOUNT CREATED DATE
const formatCreatedDate = (date) => {
  if (!date) {
    return "Date not available";
  }

  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

  // EDIT PROFILE BUTTON
  const handleEdit = () => {
    setEditData({
      name: user.name || "",
       phone: user.phone || "",
      gender: user.gender || "",
    });
     

    setIsEditing(true);
  };


  // EDIT INPUT CHANGE
  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditData({
      ...editData,
      [name]: value,
    });
  };


  // SAVE PROFILE CHANGES
  const handleUpdateProfile = async (e) => {
  e.preventDefault();

  try {
    const token = localStorage.getItem("token");

    const response = await axios.put(
      "http://localhost:5001/api/auth/profile",
      {
        name: editData.name,
        phone: editData.phone,
        gender: editData.gender,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const updatedUser = response.data.user;

    setUser(updatedUser);

    setProfilePicture(
      updatedUser.profilePicture || ""
    );

    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );

    setIsEditing(false);

    alert("✅ Profile updated successfully!");

  } catch (error) {
    console.error(
      "Profile update error:",
      error
    );

    alert(
      error.response?.data?.message ||
      "❌ Profile update failed"
    );
  }
};


  // CHANGE PASSWORD
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      return setPasswordError(
        "New passwords do not match."
      );
    }

    try {
      setIsChangingPassword(true);

      const token = localStorage.getItem("token");

      const response = await axios.put(
        "http://localhost:5001/api/auth/change-password",
        {
          currentPassword:
            passwordData.currentPassword,

          newPassword:
            passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPasswordSuccess(response.data.message);

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(
        () => setShowPasswordForm(false),
        2000
      );
    } catch (error) {
      setPasswordError(
        error.response?.data?.message ||
          "Failed to change password."
      );
    } finally {
      setIsChangingPassword(false);
    }
  };


  // DELETE ACCOUNT
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        "http://localhost:5001/api/auth/delete-account",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Account deleted successfully");

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      navigate("/register");
    } catch (error) {
      console.error(error);

      alert("Delete failed");
    }
  };


  if (!user) return null;


  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-transparent text-center overflow-auto py-5">
      <div
        className="p-4 w-100 position-relative"
        style={{ maxWidth: "600px" }}
      >

        {/* DASHBOARD BUTTON */}
        <button
          onClick={() => navigate("/dashboard")}
          className="btn btn-outline-secondary position-absolute"
          style={{
            top: "0",
            left: "20px",
          }}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Dashboard
        </button>


        <h2 className="fw-bold mb-4 mt-5 text-primary">
          Your Profile 🪪
        </h2>


        {/* PROFILE PICTURE */}
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
              position: "relative",
            }}
          >

            {isUploading ? (

              <div
                className="spinner-border text-primary"
                role="status"
              >
                <span className="visually-hidden">
                  Loading...
                </span>
              </div>

            ) : profilePicture ? (

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
                style={{ fontSize: "4rem" }}
              ></i>

            )}

          </div>


          {/* PENCIL BUTTON */}
          <button
            onClick={() =>
              setShowPicMenu(!showPicMenu)
            }
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
              padding: 0,
            }}
          >
            <i className="bi bi-pencil-fill"></i>
          </button>


          {/* PICTURE MENU */}
          {showPicMenu && (

            <div
              className="dropdown-menu show shadow p-2"
              style={{
                position: "absolute",
                top: "85%",
                left: "70%",
                zIndex: 1050,
                minWidth: "160px",
                borderRadius: "10px",
              }}
            >

              <button
                className="dropdown-item rounded d-flex align-items-center mb-1 text-primary fw-bold"
                onClick={() => {
                  setShowPicMenu(false);
                  fileInputRef.current.click();
                }}
              >
                <i className="bi bi-camera me-2 fs-5"></i>
                Change
              </button>


              {profilePicture && (

                <button
                  className="dropdown-item rounded d-flex align-items-center text-danger fw-bold"
                  onClick={() => {
                    setShowPicMenu(false);
                    handleRemovePicture();
                  }}
                >
                  <i className="bi bi-trash me-2 fs-5"></i>
                  Remove
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


        {/* PROFILE DETAILS */}
        <div className="card shadow-sm border mb-4 text-start">

          <div className="card-body">

            {!isEditing ? (

              <>
                {/* EDIT BUTTON */}
                <div className="d-flex justify-content-end mb-3">

                  <button
                    className="btn btn-primary"
                    onClick={handleEdit}
                  >
                    <i className="bi bi-pencil-square me-2"></i>
                    Edit Profile
                  </button>

                </div>


                {/* NAME */}
                <div className="mb-3">

                  <label className="form-label text-muted small fw-bold">
                    Full Name
                  </label>

                  <p className="lead fw-medium mb-0">

                    <i className="bi bi-person me-2 text-primary"></i>

                    {user.name}

                  </p>

                </div>


                {/* EMAIL */}
                <div className="mb-3">

                  <label className="form-label text-muted small fw-bold">
                    Email Address
                  </label>

                  <p className="lead fw-medium mb-0">

                    <i className="bi bi-envelope me-2 text-primary"></i>

                    {user.email}

                  </p>

                </div>


                {/* PHONE */}
                <div className="mb-3">

                  <label className="form-label text-muted small fw-bold">
                    Phone Number
                  </label>

                  <p className="lead fw-medium mb-0">

                    <i className="bi bi-telephone me-2 text-primary"></i>

                    {user.phone || "Not added"}

                  </p>

                </div>


                {/* GENDER */}
<div className="mb-3">

  <label className="form-label text-muted small fw-bold">
    Gender
  </label>

  <p className="lead fw-medium mb-0">

    <i className="bi bi-person-badge me-2 text-primary"></i>

    {user.gender || "Not added"}

  </p>

</div>


{/* MEMBER SINCE */}
<div>

  <label className="form-label text-muted small fw-bold">
    Member Since
  </label>

  <p className="lead fw-medium mb-0">

    <i className="bi bi-calendar-check me-2 text-primary"></i>

    {formatCreatedDate(user.createdAt)}

  </p>

</div>

              </>

            ) : (

              /* EDIT PROFILE FORM */
              <form onSubmit={handleUpdateProfile}>

                <h5 className="fw-bold text-primary mb-4">

                  <i className="bi bi-pencil-square me-2"></i>

                  Edit Profile

                </h5>


                {/* EDIT NAME */}
                <div className="mb-3">

                  <label className="form-label fw-bold">
                    Full Name
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={editData.name}
                    onChange={handleEditChange}
                    required
                  />

                </div>


                
                {/* EMAIL - CANNOT EDIT */}
<div className="mb-3">

  <label className="form-label fw-bold">
    Email Address
  </label>

  <div className="input-group">

    <span className="input-group-text">
      <i className="bi bi-envelope text-primary"></i>
    </span>

    <input
      type="email"
      className="form-control"
      value={user.email}
      disabled
    />

    <span className="input-group-text">
      <i className="bi bi-lock-fill text-secondary"></i>
    </span>

  </div>

  <small className="text-muted">
    Email address cannot be changed
  </small>

</div>

                {/* EDIT PHONE */}
                <div className="mb-3">

                  <label className="form-label fw-bold">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    value={editData.phone}
                    onChange={handleEditChange}
                    placeholder="Add phone number"
                  />

                </div>


                {/* EDIT GENDER */}
                <div className="mb-4">

                  <label className="form-label fw-bold">
                    Gender
                  </label>

                  <select
                    className="form-select"
                    name="gender"
                    value={editData.gender}
                    onChange={handleEditChange}
                  >

                    <option value="">
                      Select Gender
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
                {/* MEMBER SINCE */}
<div className="mb-4">

  <label className="form-label fw-bold">
    Member Since
  </label>

  <div className="input-group">

    <span className="input-group-text">
      <i className="bi bi-calendar-check text-primary"></i>
    </span>

    <input
      type="text"
      className="form-control"
      value={formatCreatedDate(user.createdAt)}
      disabled
    />

    <span className="input-group-text">
      <i className="bi bi-lock-fill text-secondary"></i>
    </span>

  </div>

  <small className="text-muted">
    Account creation date cannot be changed
  </small>

</div>


                {/* BUTTONS */}
                <div className="d-flex gap-2">

                  <button
                    type="button"
                    className="btn btn-outline-secondary w-50"
                    onClick={() =>
                      setIsEditing(false)
                    }
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Cancel
                  </button>


                  <button
                    type="submit"
                    className="btn btn-primary w-50"
                  >
                    <i className="bi bi-check-circle me-2"></i>
                    Save Changes
                  </button>

                </div>

              </form>

            )}

          </div>

        </div>


        {/* SECURITY SETTINGS */}
        <div className="card shadow-sm border mb-4 text-start">

          <div
            className="card-header bg-transparent d-flex justify-content-between align-items-center p-3"
            style={{ cursor: "pointer" }}
            onClick={() =>
              setShowPasswordForm(!showPasswordForm)
            }
          >

            <h5 className="mb-0 fw-bold">
              Security Settings
            </h5>

            <i
              className={`bi bi-chevron-${
                showPasswordForm ? "up" : "down"
              }`}
            ></i>

          </div>


          {showPasswordForm && (

            <div className="card-body">

              {passwordError && (

                <div className="alert alert-danger">
                  {passwordError}
                </div>

              )}


              {passwordSuccess && (

                <div className="alert alert-success">
                  {passwordSuccess}
                </div>

              )}


              <form onSubmit={handlePasswordChange}>

                <div className="mb-3">

                  <label className="form-label">
                    Current Password
                  </label>

                  <input
                    type="password"
                    className="form-control"
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword:
                          e.target.value,
                      })
                    }
                  />

                </div>


                <div className="mb-3">

                  <label className="form-label">
                    New Password
                  </label>

                  <input
                    type="password"
                    className="form-control"
                    required
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword:
                          e.target.value,
                      })
                    }
                  />

                </div>


                <div className="mb-4">

                  <label className="form-label">
                    Confirm New Password
                  </label>

                  <input
                    type="password"
                    className="form-control"
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword:
                          e.target.value,
                      })
                    }
                  />

                </div>


                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword
                    ? "Updating..."
                    : "Change Password"}
                </button>


                {/* DELETE ACCOUNT */}
                <button
                  type="button"
                  className="btn btn-danger w-100 mt-3"
                  onClick={handleDeleteAccount}
                >
                  <i className="bi bi-trash me-2"></i>
                  Delete Account
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