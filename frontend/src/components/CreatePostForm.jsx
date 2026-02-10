import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";
import "./CreatePostForm.css";

const CreatePostForm = ({ onPostCreated, onCancel }) => {
  const { user } = useContext(AuthContext);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Post content cannot be empty");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/posts", {
        content,
        imageUrl: imageUrl || null,
      });
      if (res.ok) toast.success("Post created!");
      onPostCreated(res.data);
      setContent("");
      setImageUrl("");
    } catch (err) {
      toast.error("Failed to create post");
      console.error(err);
    } finally {
      setLoading(false);
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
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Image URL (optional)"
            className="form-input"
          />
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
