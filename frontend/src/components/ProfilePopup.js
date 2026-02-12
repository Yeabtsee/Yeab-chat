import React from "react";

const ProfilePopup = ({
  username,
  userProfile,
  setUserProfile,
  onClose,
  onLogout,
}) => {
  const handleProfileUpdate = async () => {
    console.log("Debug: updating profile", userProfile);
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${username}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userProfile),
        }
      );
      if (response.ok) {
        const updatedData = await response.json();
        setUserProfile(updatedData);
        alert("Profile updated successfully!");
        onClose();
      } else {
        console.error("Failed to update profile:", await response.text());
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleAvatarUpload = async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);

    console.log("Debug: Uploading avatar", file);
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${username}/upload-avatar`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Debug: Avatar upload response", data);
        setUserProfile({ ...userProfile, avatar: data.avatarUrl }); // Update avatar URL
      } else {
        console.error("Failed to upload avatar:", await response.text());
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
    }
  };

  return (
    <div className="profile-popup-overlay">
      <div className="profile-popup">
        <div className="profile-header">
          <h2>Edit Profile</h2>
          <button className="close-profile-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="profile-body">
          <div className="profile-avatar-section">
            <div className="avatar-wrapper">
              {userProfile.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt="Profile"
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  {username?.charAt(0).toUpperCase()}
                </div>
              )}
              <label htmlFor="avatar-upload" className="avatar-upload-label">
                <i className="fas fa-camera"></i>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) handleAvatarUpload(file);
                }}
                hidden
              />
            </div>
            <p className="username-display">@{username}</p>
          </div>

          <div className="profile-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={userProfile.fullName}
                onChange={(e) =>
                  setUserProfile({ ...userProfile, fullName: e.target.value })
                }
                placeholder="Enter your full name"
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={userProfile.email}
                onChange={(e) =>
                  setUserProfile({ ...userProfile, email: e.target.value })
                }
                placeholder="name@example.com"
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                value={userProfile.phone}
                onChange={(e) =>
                  setUserProfile({ ...userProfile, phone: e.target.value })
                }
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
        </div>

        <div className="profile-footer">
          <button className="btn-secondary" onClick={onLogout}>
            Logout
          </button>
          <button className="btn-primary" onClick={handleProfileUpdate}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePopup;
