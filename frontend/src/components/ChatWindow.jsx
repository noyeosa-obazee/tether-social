import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import "./ChatWindow.css";

const ChatWindow = ({ chat, onBack, onToggleSidebar, sidebarOpen }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const friend = chat?.participants?.find((p) => p.id !== user.id);

  const handleAvatarClick = () => {
    navigate(`/user/${friend.id}`);
  };

  useEffect(() => {
    if (chat?.id) {
      fetchMessages();
    }
  }, [chat?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/messages/${chat.id}`);
      setMessages(res.data);
    } catch (err) {
      toast.error("Failed to fetch messages");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    try {
      setIsSending(true);
      const res = await api.post("/messages", {
        conversationId: chat.id,
        content: newMessage,
      });

      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  if (!chat) {
    return (
      <div className="chat-window empty-state">
        <div style={{ margin: "auto", textAlign: "center", color: "#888" }}>
          <h3>Select a conversation</h3>
          <p>Choose a friend from the Messages tab to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {window.innerWidth <= 768 && (
            <button
              onClick={onToggleSidebar}
              className="mobile-menu-btn"
              title={sidebarOpen ? "Close menu" : "Open menu"}
            >
              {sidebarOpen ? "✕" : "☰"}
            </button>
          )}
          <button onClick={onBack} className="back-button">
            ← Back
          </button>
          <div
            className="avatar-circle"
            style={{
              width: "35px",
              height: "35px",
              fontSize: "1rem",
              cursor: "pointer",
            }}
            onClick={handleAvatarClick}
          >
            {(friend?.username || "?").charAt(0).toUpperCase()}
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span>{friend?.username}</span>
            <span
              style={{
                fontSize: "0.75rem",
                color: "#666",
                fontWeight: "normal",
              }}
            >
              {friend?.bio || "No bio yet"}
            </span>
          </div>
        </div>
      </div>

      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="empty-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user.id;
            return (
              <div
                key={msg.id}
                className={`message-bubble ${isMe ? "me" : "friend"}`}
              >
                {msg.content}
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Type a message..."
          className="chat-input"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" className="btn-send" disabled={isSending}>
          {isSending ? (
            <ClipLoader size={20} color="white" />
          ) : (
            <span>Send ➣</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
