import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Feed from "../components/Feed";
import ChatWindow from "../components/ChatWindow";
import EditProfileModal from "../components/EditProfileModal";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("feed");
  const [selectedChat, setSelectedChat] = useState(null);
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
          <ChatWindow
            chat={selectedChat}
            onBack={() => setSelectedChat(null)}
            onToggleSidebar={toggleSidebar}
            sidebarOpen={isSidebarOpen}
          />
        )}
      </div>

      {showProfileModal && (
        <EditProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  );
};

export default Dashboard;
