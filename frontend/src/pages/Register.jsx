import { useState, useContext } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    bio: "",
    password: "",
    confirmPassword: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Creating your account...");

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match", { id: toastId });
      return;
    }

    // Create FormData for file upload
    const formDataWithFile = new FormData();
    formDataWithFile.append("username", formData.username);
    formDataWithFile.append("email", formData.email);
    formDataWithFile.append("password", formData.password);
    formDataWithFile.append("confirmPassword", formData.confirmPassword);
    if (avatarFile) {
      formDataWithFile.append("avatar", avatarFile);
    }

    try {
      const response = await api.post("/auth/register", formDataWithFile, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data) {
        // Store token and user data
        localStorage.setItem("token", response.data.token);
        toast.success("Account created successfully", { id: toastId });
        navigate("/dashboard");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Registration failed";
      toast.error(errorMessage, { id: toastId });
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image file size must be less than 5MB");
        return;
      }

      setAvatarFile(file);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join Tether - Share & Chat</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Bio (optional)</label>
            <input
              type="text"
              name="bio"
              placeholder="About yourself..."
              value={formData.bio}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Profile Picture (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="form-input"
            />
            {avatarFile && (
              <div className="image-preview">
                <span>Selected: {avatarFile.name}</span>
                <button
                  type="button"
                  onClick={() => setAvatarFile(null)}
                  className="btn-remove"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary">
            Create Account
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
