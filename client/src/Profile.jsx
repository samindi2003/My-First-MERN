import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Profile() {
  const [user, setUser] = useState(null);

  const [profilePicture, setProfilePicture] =
    useState("");

  const [isUploading, setIsUploading] =
    useState(false);

  const [showPicMenu, setShowPicMenu] =
    useState(false);

  const [isEditing, setIsEditing] =
    useState(false);

  const [editData, setEditData] = useState({
    name: "",
    phone: "",
    gender: "",
  });

  const [showPasswordForm, setShowPasswordForm] =
    useState(false);

  const [passwordData, setPasswordData] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  const [passwordError, setPasswordError] =
    useState("");

  const [passwordSuccess, setPasswordSuccess] =
    useState("");

  const [
    isChangingPassword,
    setIsChangingPassword,
  ] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Load user from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem("user");

    if (!userStr) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userStr);

      setUser(parsedUser);
      setProfilePicture(
        parsedUser.profilePicture || ""
      );
    } catch (error) {
      console.error(
        "Unable to load user information:",
        error
      );

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      navigate("/login");
    }
  }, [navigate]);

  // Convert selected image to Base64
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

  // Upload profile picture
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    // Limit image size to 3 MB
    if (file.size > 3 * 1024 * 1024) {
      alert(
        "The image is too large. Please select an image smaller than 3 MB."
      );
      return;
    }

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

        const updatedUser = {
          ...storedUser,
          profilePicture: updatedPicture,
        };

        localStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
        );

        setUser(updatedUser);
      }

      setShowPicMenu(false);
    } catch (error) {
      console.error(
        "Error uploading profile picture:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to upload profile picture."
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
    const confirmRemove = window.confirm(
      "Do you want to remove your profile picture?"
    );

    if (!confirmRemove) return;

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

        const updatedUser = {
          ...storedUser,
          profilePicture: "",
        };

        localStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
        );

        setUser(updatedUser);
      }

      setShowPicMenu(false);
    } catch (error) {
      console.error(
        "Error removing profile picture:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to remove profile picture."
      );
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

  // Open profile edit form
  const handleEdit = () => {
    setEditData({
      name: user?.name || "",
      phone: user?.phone || "",
      gender: user?.gender || "",
    });

    setIsEditing(true);
  };

  // Handle profile edit input
  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // Save profile changes
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!editData.name.trim()) {
      alert("Full name is required.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        "http://localhost:5001/api/auth/profile",
        {
          name: editData.name.trim(),
          phone: editData.phone.trim(),
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

  // Handle password input
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setPasswordError("");
    setPasswordSuccess("");
  };

  // Change password
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setPasswordError(
        "Please complete all password fields."
      );

      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError(
        "The new password must contain at least 6 characters."
      );

      return;
    }

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

      setPasswordSuccess(
        response.data.message ||
          "Password changed successfully."
      );

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
      "Are you sure you want to permanently delete your account?"
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
      console.error(
        "Account deletion error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Account deletion failed."
      );
    }
  };

  // Open or close security settings
  const toggleSecuritySettings = () => {
    setShowPasswordForm(
      (previousValue) => !previousValue
    );

    setPasswordError("");
    setPasswordSuccess("");
  };

  if (!user) {
    return (
      <div className="glass-page">
        <div className="text-center">
          <div
            className="spinner-border text-primary"
            role="status"
          >
            <span className="visually-hidden">
              Loading...
            </span>
          </div>

          <p className="text-muted mt-3">
            Loading profile...
          </p>
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

        {/* Page heading */}
        <div className="text-center mb-4">
          <div className="glass-icon mb-3">
            <i className="bi bi-person-vcard"></i>
          </div>

          <h2 className="fw-bold text-primary mb-2">
            Your Profile
          </h2>

          <p className="glass-subtitle mb-0">
            Manage your personal information and
            account security
          </p>
        </div>

        {/* Profile picture */}
        <div className="profile-photo-section">
          <div className="profile-photo-wrapper">

            {isUploading ? (
              <div className="profile-photo-placeholder">
                <div
                  className="spinner-border text-primary"
                  role="status"
                >
                  <span className="visually-hidden">
                    Uploading...
                  </span>
                </div>
              </div>
            ) : profilePicture ? (
              <img
                src={profilePicture}
                alt={`${user.name}'s profile`}
                className="profile-photo"
              />
            ) : (
              <div className="profile-photo-placeholder">
                <i className="bi bi-person-fill"></i>
              </div>
            )}

            <button
              type="button"
              className="profile-photo-edit-button"
              onClick={() =>
                setShowPicMenu(
                  (previousValue) => !previousValue
                )
              }
              disabled={isUploading}
              title="Update profile picture"
              aria-label="Update profile picture"
            >
              <i className="bi bi-camera-fill"></i>
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="d-none"
            onChange={handleFileChange}
          />

          {showPicMenu && (
            <div className="profile-photo-menu">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setShowPicMenu(false);
                  fileInputRef.current?.click();
                }}
                disabled={isUploading}
              >
                <i className="bi bi-upload me-2"></i>
                Upload Photo
              </button>

              {profilePicture && (
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={handleRemovePicture}
                  disabled={isUploading}
                >
                  <i className="bi bi-trash me-2"></i>
                  Remove Photo
                </button>
              )}
            </div>
          )}

          <p className="profile-photo-help">
            Click the camera icon to update your
            picture
          </p>
        </div>

        {/* Profile information */}
        <div className="glass-inner-card mb-4 text-start">

          {!isEditing ? (
            <>
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                  <h5 className="fw-bold mb-1">
                    <i className="bi bi-person-lines-fill text-primary me-2"></i>
                    Profile Information
                  </h5>

                  <p className="glass-section-description mb-0">
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

                    <p className="profile-information-value profile-email-value">
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

                <p className="glass-section-description mb-0">
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
                    readOnly
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
                    readOnly
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
        <div className="glass-inner-card security-card">

          <button
            type="button"
            className="security-card-header"
            onClick={toggleSecuritySettings}
            aria-expanded={showPasswordForm}
          >
            <div className="security-title-area">
              <div className="security-icon">
                <i className="bi bi-shield-lock-fill"></i>
              </div>

              <div>
                <h4 className="security-title">
                  Security Settings
                </h4>

                <p className="security-subtitle">
                  Change your password or manage your
                  account
                </p>
              </div>
            </div>

            <i
              className={`bi ${
                showPasswordForm
                  ? "bi-chevron-up"
                  : "bi-chevron-down"
              } security-chevron`}
            ></i>
          </button>

          {showPasswordForm && (
            <div className="security-content">

              {passwordError && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-circle-fill me-2"></i>
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="alert alert-success">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  {passwordSuccess}
                </div>
              )}

              <form onSubmit={handlePasswordChange}>
                <div className="row g-3">

                  <div className="col-12">
                    <label
                      htmlFor="current-password"
                      className="form-label fw-semibold"
                    >
                      Current Password
                    </label>

                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-lock"></i>
                      </span>

                      <input
                        id="current-password"
                        type="password"
                        name="currentPassword"
                        className="form-control"
                        placeholder="Enter your current password"
                        value={
                          passwordData.currentPassword
                        }
                        onChange={
                          handlePasswordInputChange
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label
                      htmlFor="new-password"
                      className="form-label fw-semibold"
                    >
                      New Password
                    </label>

                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-key"></i>
                      </span>

                      <input
                        id="new-password"
                        type="password"
                        name="newPassword"
                        className="form-control"
                        placeholder="Enter new password"
                        value={
                          passwordData.newPassword
                        }
                        onChange={
                          handlePasswordInputChange
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label
                      htmlFor="confirm-password"
                      className="form-label fw-semibold"
                    >
                      Confirm Password
                    </label>

                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-check-circle"></i>
                      </span>

                      <input
                        id="confirm-password"
                        type="password"
                        name="confirmPassword"
                        className="form-control"
                        placeholder="Confirm new password"
                        value={
                          passwordData.confirmPassword
                        }
                        onChange={
                          handlePasswordInputChange
                        }
                        required
                      />
                    </div>
                  </div>

                </div>

                <button
                  type="submit"
                  className="btn btn-primary mt-4"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-shield-check me-2"></i>
                      Update Password
                    </>
                  )}
                </button>
              </form>

              {/* Danger zone */}
              <div className="danger-zone">
                <div>
                  <h5 className="danger-zone-title">
                    Delete Account
                  </h5>

                  <p className="danger-zone-description">
                    Permanently delete your account
                    and all associated data.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={handleDeleteAccount}
                >
                  <i className="bi bi-trash me-2"></i>
                  Delete Account
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default Profile;