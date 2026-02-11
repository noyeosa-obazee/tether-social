import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { ClipLoader } from "react-spinners";
import "./UserSearch.css";

const UserSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchUsers();
      } else {
        setUsers([]);
        setHasSearched(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users", {
        params: {
          search: searchQuery,
          limit: 10,
        },
      });
      setUsers(response.data.users || []);
      setHasSearched(true);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`);
    setSearchQuery("");
  };

  return (
    <div className="user-search">
      <div className="search-input-container">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery("");
              setUsers([]);
              setHasSearched(false);
            }}
            className="clear-search"
          >
            ✕
          </button>
        )}
      </div>

      {searchQuery && (
        <div className="search-results">
          {loading ? (
            <div className="search-loading">
              <ClipLoader color="#0066cc" size={30} />
            </div>
          ) : users.length > 0 ? (
            <ul className="users-list">
              {users.map((user) => (
                <li
                  key={user.id}
                  onClick={() => handleUserClick(user.id)}
                  className="user-item"
                >
                  <img
                    src={user.avatarUrl || "https://via.placeholder.com/40"}
                    alt={user.username}
                    className="user-avatar"
                  />
                  <div className="user-info">
                    <div className="user-name">{user.username}</div>
                    <div className="user-stats">
                      {user.postsCount} posts • {user.followersCount} followers
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : hasSearched ? (
            <div className="no-results">
              <p>No users found matching "{searchQuery}"</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default UserSearch;
