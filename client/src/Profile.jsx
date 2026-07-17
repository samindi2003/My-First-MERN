import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Profile() {
  const [user, setUser] = useState(null);

  const [profilePicture, setProfilePicture] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showPicMenu, setShowPicMenu] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const [editData, setEditData] = useState({
    name: "",
    phone: "",
    gender: "",
  });

  const [showPasswordForm, setShowPasswordForm] =
    useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] =
    useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Get user from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem("user");

    if (userStr) {
      const parsedUser = JSON.parse(userStr);

      setUser(parsedUser);
      setProfilePicture(
        parsedUser.profilePicture || ""
      );
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Convert image to Base64
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

  // Change profile picture
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

      const updatedPicture =
        response.data.profilePicture;

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

      setShowPicMenu(false);
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

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Remove profile picture
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

      setShowPicMenu(false);
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

  // Format account-created date
  const formatCreatedDate = (date) => {
    if (!date) {
      return "Date not available";
    }

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "long",
        year: "numeric",
      }
    );
  };

  // Open edit profile form
  const handleEdit = () => {
    setEditData({
      name: user.name || "",
      phone: user.phone || "",
      gender: user.gender || "",
    });

    setIsEditing(true);
  };

  // Edit input change
  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditData({
      ...editData,
      [name]: value,
    });
  };

  // Save profile changes
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

      alert("Profile updated successfully!");
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Profile update failed."
      );
    }
  };

  // Change password
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      setPasswordError(
        "New passwords do not match."
      );

      return;
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

      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordSuccess("");
      }, 2000);
    } catch (error) {
      setPasswordError(
        error.response?.data?.message ||
          "Failed to change password."
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account?"
    );

    if (!confirmDelete) return;

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

      alert("Account deleted successfully.");

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      navigate("/register");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Account deletion failed."
      );
    }
  };

  if (!user) {
    return (
      <div className="glass-page">
        <div
          className="spinner-border text-primary"
          role="status"
        >
          <span className="visually-hidden">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-page profile-glass-page">
      <div className="white-glass-card large profile-glass-card">

        {/* Top navigation */}
        <div className="d-flex justify-content-start mb-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="btn btn-outline-primary profile-back-button"
          >
            <i className="bi bi-arrow-left me-2"></i>
            Dashboard
          </button>
        </div>

        {/* Heading */}
        <div className="text-center mb-4">
          <div className="glass-icon mb-3">
            <i className="bi bi-person-vcard"></i>
          </div>

          <h2 className="fw-bold text-primary mb-2">
            Your Profile
          </h2>

          <p className="glass-subtitle">
            Manage your personal information and
            account security
          </p>
        </div>

        {/* Profile picture */}
        <div className="profile-picture-section mb-4">
          <div className="profile-picture-wrapper">

            <div className="profile-picture-circle">
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
                  className="profile-picture-image"
                />
              ) : (
                <i className="bi bi-person-circle profile-placeholder-icon"></i>
              )}
            </div>

            <button
              type="button"
              className="btn btn-primary profile-picture-edit-button"
              onClick={() =>
                setShowPicMenu(!showPicMenu)
              }
              disabled={isUploading}
              aria-label="Edit profile picture"
            >
              <i className="bi bi-pencil-fill"></i>
            </button>

            {showPicMenu && (
              <div className="profile-picture-menu">
                <button
                  type="button"
                  className="profile-picture-menu-item"
                  onClick={() => {
                    setShowPicMenu(false);

                    fileInputRef.current?.click();
                  }}
                >
                  <i className="bi bi-camera me-2"></i>
                  Change picture
                </button>

                {profilePicture && (
                  <button
                    type="button"
                    className="profile-picture-menu-item text-danger"
                    onClick={handleRemovePicture}
                  >
                    <i className="bi bi-trash me-2"></i>
                    Remove picture
                  </button>
                )}
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="d-none"
            />
          </div>
        </div>

        {/* Profile information */}
        <div className="glass-inner-card mb-4 text-start">

          {!isEditing ? (
            <>
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                <div>
                  <h5 className="fw-bold mb-1">
                    <i className="bi bi-person-lines-fill text-primary me-2"></i>
                    Profile Information
                  </h5>

                  <p className="glass-section-description">
                    Your personal account details
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleEdit}
                >
                  <i className="bi bi-pencil-square me-2"></i>
                  Edit Profile
                </button>
              </div>

              <div className="profile-information-grid">

                <div className="profile-information-item">
                  <div className="profile-information-icon">
                    <i className="bi bi-person"></i>
                  </div>

                  <div>
                    <span className="profile-information-label">
                      Full Name
                    </span>

                    <p className="profile-information-value">
                      {user.name}
                    </p>
                  </div>
                </div>

                <div className="profile-information-item">
                  <div className="profile-information-icon">
                    <i className="bi bi-envelope"></i>
                  </div>

                  <div>
                    <span className="profile-information-label">
                      Email Address
                    </span>

                    <p className="profile-information-value">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="profile-information-item">
                  <div className="profile-information-icon">
                    <i className="bi bi-telephone"></i>
                  </div>

                  <div>
                    <span className="profile-information-label">
                      Phone Number
                    </span>

                    <p className="profile-information-value">
                      {user.phone || "Not added"}
                    </p>
                  </div>
                </div>

                <div className="profile-information-item">
                  <div className="profile-information-icon">
                    <i className="bi bi-person-badge"></i>
                  </div>

                  <div>
                    <span className="profile-information-label">
                      Gender
                    </span>

                    <p className="profile-information-value">
                      {user.gender || "Not added"}
                    </p>
                  </div>
                </div>

                <div className="profile-information-item">
                  <div className="profile-information-icon">
                    <i className="bi bi-calendar-check"></i>
                  </div>

                  <div>
                    <span className="profile-information-label">
                      Member Since
                    </span>

                    <p className="profile-information-value">
                      {formatCreatedDate(
                        user.createdAt
                      )}
                    </p>
                  </div>
                </div>

              </div>
            </>
          ) : (
            <form onSubmit={handleUpdateProfile}>
              <div className="mb-4">
                <h5 className="fw-bold text-primary mb-1">
                  <i className="bi bi-pencil-square me-2"></i>
                  Edit Profile
                </h5>

                <p className="glass-section-description">
                  Update your personal information
                </p>
              </div>

              <div className="mb-3">
                <label
                  htmlFor="edit-name"
                  className="form-label fw-semibold"
                >
                  <i className="bi bi-person me-2"></i>
                  Full Name
                </label>

                <input
                  id="edit-name"
                  type="text"
                  className="form-control"
                  name="name"
                  value={editData.name}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  <i className="bi bi-envelope me-2"></i>
                  Email Address
                </label>

                <div className="input-group glass-input-group">
                  <input
                    type="email"
                    className="form-control"
                    value={user.email}
                    disabled
                  />

                  <span className="input-group-text profile-locked-icon">
                    <i className="bi bi-lock-fill"></i>
                  </span>
                </div>

                <small className="profile-helper-text">
                  Email address cannot be changed.
                </small>
              </div>

              <div className="mb-3">
                <label
                  htmlFor="edit-phone"
                  className="form-label fw-semibold"
                >
                  <i className="bi bi-telephone me-2"></i>
                  Phone Number
                </label>

                <input
                  id="edit-phone"
                  type="tel"
                  className="form-control"
                  name="phone"
                  value={editData.phone}
                  onChange={handleEditChange}
                  placeholder="Add phone number"
                />
              </div>

              <div className="mb-3">
                <label
                  htmlFor="edit-gender"
                  className="form-label fw-semibold"
                >
                  <i className="bi bi-people me-2"></i>
                  Gender
                </label>

                <select
                  id="edit-gender"
                  className="form-select"
                  name="gender"
                  value={editData.gender}
                  onChange={handleEditChange}
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

              <div className="mb-4">
                <label className="form-label fw-semibold">
                  <i className="bi bi-calendar-check me-2"></i>
                  Member Since
                </label>

                <div className="input-group glass-input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={formatCreatedDate(
                      user.createdAt
                    )}
                    disabled
                  />

                  <span className="input-group-text profile-locked-icon">
                    <i className="bi bi-lock-fill"></i>
                  </span>
                </div>

                <small className="profile-helper-text">
                  Account creation date cannot be
                  changed.
                </small>
              </div>

              <div className="d-flex flex-column flex-sm-row gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100"
                  onClick={() =>
                    setIsEditing(false)
                  }
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                >
                  <i className="bi bi-check-circle me-2"></i>
                  Save Changes
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Security settings */}
        <div className="glass-inner-card text-start">

          <button
            type="button"
            className="profile-security-header"
            onClick={() => {
              setShowPasswordForm(
                !showPasswordForm
              );

              setPasswordError("");
              setPasswordSuccess("");
            }}
          >
            <div>
              <h5 className="fw-bold mb-1">
                <i className="bi bi-shield-lock text-primary me-2"></i>
                Security Settings
              </h5>

              <p className="glass-section-description">
                Change your password or delete your
                account
              </p>
            </div>

            <i
              className={`bi bi-chevron-${
                showPasswordForm ? "up" : "down"
              }`}
            ></i>
          </button>

          {showPasswordForm && (
            <div className="profile-security-content">

              {passwordError && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-circle me-2"></i>
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="alert alert-success">
                  <i className="bi bi-check-circle me-2"></i>
                  {passwordSuccess}
                </div>
              )}

              <form onSubmit={handlePasswordChange}>

                <div className="mb-3">
                  <label
                    htmlFor="current-password"
                    className="form-label fw-semibold"
                  >
                    Current Password
                  </label>

                  <input
                    id="current-password"
                    type="password"
                    className="form-control"
                    placeholder="Enter current password"
                    required
                    value={
                      passwordData.currentPassword
                    }
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
                  <label
                    htmlFor="new-password"
                    className="form-label fw-semibold"
                  >
                    New Password
                  </label>

                  <input
                    id="new-password"
                    type="password"
                    className="form-control"
                    placeholder="Enter new password"
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
                  <label
                    htmlFor="confirm-new-password"
                    className="form-label fw-semibold"
                  >
                    Confirm New Password
                  </label>

                  <input
                    id="confirm-new-password"
                    type="password"
                    className="form-control"
                    placeholder="Confirm new password"
                    required
                    value={
                      passwordData.confirmPassword
                    }
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
                  className="btn btn-primary w-100 mb-3"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-key me-2"></i>
                      Change Password
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-danger w-100"
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