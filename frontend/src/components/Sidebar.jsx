import { useState, useEffect, useContext } from "react";
import { ClipLoader } from "react-spinners";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";
import "./Sidebar.css";

const Sidebar = ({
  activeTab,
  onTabChange,
  onSelectChat,
  selectedChat,
  onClose,
  onOpenProfileModal,
}) => {
  const { user, logout } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "chat") {
      fetchConversations();
    }
  }, [activeTab]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await api.get("/conversations");
      setConversations(res.data);
    } catch (err) {
      toast.error("Failed to load chats");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.length > 0) {
      setLoading(true);
      try {
        const res = await api.get(`/users?search=${term}`);
        setSearchResults(res.data);
      } catch (err) {
        toast.error("Failed to search");
      } finally {
        setLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const startChat = async (participantId) => {
    try {
      const res = await api.post("/conversations", { participantId });
      const newChat = res.data;
      onSelectChat(newChat);
      setSearchTerm("");
      setSearchResults([]);
    } catch (err) {
      toast.error("Could not start chat");
    }
  };

  return (
    <div className="sidebar">
      {/* Sidebar Header with Toggle Arrow */}
      <div className="sidebar-top">
        <div className="sidebar-title">
          <h1>Tether</h1>
        </div>
        {window.innerWidth <= 768 && (
          <button
            className="sidebar-toggle-btn"
            onClick={onClose}
            aria-label="Close sidebar"
            title="Close menu"
          >
            →
          </button>
        )}
      </div>

      {/* User Profile Header */}
      <div className="sidebar-header">
        <div className="user-profile">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="Avatar"
              className="avatar-circle"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div className="avatar-circle">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <span style={{ fontWeight: "600" }}>{user?.username}</span>
            <span style={{ fontSize: "0.75rem", color: "#666" }}>
              {user?.bio || "No bio yet"}
            </span>
          </div>
        </div>
        <div className="btn-flex">
          <button onClick={onOpenProfileModal} className="btn-primary edit-btn">
            Edit
          </button>
          <button onClick={logout} className="btn-primary logout-btn">
            Logout
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sidebar-tabs">
        <button
          className={`tab-btn ${activeTab === "feed" ? "active" : ""}`}
          onClick={() => {
            onTabChange("feed");
            onClose?.();
          }}
        >
          📱 Feed
        </button>
        <button
          className={`tab-btn ${activeTab === "chat" ? "active" : ""}`}
          onClick={() => {
            onTabChange("chat");
            onClose?.();
          }}
        >
          💬 Messages
        </button>
      </div>

      {/* Feed Tab Content */}
      {activeTab === "feed" && (
        <div className="sidebar-content">
          <div className="sidebar-info">
            <h3>Welcome to Tether</h3>
            <p>Share posts, comment, like, and chat with friends!</p>
          </div>
        </div>
      )}

      {/* Chat Tab Content */}
      {activeTab === "chat" && (
        <>
          <div className="sidebar-search">
            <input
              type="text"
              placeholder="Search users..."
              className="search-input"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <div className="conversation-list">
            {searchTerm.length > 0 ? (
              <div>
                {loading && (
                  <div className="loading">
                    <ClipLoader size={20} />
                  </div>
                )}
                {searchResults.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => startChat(u.id)}
                    className="conversation-item"
                  >
                    <div className="avatar-circle">
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <div>{u.username}</div>
                  </div>
                ))}
                {!loading && searchResults.length === 0 && (
                  <div style={{ padding: "10px", color: "#666" }}>
                    No users found
                  </div>
                )}
              </div>
            ) : loading ? (
              <div className="loading">
                <ClipLoader size={20} />
              </div>
            ) : conversations.length > 0 ? (
              conversations.map((chat) => {
                const friend = chat.participants.find((p) => p.id !== user.id);
                const lastMsg = chat.messages[0]?.content || "No messages yet";
                const isSelected = selectedChat?.id === chat.id;

                return (
                  <div
                    key={chat.id}
                    className={`conversation-item ${isSelected ? "active" : ""}`}
                    onClick={() => {
                      onSelectChat(chat);
                      onClose?.();
                    }}
                  >
                    <div className="avatar-circle">
                      {friend?.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: "600" }}>
                        {friend?.username}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "#666" }}>
                        {lastMsg}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                style={{ padding: "20px", textAlign: "center", color: "#999" }}
              >
                <p>No conversations yet</p>
                <p style={{ fontSize: "0.85rem" }}>
                  Search to start a new chat
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
