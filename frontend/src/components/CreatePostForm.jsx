import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";
import "./CreatePostForm.css";

const CreatePostForm = ({ onPostCreated, onCancel }) => {
  const { user } = useContext(AuthContext);
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) {
      toast.error("Post must have either content or an image");
      return;
    }

    try {
      setLoading(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("content", content);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await api.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Post created!");
      onPostCreated(res.data);
      setContent("");
      setImageFile(null);
    } catch (err) {
      toast.error("Failed to create post");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
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

      setImageFile(file);
    }
  };

  return (
    <div className="create-post-form">
      <div className="form-header">
        <div className="user-info">
          <div className="avatar-circle">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <span>{user?.username}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="post-textarea"
          rows="4"
        />

        <div className="form-inputs">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="form-input"
          />
          {imageFile && (
            <div className="image-preview">
              <span>Selected: {imageFile.name}</span>
              <button
                type="button"
                onClick={() => setImageFile(null)}
                className="btn-remove"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePostForm;
