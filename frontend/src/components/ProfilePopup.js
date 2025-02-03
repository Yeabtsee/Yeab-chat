import React from "react";

const ProfilePopup = ({ username, userProfile, setUserProfile, onClose,onLogout }) => {
  
  const handleProfileUpdate = async () => {
    console.log("Debug: updating profile", userProfile);
    try {
      const response = await fetch(`http://localhost:5000/api/users/${username}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userProfile),
      });
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
    console.log("Debug: Form data", formData);
    try {
      const response = await fetch(`http://localhost:5000/api/users/${username}/upload-avatar`, {
        method: "POST",
        body: formData,
      });


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
    <div className="profile-popup">
      <div className="profile-content">
      <button className="close-profile" onClick={onClose}>
          &times;
        </button>
        <h2>User Profile</h2>
        {userProfile.avatar ? (
          <img
            src={userProfile.avatar}
            alt="Profile Avatar"
            className="profile-avatar"
          />
        ) : (
          <div
            className="profile-avatar-letter"
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              border: "1px solid #fff",
              backgroundColor: "rgb(61, 117, 239)",
              color: "#fff",
              textAlign: "center",
              lineHeight: "50px",
              fontSize: "1.5rem",
            }}
          >
            {username?.charAt(0).toUpperCase()}
          </div>
        )}
        
        <label>
          Full Name:
          <input
            type="text"
            value={userProfile.fullName}
            onChange={(e) =>
              setUserProfile({ ...userProfile, fullName: e.target.value })
            }
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            value={userProfile.email}
            onChange={(e) =>
              setUserProfile({ ...userProfile, email: e.target.value })
            }
          />
        </label>
        <label>
          Phone:
          <input
            type="text"
            value={userProfile.phone}
            onChange={(e) =>
              setUserProfile({ ...userProfile, phone: e.target.value })
            }
          />
        </label>
        <label>
          Change Profile Picture:
          <input
            type="file"
            accept="image/*"
            style={{ marginLeft:"10%",marginTop:"10px" }}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                handleAvatarUpload(file); // Handle avatar upload
              }
            }}
          />
        </label>
        <div style={{display:"flex",flexDirection:"column"}}>
            <button className="profile-save-btn" onClick={handleProfileUpdate}>Save Changes</button>
            <button className="logout-button" onClick={onLogout}>
            Logout
            </button>
       </div>
      </div>
    </div>
  );
};

export default ProfilePopup;
