import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import Post from "../components/Post";
import { ClipLoader } from "react-spinners";
import "./UserProfile.css";

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/users/${userId}`);
      setUser(response.data);
      setPosts(response.data.posts || []);

      if (currentUser && currentUser.id !== userId) {
        try {
          const followResponse = await api.get(`/users/${userId}/is-following`);
          setIsFollowing(followResponse.data.isFollowing);
        } catch (err) {
          console.error("Error checking follow status:", err);
        }
      }
    } catch (err) {
      console.error("Error fetching user:", err);
      setError("Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      await api.post(`/users/${userId}/follow`);
      setIsFollowing(true);
      setUser((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          followersCount: prev.stats.followersCount + 1,
        },
      }));
    } catch (err) {
      console.error("Error following user:", err);
    }
  };

  const handleUnfollow = async () => {
    try {
      await api.post(`/users/${userId}/unfollow`);
      setIsFollowing(false);
      setUser((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          followersCount: prev.stats.followersCount - 1,
        },
      }));
    } catch (err) {
      console.error("Error unfollowing user:", err);
    }
  };

  const handlePostDelete = (postId) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  if (loading) {
    return (
      <div className="user-profile-loading">
        <ClipLoader color="#0066cc" size={50} />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="user-profile-error">
        <h2>{error || "User not found"}</h2>
        <button onClick={() => navigate("/dashboard")} className="back-btn">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.id === userId;

  return (
    <div className="user-profile">
      <div className="profile-header">
        <button onClick={() => navigate("/dashboard")} className="back-button">
          ← Back
        </button>
        <div className="profile-cover"></div>
        <div className="profile-info-container">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl || "https://via.placeholder.com/150"}
              alt={user.username}
              className="profile-avatar"
            />
          ) : (
            <div className="avatar-circle">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="profile-details">
            <h1 className="profile-username">{user.username}</h1>
            <p className="profile-bio">{user.bio || "No bio yet"}</p>
            <p className="profile-joined">
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </p>
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-number">{user.stats.postsCount}</span>
                <span className="stat-label">Posts</span>
              </div>
              <div className="stat">
                <span className="stat-number">{user.stats.followersCount}</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat">
                <span className="stat-number">{user.stats.followingCount}</span>
                <span className="stat-label">Following</span>
              </div>
            </div>
          </div>
          {!isOwnProfile && currentUser && (
            <div className="profile-actions">
              {isFollowing ? (
                <button className="unfollow-btn" onClick={handleUnfollow}>
                  Following
                </button>
              ) : (
                <button className="follow-btn" onClick={handleFollow}>
                  Follow
                </button>
              )}
              <button className="message-btn">Message</button>
            </div>
          )}
        </div>
      </div>

      <div className="profile-posts-section">
        {/* <h2>Posts</h2> */}
        {postsLoading ? (
          <div className="posts-loading">
            <ClipLoader color="#0066cc" size={40} />
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="posts-list">
            {posts.map((post) => (
              <Post
                key={post.id}
                post={post}
                onPostDeleted={handlePostDelete}
              />
            ))}
          </div>
        ) : (
          <div className="no-posts">
            <p>No posts yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
