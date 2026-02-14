import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import Post from "./Post";
import CreatePostForm from "./CreatePostForm";
import "./Feed.css";

const Feed = ({ onToggleSidebar, sidebarOpen }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleAvatarClick = () => {
    navigate(`/user/${user.id}`);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/posts");
      setPosts(res.data.posts);
    } catch (err) {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setShowCreateForm(false);
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter((p) => p.id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(posts.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  };

  return (
    <div className="feed">
      <div className="feed-header">
        <h2>Feed</h2>
        {window.innerWidth <= 768 && (
          <button
            className="menu-toggle"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
            title={sidebarOpen ? "Close menu" : "Open menu"}
          >
            {sidebarOpen ? "✕" : "☰"}
          </button>
        )}
        {window.innerWidth > 768 && (
          <button
            className="sidebar-collapse-btn"
            onClick={onToggleSidebar}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? "←" : "→"}
          </button>
        )}
      </div>

      <div className="feed-content">
        {!showCreateForm ? (
          <div className="post-input-area">
            <div
              className="avatar-circle"
              onClick={handleAvatarClick}
              style={{ cursor: "pointer" }}
            >
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="post-input-btn"
            >
              What's on your mind?
            </button>
          </div>
        ) : (
          <CreatePostForm
            onPostCreated={handlePostCreated}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {loading ? (
          <div className="loading">Loading posts...</div>
        ) : (
          <div className="posts-list">
            {posts.length > 0 ? (
              posts.map((post) => (
                <Post
                  key={post.id}
                  post={post}
                  onPostDeleted={handlePostDeleted}
                  onPostUpdated={handlePostUpdated}
                />
              ))
            ) : (
              <div className="empty-state">
                <p>No posts yet. Be the first to share!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
