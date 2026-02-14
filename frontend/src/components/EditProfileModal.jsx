import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";
import "./EditProfileModal.css";

const EditProfileModal = ({ onClose }) => {
  const { user, updateUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  const [formData, setFormData] = useState({
    username: user.username || "",
    bio: user.bio || "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create FormData for file upload
      const formDataWithFile = new FormData();
      formDataWithFile.append("username", formData.username);
      formDataWithFile.append("bio", formData.bio);
      if (avatarFile) {
        formDataWithFile.append("avatar", avatarFile);
      }

      const res = await api.put(`/users/${user.id}`, formDataWithFile, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      updateUser(res.data);

      toast.success("Profile updated!");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image file size must be less than 5MB");
        return;
      }

      setAvatarFile(file);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button onClick={onClose} className="close-btn">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Bio</label>
            <input
              type="text"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="About yourself..."
            />
          </div>

          <div className="form-group">
            <label>Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="form-input"
            />
            {avatarFile && (
              <div className="image-preview">
                <span>Selected: {avatarFile.name}</span>
                <button
                  type="button"
                  onClick={() => setAvatarFile(null)}
                  className="btn-remove"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
