import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";
import "./Post.css";

const Post = ({ post, onPostDeleted, onPostUpdated }) => {
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);

  const canEdit = user?.id === post.authorId;

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        await api.delete(`/posts/${post.id}`);
        toast.success("Post deleted");
        onPostDeleted(post.id);
      } catch (err) {
        toast.error("Failed to delete post");
      }
    }
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
    try {
      await api.post("/likes", { postId: post.id });
      setLiked(true);
      setLikeCount(likeCount + 1);
      toast.success("Post liked!");
    } catch (err) {
      toast.error("Failed to like post");
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
      {/* Post Header */}
      <div className="post-header">
        <div className="post-author">
          <div className="avatar-circle">
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

      {/* Post Content */}
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

      {/* Post Actions */}
      <div className="post-actions-footer">
        <button onClick={handleLike} className="action-btn">
          {liked ? "❤️" : "🤍"} Like
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="action-btn"
        >
          💬 Comment
        </button>
      </div>

      {/* Comments Section */}
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
