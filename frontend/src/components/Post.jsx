import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import "./Post.css";

const Post = ({ post, onPostDeleted, onPostUpdated }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [liked, setLiked] = useState(
    post.likes.some((like) => like.userId === user.id),
  );
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);

  const handleAvatarClick = () => {
    navigate(`/user/${post.authorId}`);
  };

  const canEdit = user?.id === post.authorId;

  const handleDelete = async () => {
    let confirmId = null;
    confirmId = toast(
      (t) => (
        <div style={{ padding: 8 }}>
          <div style={{ marginBottom: 8 }}>
            Are you sure you want to delete this post?
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              onClick={() => toast.dismiss(t.id)}
              style={{ padding: "6px 10px", borderRadius: 6 }}
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);

                const loadingId = toast.loading("Deleting post...");
                try {
                  await api.delete(`/posts/${post.id}`);
                  toast.success("Post deleted", { id: loadingId });
                  onPostDeleted(post.id);
                } catch (err) {
                  toast.error("Failed to delete post", { id: loadingId });
                }
              }}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                background: "#dc3545",
                color: "white",
                border: "none",
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { duration: Infinity },
    );
  };

  const handleEdit = async () => {
    try {
      const res = await api.put(`/posts/${post.id}`, { content: editContent });
      toast.success("Post updated");
      onPostUpdated(res.data);
      setIsEditing(false);
    } catch (err) {
      toast.error("Failed to update post");
    }
  };

  const handleLike = async () => {
    if (!liked && likeCount >= 0) {
      setLiked(true);
      setLikeCount((prev) => prev + 1);
      try {
        await api.post("/likes/" + post.id);
      } catch (err) {
        toast.error("Failed to like post");
        setLiked(false);
        setLikeCount(likeCount - 1);
      }
    } else {
      setLiked(false);
      setLikeCount(likeCount - 1);
      try {
        await api.delete("/likes/" + post.id);
      } catch (err) {
        toast.error("Failed to unlike post");
        setLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await api.post("/comments", {
        postId: post.id,
        content: newComment,
      });
      setComments([...comments, res.data]);
      setNewComment("");
      toast.success("Comment added");
    } catch (err) {
      toast.error("Failed to add comment");
    }
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-author">
          <div
            className="avatar-circle"
            onClick={handleAvatarClick}
            style={{ cursor: "pointer" }}
          >
            {post.author?.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="author-name">{post.author?.username}</div>
            <div className="post-date">
              {new Date(post.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        {canEdit && (
          <div className="post-actions">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-small"
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
            <button onClick={handleDelete} className="btn-small btn-danger">
              Delete
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="post-edit">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="edit-textarea"
          />
          <button onClick={handleEdit} className="btn-primary">
            Save
          </button>
        </div>
      ) : (
        <>
          <div className="post-content">{post.content}</div>
          {post.imageUrl && (
            <img src={post.imageUrl} alt="post" className="post-image" />
          )}
        </>
      )}

      <div className="post-actions-footer">
        <button onClick={handleLike} className="action-btn">
          <span> {liked ? "❤️" : "🤍"}</span>
          <span>{likeCount > 0 && likeCount}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="action-btn"
        >
          💬
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          <div className="new-comment">
            <form onSubmit={handleAddComment}>
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="comment-input"
              />
              <button type="submit" className="btn-primary">
                Post
              </button>
            </form>
          </div>

          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment">
                <div className="comment-author">
                  <strong>{comment.author?.username}</strong>
                </div>
                <div className="comment-content">{comment.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;
