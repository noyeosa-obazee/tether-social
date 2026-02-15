import { useState, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Feed from "../components/Feed";
import ChatWindow from "../components/ChatWindow";
import EditProfileModal from "../components/EditProfileModal";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("feed");
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    if (location.state?.activeTab && location.state?.selectedChat) {
      setActiveTab(location.state.activeTab);
      setSelectedChat(location.state.selectedChat);
    }
  }, [location.state]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="dashboard-container">
      {isSidebarOpen && window.innerWidth <= 768 && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      <div className={`sidebar-wrapper ${isSidebarOpen ? "open" : "closed"}`}>
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSelectChat={setSelectedChat}
          selectedChat={selectedChat}
          onClose={closeSidebar}
          onOpenProfileModal={() => setShowProfileModal(true)}
        />
      </div>

      <div className="main-content">
        {activeTab === "feed" ? (
          <Feed onToggleSidebar={toggleSidebar} sidebarOpen={isSidebarOpen} />
        ) : (
          <div className="chat-container">
            {selectedChat ? (
              <ChatWindow
                chat={selectedChat}
                onBack={() => setSelectedChat(null)}
                onToggleSidebar={toggleSidebar}
                sidebarOpen={isSidebarOpen}
              />
            ) : (
              <div className="empty-chat-state">
                <div className="empty-chat-content">
                  <h2>Start a Conversation</h2>
                  <p>Find friends and start chatting!</p>
                  <div className="empty-chat-actions">
                    <button
                      onClick={() => setActiveTab("feed")}
                      className="btn-primary"
                    >
                      Explore Feed
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("chat");
                        setIsSidebarOpen(true);
                      }}
                      className="btn-secondary"
                    >
                      Search Users
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showProfileModal && (
        <EditProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  );
};

export default Dashboard;
